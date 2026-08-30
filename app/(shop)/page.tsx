"use client"

import { Suspense } from "react"
import { ProductGrid } from "@/components/catalog/ProductGrid"
import { FiltersPanel } from "@/components/catalog/FiltersPanel"
import { Pagination } from "@/components/catalog/Pagination"
import { useProducts } from "@/hooks/useProducts"
import { PRODUCTS_PAGE_SIZE } from "@/lib/constants/catalog"

function HomePageContent() {
  const { items, total, page, loading, error, setFilter, setPage, retry } = useProducts()

  return (
    <div className="space-y-6 py-4 lg:py-6">
      <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(115deg,#07173d_0%,#0b4fd6_48%,#5c1fd6_100%)] p-5 lg:p-7">
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,.5),transparent_65%)]" />
        <div className="relative max-w-[46ch]">
          <span className="inline-flex items-center gap-2 rounded-full border border-ai-cyan/45 bg-ai-cyan/15 px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-widest text-ai-cyan">
            ✦ MercadoTech · Catálogo
          </span>
          <h1 className="mt-2.5 text-pretty text-[22px] font-extrabold leading-[1.1] tracking-tighter text-white lg:text-[28px]">
            Encuentra tu próxima compra tecnológica
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-white/75">
            {total > 0 ? `${total} productos disponibles` : "No hay productos"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Filters */}
        <div className="lg:col-span-1">
          <Suspense>
            <FiltersPanel onFilterChange={setFilter} />
          </Suspense>
        </div>

        {/* Products */}
        <div className="lg:col-span-3 space-y-6">
          <ProductGrid products={items} loading={loading} error={error} onRetry={retry} />

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
