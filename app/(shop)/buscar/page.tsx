"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProductGrid } from "@/components/catalog/ProductGrid"
import { FiltersPanel } from "@/components/catalog/FiltersPanel"
import { Pagination } from "@/components/catalog/Pagination"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useProducts } from "@/hooks/useProducts"
import { useSemanticSearch } from "@/hooks/useSemanticSearch"
import { useAuth } from "@/hooks/useAuth"
import { PRODUCTS_PAGE_SIZE } from "@/lib/constants/catalog"

function ExactResultsTab() {
  const { items, total, page, loading, error, setFilter, setPage, retry } =
    useProducts()

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        {total > 0 ? `${total} productos encontrados` : "No hay resultados"}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Suspense>
            <FiltersPanel onFilterChange={setFilter} />
          </Suspense>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <ProductGrid products={items} loading={loading} error={error} onRetry={retry} />

          {total > PRODUCTS_PAGE_SIZE && (
            <Pagination currentPage={page} total={total} onPageChange={setPage} />
          )}
        </div>
      </div>
    </div>
  )
}

// Pestaña IA (decisión 1: exige sesión — protege la cuota gratuita de
// Hugging Face y evita ofrecer una búsqueda que no puede correr). Reutiliza
// el mismo ProductGrid que la pestaña exacta: el EmptyState de "sin sesión"
// es solo otra combinación de sus props, no un componente nuevo.
function SemanticResultsTab({ query }: { query: string }) {
  const router = useRouter()
  const { user, initializing } = useAuth()
  const { results, loading, error, search } = useSemanticSearch()

  useEffect(() => {
    if (!initializing && user && query) {
      search(query)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, initializing, query])

  if (initializing) {
    return <ProductGrid products={[]} loading />
  }

  if (!user) {
    return (
      <ProductGrid
        products={[]}
        emptyTitle="Inicia sesión para usar la búsqueda inteligente"
        emptyDescription="La búsqueda por significado usa un asistente de IA y necesita sesión iniciada."
        emptyAction={
          <Button
            onClick={() =>
              router.push(`/login?redirectTo=${encodeURIComponent(`/buscar?q=${query}`)}`)
            }
          >
            Iniciar sesión
          </Button>
        }
      />
    )
  }

  return (
    <ProductGrid
      products={results}
      loading={loading}
      error={error}
      onRetry={() => search(query)}
      emptyTitle="No encontramos resultados"
      emptyDescription="Prueba describir para qué lo necesitas, con tus propias palabras."
    />
  )
}

function SearchPageContent({ query }: { query: string }) {
  return (
    <div className="py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Resultados para &quot;{query}&quot;
        </h1>
      </div>

      <Tabs defaultValue="exacta">
        <TabsList>
          <TabsTrigger value="exacta">Coincidencia exacta</TabsTrigger>
          <TabsTrigger value="ia">Resultados con IA</TabsTrigger>
        </TabsList>

        <TabsContent value="exacta">
          <ExactResultsTab />
        </TabsContent>

        <TabsContent value="ia">
          <SemanticResultsTab query={query} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SearchPageWrapper() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  return <SearchPageContent query={query} />
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageWrapper />
    </Suspense>
  )
}
