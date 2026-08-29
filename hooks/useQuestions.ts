"use client"

import { useEffect, useState } from "react"
import {
  answer,
  create,
  listByProduct,
  type Question,
} from "@/services/question.service"

export function useQuestions(productId: string) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    const fetchQuestions = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await listByProduct(productId)
        if (active) setQuestions(data)
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Error al cargar las preguntas")
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchQuestions()

    return () => {
      active = false
    }
  }, [productId])

  const ask = async (userId: string, question: string) => {
    const tempId = `temp-${Date.now()}`
    const optimistic: Question = {
      id: tempId,
      product_id: productId,
      user_id: userId,
      question,
      answer: null,
      answered_at: null,
      created_at: new Date().toISOString(),
    }

    setQuestions((prev) => [optimistic, ...prev])
    setSubmitting(true)
    setError(null)

    try {
      const created = await create(productId, userId, question)
      setQuestions((prev) => prev.map((q) => (q.id === tempId ? created : q)))
    } catch (err) {
      setQuestions((prev) => prev.filter((q) => q.id !== tempId))
      setError(err instanceof Error ? err.message : "Error al enviar la pregunta")
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  const respond = async (questionId: string, answerText: string) => {
    const previous = questions
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, answer: answerText, answered_at: new Date().toISOString() }
          : q
      )
    )
    setSubmitting(true)
    setError(null)

    try {
      const updated = await answer(questionId, answerText)
      setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)))
    } catch (err) {
      setQuestions(previous)
      setError(err instanceof Error ? err.message : "Error al responder la pregunta")
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  return { questions, loading, error, submitting, ask, respond }
}
