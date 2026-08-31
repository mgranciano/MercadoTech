# CLAUDE.md — Contrato de desarrollo MercadoTech

Este documento define las convenciones, arquitectura y restricciones que rigen el desarrollo de MercadoTech. **Claude Code debe respetarlas en todas las sesiones.**

---

## ¿Qué es MercadoTech?

MercadoTech es un marketplace de productos tecnológicos donde compradores navegan catálogos, hacen búsquedas, ven detalles con galerías de imágenes, reseñas y Q&A, agregan al carrito y completan checkout simulado. Vendedores publican productos y gestionan pedidos. Un asistente de soporte responde preguntas basadas en FAQ (RAG) y en sesiones futuras evoluciona a agente de voz. **No hay pasarela de pago real en ningún momento.**

---

## Comandos

Scripts npm implementados (actualizados en Sesión 6):

```bash
npm run dev               # Inicia dev server (Next.js, puerto 3000)
npm run build             # Build para producción
npm run start             # Inicia servidor de producción
npm run lint              # Lint de código (ESLint)
npm run type-check        # Verificación TypeScript strict (tsc --noEmit)
npm run test              # Tests unitarios Vitest (201 tests, 70%+ cobertura servicios)
npm run test:coverage     # Tests + coverage report (HTML en coverage/)
npm run test:e2e          # Tests e2e Playwright (requiere: supabase start + npm run build && start)
npm run db:types          # Regenera types/database.ts desde el esquema local
npx tsx scripts/index-all.ts  # Reindexa todo el catálogo + FAQ en knowledge_embeddings (Sesión 4)
```

**Prerequisitos para test:e2e:** `supabase start` debe estar corriendo (local ephemeral stack). Luego: `npm run build && npm run start` (para que Playwright corra contra producción local), o contra dev (`npm run dev` en otra terminal).

**Gate de validación:** antes de commitear, correr:
```bash
npm run lint && npm run type-check && npm run test
# Si supabase está verde: npm run test:e2e
```
Si alguno falla, no commits — revisar `docs/DEBUGGING.md` para diagnóstico.

---

## Arquitectura por capas

```
┌─────────────────────────────────────────────┐
│ components/                                 │  UI / componentes React
├─────────────────────────────────────────────┤
│ hooks/                                      │  Custom hooks (estado local, fetch)
├─────────────────────────────────────────────┤
│ services/                                   │  Lógica de negocio (sin Supabase directo)
├─────────────────────────────────────────────┤
│ lib/                                        │  Utilidades: types, db, constants, ai, voice
└─────────────────────────────────────────────┘
```

**Flujo de datos único:**
```
UI (React) → Hooks → Services → Supabase (con RLS)
```

### Cinco reglas de independencia

1. **Un archivo, una responsabilidad.** Un componente es un componente; un service gestiona un dominio; un hook encapsula un efecto. Sin servicios multipropósito.

2. **Sin barrels (`index.ts`).** Importa siempre del archivo específico:
   ```typescript
   // ✓ Bien
   import { usePriceFormat } from '@/hooks/usePriceFormat'
   
   // ✗ Mal
   import { usePriceFormat } from '@/hooks'
   ```

3. **UI nunca importa `lib/ai/`, `lib/voice/` o el cliente admin.** Esos módulos son solo para services o backend. La UI solo usa funcionalidades publicitadas a través de hooks y services.

4. **Un solo camino de datos: hooks → services → Supabase con RLS.** Sin capa REST paralela. Sin queries directas desde componentes. Todo fluye a través de services que hablan con Supabase.

5. **Tunables solo en `lib/constants/`.** Precios, límites de sesión, timeouts, modelos de IA: van en `lib/constants/` (versionado), nunca hardcodeados ni en .env.

6. **DTO ENFORCER: Componentes React NUNCA usan tipos crudos de Supabase.** Los componentes NO pueden importar ni usar `Tables<'tabla'>` de `types/database.ts`. Es obligatorio que los **services mapeen las respuestas de la BD a DTOs limpios**, y que **la UI consuma exclusivamente esos DTOs**. Los DTOs viven en `types/<domain>.ts` (ej: `types/order.ts`, `types/product.ts`) como interfaces que transforman los tipos de Supabase. Esto asegura: (a) desacoplamiento del esquema de BD, (b) cambios de BD no rompen componentes, (c) servicios validan y transforman datos antes de presentación.

### Estructura real de `components/` y rutas (Sesión 3)

- `components/`: `ui/` (shadcn), `shared/`, `layout/`, `auth/`, `catalog/`,
  `product/`, `cart/`, `orders/`, `seller/` — una carpeta por dominio, sin
  barrels.
- Rutas: `(auth)/{login,register}`; `(shop)/{page,buscar,carrito,
  categoria/[slug],favoritos,pedidos,pedidos/[id],producto/[id]}`;
  `(seller)/vendedor/{productos,productos/[id]/editar,publicar,pedidos}` —
  el panel de vendedor vive bajo el prefijo `/vendedor/...` para no chocar
  con las rutas de comprador.
- `lib/constants/`: `catalog.ts`, `product.ts`, `orders.ts`, `roles.ts`,
  `ai.ts` (tunables de IA, Sesión 4), `tickets.ts`.

**Verificación de capas** (deben devolver vacío):
```bash
grep -rl "@/lib/supabase" components hooks
grep -rl "from \"@/services" components
grep -rln "@huggingface" --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -v lib/ai
grep -rl "lib/supabase/admin" app components hooks services | grep -v api/v1
```

---

## Convenciones de código

### Identificadores
- **Inglés para variables, funciones, tipos, archivos.**
- **Español para comentarios y documentación** (README, tickets, propuestas).

### TypeScript
- **Strict mode siempre.** `tsconfig.json` no negocia.
- **No `any`.** Usa `unknown` si es necesario; mejor aún, define el tipo.

### Nombres de archivos y exports

- **Services:** `<domain>.service.ts` (ej: `products.service.ts`, `orders.service.ts`)
  ```typescript
  // products.service.ts
  export async function getProductById(id: string) { ... }
  export async function searchProducts(query: string) { ... }
  ```

- **Hooks:** `use<Domain>.ts` (ej: `useProducts.ts`, `usePriceFormat.ts`)
  ```typescript
  // useProducts.ts
  export function useProducts() { ... }
  ```

- **Componentes:** PascalCase (ej: `ProductCard.tsx`, `CheckoutForm.tsx`)

- **Utilidades:** camelCase (ej: `formatPrice.ts`, `validateEmail.ts`)

### Comentarios
- **No comentes el QUÉ**, el código ya lo dice.
- **Comenta el POR QUÉ** cuando hay una razón no obvia (workaround, restricción de negocio, edge case).

### Convenciones aprendidas en Sesión 3

- **Service con cliente inyectable:** cada función de `services/*.service.ts`
  recibe el cliente de Supabase como último parámetro, con default al
  cliente de navegador: `getProductById(id: string, supabase: Client =
  createClient())`. No importan React; lanzan el error de Supabase tal cual,
  el hook lo traduce a estado.
- **`numeric` llega como `string` desde PostgREST** (`price`, `total`,
  `price_snapshot`): el service lo convierte con `Number()`; los componentes
  siempre reciben `number`.
- **Componentes reciben `image_url` ya resuelta**, nunca `image_path` — la
  arma `storage.service.getPublicUrl`.
- **Filtros de catálogo viven en la URL** (`useSearchParams`), no en estado
  local — así son compartibles y sobreviven a un refresh.
- **Las transiciones del kanban de pedidos viven en el hook**
  (`useSellerOrders.move()`), no en el componente ni en el service: valida
  contra `ORDER_STATUS_FLOW` antes de llamar `updateOrderStatus`.

### Convenciones aprendidas en Sesión 4

- **La UI nunca importa `lib/ai/`:** el navegador llega a la IA solo vía
  hook → `fetch` a `app/api/v1/*` → service → `lib/ai/`.
- **El cliente admin (`lib/supabase/admin.ts`) solo vive en Route Handlers
  y `scripts/`:** nunca en `components/`, `hooks/` ni `services/` — los
  services de IA reciben el cliente inyectado por el caller.
- **Tunables de IA en `lib/constants/ai.ts`:** modelos, dimensión del
  embedding, umbrales de similitud y presupuesto de contexto. El modelo de
  chat se sobreescribe por `HUGGINGFACE_CHAT_MODEL` si Hugging Face lo
  retira — nunca se hardcodea ni se cambia en código.
- **`knowledge_embeddings` es una tabla discriminada por `source_type`**
  (`'producto'` / `'articulo_soporte'`), sin FK dura en `source_id`
  (apunta a dos tablas origen distintas): fichas huérfanas posibles, las
  descarta quien hidrata (`vector-search.service`).

### Convenciones aprendidas en Sesión 5

- **Servidor MCP en `mcp/src/`:** consumidor igual que cualquier otra parte
  del proyecto — importa `services/`, `lib/ai/`, `lib/constants/`, `types/`,
  nunca `app/`, `components/` ni `hooks/`.
- **Cliente admin en MCP:** permitido en `mcp/src/context.ts` (único lugar
  donde se construye), nunca inyectado a tools — tools usan solo cliente
  `anon` con RLS activo.
- **Adapters MCP en `mcp/src/shared/adapters.ts`:** reutilizan servicios
  existentes con cliente inyectable, evitan reimplementar lógica.
- **Validación con Zod en tools:** todos los tools validan input (min/max
  strings, enums blanqueados, número acotado), nunca `any` en callbacks.
- **Degradación elegante (Lección 7):** si Supabase falla, recursos devuelven
  lista estática o error claro, nunca colapso cascada.

### Convenciones aprendidas en Sesión 6

- **Tests viven junto al archivo:** `.test.ts` adyacente (ej: `services/product.service.ts` → `services/product.service.test.ts`). Test file excluido de root `tsconfig.json` (tiene su propio contexto).
- **Supabase nunca mocked con `vi.mock()`:** inyectable por parámetro en función (`getProductById(id, supabase = createClient())`). Razón: tests necesitan control fino sobre BD por caso; `vi.mock()` es rígido. Mock completo (`supabase-mock.ts`) con encadenamiento y métodos helper (`.calls()`, `.updates()`).
- **Comportamiento real, no stubs vacíos:** tests anclan a respuestas concretas del mock (ej: precio como string desde PostgREST → convertido a number). Verifica transformaciones, no stubs sin sentido.
- **Test IDs en kebab-case:** `nav-cart-link`, `shop-product-card`, `product-add-to-cart-btn` — CSS no, selectors de Playwright sí.
- **E2E requiere `supabase start`:** stack local ephemeral, credenciales dinámicas (sin secrets hardcodeados). Fixtures mockan auth (localStorage), no login real.
- **Ciclo de validación:** código → `npm run test` (unitarios) → `npm run test:e2e` (si Supabase verde) → validator skill (gate binario) → commit. Un test fallido tumba todo.

---

## Fuente de verdad de la base de datos

- **Fuente de verdad:** `supabase/migrations/` (desde sesión 2)
- **Copias de referencia:** `schema.sql` y `policies.sql` son snapshots solo informativos.
- **Nunca alteres la DB a mano.** Cambios solo vía migrations.

---

## Lockfile y gestor de paquetes (desde Sesión 6)

- **Campo obligatorio en `package.json`:** `"packageManager": "npm@11.6.2"`. Esto fuerza que Node.js y CI usen esa versión exacta.
- **Por qué:** npm 11.6.2 genera `package-lock.json` v3+. Runners con npm 10.x fallan con "Missing from lock file" porque no entienden el nuevo formato. El pin evita sorpresas en CI.
- **Nunca cambies a la ligera:** cambiar de npm 11.x → 12.x regenera el lockfile con un formato distinto. Esto es un cambio de infraestructura, no una actualización trivial. Comunicar al equipo.
- **Regenerar:** `npm install -g npm@<version> && npm ci` (en local), commit el `package-lock.json` nuevo.

---

## Regla de sesiones

- **Cada sesión tiene su especificación** en su archivo de planeación (ej: `MercadoTech_sesion1.md`).
- **No adelantes trabajo de sesiones futuras.** Si la sesión 2 es "crear el proyecto Next.js", no lo hagas en sesión 1.
- **Las fases son secuenciales.** No saltes entre ellas.

---

## Criterio para cambios futuros

Antes de sugerir un cambio arquitectónico:
1. ¿Violaría alguna de las 5 reglas de independencia?
2. ¿Está cubierto por la sesión actual o es adelanto?
3. ¿Hay un test que falla o una restricción de negocio que lo requiere?

Si la respuesta a (2) es "adelanto", no lo hagas. Si a (1) es "sí", detente.

---

## Stack esperado (sesión 2 en adelante)

- **Frontend:** Next.js 14+, React 18+, TypeScript
- **Backend/DB:** Supabase (PostgreSQL + RLS)
- **Autenticación:** Supabase Auth
- **Storage:** Supabase Storage (imágenes)
- **AI:** Hugging Face Inference (embeddings + chat, sesión 4); voz en sesión 8
- **MCP:** Model Context Protocol (servidor stdio, tools, resources, prompts, sesión 5+)
- **Testing:** Vitest (unitarios, 201 tests, 70%+ cobertura), Playwright (e2e, 11 tests buyer flow)
- **CI/CD:** GitHub Actions (checks: lint/type-check/test, e2e: Playwright ephemeral Supabase)
- **Secrets:** `.env.local` (desarrollo), GitHub Secrets (CI — a implementar sesión 7)

---

## Estructura del proyecto (Sesión 2)

La Fase 2.1 implementó:

- **App Router** de Next.js 15 con rutas organizadas por feature: `(auth)`, `(shop)`, `(seller)`, `api/v1`.
- **Clientes Supabase**: `lib/supabase/{client,server,middleware,admin}.ts` para el flujo de sesiones.
- **Constantes**: `lib/constants/roles.ts` con tipos de roles, estados de órdenes, tickets, condiciones.
- **Utilidades**: `lib/utils.ts` con función `cn` para Tailwind.
- **Estructura de capas**: directorios vacíos listos para features (`components/`, `hooks/`, `services/`, `types/`).

---

## Estado del proyecto

- **Sesión 1:** no se ejecutó como sesión independiente (ver `docs/BITACORA.md`).
- **Sesión 2:** completa, incluidas las Fases 2.6 y 2.7 (commits `88b0681`, `8a472ee`).
- **Sesión 3:** Fases 3.1–3.9 construidas, verificadas y commiteadas (una
  fase por commit; ver `docs/BITACORA.md` para los hashes).
- **Sesión 4:** Fases 4.1–4.8 construidas, verificadas y commiteadas. RAG
  real: `lib/ai/`, `app/api/v1/{chat,reindex,search/semantic}`, páginas
  `/asistente` y `/soporte`. Desviación: `components/shared/AIChatbot.tsx`
  (el FAB de la Fase 3.9) sigue sin conectar al RAG — ver deuda técnica en
  `docs/BITACORA.md`.
- **Sesión 5:** Fases 5.1–5.6 construidas y auditadas. Servidor MCP
  operacional en `mcp/`: 10 tools, 6 resources, 3 prompts. Validación de
  arquitectura completada (Skills de validador automático + enforcer). Auditoría
  de seguridad en `mcp/AUDIT.md`: RLS, resiliencia, stdio aislado. Veredicto:
  listo para producción.
- **Sesión 5 extendida (Fase 5.7):** DTO ENFORCER rule creada y agregada a CLAUDE.md (regla 6). Protege arquitectura contra degradación de capas. Skill de validación pendiente para sesión 6.
- **Sesión 6:** Fases 6.1–6.8 construidas. Testing completo: Vitest (201 tests, 70%+ cobertura servicios), Playwright (11 E2E, buyer flow + negatives), GitHub Actions CI (checks + e2e, npm 11.6.2 pinning, credenciales dinámicas). Debugging runbook (`docs/DEBUGGING.md`) + validator actualizado (gate binario con tests). Cambio de alcance: Fase 7.1 (CI) absorbida en 6.7. CI verde. Main protegida.
- **Sesión 7:** Performance + secretos + deploy (sin CI nuevamente — está hecho). Roadmap: timeouts, rate limiting, branch protection, tests de MCP, voz.
- Detalle completo: `docs/BITACORA.md` (bitácora acumulativa),
  `docs/DEBUGGING.md` (runbook diagnostico), `docs/RAG.md` (flujo IA) y
  `mcp/AUDIT.md` (auditoría MCP).

---

## Servidor MCP (desde Sesión 5)

### Estructura

```
mcp/
├── src/
│   ├── index.ts              # Entrada (stdio transport)
│   ├── env.ts                # Carga .env.local
│   ├── context.ts            # Clientes anon/admin (Decisión 8: inyectable)
│   ├── server.ts             # Handlers de request (ListTools, CallTool, etc.)
│   ├── tools/                # 10 tools con Zod validation + safe()
│   ├── resources/            # 6 resources + 2 templates, degradación elegante
│   ├── prompts/              # 3 prompts con inyección de contexto
│   ├── shared/
│   │   └── adapters.ts       # Reutilización de services (decisión #10)
│   └── lib/
│       ├── tool-result.ts
│       └── safe.ts           # Wrapper de manejo de errores
├── package.json
├── tsconfig.json
└── AUDIT.md                  # Auditoría: seguridad, resiliencia, stdio
```

### Reglas de MCP

1. **Consumidor de servicios:** importa `services/`, `lib/ai/`, `lib/constants/`, `types/` — nunca `app/`, `components/`, `hooks/`.
2. **Aislamiento de clientes:** solo anon en tools (RLS activo); admin permitido solo en `context.ts`.
3. **Validación Zod:** todos los tools validan input, nunca `any`.
4. **Adaptadores sin reimplementación:** `mcp/src/shared/adapters.ts` reutiliza lógica existente.
5. **Degradación elegante:** si Supabase falla, recursos devuelven lista vacía o error claro.
6. **Aislamiento stdio:** redirección de logs a stderr (línea 2 de `index.ts`), JSON-RPC preservado.

### Verificación de reglas MCP

```bash
# Debe devolver vacío:
grep -rl "from ['\"]@/app\|from ['\"]@/components\|from ['\"]@/hooks" mcp/src
grep -rl "\.admin" mcp/src/tools mcp/src/resources mcp/src/prompts
```

---

*Última actualización: Sesión 5 (cierre)*

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
