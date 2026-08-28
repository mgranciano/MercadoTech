export const UserRole = {
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const OrderStatus = {
  PENDING: 'pendiente',
  PAID: 'pagado',
  SHIPPED: 'enviado',
  DELIVERED: 'entregado',
  CANCELLED: 'cancelado',
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

export const TicketStatus = {
  OPEN: 'abierto',
  IN_PROGRESS: 'en_proceso',
  RESOLVED: 'resuelto',
  CLOSED: 'cerrado',
} as const

export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus]

export const ProductCondition = {
  NEW: 'nuevo',
  USED: 'usado',
  REFURBISHED: 'reacondicionado',
} as const

export type ProductCondition = (typeof ProductCondition)[keyof typeof ProductCondition]
