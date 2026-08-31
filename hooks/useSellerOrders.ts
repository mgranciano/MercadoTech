"use client"

import { useEffect, useState } from "react"
import { listMyOrders, updateOrderStatus } from "@/services/seller.service"
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } from "@/lib/constants/orders"
import type { OrderStatus } from "@/lib/constants/roles"
import type { SellerOrder } from "@/types/seller"

// Helper puro para validar transición de status (exportado para tests de Fase 6.3)
export function validateStatusTransition(fromStatus: string, toStatus: string): boolean {
  const fromIndex = ORDER_STATUS_FLOW.indexOf(fromStatus as OrderStatus)
  const toIndex = ORDER_STATUS_FLOW.indexOf(toStatus as OrderStatus)
  return fromIndex !== -1 && toIndex === fromIndex + 1
}

export function useSellerOrders(sellerId?: string) {
  const [orders, setOrders] = useState<SellerOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [moveError, setMoveError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true

    const fetchOrders = async () => {
      if (!sellerId) {
        setOrders([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const data = await listMyOrders(sellerId)
        if (active) setOrders(data)
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Error al cargar los pedidos")
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchOrders()

    return () => {
      active = false
    }
  }, [sellerId, refreshKey])

  const retry = () => setRefreshKey((k) => k + 1)

  // La secuencia no se valida en RLS a propósito (decisión 9): "un paso
  // adelante" en ORDER_STATUS_FLOW se exige acá. Nota: orders.status es del
  // PEDIDO completo, no de "mis ítems" — en un pedido multi-vendedor mover
  // la tarjeta cambia el estado para todos los vendedores del pedido.
  // Limitación del modelo, fuera de alcance de esta sesión.
  const move = async (orderId: string, toStatus: string) => {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return

    if (!validateStatusTransition(order.status, toStatus)) {
      const fromLabel = ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status
      const toLabel = ORDER_STATUS_LABELS[toStatus as OrderStatus] ?? toStatus
      setMoveError(`No puedes mover un pedido de "${fromLabel}" directo a "${toLabel}".`)
      return
    }

    setMoveError(null)
    const previous = orders
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: toStatus } : o)))

    try {
      await updateOrderStatus(orderId, toStatus)
    } catch (err) {
      setOrders(previous)
      setMoveError(err instanceof Error ? err.message : "No se pudo mover el pedido.")
    }
  }

  return { orders, loading, error, moveError, move, retry }
}
