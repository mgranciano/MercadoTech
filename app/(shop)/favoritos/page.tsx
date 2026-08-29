"use client"

import { useAuth } from "@/hooks/useAuth"
import { useFavorites } from "@/hooks/useFavorites"
import { ProductGrid } from "@/components/catalog/ProductGrid"
import { LoadingState } from "@/components/shared/LoadingState"

export default function FavoritesPage() {
  const { profile, initializing } = useAuth()
  const { items, loading, error, retry } = useFavorites(profile?.id)

  if (initializing) {
    return <LoadingState variant="grid" count={4} className="py-8" />
  }

  return (
    <div className="py-8">
      <h1 className="mb-6 text-2xl font-bold">Mis favoritos</h1>
      <ProductGrid
        products={items}
        loading={loading}
        error={error}
        emptyTitle="Sin favoritos todavía"
        emptyDescription="Guarda los productos que te interesen para encontrarlos aquí."
      />
      {error && (
        <div className="mt-4 flex justify-center">
          <button onClick={retry} className="text-sm text-primary underline">
            Reintentar
          </button>
        </div>
      )}
    </div>
  )
}
