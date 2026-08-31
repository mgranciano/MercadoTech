import type { Resource } from '@modelcontextprotocol/sdk/types.js'

export const infoResource: Resource = {
  uri: 'mercadotech://info',
  name: 'Información de MercadoTech',
  description:
    'Descripción general de la plataforma: qué es, cómo funciona, políticas principales y cómo interactuar.',
  mimeType: 'text/plain',
}

export async function getInfoContent(): Promise<string> {
  return `
# MercadoTech: Marketplace de Tecnología

## ¿Qué es MercadoTech?
MercadoTech es un marketplace de productos tecnológicos donde compradores pueden explorar, comparar y comprar productos de vendedores verificados. Contamos con cientos de artículos en categorías como computadoras, accesorios, periféricos y más.

## Cómo comprar
1. **Navega el catálogo:** Explora productos por categoría o usa búsqueda semántica ("laptops gamer de bajo presupuesto").
2. **Lee detalles:** Cada producto muestra especificaciones, precio actual, stock, reseñas y preguntas de otros clientes.
3. **Haz preguntas:** Si algo no está claro, pregúntale al vendedor.
4. **Agrega al carrito:** Selecciona cantidad y procede al checkout.
5. **Checkéate:** Completa la compra (simulada — no hay pago real).

## Políticas
- **Devoluciones:** 30 días si el producto llega defectuoso o no coincide con la descripción.
- **Garantía:** Varía por vendedor (típicamente 12 meses en electrónica).
- **Envío:** Gratuito en compras mayores a $50. Internacional disponible en seleccionadas.
- **Reseñas:** Solo clientes con compra verificada pueden reseñar.

## Asistente
Soy tu asistente de IA. Puedo ayudarte a:
- Buscar productos por descripción (semántica).
- Comparar artículos.
- Responder preguntas sobre políticas y procedimientos.
- Ayudarte con problemas técnicos.

Todas mis respuestas se basan en la información real de la tienda — jamás invento datos.
`.trim()
}
