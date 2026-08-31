# MercadoTech MCP Server

Un servidor **Model Context Protocol** que integra el marketplace MercadoTech con Claude, exponiendo herramientas para búsqueda semántica, comparación de productos, chat con RAG, y consultas administrativas sobre la tienda.

## ¿Qué es esto?

MCP es un protocolo que conecta aplicaciones externas (como Claude) con herramientas y datos vía JSON-RPC sobre stdio. Este servidor MarcadoTech expone:

- **10 tools:** búsqueda, consultas, comparación, chat con IA
- **7 resources:** catálogo, FAQ, vendedores, estadísticas (datos estáticos y dinámicos)
- **5 prompts:** plantillas para redacción de descripciones, comparativas, FAQ

Todo se comunica vía **JSON-RPC sobre stdin/stdout**, sin REST API intermedia — el protocolo es bidi (cliente ↔ servidor) y sin estado entre llamadas.

## Arquitetura: Flujo de datos

```
┌──────────────────────────────────────────────────────────────┐
│ Claude (cliente MCP)                                         │
└──────────┬───────────────────────────────────────────────────┘
           │ (JSON-RPC sobre stdio)
           │
┌──────────▼──────────────────────────────────────────────────┐
│ MCP Server (mcp/src/index.ts)                               │
│  ├─ Handlers para ListTools, CallTool                       │
│  ├─ Handlers para ListResources, ReadResource              │
│  └─ Handlers para ListPrompts, GetPrompt                   │
└──────────┬──────────────────────────────────────────────────┘
           │
           ├──────────────────────────────────────────────────┐
           │                                                  │
      [Tools]                                          [Resources]
      (stdout)                                        (stderr para logs)
      │                                               │
┌─────▼──────────────────────┐              ┌─────────▼───────────────┐
│ Servicios (services/)      │              │ Queries a Supabase      │
│ • vector-search.service    │              │ (SELECT con RLS)        │
│ • chat.service (RAG)       │              │                         │
│ • products.service         │              │ • products (lista/show) │
│ • orders.service           │              │ • support_articles      │
└─────┬──────────────────────┘              │ • sellers               │
      │                                     └──────────┬──────────────┘
      │                                               │
      └───────────────────────────┬───────────────────┘
                                  │
                      ┌───────────▼────────────────┐
                      │ Supabase (PostgreSQL)      │
                      │ • Con RLS activo           │
                      │ • Embeddings (pgvector)    │
                      └────────────────────────────┘
```

## Decisiones arquitectónicas

### 1. **Por llamada vs. por arranque** — contexto limpio por invocación

Cada tool crea su propio contexto de Supabase (`createContext()`) dentro de su handler, en lugar de reutilizar un cliente global:

```typescript
// ✓ Lo que hace este servidor (mcp/src/context.ts)
const handler = async (input) => {
  const { anon, admin } = await createContext()  // Nuevo cada vez
  // ...usa contexto aquí
}

// ✗ Antipatrón (no usado aquí)
const globalClient = createClient(...)  // Global reutilizado
```

**Por qué:** Cada invocación llega como un JSON-RPC independiente, con su propia sesión de usuario. Si el servidor guardara estado (token expirado, error anterior), afectaría llamadas posteriores. El contexto limpio aísla fallos.

**Ventaja:** sin sincronización de estado, sin race conditions en multi-llamada.

### 2. **Stdout para JSON-RPC, stderr para logs** — el protocolo es celoso

La librería MCP decodifica JSON desde stdin y codifica a stdout. Cualquier otro output (logs, errors debug) debe ir a stderr, o corrompe la sesión:

```typescript
// Línea 1-2 de mcp/src/index.ts
console.log = console.info = console.warn = (...a) => console.error(...a)
// ↑ Redirige TODOS los logs a stderr, nunca a stdout
```

Verlo en el servidor:
```bash
# stdout = JSON-RPC (para Claude)
{"jsonrpc":"2.0","id":1,"result":{"content":[...]}}

# stderr = logs (para humanos)
[MercadoTech MCP] Servidor conectado y esperando mensajes.
```

### 3. **¿Por qué NO importa `lib/supabase/admin.ts`?** — exclusión de "server-only"

El archivo `lib/supabase/admin.ts` contiene:
```typescript
import 'server-only'  // ← Solo válido en Next.js SSR/SSG
```

Este import solo funciona cuando Next.js compila; fuera de ese contexto (como en este script MCP ejecutado con `node` o `tsx`), lanza error. La solución: **recrear el cliente admin** localmente en `mcp/src/context.ts`:

```typescript
// mcp/src/context.ts — sin importar lib/supabase/admin
const admin = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})
```

**Razón:** el MCP corre **fuera** del flujo de compilación Next.js. Es un proceso independiente.

**Verificación:** `grep -r "lib/supabase/admin" mcp/` debe devolver vacío (sí, pasa).

### 4. **Clientes anón vs. admin por tool** — principio de menor privilegio

Cada tool elige qué cliente usar según su propósito:

| Tool | Cliente | Por qué |
|------|---------|---------|
| `search_products` | `anon` | Búsqueda pública, respeta RLS |
| `ask_chat` | `anon` | Chat público, respeta RLS |
| `get_product` | `anon` | Catálogo público |
| `compare_products` | `anon` | Comparativa pública |
| `search_knowledge` | `anon` | FAQ pública |
| `get_store_stats` | `admin` | Estadísticas internas (nunca públicas) |
| `get_order_status` | `anon` | El usuario autenticado ve su pedido vía RLS |

**Regla:** usar `anon` salvo que la herramienta sea claramente administrativa o requiera superar RLS.

### 5. **Env de la raíz (`.env.local`)** — configuración centralizada

El servidor busca `.env.local` en la carpeta raíz de mercadotech/, **no** en `mcp/`:

```typescript
// mcp/src/env.ts
const envPath = resolve(__dirname, '.env.local')  // Sube 2 niveles desde src/
process.loadEnvFile(envPath)
```

**Variables requeridas:**
- `NEXT_PUBLIC_SUPABASE_URL` — URL de Supabase (pública)
- `SUPABASE_SERVICE_ROLE_KEY` — clave admin (privada)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — clave anónima (pública, solo si está en `.env.local`)

**Por qué en raíz:** el `.env.local` de la raíz es el fuente de verdad único; si estuviera en `mcp/`, habría duplicación.

---

## Comandos

### Desarrollo (watch mode)

```bash
cd mcp
npm run dev
```

Sale del servidor en modo watch (reinicia al editar). Logs a stderr, JSON-RPC a stdout.

### Build para producción

```bash
cd mcp
npm run build
```

Compila TypeScript → ESM en `dist/index.js`. El MCP cliente usa este build.

### Verificación de tipos

```bash
cd mcp
npm run type-check
```

Ejecuta `tsc --noEmit` con `strict: true` (del tsconfig del monorepo).

### Ejecutar el build (standalone)

```bash
node mcp/dist/index.js
```

Ejecuta el servidor compilado. Válido para testing local o integración CI.

---

## Registro en `.mcp.json`

La raíz contiene `.mcp.json`:

```json
{
  "mcpServers": {
    "mercadotech": {
      "command": "node",
      "args": ["mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

Esto le dice al cliente MCP (ej. Claude Desktop):
1. Servidor llamado "mercadotech"
2. Ejecutable: `node mcp/dist/index.js` (desde la raíz del proyecto)
3. Sin env vars extra (reutiliza las de `.env.local`)

### Variante de desarrollo (no commiteada)

Para debuggear, podrías cambiar el `command` a:
```json
"command": "npx tsx mcp/src/index.ts"
```

Pero **esto no se commitea** — la versión de producción siempre es el build.

---

## Tabla: Tools, Resources, Prompts × Servicios reutilizados × Clientes

### Tools (10)

| Nombre | Descripción | Servicio usado | Cliente | Entrada típica | Salida |
|--------|-------------|----------------|---------|-----------------|--------|
| `search_products` | Búsqueda semántica de productos | `vector-search.service.searchProducts()` | `anon` | `{ query: "laptop gaming", topK: 5 }` | Lista de productos ordenados por similitud |
| `get_product` | Detalles completos de un producto | `product.service.getProductById()` | `anon` | `{ product_id: "uuid" }` | Título, precio, stock, descripción, reviews |
| `list_categories` | Categorías de la tienda | Query directo a `categories` | `anon` | (sin input) | Array de categorías y su cantidad de productos |
| `get_product_reviews` | Reviews de un producto | Query a `reviews` + hidratación | `anon` | `{ product_id: "uuid", limit: 10 }` | Array de reviews con calificación, texto, usuario |
| `get_product_questions` | Q&A de un producto | Query a `product_questions` + respuestas | `anon` | `{ product_id: "uuid" }` | Preguntas y respuestas (si existen) |
| `search_knowledge` | Búsqueda en FAQ/artículos | `vector-search.service.searchKnowledge()` | `anon` | `{ query: "devoluciones", topK: 3 }` | Artículos de soporte ordenados por relevancia |
| `ask_chat` | Chat RAG (compras o soporte) | `chat.service.ask()` — orquesta búsqueda + contexto + completion | `anon` | `{ query: "...", mode: "compras\|soporte" }` | Respuesta generada + metadatos de fuentes usadas |
| `get_order_status` | Estado de un pedido del usuario | `order.service.getOrderStatus()` | `anon` | `{ order_id: "uuid" }` | Estado, productos, total, fecha estimada |
| `get_store_stats` | Estadísticas admin de la tienda | Query directo a vistas/RPC | `admin` | (sin input) | Total de productos, usuarios, ingresos, etc. |
| `compare_products` | Comparativa lado a lado | `product.service.getProductById()` × 2 | `anon` | `{ product_id_1: "uuid", product_id_2: "uuid" }` | Tabla markdown con precio, marca, rating, stock |

### Resources (7)

| URI | Nombre | Tipo | Servicio/Query | Cliente | Contenido típico |
|-----|--------|------|-------|--------|-----------------|
| `mercadotech://info` | Info general | Estático | Hardcodeado | — | Nombre, versión, etc. del MCP |
| `mercadotech://products` | Lista de productos | Dinámico | Query `products` (activos) | `anon` | 100 productos activos: título, precio, stock |
| `mercadotech://products/{id}` | Producto individual | Dinámico | `product.service.getProductById()` | `anon` | Detalles completos (specs, descripción, reviews) |
| `mercadotech://sellers` | Lista de vendedores | Dinámico | Query `sellers` (verificados) | `anon` | Nombre, rating, cantidad de productos |
| `mercadotech://sellers/{id}` | Vendedor individual | Dinámico | Query + agregaciones | `anon` | Nombre, verificado, reviews, productos listados |
| `mercadotech://categories` | Categorías | Dinámico | Query `categories` + count | `anon` | Nombre de cada categoría, cantidad de productos |
| `mercadotech://faq` | FAQ/Artículos | Dinámico | Query `support_articles` (publicados) | `anon` | Hasta 50 artículos con título y contenido |
| `mercadotech://stats` | Estadísticas | Dinámico | Vistas/RPC aggregados | `admin` | Totales: productos, usuarios activos, ingresos |

### Prompts (5)

| Nombre | Descripción | Argumentos | Servicio usado | Cliente | Caso de uso |
|--------|-------------|-----------|----------------|---------|------------|
| `describir_producto` | Redacción comercial | `product_id` | `product.service.getProductById()` | `anon` | Vendedor crea descripción mejorada de su producto |
| `comparar_productos` | Análisis comparativo | `product_id_1`, `product_id_2` | `product.service.getProductById()` × 2 | `anon` | Contenido de blog: "Laptop A vs. Laptop B" |
| `redactar_respuesta_pregunta` | Respuesta a Q&A | `product_id`, `question_index` | Query `product_questions` | `anon` | Vendedor responde una pregunta de cliente |
| `resumen_de_resenas` | Síntesis de reviews | `product_id` | Query `reviews` | `anon` | Análisis de feedback del producto |
| `generar_articulo_faq` | FAQ personalizado | `topic` | Búsqueda semántica + contexto | `anon` | Soporte crea artículo nuevo basado en preguntas |

---

## Flujo de una llamada (ejemplo: `search_products`)

1. **Cliente (Claude) envía JSON-RPC:**
   ```json
   {
     "jsonrpc": "2.0",
     "id": 123,
     "method": "tools/call",
     "params": {
       "name": "search_products",
       "arguments": { "query": "laptop gaming", "topK": 5 }
     }
   }
   ```

2. **Servidor recibe stdin, decodifica JSON-RPC:**
   ```typescript
   // mcp/src/server.ts
   server.setRequestHandler(CallToolRequestSchema, async (request) => {
     const handler = toolHandlers[request.params.name]  // → search-products.ts
     const result = await handler(request.params.arguments)
   })
   ```

3. **Handler valida y ejecuta:**
   ```typescript
   // mcp/src/tools/search-products.ts
   const handler = safe(async (input) => {
     const validated = searchProductsSchema.parse(input)  // Zod validation
     const { anon } = await createContext()  // ← Contexto limpio
     const results = await searchProducts(validated.query, anon, ...)
     // Retorna textResult(formatted)
   })
   ```

4. **Servicio consulta Supabase (con RLS):**
   ```typescript
   // services/vector-search.service.ts
   const { data, error } = await supabase
     .rpc('match_knowledge', { ... })  // RPC con SECURITY INVOKER
     .select(...)
     .limit(...)
   ```

5. **Servidor codifica respuesta a JSON-RPC y envía por stdout:**
   ```json
   {
     "jsonrpc": "2.0",
     "id": 123,
     "result": {
       "content": [
         { "type": "text", "text": "Encontré 5 productos...\n\n1. **MacBook Pro 16**..." }
       ]
     }
   }
   ```

6. **Cliente (Claude) recibe, parsea y usa la respuesta.**

---

## Casos de prueba y verificación (desde `docs/RAG.md`)

Antes de comprometer: pasa el Inspector con estos 6 casos clave de búsqueda:

| Consulta | Tipo | Resultado esperado | Umbral | Notas |
|----------|------|-------------------|--------|-------|
| "audífonos para correr" | `search_products` | Sony WH-1000XM5 primero (>30%) | 0.35 | Caso insignia de sesión 4 |
| "laptop liviana para universidad" | `ask_chat` + RAG | 2 productos citados con fuentes reales | 0.35 | Verificar mini-cards |
| "devoluciones" | `search_knowledge` | Artículo FAQ sobre retorno de productos | 0.35 | FAQ se busca semánticamente |
| "autos usados" | `search_products` | Sin ruido (`Cisco Catalyst 9200` no debe salir) | 0.35 | Threshold 0.35 evita ruido |
| "¿cuál es la política de privacidad?" | `ask_chat` + RAG (soporte) | Respuesta honesta ("no encontré...") | 0.35 | Si no hay fuente, el modelo admite la ignorancia |
| "¿me das una laptop para diseño?" | `ask_chat` + RAG (compras) | Sugerencias de productos relevantes | 0.35 | Prompt de compras sugiere productos |

**Threshold 0.35:** se calibró en sesión 4 para equilibrar recall (no perder coincidencias reales, como Sony al 41%) y precision (evitar ruido, como Cisco al 34%).

---

## Troubleshooting

### El servidor no arranca

**Síntoma:** `Error: Falta NEXT_PUBLIC_SUPABASE_URL...`

**Solución:** verifica `.env.local` en la raíz contiene ambas variables. Si usas CI, pasalas como env vars:
```bash
export NEXT_PUBLIC_SUPABASE_URL=https://...
export SUPABASE_SERVICE_ROLE_KEY=eyJ...
node mcp/dist/index.js
```

### JSON-RPC corrupto en logs

**Síntoma:** Claude dice "invalid JSON" o la sesión se corta.

**Solución:** asegúrate de que TODOS los logs van a stderr, nunca stdout. Verifica línea 1-2 de `mcp/src/index.ts`:
```typescript
console.log = console.info = console.warn = (...a) => console.error(...a)
```

### Un tool devuelve error 500

**Síntoma:** `Error en [tool_name]: ... database error ...`

**Solución:** 
1. Verifica que `mcp/dist/index.js` está actualizado: `npm run build -C mcp`
2. Revisa stderr: los logs del servidor incluyen el error real
3. Si es un error de permisos, verifica RLS en `supabase/policies.sql`

### Resource degradado en el Inspector

**Síntoma:** `mercadotech://products` aparece con `error: "..."` en la lista.

**Solución:** es intencional (Lección 7: degrada recursos caídos, no falla todo). Verifica que Supabase está levantado: `supabase status`.

---

## Próximos pasos

- **Voz (Sesión 6+):** nuevos tools para transcripción y síntesis de voz
- **Webhooks:** disparadores desde Supabase cuando cambia el catálogo (invalidar embeddings, etc.)
- **Caching:** cachear resources estáticos (`mercadotech://categories`) en memoria

---

*Documentado para Fase 5.5 (release engineering del servidor MCP). Úsalo como referencia cuando integres el servidor con Claude Desktop o scripts externos.*
