"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useCart } from "@/hooks/useCart"
import { CartItemRow } from "@/components/cart/CartItemRow"
import { CartSummary } from "@/components/cart/CartSummary"
import { EmptyState } from "@/components/shared/EmptyState"
import { LoadingState } from "@/components/shared/LoadingState"

export default function CartPage() {
  const { profile, initializing } = useAuth()
  const { items, subtotal, count, loading, error, update, remove, checkout } = useCart(profile?.id)

  if (initializing || loading) {
    return <LoadingState variant="list" count={3} className="py-8" />
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-destructive">{error}</p>
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <EmptyState
          icon={<ShoppingCart size={48} />}
          title="Tu carrito está vacío"
          description="Explora el catálogo y agrega productos para comenzar."
          action={
            <Link href="/" className="text-sm text-primary underline">
              Ir al catálogo
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="grid gap-8 py-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="mb-4 text-2xl font-bold">Carrito de compras</h1>
        <div className="rounded-lg border border-border px-4">
          {items.map((item) => (
            <CartItemRow key={item.id} item={item} onUpdateQuantity={update} onRemove={remove} />
          ))}
        </div>
      </div>

      <div>
        <CartSummary subtotal={subtotal} itemCount={count} onCheckout={checkout} />
      </div>
    </div>
  )
}
