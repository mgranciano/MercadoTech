import { ReactNode } from "react"
import { ProductCard } from "./ProductCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import type { ProductWithDetails } from "@/types/product"

interface ProductGridProps {
  products: ProductWithDetails[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
}

export function ProductGrid({
  products,
  loading = false,
  error,
  onRetry,
  emptyTitle = "No hay productos",
  emptyDescription = "No encontramos productos que coincidan con tus filtros. Intenta cambiar los criterios de búsqueda.",
  emptyAction,
}: ProductGridProps) {
  if (loading) {
    return <LoadingState variant="grid" count={12} />
  }

  if (error) {
    return (
      <ErrorState
        title="No pudimos cargar los productos"
        description={error}
        onRetry={onRetry}
      />
    )
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        className="rounded-2xl border border-dashed border-border bg-card"
      />
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(230px,1fr))] sm:gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
