"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useOrder } from "@/hooks/useOrders"
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge"
import { OrderItemsTable } from "@/components/orders/OrderItemsTable"
import { Price } from "@/components/shared/Price"
import { Button } from "@/components/ui/button"
import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { OrderStatus } from "@/lib/constants/roles"

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-PE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>()
  const { order, loading, error, canceling, cancel, retry } = useOrder(params.id)
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  if (loading) {
    return <LoadingState variant="list" count={2} className="py-8" />
  }

  if (error || !order) {
    return (
      <ErrorState
        title="Pedido no encontrado"
        description="No existe o no tienes acceso a este pedido."
        onRetry={retry}
      />
    )
  }

  const handleCancel = async () => {
    setCancelError(null)
    try {
      await cancel()
      setConfirmingCancel(false)
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "No se pudo cancelar el pedido.")
    }
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" data-testid="order-id">Pedido #{order.id.slice(0, 8)}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
        </div>
        <div data-testid="order-status"><OrderStatusBadge status={order.status} />
      </div>

      <OrderItemsTable items={order.order_items} />

      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <span className="font-medium">Total</span>
        <Price value={order.total} className="text-xl font-bold" />
      </div>

      {order.status === OrderStatus.PENDING && (
        <div className="rounded-lg border border-border p-4">
          {!confirmingCancel ? (
            <Button variant="outline" onClick={() => setConfirmingCancel(true)}>
              Cancelar pedido
            </Button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm">
                ¿Seguro que quieres cancelar este pedido? El stock no se repone
                automáticamente.
              </p>
              {cancelError && <p className="text-sm text-destructive">{cancelError}</p>}
              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleCancel} disabled={canceling}>
                  Sí, cancelar
                </Button>
                <Button variant="ghost" onClick={() => setConfirmingCancel(false)}>
                  No
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
