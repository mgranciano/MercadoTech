"use client"

import { useEffect, useState } from "react"
import { listMine, type Ticket } from "@/services/ticket.service"

export function useMyTickets(userId?: string) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const fetchTickets = async () => {
      if (!userId) {
        setTickets([])
        setLoading(false)
        return
      }

      setLoading(true)

      const data = await listMine(userId)
      if (active) {
        setTickets(data)
        setLoading(false)
      }
    }

    fetchTickets()

    return () => {
      active = false
    }
  }, [userId])

  return { tickets, loading }
}
