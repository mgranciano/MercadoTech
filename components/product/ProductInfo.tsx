import { Price } from "@/components/shared/Price"
import { ConditionBadge } from "@/components/shared/ConditionBadge"

interface ProductInfoProps {
  title: string
  brand: string | null
  condition: string
  price: number
  stock: number
  description: string | null
}

export function ProductInfo({
  title,
  brand,
  condition,
  price,
  stock,
  description,
}: ProductInfoProps) {
  return (
    <div className="flex flex-col gap-3">
      <ConditionBadge condition={condition as "nuevo" | "usado" | "reacondicionado"} />

      <h1 className="text-2xl font-bold" data-testid="product-title">{title}</h1>

      {brand && <p className="text-sm text-muted-foreground">Marca: {brand}</p>}

      <Price value={price} className="text-3xl font-bold text-primary" data-testid="product-price" />

      <p className="text-sm text-muted-foreground" data-testid="product-stock">
        {stock > 0 ? `${stock} disponible${stock === 1 ? "" : "s"}` : "Sin stock"}
      </p>

      {stock === 0 && (
        <p className="text-sm text-destructive" data-testid="product-stock-zero-msg">
          Producto sin stock disponible
        </p>
      )}

      {description && (
        <div className="pt-2">
          <h2 className="mb-1 font-semibold">Descripción</h2>
          <p className="whitespace-pre-line text-sm text-muted-foreground">{description}</p>
        </div>
      )}
    </div>
  )
}
