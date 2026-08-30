"use client"

import { X } from "lucide-react"
import { ProductImage } from "@/components/shared/ProductImage"
import { Price } from "@/components/shared/Price"
import { Button } from "@/components/ui/button"
import type { CartItemWithProduct } from "@/types/cart"

interface CartItemRowProps {
  item: CartItemWithProduct
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
}

export function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  if (!item.product) {
    return (
      <div className="flex items-center justify-between gap-4 border-b border-border py-4 last:border-b-0">
        <p className="text-sm text-muted-foreground">Este producto ya no está disponible.</p>
        <Button variant="ghost" size="sm" onClick={() => onRemove(item.id)} className="gap-1">
          <X size={16} />
          Quitar
        </Button>
      </div>
    )
  }

  const { title, price, stock, imageUrl } = item.product
  const quantityOptions = Math.max(stock, item.quantity)

  return (
    <div className="flex items-center gap-4 border-b border-border py-4 last:border-b-0">
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
        {imageUrl ? (
          <ProductImage src={imageUrl} alt={title} fill className="h-full w-full" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            Sin imagen
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{title}</p>
        <Price value={price} className="text-sm text-primary" />
      </div>

      <select
        value={item.quantity}
        onChange={(e) => onUpdateQuantity(item.id, Number(e.target.value))}
        aria-label={`Cantidad de ${title}`}
        className="rounded-md border border-input bg-background px-2 py-1 text-sm"
      >
        {Array.from({ length: quantityOptions }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(item.id)}
        aria-label={`Quitar ${title} del carrito`}
      >
        <X size={16} />
      </Button>
    </div>
  )
}
