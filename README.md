# MercadoTech — Marketplace Tecnológico con IA

![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square)
![Tests](https://img.shields.io/badge/Tests-201-green?style=flat-square)

---

## Descripción

**MercadoTech** es un marketplace de productos tecnológicos donde compradores navegan catálogos, buscan por inteligencia artificial (RAG), ven detalles con galerías de imágenes, leen reseñas y preguntas frecuentes, agregan al carrito y completan un checkout simulado. Vendedores publican productos y gestionan pedidos. Un asistente de soporte con IA responde preguntas en tiempo real basadas en FAQ y conocimiento de productos.

**No hay pasarela de pago real** — el checkout es una simulación educativa.

---

## Características

### 🛍️ Para Compradores

- **Catálogo explorable** con categorías, filtros por precio, condición y características
- **Búsqueda semántica** impulsada por IA (busca "laptop liviana" y encuentra MacBooks)
- **Detalles de producto** con galería de imágenes, reseñas con rating, Q&A comunitario
- **Carrito inteligente** con actualizaciones en tiempo real y sincronización
- **Historial de órdenes** con estados (pendiente, pagado, enviado, entregado, cancelado)
- **Favoritos** para guardar productos de interés
- **Asistente de soporte** que responde preguntas sobre políticas de devolución, envíos, etc.

### 🏪 Para Vendedores

- **Panel de control** con gestión de productos activos/inactivos
- **Publicación de productos** con imágenes, descripción, precio, stock
- **Gestión de pedidos** (kanban por estado, transiciones validadas)
- **Reindexación automática** de productos para búsqueda semántica

### 🤖 IA y RAG

- **Sistema RAG completo**: productos y artículos de soporte se indexan en embeddings (384D, Hugging Face)
- **Búsqueda semántica**: encuentra productos incluso con consultas en lenguaje natural
- **Respuestas generadas**: el asistente redacta respuestas citando fuentes reales (productos/artículos)
- **Contexto dinámico**: cada consulta recupera las fichas más relevantes antes de generar

### 📊 Testing & CI/CD

- **201 tests unitarios** (70%+ cobertura de servicios) con Vitest
- **11 tests E2E** (buyer flow completo) con Playwright
- **GitHub Actions CI/CD**: checks (lint, type-check, test) + E2E contra Supabase ephemeral
- **Validator automático**: gate binario — un test fallido bloquea el merge

---

## Arquitectura

```
┌────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                  │
│  Componentes React | Custom Hooks | TypeScript strict  │
└────────────────────────┬─────────────────────────────┘
                         │
                         ↓
┌────────────────────────────────────────────────────────┐
│              SERVICES (Lógica de negocio)              │
│  products | orders | cart | chat | vector-search      │
│  storage | auth | seller | reviews | questions        │
└────────────────────────┬─────────────────────────────┘
                         │
        ┌────────────────┼────────────────┬───────────┐
        │                │                │           │
        ↓                ↓                ↓           ↓
    ┌─────────┐  ┌─────────────┐  ┌──────────────┐  ┌─────┐
    │Supabase │  │ Hugging Face│  │ Storage      │  │ Auth│
    │PostgreSQL  Embeddings+Chat  Images (CDN)    │ (JWT)│
    └─────────┘  └─────────────┘  └──────────────┘  └─────┘
```

### Flujo de Datos

```
UI (React) → Hooks → Services → Supabase (con RLS)
                   ↘         ↙
                  Hugging Face
                  (embeddings + chat)
```

### Componentes Clave

| Componente | Responsabilidad |
|---|---|
| **Frontend (Next.js 16)** | Rutas App Router, páginas, componentes React, autenticación cliente |
| **API Routes (`app/api/v1/`)** | Endpoints para chat, búsqueda semántica, reindex de embeddings |
| **Services** | Lógica de negocio aislada (productos, órdenes, IA, storage) |
| **Supabase** | PostgreSQL + RLS + Auth + Storage + Realtime |
| **Hugging Face** | Embeddings (sentence-transformers) + Chat (Llama-2 vía API) |
| **MCP Server** | Model Context Protocol para integración con clientes/agentes |

---

## Tecnologías

| Aspecto | Tecnología | Versión |
|---|---|---|
| **Runtime/Frontend** | Next.js | 16.3 |
| **Librería UI** | React | 19 |
| **Lenguaje** | TypeScript | 5 |
| **Estilos** | Tailwind CSS | 4 |
| **UI Components** | shadcn/ui (Radix) | 2.x |
| **Database** | PostgreSQL (Supabase) | 15+ |
| **Auth** | Supabase Auth (JWT) | — |
| **Storage** | Supabase Storage (S3-compatible) | — |
| **Embeddings** | Hugging Face (sentence-transformers) | 384D |
| **LLM Chat** | Hugging Face (Llama-2-7b-chat) | — |
| **Testing** | Vitest + Playwright | 4.1 / 1.62 |
| **Linting** | ESLint | 9 |
| **CI/CD** | GitHub Actions | — |
| **MCP Server** | @modelcontextprotocol/sdk | — |

---

## Instalación

### Requisitos Previos

- **Node.js** 20+ (recomendado 22+)
- **npm** 11.6.2 (pinned en `packageManager` de `package.json`)
- **Supabase CLI** (para trabajar con la BD local)
- **Git**

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/mgranciano/MercadoTech.git
cd MercadoTech

# 2. Instalar dependencias (root + MCP)
npm ci
cd mcp && npm ci && cd ..

# 3. Copiar variables de entorno
cp .env.local.example .env.local

# 4. Levantar stack local de Supabase
supabase start

# 5. Regenerar tipos de la BD
npm run db:types

# 6. Verificar instalación
npm run type-check && npm run lint && npm run test
```

---

## Variables de Entorno

### `.env.local` (desarrollo local)

```bash
# Supabase (se obtiene del output de `supabase start`)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Hugging Face API (requerido para IA)
HUGGINGFACE_API_KEY=hf_...

# Opcional: override de modelos
HUGGINGFACE_CHAT_MODEL=meta-llama/Llama-2-7b-chat-hf
HUGGINGFACE_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

### Variables sensibles (producción)

En producción, estos valores se inyectan vía GitHub Secrets o variables de entorno del host (Vercel, Railway, etc.). **Nunca commiteás `.env.local`** — está en `.gitignore`.

---

## Ejecución Local

### Desarrollo

```bash
# Terminal 1: Supabase local
supabase start

# Terminal 2: Next.js dev server
npm run dev
# Accesible en http://localhost:3000
```

### Testing

```bash
# Tests unitarios (Vitest)
npm run test

# Tests con cobertura
npm run test:coverage

# Tests E2E (Playwright, requiere: npm run build && npm run start en otra terminal)
npm run test:e2e

# Tests E2E en modo watch
npm run test:watch
```

### Linting y Type-checking

```bash
# Verificar tipos TypeScript (root + mcp/)
npm run type-check

# Lint de código (ESLint)
npm run lint

# Build de producción
npm run build
npm run start
```

---

## Despliegue

### Deploy a Vercel (recomendado)

```bash
# 1. Conectar repo a Vercel vía CLI o dashboard
vercel link

# 2. Agregar variables de entorno en Vercel
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# HUGGINGFACE_API_KEY

# 3. Deploy automático en cada push a main
vercel deploy --prod
```

### Deploy a Railway / Render

1. Conectar repositorio GitHub
2. Configurar variables de entorno (las mismas de `.env.local`)
3. Seleccionar `Node.js` como runtime
4. Build command: `npm run build`
5. Start command: `npm run start`

### Consideraciones de Producción

- **Supabase:** usar un proyecto remoto (no ephemeral local)
- **Hugging Face API:** el token va en GitHub Secrets (no en el código)
- **Rate limiting:** implementar timeouts y límites por IP en production (WIP sesión 7)
- **Logging:** configurar observabilidad (logs, traces, métricas)
- **CORS:** solo dominios permitidos en política de CORS de Supabase

---

## Estructura del Proyecto

### Carpetas principales

| Carpeta | Responsabilidad | Contenido |
|---|---|---|
| **`app/`** | Rutas Next.js App Router | `(auth)` login/registro, `(shop)` catálogo/carrito/órdenes, `(seller)` panel vendedor, `api/v1/` endpoints |
| **`components/`** | Componentes React reutilizables | `ui/` (shadcn), `shared/` (comunes), `catalog/` (catálogo), `product/` (detalle), `cart/` (carrito), `orders/` (órdenes), `seller/` (panel), `auth/` (login), `support/` (soporte), `chat/` (asistente), `layout/` (navbar, footer) |
| **`hooks/`** | Custom React hooks | `useProducts`, `useCart`, `useAuth`, `useChat`, `useOrders`, `useSellerOrders`, `useFavorites`, `useQuestions`, `useReviews`, etc. |
| **`services/`** | Lógica de negocio (sin React) | `products.service`, `orders.service`, `cart.service`, `chat.service`, `vector-search.service`, `storage.service`, `auth.service`, `seller.service`, etc. |
| **`lib/`** | Configuraciones compartidas | `supabase/` (clientes), `ai/` (embeddings, chat, context), `constants/` (tunables), `utils.ts`, `validators/` (Zod) |
| **`types/`** | Tipos TypeScript | `database.ts` (generado), `product.ts`, `order.ts`, `user.ts`, DTOs |
| **`supabase/`** | BD y migraciones | `migrations/` (20+ migraciones), `seed.sql` (datos de prueba) |
| **`public/`** | Recursos estáticos | `favicon.ico` |
| **`mcp/`** | Servidor Model Context Protocol | `src/tools/` (10 read-only tools), `resources/` (6 dinámicos), `prompts/` (3 templates) |
| **`e2e/`** | Tests end-to-end Playwright | `fixtures/` (autenticación mock), `pages/` (page objects), `tests/` (suites buyer), `data/` (test users) |
| **`.github/`** | Configuración CI/CD | `workflows/ci.yml` (checks + e2e) |

### Archivos de configuración

| Archivo | Propósito |
|---|---|
| `package.json` | Scripts, dependencias, pinning npm@11.6.2 |
| `next.config.ts` | Configuración Next.js (imágenes remotas, optimizaciones) |
| `tsconfig.json` | TypeScript strict mode, rutas alias (`@/`) |
| `tailwind.config.ts` | Tema Tailwind CSS |
| `vitest.config.ts` | Configuración de tests unitarios |
| `playwright.config.ts` | Configuración E2E |
| `eslint.config.js` | Reglas de linting |
| `.env.local` | Variables de entorno (no commiteado) |
| `CLAUDE.md` | Convenciones y arquitectura del proyecto |

---

## API

### Endpoints principales (`app/api/v1/`)

| Endpoint | Método | Propósito |
|---|---|---|
| `/chat` | POST | Consultas al asistente de soporte (RAG) |
| `/search/semantic` | POST | Búsqueda semántica de productos |
| `/reindex` | POST | Reindexa productos/artículos en embeddings |

Todas las respuestas son JSON. Los errores devuelven status HTTP 4xx/5xx con mensaje de error.

### Rutas de UI (App Router)

#### Comprador (`(shop)`)

- `/` — Página de inicio (catálogo)
- `/buscar?q=...` — Búsqueda con dos pestañas (exacta + IA)
- `/producto/[id]` — Detalle de producto + reseñas + Q&A
- `/carrito` — Carrito de compras
- `/pedidos` — Historial de órdenes
- `/pedidos/[id]` — Detalle de orden
- `/asistente` — Chat del asistente de soporte
- `/soporte` — Centro de ayuda (FAQ)

#### Vendedor (`(seller)/vendedor/`)

- `/productos` — Lista de productos del vendedor
- `/productos/[id]/editar` — Editar producto
- `/publicar` — Crear nuevo producto
- `/pedidos` — Gestión de órdenes (kanban)

#### Autenticación (`(auth)`)

- `/login` — Ingreso
- `/register` — Registro

---

## Base de Datos

### Estructura General

La BD está en PostgreSQL (Supabase) con **Row-Level Security (RLS)** habilitado. Todas las tablas usan UUIDs como PKs. Las transacciones críticas (checkout) se manejan vía funciones SQL.

### Tablas Principales

| Tabla | Descripción | Relaciones Clave |
|---|---|---|
| **`profiles`** | Usuarios autenticados (por autenticación de Supabase) | FK: `auth.users.id` |
| **`products`** | Catálogo de productos | FK: `seller_id` (profiles), `category_id` (categories) |
| **`product_images`** | Galerías de imágenes por producto | FK: `product_id` (products) |
| **`categories`** | Categorías de productos (laptops, smartphones, etc.) | Jerarquía: `parent_id` (self-referencial) |
| **`cart_items`** | Carrito del comprador | FK: `buyer_id` (profiles), `product_id` (products) |
| **`orders`** | Órdenes de compra | FK: `buyer_id` (profiles), estado: pendiente/pagado/enviado/entregado/cancelado |
| **`order_items`** | Items individuales de una orden (snapshots de precio/título) | FK: `order_id` (orders), `product_id` (products), `seller_id` (profiles) |
| **`reviews`** | Reseñas de productos | FK: `product_id` (products), `buyer_id` (profiles), rating: 1-5 |
| **`questions`** | Preguntas de compradores | FK: `product_id` (products), `user_id` (profiles) |
| **`answers`** | Respuestas a preguntas | FK: `question_id` (questions), `user_id` (profiles) |
| **`favorites`** | Productos favoritos | FK: `buyer_id` (profiles), `product_id` (products) |
| **`product_views`** | Historial de vistas de producto (analytics) | FK: `product_id` (products), `user_id` (profiles) |
| **`support_articles`** | Artículos de FAQ para el asistente | — |
| **`support_tickets`** | Tickets de soporte del cliente | FK: `user_id` (profiles) |
| **`ticket_messages`** | Mensajes dentro de un ticket | FK: `ticket_id` (support_tickets), `user_id` (profiles) |
| **`knowledge_embeddings`** | Índice de embeddings (384D) para búsqueda semántica | Discriminado por `source_type`: 'producto' \| 'articulo_soporte' |

### Índices Clave

- **Vector search:** `knowledge_embeddings.embedding` (pgvector con L2 distance)
- **Performance:** índices en `product_id`, `category_id`, `buyer_id`, `seller_id`, `status`

### Políticas RLS (Row-Level Security)

| Tabla | Política | Lógica |
|---|---|---|
| `products` | SELECT | Público (solo `is_active=true`), vendedor ve los suyos |
| `orders` | SELECT | Solo el comprador ve sus órdenes |
| `cart_items` | SELECT/INSERT/UPDATE | Solo el comprador ve/modifica su carrito |
| `reviews` | INSERT | Solo el comprador puede reseñar |
| `support_tickets` | SELECT/INSERT | Solo el usuario ve sus tickets |
| `knowledge_embeddings` | SELECT | Público (para búsqueda) |

### Migraciones

Se encuentran en `supabase/migrations/` (20+). Cada migración:
1. Crea tablas/índices
2. Habilita RLS
3. Define políticas
4. Configura triggers (ej: reindexación automática al editar producto)

**Comando para aplicar:**

```bash
supabase db push  # En desarrollo
# En producción: Supabase CLI con token de proyecto remoto
```

---

## Contribución

### Ciclo de Desarrollo

1. **Crear rama:** `git checkout -b feature/mi-feature`
2. **Desarrollar:** seguir convenciones en `CLAUDE.md`
3. **Tests:** `npm run test` debe pasar (201/201)
4. **Lint + Type:** `npm run lint && npm run type-check`
5. **E2E:** `npm run test:e2e` (si aplica)
6. **Validator:** invocar skill `mercadotech-automatic-validator` (gate binario)
7. **Commit:** mensaje imperativo presente, referencia a fase
8. **Push & PR:** GitHub Actions ejecuta automáticamente

### Convenciones

Ver `CLAUDE.md` para:
- Reglas de arquitectura (5 reglas de independencia)
- Convenciones de código (inglés para código, español para docs)
- Testing (inyección de Supabase, comportamiento real)
- Ciclo reviewer → desarrollo → validator → commit

---

## Licencia

Proyecto educativo. Sin licencia específica.

---

## Contacto & Recursos

- **Bitácora:** `docs/BITACORA.md` (historial acumulativo por sesión)
- **Debugging:** `docs/DEBUGGING.md` (runbook de diagnóstico)
- **RAG:** `docs/RAG.md` (sistema de búsqueda semántica)
- **Arquitectura MCP:** `mcp/AUDIT.md` (auditoría de seguridad)

---

**Última actualización:** Sesión 6 (2026-08-31) — Testing, CI/CD, Debugging

**Estado:** ✅ Verde (CI pasa, 201/201 tests, main protegida, listo para Sesión 7: Performance + Secretos + Deploy)
