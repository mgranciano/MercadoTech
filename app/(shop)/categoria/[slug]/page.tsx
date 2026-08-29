"use client"

import { Suspense, useEffect, useState } from "react"
import { ProductGrid } from "@/components/catalog/ProductGrid"
import { FiltersPanel } from "@/components/catalog/FiltersPanel"
import { Pagination } from "@/components/catalog/Pagination"
import { useProducts } from "@/hooks/useProducts"
import { getCategoryBySlug, type Category } from "@/services/category.service"
import { PRODUCTS_PAGE_SIZE } from "@/lib/constants/catalog"

interface CategoryPageProps {
  params: { slug: string }
}

function CategoryContent({ slug }: { slug: string }) {
  const [category, setCategory] = useState<Category | null>(null)
  const [loadingCategory, setLoadingCategory] = useState(true)

  useEffect(() => {
    const fetchCategory = async () => {
      const cat = await getCategoryBySlug(slug)
      setCategory(cat)
      setLoadingCategory(false)
    }

    void fetchCategory()
  }, [slug])

  const { items, total, page, loading, error, setFilter, setPage } =
    useProducts({ categoryId: category?.id })

  if (loadingCategory) {
    return <div className="text-center py-8">Cargando categoría...</div>
  }

  if (!category) {
    return <div className="text-center py-8">Categoría no encontrada</div>
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

export default function CategoryPage({ params }: CategoryPageProps) {
  return <CategoryContent slug={params.slug} />
}
