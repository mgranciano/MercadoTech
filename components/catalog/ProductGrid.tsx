import { ProductCard } from "./ProductCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { LoadingState } from "@/components/shared/LoadingState"
import type { ProductWithDetails } from "@/services/product.service"

interface ProductGridProps {
  products: ProductWithDetails[]
  loading?: boolean
  error?: string | null
  emptyTitle?: string
  emptyDescription?: string
}

export function ProductGrid({
  products,
  loading = false,
  error,
  emptyTitle = "No hay productos",
  emptyDescription = "No encontramos productos que coincidan con tus filtros. Intenta cambiar los criterios de búsqueda.",
}: ProductGridProps) {
  if (loading) {
    return <LoadingState variant="grid" count={12} />
  }

  if (error) {
    return (
      <div className="rounded-lg border border-border p-8">
        <p className="text-center text-destructive text-sm">{error}</p>
      </div>
    )
  }

  if (products.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
