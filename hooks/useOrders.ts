"use client"

import { useEffect, useState } from "react"
import { cancelIfPending, getOrderById, listMyOrders } from "@/services/order.service"
import type { OrderWithItems } from "@/types/order"

export function useOrders(userId?: string) {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true

    const fetchOrders = async () => {
      if (!userId) {
        setOrders([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const data = await listMyOrders(userId)
        if (active) setOrders(data)
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Error al cargar tus pedidos")
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchOrders()

    return () => {
      active = false
    }
  }, [userId, refreshKey])

  const retry = () => setRefreshKey((k) => k + 1)

  return { orders, loading, error, retry }
}

export function useOrder(orderId: string) {
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [canceling, setCanceling] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true

    const fetchOrder = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await getOrderById(orderId)
        if (!active) return

        if (!data) {
          setError("Pedido no encontrado")
        }
        setOrder(data)
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Error al cargar el pedido")
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchOrder()

    return () => {
      active = false
    }
  }, [orderId, refreshKey])

  const retry = () => setRefreshKey((k) => k + 1)

  // No reutiliza `error` (ese es del fetch inicial): un fallo aquí no debe
  // tumbar la página entera a la vista de "no encontrado". El llamador
  // captura el throw y decide dónde mostrarlo.
  const cancel = async () => {
    setCanceling(true)
    try {
      await cancelIfPending(orderId)
      retry()
    } finally {
      setCanceling(false)
    }
  }

  return { order, loading, error, canceling, cancel, retry }
}
