# Fase 5.5 — Inspector Checklist (Pasada manual)

Este documento es tu **guía paso a paso** para verificar que el servidor MCP funciona completamente en el Inspector de Claude Code.

**Requisitos previos:**
- `.mcp.json` está en la raíz ✅ (ya creado)
- `mcp/dist/index.js` está actualizado ✅ (build ejecutado)
- `.env.local` tiene `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` ✅
- Sesión local de Supabase está levantada (`supabase start`)

---

## Paso 0: Reiniciar Claude Code e Inicializar MCP

1. **Reinicia Claude Code completamente:**
   ```bash
   # Cierra Claude Code (Cmd+Q o File → Quit)
   # Reabre Claude Code
   ```

2. **Carga la sesión MCP:**
   Al abrir Claude Code en esta carpeta, aparecerá un prompt:
   > "mercadotech MCP server found. Do you want to register it?"
   
   Responde **Yes** (esto registra `.mcp.json`).

3. **Verifica la conexión:**
   En el terminal, escribe:
   ```bash
   /mcp
   ```
   
   Debe mostrar:
   ```
   Available MCP servers:
   - mercadotech (stdio): node mcp/dist/index.js
   ```

---

## Paso 1: Verifica ListTools (10 tools)

En el chat, pregunta:
```
What tools does the mercadotech server expose?
```

**Esperado:** Claude lista **exactamente 10 tools**:
1. `search_products`
2. `get_product`
3. `list_categories`
4. `get_product_reviews`
5. `get_product_questions`
6. `search_knowledge`
7. `ask_chat`
8. `get_order_status`
9. `get_store_stats`
10. `compare_products`

Marca cada uno en tu checklist. Si faltan o están de más, hay un problema en `mcp/src/tools/index.ts`.

---

## Paso 2: Verifica ListResources (7 resources + 2 templates)

En el chat:
```
List all resources available from the mercadotech server.
```

**Esperado:** Claude lista **7 resources estáticos**:
1. `mercadotech://info` (Info general)
2. `mercadotech://products` (Lista de productos)
3. `mercadotech://sellers` (Vendedores verificados)
4. `mercadotech://categories` (Categorías)
5. `mercadotech://faq` (FAQ y artículos de soporte)
6. `mercadotech://stats` (Estadísticas admin)

**Plus 2 resource templates (dinámicos):**
7. `mercadotech://products/{id}` (Detalles de un producto)
8. `mercadotech://sellers/{id}` (Detalles de un vendedor)

Verifica que cada recurso aparece listado.

---

## Paso 3: Verifica ListPrompts (5 prompts)

En el chat:
```
What prompts are available from mercadotech?
```

**Esperado:** Claude lista **5 prompts exactos**:
1. `describir_producto` (arg: `product_id`)
2. `comparar_productos` (args: `product_id_1`, `product_id_2`)
3. `redactar_respuesta_pregunta` (args: `product_id`, `question_index`)
4. `resumen_de_resenas` (arg: `product_id`)
5. `generar_articulo_faq` (arg: `topic`)

Verifica que cada prompt tiene su argumentación correcta.

---

## Paso 4: Prueba Tools — Casos de búsqueda (Tabla de síntomas)

### Caso 1: `search_products` — Audífonos para correr

```
Use the mercadotech server's search_products tool to search for: "audífonos para correr"
```

**Esperado:**
- Sony WH-1000XM5 debe aparecer **primero** o muy arriba (similitud >30%)
- Resultado incluye título, marca, precio, rating
- Similitud mostrada en porcentaje

**Tabla de síntomas:**
| Resultado | Síntoma | Solución |
|-----------|---------|----------|
| No encuentra Sony WH-1000XM5 | Embeddings no indexados o threshold muy alto | Ejecutar `npx tsx scripts/index-all.ts`, bajar threshold en constants/ai.ts |
| Encuentra Cisco Catalyst (ruido) | Threshold muy bajo | Subir threshold a 0.35+ |

---

### Caso 2: `get_product` — Obtén una laptop específica

Primero, obtén un UUID de producto real:
```
Use search_products to find a laptop, then call get_product with that UUID to show full details.
```

**Esperado:**
- Retorna: título completo, marca, precio (como número, no string), stock, condición, descripción, calificación, cantidad de reviews
- Imagen_url está resuelta (URL pública completa, no path relativo)

---

### Caso 3: `list_categories` — Categorías

```
Use list_categories to show me all product categories in the store.
```

**Esperado:**
- Lista categorías (ej: Laptops, Audífonos, Redes, etc.)
- Cada categoría incluye count de productos

---

### Caso 4: `compare_products` — Compara dos laptops

Primero, busca dos laptops:
```
Use search_products to find two different laptops, then use compare_products to show them side by side.
```

**Esperado:**
- Tabla markdown con:
  - Título de cada laptop
  - Precio ($)
  - Marca
  - Calificación (⭐ X/5, Y reseñas)
  - Stock
  - Condición

---

### Caso 5: `get_product_reviews` — Reviews de un producto

```
Use get_product to find a laptop with good reviews, then call get_product_reviews to show its reviews.
```

**Esperado:**
- Array de reviews con: calificación (1-5), texto, nombre de usuario, fecha
- Si el producto no tiene reviews, respuesta clara ("No hay reviews")

---

### Caso 6: `get_product_questions` — Q&A de un producto

```
Use get_product to find any laptop, then call get_product_questions to show its Q&A.
```

**Esperado:**
- Array de preguntas con respuestas (si existen)
- Si no hay Q&A, respuesta clara ("Sin preguntas aún")

---

### Caso 7: `list_categories` (ya cubierto arriba)

---

### Caso 8: `search_knowledge` — Busca en FAQ

```
Use search_knowledge to find information about "devolutions" or "return policy"
```

**Esperado:**
- Encuentra artículos de soporte (FAQ) relevantes por similitud semántica
- Retorna título, contenido del artículo, similitud en %

---

### Caso 9: `ask_chat` — RAG (compras)

```
Use ask_chat with mode="compras" to answer: "¿Qué laptop me recomiendas para programar?"
```

**Esperado:**
- Respuesta generada por IA citando productos reales
- Incluye: "Información usada: X fuente(s) de Y consultadas"
- Si no hay contexto relevante: "Nota: no encontré información relacionada"

**Tabla de síntomas:**
| Síntoma | Causa | Solución |
|---------|-------|----------|
| Responde genérico sin citar fuentes | topK muy bajo o threshold muy alto | Subir topK a 10, threshold a 0.35 |
| Cita productos no relacionados | topK muy alto o threshold muy bajo | Bajar topK a 5, threshold a 0.4 |
| Error "No pude procesar" | Token HUGGINGFACE_CHAT_MODEL inválido o red caída | Verificar token en `.env.local`, probar curl a HF API |

---

### Caso 10: `ask_chat` — RAG (soporte)

```
Use ask_chat with mode="soporte" to answer: "¿Cuál es la política de devoluciones?"
```

**Esperado:**
- Respuesta honesta citando FAQ
- Si la FAQ tiene contenido: "Política: Los productos se pueden devolver dentro de 30 días..."
- Si NO hay info relevante: "No encontré información relacionada... pero puedo ayudarte a abrir un ticket"

---

### Caso 11: `get_order_status` — Estado de pedido

```
Use get_order_status with an order_id from a test order (if you have one).
```

**Esperado:**
- Retorna estado, productos, total, fecha estimada
- Si no existe: error claro ("Pedido no encontrado")

---

### Caso 12: `get_store_stats` — Estadísticas admin

```
Use get_store_stats to show me store statistics.
```

**Esperado:**
- Total de productos activos (~15)
- Total de usuarios activos
- Total de ingresos (si hay pedidos completados)
- Etc.

---

## Paso 5: Prueba Resources — Lectura de datos

### Resource 1: `mercadotech://info`

```
Read the mercadotech://info resource to tell me about this server.
```

**Esperado:**
- Información general del MCP (nombre, versión, descripción)

---

### Resource 2: `mercadotech://products`

```
Read mercadotech://products to show me the full product list.
```

**Esperado:**
- Texto plano con ~15 productos activos
- Formato: "- Título (Marca) - $Precio - Stock: N"

---

### Resource 3: `mercadotech://products/{id}`

```
Read mercadotech://products/{uuid} for any product UUID from search_products above.
```

**Esperado:**
- Detalles completos: título, marca, precio, stock, condición, calificación, descripción

---

### Resource 4: `mercadotech://categories`

```
Read mercadotech://categories to list all categories.
```

**Esperado:**
- Texto plano: "Categoria1 - X productos\nCategoria2 - Y productos\n..."

---

### Resource 5: `mercadotech://faq`

```
Read mercadotech://faq to show support articles.
```

**Esperado:**
- Texto plano con hasta 50 artículos de FAQ
- Cada artículo: "## Título\n\nContenido..."

---

### Resource 6: `mercadotech://sellers`

```
Read mercadotech://sellers to list verified sellers.
```

**Esperado:**
- Texto plano: "Seller1 - Rating X.X/5 - Y productos\n..."

---

### Resource 7: `mercadotech://sellers/{id}`

```
Read mercadotech://sellers/{uuid} for a specific seller.
```

**Esperado:**
- Nombre, verificación, calificación, cantidad de productos, reviews agregados

---

### Resource 8: `mercadotech://stats`

```
Read mercadotech://stats to see store statistics.
```

**Esperado:**
- Números: productos, usuarios, ingresos (admin view)

---

## Paso 6: Prueba Prompts — Generación de contenido

### Prompt 1: `describir_producto`

```
Ask Claude to use the describir_producto prompt with a laptop UUID to redraft its description.
```

**Esperado:**
- Claude ejecuta el prompt con el UUID
- Retorna instrucciones para redactar una descripción comercial honesta
- La descripción generada es ~150 palabras, enfocada en beneficios

---

### Prompt 2: `comparar_productos`

```
Ask Claude to use comparar_productos with two laptop UUIDs to analyze them.
```

**Esperado:**
- Prompt retorna instrucciones para escribir un análisis comparativo
- Resultado puede usarse en un blog post o email

---

### Prompt 3: `redactar_respuesta_pregunta`

```
Ask Claude to use redactar_respuesta_pregunta with a product UUID and question index.
```

**Esperado:**
- Prompt retorna la pregunta del cliente + instrucciones para responder
- Vendedor puede usar la respuesta generada

---

### Prompt 4: `resumen_de_resenas`

```
Ask Claude to use resumen_de_resenas with a laptop UUID.
```

**Esperado:**
- Prompt retorna todas las reviews del producto
- Claude sintetiza puntos positivos, negativos, recomendación

---

### Prompt 5: `generar_articulo_faq`

```
Ask Claude to use generar_articulo_faq with topic="devolutions" to create an FAQ entry.
```

**Esperado:**
- Prompt busca preguntas relacionadas en la BD
- Retorna contexto (problema, solución, política) para redactar el artículo

---

## Resumen: Checklist final

Marca cada prueba cuando pase:

```
[ ] Paso 0: MCP registrado (/mcp muestra mercadotech)
[ ] Paso 1: ListTools (10 tools encontrados)
[ ] Paso 2: ListResources (7 resources + 2 templates)
[ ] Paso 3: ListPrompts (5 prompts encontrados)
[ ] Paso 4: search_products ("audífonos..." → Sony primero)
[ ] Paso 4: get_product (UUID → detalles completos)
[ ] Paso 4: list_categories (categorías listadas)
[ ] Paso 4: compare_products (tabla markdown)
[ ] Paso 4: get_product_reviews (reviews o mensaje claro)
[ ] Paso 4: get_product_questions (Q&A o mensaje claro)
[ ] Paso 4: search_knowledge ("devoluciones" → artículos FAQs)
[ ] Paso 4: ask_chat compras (respuesta con fuentes)
[ ] Paso 4: ask_chat soporte (respuesta FAQ o admisión de ignorancia)
[ ] Paso 4: get_order_status (estado o error claro)
[ ] Paso 4: get_store_stats (números admin)
[ ] Paso 5: info resource (metadata del servidor)
[ ] Paso 5: products list resource (catálogo)
[ ] Paso 5: products/{id} (detalles por UUID)
[ ] Paso 5: categories resource (lista de categorías)
[ ] Paso 5: faq resource (artículos de soporte)
[ ] Paso 5: sellers resource (vendedores)
[ ] Paso 5: sellers/{id} (vendedor específico)
[ ] Paso 5: stats resource (estadísticas)
[ ] Paso 6: describir_producto prompt (descripción generada)
[ ] Paso 6: comparar_productos prompt (análisis)
[ ] Paso 6: redactar_respuesta_pregunta (respuesta a Q&A)
[ ] Paso 6: resumen_de_resenas (síntesis de reviews)
[ ] Paso 6: generar_articulo_faq (FAQ generada)
```

---

## Dos casos de uso finales

Cuando todo pase el checklist arriba, prueba estos dos flujos de usuario real:

### Flujo 1: Búsqueda con herramienta

```
A Claude: "Usa la herramienta compare_products del servidor mercadotech para mostrar dos 
laptops del catálogo lado a lado. Luego hazme una recomendación de cuál es mejor para 
programar en Python."
```

**Esperado:**
- Claude busca laptops con `search_products`
- Elige dos IDs
- Usa `compare_products` con esos IDs
- Retorna tabla markdown
- Da recomendación basada en specs

---

### Flujo 2: Chat RAG

```
A Claude: "Pídele al asistente de compras del mercadotech que me sugiera una laptop 
para diseño gráfico. Debe usar la función ask_chat con mode='compras'."
```

**Esperado:**
- Claude llama `ask_chat` con query sobre "laptop diseño gráfico"
- RAG busca productos relevantes (MacBook, ASUS VivoBook, etc.)
- Respuesta cita fuentes reales
- Incluye metadata: "Información usada: X fuente(s)"

---

## Notas finales

- Si un tool devuelve error 500, verifica stderr en la terminal donde corre Claude Code
- Si el JSON-RPC se corrompe, reinicia Claude Code — asegúrate de que `mcp/dist/index.js` está limpio (sin logs a stdout)
- Si un resource está "degradado" (aparece con error), es intencional por Lección 7 (degrada, no falla todo). Verifica que Supabase está levantado.

**Cuando todo pase:** Ese es tu checklist para comprometer. El servidor está listo para producción.
