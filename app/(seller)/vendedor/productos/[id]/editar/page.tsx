"use client"

import { useParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useCategories } from "@/hooks/useCategories"
import { useProductForm } from "@/hooks/useProductForm"
import { ProductForm } from "@/components/seller/ProductForm"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"

export default function EditProductPage() {
  const params = useParams<{ id: string }>()
  const { profile } = useAuth()
  const { categories } = useCategories()
  const form = useProductForm({ mode: "edit", sellerId: profile?.id, productId: params.id })

  if (!profile || form.loading) {
    return <LoadingState variant="list" count={2} className="py-8" />
  }

  if (form.notFound) {
    return (
      <ErrorState
        title="Producto no encontrado"
        description="No existe o no tienes acceso a este producto."
      />
    )
  }

  return (
    <div className="py-8">
      <h1 className="mb-6 text-2xl font-bold">Editar producto</h1>
      <ProductForm
        mode="edit"
        values={form.values}
        errors={form.errors}
        categories={categories}
        images={form.images}
        submitting={form.submitting}
        submitError={form.submitError}
        onChange={form.setField}
        onAddFiles={form.addFiles}
        onRemoveImage={form.removeImage}
        onReorderImages={form.reorderImages}
        onSubmit={form.submit}
      />
    </div>
  )
}
