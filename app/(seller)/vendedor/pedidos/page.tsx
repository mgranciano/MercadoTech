"use client"

import { useAuth } from "@/hooks/useAuth"
import { useSellerOrders } from "@/hooks/useSellerOrders"
import { OrdersKanban } from "@/components/seller/OrdersKanban"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"

export default function SellerOrdersPage() {
  const { profile } = useAuth()
  const { orders, loading, error, moveError, move, retry } = useSellerOrders(profile?.id)

  return (
    <div className="flex flex-col gap-6 py-8">
      <div>
        <h1 className="mb-1 text-xl font-extrabold tracking-tighter lg:text-[26px]">
          Tablero de pedidos
        </h1>
        <p className="text-[13px] text-muted-foreground">
          <span className="hidden lg:inline">
            Arrastra las tarjetas entre columnas para actualizar el estado
          </span>
          <span className="lg:hidden">Desliza entre estados</span> · {orders.length} pedidos activos
        </p>
      </div>

      {moveError && <p className="text-sm text-destructive">{moveError}</p>}

      {loading ? (
        <LoadingState variant="list" count={3} />
      ) : error ? (
        <ErrorState title="No pudimos cargar tus pedidos" description={error} onRetry={retry} />
      ) : (
        <OrdersKanban orders={orders} onMove={move} />
      )}
    </div>
  )
}
