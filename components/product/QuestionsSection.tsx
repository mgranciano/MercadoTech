"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/EmptyState"
import { LoadingState } from "@/components/shared/LoadingState"
import type { Question } from "@/types/question"

const TEXTAREA_CLASS =
  "w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-PE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

interface AnswerFormProps {
  questionId: string
  submitting: boolean
  onAnswer: (questionId: string, answer: string) => void
}

function AnswerForm({ questionId, submitting, onAnswer }: AnswerFormProps) {
  const [text, setText] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    onAnswer(questionId, text.trim())
    setText("")
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-2 sm:flex-row">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escribe tu respuesta..."
        rows={2}
        className={TEXTAREA_CLASS}
      />
      <Button type="submit" size="sm" disabled={submitting || !text.trim()}>
        Responder
      </Button>
    </form>
  )
}

interface QuestionsSectionProps {
  questions: Question[]
  loading: boolean
  isOwner: boolean
  hasSession: boolean
  submitting: boolean
  onAsk: (question: string) => void
  onAnswer: (questionId: string, answer: string) => void
  onRequireLogin: () => void
}

export function QuestionsSection({
  questions,
  loading,
  isOwner,
  hasSession,
  submitting,
  onAsk,
  onAnswer,
  onRequireLogin,
}: QuestionsSectionProps) {
  const [newQuestion, setNewQuestion] = useState("")

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasSession) {
      onRequireLogin()
      return
    }
    if (!newQuestion.trim()) return
    onAsk(newQuestion.trim())
    setNewQuestion("")
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Preguntas y respuestas</h2>

      {!isOwner && (
        <form onSubmit={handleAsk} className="flex flex-col gap-2 sm:flex-row">
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder={hasSession ? "Escribe tu pregunta..." : "Inicia sesión para preguntar"}
            rows={2}
            disabled={!hasSession}
            className={`flex-1 ${TEXTAREA_CLASS}`}
          />
          {hasSession ? (
            <Button type="submit" disabled={submitting || !newQuestion.trim()}>
              Preguntar
            </Button>
          ) : (
            <Button type="button" onClick={onRequireLogin}>
              Ingresar para preguntar
            </Button>
          )}
        </form>
      )}

      {loading ? (
        <LoadingState variant="list" count={2} />
      ) : questions.length === 0 ? (
        <EmptyState
          icon={<MessageCircle size={40} />}
          title="Sin preguntas todavía"
          description="Sé el primero en preguntar sobre este producto."
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {questions.map((q) => (
            <li key={q.id} className="border-b border-border pb-4 last:border-b-0">
              <p className="text-sm">
                {/* profiles solo es legible por su dueño (decisión 8): no hay
                    forma de mostrar el nombre real de otro usuario sin una
                    vista public_profiles, fuera de alcance de esta sesión. */}
                <span className="font-medium">Usuario</span>{" "}
                <span className="text-muted-foreground">· {formatDate(q.created_at)}</span>
              </p>
              <p className="mt-1">{q.question}</p>

              {q.answer ? (
                <div className="mt-2 rounded-md bg-muted p-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Respuesta del vendedor
                    {q.answered_at ? ` · ${formatDate(q.answered_at)}` : ""}
                  </p>
                  <p className="mt-1 text-sm">{q.answer}</p>
                </div>
              ) : isOwner ? (
                <AnswerForm questionId={q.id} submitting={submitting} onAnswer={onAnswer} />
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">Sin respuesta todavía.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
