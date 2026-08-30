import { MAX_IMAGES_PER_PRODUCT, TITLE_MAX, TITLE_MIN } from "@/lib/constants/product"

export interface ProductFormValues {
  title: string
  description: string
  brand: string
  categoryId: string
  condition: string
  price: string
  stock: string
}

export interface ValidationError {
  field: string
  message: string
}

export function validateProduct(values: ProductFormValues, imageCount: number): ValidationError[] {
  const errors: ValidationError[] = []

  const title = values.title.trim()
  if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
    errors.push({
      field: "title",
      message: `El título debe tener entre ${TITLE_MIN} y ${TITLE_MAX} caracteres.`,
    })
  }

  const price = Number(values.price)
  if (!values.price.trim() || Number.isNaN(price) || price <= 0) {
    errors.push({ field: "price", message: "El precio debe ser mayor a 0." })
  }

  const stock = Number(values.stock)
  if (!values.stock.trim() || Number.isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
    errors.push({ field: "stock", message: "El stock debe ser 0 o mayor." })
  }

  if (!values.categoryId) {
    errors.push({ field: "categoryId", message: "Selecciona una categoría." })
  }

  if (imageCount < 1) {
    errors.push({ field: "images", message: "Agrega al menos una imagen." })
  } else if (imageCount > MAX_IMAGES_PER_PRODUCT) {
    errors.push({ field: "images", message: `Máximo ${MAX_IMAGES_PER_PRODUCT} imágenes.` })
  }

  return errors
}
