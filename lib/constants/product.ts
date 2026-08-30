export const TITLE_MIN = 5
export const TITLE_MAX = 120

// Debe coincidir con el bucket product-images (migración 0018): 5 MB,
// JPEG/PNG/WebP. Validar en el cliente evita subir y recién ahí fallar.
export const MAX_IMAGES_PER_PRODUCT = 6
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
