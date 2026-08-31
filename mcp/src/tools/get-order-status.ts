import { z } from 'zod'
import { getOrderByIdAdapter } from '../shared/adapters.js'
import { errorResult, textResult } from '../lib/tool-result.js'
import { safe } from '../lib/safe.js'
import { createContext } from '../context.js'

const getOrderStatusSchema = z.object({
  order_id: z
    .string()
    .uuid('El ID del pedido debe ser un UUID válido')
    .describe('UUID del pedido en la base de datos'),
})

type GetOrderStatusInput = z.infer<typeof getOrderStatusSchema>

const handler = safe(async (input: GetOrderStatusInput) => {
  const validated = getOrderStatusSchema.parse(input)
  const { anon } = await createContext()

  // Obtiene SOLO estado, fecha, total e ítems snapshot — sin datos del comprador.
  // En producción, esta herramienta requeriría autenticación del comprador para
  // verificar que el usuario puede ver este pedido (no implementado en Fase 5.3).
  const order = await getOrderByIdAdapter(validated.order_id, anon)

  if (!order) {
    return errorResult(`Pedido no encontrado: ${validated.order_id}`)
  }

  const itemsList = order.order_items
    .map((item) => `- Producto ${item.product_id}: ${item.quantity} ud. x $${item.price_snapshot}`)
    .join('\n')

  const formatted =
    `**Estado del pedido ${validated.order_id}**\n` +
    `Estado: ${order.status}\n` +
    `Fecha: ${new Date(order.created_at).toLocaleDateString()}\n` +
    `Total: $${order.total.toFixed(2)}\n` +
    `Ítems:\n${itemsList}`

  return textResult(formatted)
})

export const getOrderStatusTool = {
  name: 'get_order_status',
  description:
    'Obtiene el estado actual de un pedido: estado de entrega, fecha, total y qué productos incluyó. No devuelve datos personales del comprador.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      order_id: {
        type: 'string' as const,
        description: 'UUID del pedido (ejemplo: "550e8400-e29b-41d4-a716-446655440001")',
      },
    },
    required: ['order_id'],
  },
  handler,
}
