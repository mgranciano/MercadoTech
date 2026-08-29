"use client"

import { Suspense } from "react"
import { ProductGrid } from "@/components/catalog/ProductGrid"
import { FiltersPanel } from "@/components/catalog/FiltersPanel"
import { Pagination } from "@/components/catalog/Pagination"
import { useProducts } from "@/hooks/useProducts"
import { PRODUCTS_PAGE_SIZE } from "@/lib/constants/catalog"

function HomePageContent() {
  const { items, total, page, loading, error, setFilter, setPage } = useProducts()

  return (
    <div className="py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Catálogo de productos</h1>
        <p className="text-muted-foreground">
          {total > 0 ? `${total} productos disponibles` : "No hay productos"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="lg:col-span-1">
          <Suspense>
            <FiltersPanel onFilterChange={setFilter} />
          </Suspense>
        </div>

        {/* Products */}
        <div className="lg:col-span-3 space-y-6">
          <ProductGrid products={items} loading={loading} error={error} />

          {total > PRODUCTS_PAGE_SIZE && (
            <Pagination
              currentPage={page}
              total={total}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense>
      <HomePageContent />
    </Suspense>
  )
}
