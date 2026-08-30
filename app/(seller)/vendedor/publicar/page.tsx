"use client"

import { useAuth } from "@/hooks/useAuth"
import { useCategories } from "@/hooks/useCategories"
import { useProductForm } from "@/hooks/useProductForm"
import { ProductForm } from "@/components/seller/ProductForm"
import { LoadingState } from "@/components/shared/LoadingState"

export default function PublishProductPage() {
  const { profile } = useAuth()
  const { categories } = useCategories()
  const form = useProductForm({ mode: "create", sellerId: profile?.id })

  if (!profile) {
    return <LoadingState variant="list" count={2} className="py-8" />
  }

  return (
    <div className="py-8">
      <h1 className="mb-6 text-2xl font-bold">Publicar producto</h1>
      <ProductForm
        mode="create"
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
