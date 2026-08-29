"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RatingStars } from "@/components/shared/RatingStars"
import { EmptyState } from "@/components/shared/EmptyState"
import type { Review } from "@/services/review.service"

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-PE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

interface ReviewsSectionProps {
  reviews: Review[]
  average: number
  count: number
  canReview: boolean
  hasSession: boolean
  submitting: boolean
  onSubmit: (rating: number, comment: string) => void
  onRequireLogin: () => void
}

export function ReviewsSection({
  reviews,
  average,
  count,
  canReview,
  hasSession,
  submitting,
  onSubmit,
  onRequireLogin,
}: ReviewsSectionProps) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasSession) {
      onRequireLogin()
      return
    }
    onSubmit(rating, comment.trim())
    setComment("")
    setRating(5)
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Reseñas</h2>

      {count > 0 && (
        <div className="flex items-center gap-3">
          <RatingStars rating={average} size={20} />
          <span className="text-sm text-muted-foreground">
            {average.toFixed(1)} · {count} reseña{count === 1 ? "" : "s"}
          </span>
        </div>
      )}

      {canReview && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 rounded-lg border border-border p-4"
        >
          <p className="text-sm font-medium">Deja tu reseña</p>
          <RatingStars rating={rating} onChange={setRating} size={24} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="¿Qué te pareció el producto? (opcional)"
            rows={3}
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button type="submit" disabled={submitting} className="self-start">
            Publicar reseña
          </Button>
        </form>
      )}

      {reviews.length === 0 ? (
        <EmptyState
          icon={<Star size={40} />}
          title="Sin reseñas todavía"
          description="Este producto no tiene reseñas aún."
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-border pb-4 last:border-b-0">
              <div className="flex items-center gap-2">
                <RatingStars rating={r.rating} size={16} />
                <span className="text-xs text-muted-foreground">
                  {/* Sin nombres de otros usuarios (decisión 8): profiles solo
                      es legible por su dueño. */}
                  Comprador verificado · {formatDate(r.created_at)}
                </span>
              </div>
              {r.comment && <p className="mt-1 text-sm">{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
