"use client"

import { Suspense, useEffect, useState } from "react"
import { ProductGrid } from "@/components/catalog/ProductGrid"
import { FiltersPanel } from "@/components/catalog/FiltersPanel"
import { Pagination } from "@/components/catalog/Pagination"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { useProducts } from "@/hooks/useProducts"
import { getCategoryBySlug } from "@/services/category.service"
import type { Category } from "@/types/category"
import { PRODUCTS_PAGE_SIZE } from "@/lib/constants/catalog"

interface CategoryPageProps {
  params: { slug: string }
}

function CategoryContent({ slug }: { slug: string }) {
  const [category, setCategory] = useState<Category | null>(null)
  const [loadingCategory, setLoadingCategory] = useState(true)
  const [categoryError, setCategoryError] = useState(false)
  const [categoryRefreshKey, setCategoryRefreshKey] = useState(0)

  useEffect(() => {
    let active = true

    const fetchCategory = async () => {
      setLoadingCategory(true)
      setCategoryError(false)

      const cat = await getCategoryBySlug(slug)
      if (!active) return

      if (!cat) setCategoryError(true)
      setCategory(cat)
      setLoadingCategory(false)
    }

    void fetchCategory()

    return () => {
      active = false
    }
  }, [slug, categoryRefreshKey])

  const { items, total, page, loading, error, setFilter, setPage, retry } =
    useProducts({ categoryId: category?.id })

  if (loadingCategory) {
    return <LoadingState variant="grid" count={8} className="py-8" />
  }

  if (categoryError || !category) {
    return (
      <ErrorState
        title="Categoría no encontrada"
        description="No existe una categoría con esa URL."
        onRetry={() => setCategoryRefreshKey((k) => k + 1)}
        className="py-8"
      />
    )
  }

  const categoryName = category.name

  return (
    <div className="py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Categoría: {categoryName}</h1>
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

export default function CategoryPage({ params }: CategoryPageProps) {
  return <CategoryContent slug={params.slug} />
}
