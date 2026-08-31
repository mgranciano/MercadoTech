import Link from "next/link"
import { ProductImage } from "@/components/shared/ProductImage"
import { Price } from "@/components/shared/Price"
import { ConditionBadge } from "@/components/shared/ConditionBadge"
import { RatingStars } from "@/components/shared/RatingStars"
import type { ProductWithDetails } from "@/types/product"

interface ProductCardProps {
  product: ProductWithDetails
  // Solo la pestaña "Resultados con IA" de /buscar la pasa (Fase 4.4): un
  // prop opcional, no un card distinto.
  similarity?: number
}

export function ProductCard({ product, similarity }: ProductCardProps) {
  return (
    <Link
      href={`/producto/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition duration-200 hover:-translate-y-1 hover:border-ai-cyan hover:shadow-[0_16px_34px_rgba(12,26,56,.14)]"
      data-testid={`shop-product-card-${product.id}`}
    >
      <div className="relative h-[170px] w-full overflow-hidden bg-muted">
        {product.image_url ? (
          <ProductImage
            src={product.image_url}
            alt={product.title}
            fill
            className="transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            Sin imagen
          </div>
        )}
        <ConditionBadge
          condition={product.condition as "nuevo" | "usado" | "reacondicionado"}
          className="absolute left-2.5 top-2.5 shadow-sm"
        />
        {similarity !== undefined && (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold text-primary shadow-sm">
            {Math.round(similarity * 100)}% relevante
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="font-mono text-[9.5px] uppercase tracking-[.12em] text-muted-foreground">
          {product.brand}
        </span>

        <h3 className="text-pretty text-[14.5px] font-bold leading-snug tracking-tight line-clamp-2 transition-colors group-hover:text-primary">
          {product.title}
        </h3>

        {product.review_count > 0 && (
          <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
            <RatingStars rating={product.average_rating} size={13} />
            <span>({product.review_count})</span>
          </div>
        )}

        <div className="mt-auto border-t border-border pt-3">
          <Price value={product.price} className="text-xl font-extrabold tracking-tight" />
        </div>
      </div>
    </Link>
  )
}
