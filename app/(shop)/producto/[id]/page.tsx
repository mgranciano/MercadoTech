"use client"

import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useProduct } from "@/hooks/useProduct"
import { useQuestions } from "@/hooks/useQuestions"
import { useReviews } from "@/hooks/useReviews"
import { useFavorite } from "@/hooks/useFavorite"
import { ProductGallery } from "@/components/product/ProductGallery"
import { ProductInfo } from "@/components/product/ProductInfo"
import { BuyBox } from "@/components/product/BuyBox"
import { QuestionsSection } from "@/components/product/QuestionsSection"
import { ReviewsSection } from "@/components/product/ReviewsSection"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"

export default function ProductPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const productId = params.id

  const { profile } = useAuth()
  const hasSession = !!profile

  const { product, images, loading, error, retry } = useProduct(productId, profile?.id)
  const {
    questions,
    loading: questionsLoading,
    submitting: askingQuestion,
    ask,
    respond,
  } = useQuestions(productId)
  const {
    reviews,
    average,
    count,
    canReview,
    submitting: submittingReview,
    submit: submitReview,
  } = useReviews(productId, profile?.id)
  const { favorite, toggling, toggle: toggleFavorite } = useFavorite(productId, profile?.id)

  const requireLogin = () => {
    router.push(`/login?redirectTo=/producto/${productId}`)
  }

  if (loading) {
    return <LoadingState variant="grid" count={1} className="py-12" />
  }

  if (error || !product) {
    return (
      <ErrorState
        title="No pudimos cargar el producto"
        description={error ?? "El producto no existe o ya no está disponible."}
        onRetry={retry}
      />
    )
  }

  const isOwner = profile?.id === product.seller_id

  return (
    <div className="flex flex-col gap-10 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={images} title={product.title} />

        <div className="flex flex-col gap-6">
          <ProductInfo
            title={product.title}
            brand={product.brand}
            condition={product.condition}
            price={product.price}
            stock={product.stock}
            description={product.description}
          />

          <BuyBox
            stock={product.stock}
            isActive={product.is_active}
            isOwner={isOwner}
            hasSession={hasSession}
            favorite={favorite}
            favoriteLoading={toggling}
            onAddToCart={() => {
              // "Agregar al carrito" se implementa en la Fase 3.6.
            }}
            onToggleFavorite={toggleFavorite}
            onRequireLogin={requireLogin}
          />
        </div>
      </div>

      <div className="border-t border-border" />

      <QuestionsSection
        questions={questions}
        loading={questionsLoading}
        isOwner={isOwner}
        hasSession={hasSession}
        submitting={askingQuestion}
        onAsk={(text) => profile && ask(profile.id, text)}
        onAnswer={(id, text) => respond(id, text)}
        onRequireLogin={requireLogin}
      />

      <div className="border-t border-border" />

      <ReviewsSection
        reviews={reviews}
        average={average}
        count={count}
        canReview={canReview.allowed}
        hasSession={hasSession}
        submitting={submittingReview}
        onSubmit={(rating, comment) => submitReview(rating, comment)}
        onRequireLogin={requireLogin}
      />
    </div>
  )
}
