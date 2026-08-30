"use client"

import { useEffect, useRef, useState } from "react"
import { addItem, getItems, removeItem, updateQuantity } from "@/services/cart.service"
import { checkout as checkoutRequest } from "@/services/order.service"
import type { CartItemWithProduct } from "@/types/cart"

// El carrito vive en varias instancias del hook a la vez (navbar, página del
// carrito, BuyBox del detalle). Este evento las mantiene sincronizadas sin
// introducir un context/provider: cada mutación lo dispara y cada instancia
// (incluida la que mutó) lo escucha para refrescar su propio estado.
const CART_CHANGED_EVENT = "mercadotech:cart-changed"

function notifyCartChanged() {
  window.dispatchEvent(new CustomEvent(CART_CHANGED_EVENT))
}

export function useCart(userId?: string) {
  const [items, setItems] = useState<CartItemWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  // El checkout fallido dispara un recargo del carrito (el stock pudo
  // cambiar) sin que eso deba tumbar la página a su skeleton de carga: eso
  // desmontaría CartSummary y con él el mensaje de error que se acaba de
  // mostrar. Solo la carga inicial pasa loading a true.
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    let active = true

    const fetchCart = async () => {
      if (!userId) {
        setItems([])
        setLoading(false)
        hasLoadedRef.current = true
        return
      }

      if (!hasLoadedRef.current) setLoading(true)
      setError(null)

      try {
        const data = await getItems(userId)
        if (active) setItems(data)
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Error al cargar el carrito")
        }
      } finally {
        if (active) {
          setLoading(false)
          hasLoadedRef.current = true
        }
      }
    }

    fetchCart()

    return () => {
      active = false
    }
  }, [userId, refreshKey])

  useEffect(() => {
    const handler = () => setRefreshKey((k) => k + 1)
    window.addEventListener(CART_CHANGED_EVENT, handler)
    return () => window.removeEventListener(CART_CHANGED_EVENT, handler)
  }, [])

  const add = async (productId: string, quantity: number) => {
    if (!userId) return
    await addItem(userId, productId, quantity)
    notifyCartChanged()
  }

  const update = async (itemId: string, quantity: number) => {
    await updateQuantity(itemId, quantity)
    notifyCartChanged()
  }

  const remove = async (itemId: string) => {
    await removeItem(itemId)
    notifyCartChanged()
  }

  const checkout = async (): Promise<string> => {
    if (!userId) throw new Error("Debes iniciar sesión")

    try {
      const orderId = await checkoutRequest(userId)
      notifyCartChanged()
      return orderId
    } catch (err) {
      // El stock pudo cambiar durante la validación del RPC: recargar igual.
      notifyCartChanged()
      throw err
    }
  }

  const subtotal = items.reduce(
    (sum, item) => sum + (item.product ? item.product.price * item.quantity : 0),
    0
  )

  return {
    items,
    subtotal,
    count: items.length,
    loading,
    error,
    add,
    update,
    remove,
    checkout,
  }
}
