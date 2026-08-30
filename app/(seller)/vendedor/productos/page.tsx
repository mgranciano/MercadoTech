"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { useSellerProducts } from "@/hooks/useSellerProducts"
import { ProductsTable } from "@/components/seller/ProductsTable"
import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"

export default function SellerProductsPage() {
  const { profile } = useAuth()
  const { products, loading, error, retry, toggle, remove } = useSellerProducts(profile?.id)

  return (
    <div className="flex flex-col gap-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis productos</h1>
        <Link href="/vendedor/publicar">
          <Button>Publicar producto</Button>
        </Link>
      </div>

      {loading ? (
        <LoadingState variant="list" count={3} />
      ) : error ? (
        <ErrorState title="No pudimos cargar tus productos" description={error} onRetry={retry} />
      ) : (
        <ProductsTable products={products} onToggleActive={toggle} onDelete={remove} />
      )}
    </div>
  )
}
