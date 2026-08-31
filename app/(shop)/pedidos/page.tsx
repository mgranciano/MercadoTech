"use client"

import Link from "next/link"
import { Package } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useOrders } from "@/hooks/useOrders"
import { OrderCard } from "@/components/orders/OrderCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { Button } from "@/components/ui/button"

export default function OrdersPage() {
  const { profile, initializing } = useAuth()
  const { orders, loading, error, retry } = useOrders(profile?.id)

  if (initializing || loading) {
    return <LoadingState variant="list" count={3} className="py-8" />
  }

  if (error) {
    return (
      <ErrorState title="No pudimos cargar tus pedidos" description={error} onRetry={retry} />
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <EmptyState
          icon={<Package size={48} />}
          title="Todavía no tienes pedidos"
          description="Cuando compres un producto, lo verás aquí."
          action={
            <Link href="/">
              <Button variant="outline">Explorar productos</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-8">
      <h1 className="text-2xl font-bold">Mis pedidos</h1>
      <div data-testid="orders-list">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  )
}
