"use client"

import { useState } from "react"
import type { ProductWithDetails } from "@/types/product"

export interface SemanticSearchResult extends ProductWithDetails {
  similarity: number
}

interface UseSemanticSearchState {
  results: SemanticSearchResult[]
  loading: boolean
  error: string | null
  unauthorized: boolean
}

const INITIAL_STATE: UseSemanticSearchState = {
  results: [],
  loading: false,
  error: null,
  unauthorized: false,
}

export function useSemanticSearch() {
  const [state, setState] = useState<UseSemanticSearchState>(INITIAL_STATE)

  const search = async (query: string) => {
    setState({ results: [], loading: true, error: null, unauthorized: false })

    try {
      const response = await fetch("/api/v1/search/semantic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })

      if (response.status === 401) {
        setState({ results: [], loading: false, error: null, unauthorized: true })
        return
      }

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error?.message || "No se pudo completar la búsqueda.")
      }

      const body = (await response.json()) as { results: SemanticSearchResult[] }
      setState({ results: body.results, loading: false, error: null, unauthorized: false })
    } catch (err) {
      setState({
        results: [],
        loading: false,
        unauthorized: false,
        error: err instanceof Error ? err.message : "No se pudo completar la búsqueda.",
      })
    }
  }

  return { ...state, search }
}
