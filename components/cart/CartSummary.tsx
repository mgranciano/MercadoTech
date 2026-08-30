"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Price } from "@/components/shared/Price"
import { Button } from "@/components/ui/button"

interface CartSummaryProps {
  subtotal: number
  itemCount: number
  onCheckout: () => Promise<string>
}

export function CartSummary({ subtotal, itemCount, onCheckout }: CartSummaryProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    setSubmitting(true)
    setError(null)

    try {
      const orderId = await onCheckout()
      router.push(`/pedidos/${orderId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo completar la compra.")
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Subtotal ({itemCount})</span>
        <Price value={subtotal} className="text-lg font-bold" />
      </div>

      <p className="text-xs text-muted-foreground">
        Pago simulado para el laboratorio — no se cobra.
      </p>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={handleCheckout} disabled={submitting || itemCount === 0}>
        {submitting ? "Procesando..." : "Finalizar compra"}
      </Button>
    </div>
  )
}
