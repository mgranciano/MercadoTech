"use client"

import { useState } from "react"
import { Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BuyBoxProps {
  stock: number
  isActive: boolean
  isOwner: boolean
  hasSession: boolean
  favorite: boolean
  favoriteLoading?: boolean
  onAddToCart: (quantity: number) => void
  onToggleFavorite: () => void
  onRequireLogin: () => void
}

export function BuyBox({
  stock,
  isActive,
  isOwner,
  hasSession,
  favorite,
  favoriteLoading = false,
  onAddToCart,
  onToggleFavorite,
  onRequireLogin,
}: BuyBoxProps) {
  const [quantity, setQuantity] = useState(1)

  const disabledReason = !isActive
    ? "Este producto ya no está disponible."
    : isOwner
      ? "No puedes comprar tu propio producto."
      : stock === 0
        ? "Sin stock disponible."
        : null

  const canBuy = disabledReason === null

  const handleAddToCart = () => {
    if (!hasSession) {
      onRequireLogin()
      return
    }
    onAddToCart(quantity)
  }

  const handleFavoriteClick = () => {
    if (!hasSession) {
      onRequireLogin()
      return
    }
    onToggleFavorite()
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
      {canBuy && (
        <div className="flex items-center gap-2">
          <label htmlFor="buybox-quantity" className="text-sm font-medium">
            Cantidad
          </label>
          <select
            id="buybox-quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="rounded-md border border-input bg-background px-2 py-1 text-sm"
          >
            {Array.from({ length: stock }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      )}

      {disabledReason && <p className="text-sm text-destructive">{disabledReason}</p>}

      <Button onClick={handleAddToCart} disabled={!canBuy} className="gap-2">
        <ShoppingCart size={18} />
        Agregar al carrito
      </Button>

      <Button
        onClick={handleFavoriteClick}
        variant="outline"
        disabled={favoriteLoading}
        className="gap-2"
      >
        <Heart size={18} className={cn(favorite && "fill-current text-destructive")} />
        {favorite ? "Guardado en favoritos" : "Agregar a favoritos"}
      </Button>
    </div>
  )
}
