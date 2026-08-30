"use client"

import { useEffect, useState } from "react"
import {
  canReview as canReviewRequest,
  create,
  getAverage,
  listByProduct,
} from "@/services/review.service"
import type { CanReviewResult, Review } from "@/types/review"

const NO_REVIEW_ACCESS: CanReviewResult = { allowed: false, orderId: null }

export function useReviews(productId: string, userId?: string) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [average, setAverage] = useState(0)
  const [count, setCount] = useState(0)
  const [canReview, setCanReview] = useState<CanReviewResult>(NO_REVIEW_ACCESS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true

    const fetchAll = async () => {
      setLoading(true)
      setError(null)

      try {
        const [reviewsData, averageData, access] = await Promise.all([
          listByProduct(productId),
          getAverage(productId),
          userId ? canReviewRequest(productId, userId) : Promise.resolve(NO_REVIEW_ACCESS),
        ])

        if (!active) return

        setReviews(reviewsData)
        setAverage(averageData.average)
        setCount(averageData.count)
        setCanReview(access)
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Error al cargar las reseñas")
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchAll()

    return () => {
      active = false
    }
  }, [productId, userId, refreshKey])

  const submit = async (rating: number, comment: string) => {
    if (!userId || !canReview.orderId) return

    setSubmitting(true)
    setError(null)

    try {
      await create({
        productId,
        orderId: canReview.orderId,
        buyerId: userId,
        rating,
        comment,
      })
      setRefreshKey((k) => k + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar la reseña")
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  return { reviews, average, count, canReview, loading, error, submitting, submit }
}
