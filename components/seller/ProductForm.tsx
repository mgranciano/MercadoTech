"use client"

import { CONDITION_OPTIONS } from "@/lib/constants/catalog"
import { MAX_IMAGES_PER_PRODUCT } from "@/lib/constants/product"
import { Button } from "@/components/ui/button"
import { SortableImageGallery } from "./SortableImageGallery"
import type { Category } from "@/types/category"
import type { ProductFormValues } from "@/lib/validators/product"

// Misma forma que hooks/useProductForm.ts's GalleryImage: se declara acá en
// vez de importarla porque components/ no puede importar de hooks/.
export interface GalleryImage {
  id: string
  url: string
  status: "local" | "persisted"
  file?: File
  imagePath?: string
}

const INPUT_CLASS =
  "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"

interface ProductFormProps {
  mode: "create" | "edit"
  values: ProductFormValues
  errors: Record<string, string>
  categories: Category[]
  images: GalleryImage[]
  submitting: boolean
  submitError?: string | null
  onChange: (field: keyof ProductFormValues, value: string) => void
  onAddFiles: (files: FileList) => void
  onRemoveImage: (id: string) => void
  onReorderImages: (newOrder: GalleryImage[]) => void
  onSubmit: () => void
}

export function ProductForm({
  mode,
  values,
  errors,
  categories,
  images,
  submitting,
  submitError,
  onChange,
  onAddFiles,
  onRemoveImage,
  onReorderImages,
  onSubmit,
}: ProductFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-6">
      <div>
        <label htmlFor="title" className="text-sm font-medium">
          Título
        </label>
        <input
          id="title"
          value={values.title}
          onChange={(e) => onChange("title", e.target.value)}
          className={INPUT_CLASS}
        />
        {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="description" className="text-sm font-medium">
          Descripción
        </label>
        <textarea
          id="description"
          value={values.description}
          onChange={(e) => onChange("description", e.target.value)}
          rows={4}
          className={`${INPUT_CLASS} resize-none`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="brand" className="text-sm font-medium">
            Marca
          </label>
          <input
            id="brand"
            value={values.brand}
            onChange={(e) => onChange("brand", e.target.value)}
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label htmlFor="condition" className="text-sm font-medium">
            Condición
          </label>
          <select
            id="condition"
            value={values.condition}
            onChange={(e) => onChange("condition", e.target.value)}
            className={INPUT_CLASS}
          >
            {CONDITION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="categoryId" className="text-sm font-medium">
          Categoría
        </label>
        <select
          id="categoryId"
          value={values.categoryId}
          onChange={(e) => onChange("categoryId", e.target.value)}
          className={INPUT_CLASS}
        >
          <option value="">Selecciona una categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && <p className="mt-1 text-sm text-destructive">{errors.categoryId}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className="text-sm font-medium">
            Precio
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={values.price}
            onChange={(e) => onChange("price", e.target.value)}
            className={INPUT_CLASS}
          />
          {errors.price && <p className="mt-1 text-sm text-destructive">{errors.price}</p>}
        </div>

        <div>
          <label htmlFor="stock" className="text-sm font-medium">
            Stock
          </label>
          <input
            id="stock"
            type="number"
            min="0"
            step="1"
            value={values.stock}
            onChange={(e) => onChange("stock", e.target.value)}
            className={INPUT_CLASS}
          />
          {errors.stock && <p className="mt-1 text-sm text-destructive">{errors.stock}</p>}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Imágenes</p>
        <SortableImageGallery
          images={images}
          onReorder={onReorderImages}
          onRemove={onRemoveImage}
          onAddFiles={onAddFiles}
          maxImages={MAX_IMAGES_PER_PRODUCT}
        />
        {errors.images && <p className="mt-1 text-sm text-destructive">{errors.images}</p>}
      </div>

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <Button type="submit" disabled={submitting} className="self-start">
        {submitting ? "Guardando..." : mode === "create" ? "Publicar producto" : "Guardar cambios"}
      </Button>
    </form>
  )
}
