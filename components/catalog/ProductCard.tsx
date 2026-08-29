import Link from "next/link"
import { ProductImage } from "@/components/shared/ProductImage"
import { Price } from "@/components/shared/Price"
import { ConditionBadge } from "@/components/shared/ConditionBadge"
import { RatingStars } from "@/components/shared/RatingStars"
import type { ProductWithDetails } from "@/services/product.service"

interface ProductCardProps {
  product: ProductWithDetails
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/producto/${product.id}`}
      className="group flex flex-col rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="relative w-full aspect-square bg-muted overflow-hidden">
        {product.image_url ? (
          <ProductImage
            src={product.image_url}
            alt={product.title}
            fill
            className="group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
            Sin imagen
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col p-4">
        <div className="mb-2">
          <ConditionBadge
            condition={product.condition as "nuevo" | "usado" | "reacondicionado"}
            className="text-xs"
          />
        </div>

        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">
          {product.title}
        </h3>

        <p className="text-xs text-muted-foreground mb-2">{product.brand}</p>

        {product.review_count > 0 && (
          <div className="flex items-center gap-2 mb-auto">
            <RatingStars rating={product.average_rating} size={14} />
            <span className="text-xs text-muted-foreground">
              ({product.review_count})
            </span>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-border">
          <Price value={product.price} className="text-lg font-bold text-primary" />
        </div>
      </div>
    </Link>
  )
}
