export const PRODUCTS_PAGE_SIZE = 12

export const SORT_OPTIONS = [
  { label: "Más recientes", value: "recientes" },
  { label: "Precio: menor a mayor", value: "precio_asc" },
  { label: "Precio: mayor a menor", value: "precio_desc" },
] as const

// products.condition solo admite estos 3 valores (check constraint de
// 0004_create_products_table.sql).
export const CONDITION_OPTIONS = [
  { label: "Nuevo", value: "nuevo" },
  { label: "Usado", value: "usado" },
  { label: "Reacondicionado", value: "reacondicionado" },
] as const

export const DEFAULT_PRICE_RANGE = {
  min: 0,
  max: 10000000,
}
