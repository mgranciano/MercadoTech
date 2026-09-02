# MercadoTech — Marketplace Tecnológico

**Tienda online de productos tecnológicos con búsqueda impulsada por IA y asistente de soporte.**

🔗 **URL de Producción:** *(se completará en Fase 7.4)* 

---

## ¿Qué es MercadoTech?

MercadoTech es un marketplace donde:

- **Compradores** exploran productos tecnológicos, buscan con IA (ej: "laptop ligera"), leen reseñas, agregan al carrito y simulan compra
- **Vendedores** publican productos con imágenes, gestionan pedidos en un tablero Kanban
- **Asistente de IA** responde preguntas sobre envíos, pagos, devoluciones citando la FAQ en tiempo real
- **Base de datos** protegida con RLS (Row-Level Security), búsqueda semántica con embeddings, autenticación JWT

**No hay procesamiento de pagos real** — el checkout es simulado para fines educativos.

---

## Tecnologías

| Aspecto | Herramienta |
|---|---|
| Frontend | Next.js 16 + React 19 + TypeScript 5 |
| Estilos | Tailwind CSS + shadcn/ui |
| Base de datos | Supabase (PostgreSQL + RLS + Auth) |
| Búsqueda semántica | Hugging Face (embeddings 384D) |
| IA generativa | Hugging Face Inference (chat) |
| Testing | Vitest (unitarios) + Playwright (E2E) |
| CI/CD | GitHub Actions |
| Deploy | Vercel |

---

## Inicio Rápido (Desarrollo Local)

### Requisitos

- **Node.js** 22+ y **npm** 11.6.2
- **Docker Desktop** (para Supabase local)
- **Git**

### Pasos

```bash
# 1. Clonar repositorio
git clone https://github.com/growlearnjo/mercadotech.git
cd mercadotech

# 2. Instalar dependencias
npm ci
cd mcp && npm ci && cd ..

# 3. Copiar variables de entorno
cp .env.example .env.local

# 4. Iniciar Supabase local (requiere Docker)
supabase start

# 5. Ejecutar migraciones + seed
supabase db reset

# 6. Completar .env.local con credenciales de Supabase local
# (El comando anterior mostrará: API_URL, ANON_KEY, SERVICE_ROLE_KEY)
# Cópialas en .env.local

# 7. Instalar Supabase CLI si no lo tienes
npm install -g supabase

# 8. Levantar app en desarrollo
npm run dev
# Abierto en http://localhost:3000
```

---

## Comandos Principales

```bash
# Desarrollo
npm run dev              # Servidor local con hot reload

# Testing
npm run test             # Tests unitarios (201 tests)
npm run test:coverage    # Coverage report (HTML)
npm run test:e2e         # E2E Playwright (requiere: npm run build && npm run start)
npm run test:watch       # Watch mode tests

# Verificación
npm run lint             # ESLint
npm run type-check       # TypeScript strict
npm run build            # Build de producción

# Producción local
npm run build
npm run start            # Servidor prod en localhost:3000

# Base de datos
npm run db:types         # Regenerar types/database.ts desde Supabase
supabase db reset        # Reiniciar BD local + migraciones + seed
supabase start           # Iniciar stack Supabase local
supabase stop            # Detener Supabase

# IA (Re-indexación)
npx tsx scripts/index-all.ts  # Reindexa productos + FAQ en embeddings
```

---

## Estructura del Proyecto

```
mercadotech/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Login, register
│   ├── (shop)/            # Comprador: catálogo, búsqueda, carrito, órdenes, soporte
│   ├── (seller)/vendedor/ # Vendedor: productos, pedidos
│   └── api/v1/            # API: chat, búsqueda, reindex
├── components/            # Componentes React (ui, catalog, cart, orders, etc.)
├── hooks/                 # Custom hooks (useProducts, useCart, useAuth, etc.)
├── services/              # Lógica de negocio (sin React)
├── lib/                   # Configuración compartida
│   ├── supabase/         # Clientes Supabase
│   ├── ai/               # Embeddings, chat, RAG context
│   ├── constants/        # Tunables (modelos, precios, límites)
│   └── utils.ts          # Utilidades
├── types/                 # TypeScript types (DTOs, database)
├── supabase/             # BD y migraciones
│   ├── migrations/       # 29 migraciones
│   ├── seed.sql          # Datos de prueba (laboratorio)
│   └── seed.prod.sql     # Datos de producción (8 categorías + 10 FAQ)
├── e2e/                  # Tests Playwright
├── mcp/                  # Servidor Model Context Protocol (10 tools + 6 resources)
├── scripts/              # Utilidades: index-all.ts para reindexación
└── docs/                 # Documentación
    ├── BITACORA.md       # Historial por sesión
    ├── ARQUITECTURA.md   # Capas y decisiones
    ├── DEPLOY.md         # Variables, flow, rollback, smoke tests
    ├── PERFORMANCE.md    # Métricas de performance
    ├── RAG.md            # Sistema de búsqueda semántica
    ├── DEBUGGING.md      # Runbook de diagnóstico
    └── PLAN_CURSO.md     # Plan original (referencia)
```

---

## Flujo de Datos

```
┌─────────────────────────┐
│      React Frontend     │
│  (Componentes, Hooks)   │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│      Services Layer     │
│   (Lógica de negocio)   │
└────────┬────────────────┘
         │
   ┌─────┴─────┬────────────┬──────────┐
   │            │            │          │
   ↓            ↓            ↓          ↓
┌────────┐  ┌────────┐  ┌───────┐  ┌──────────┐
│Supabase│  │Hugging │  │Storage│  │Auth(JWT) │
│   DB   │  │ Face   │  │ (CDN) │  │          │
└────────┘  └────────┘  └───────┘  └──────────┘
```

---

## Uso de la App

### Para Compradores

1. **Registro/Login:** `/register` o `/login`
2. **Explorar:** `/` (home) o `/buscar` (búsqueda exacta)
3. **Búsqueda IA:** en `/buscar`, pestaña "Por IA" (busca "laptop ligera" → encuentra MacBooks)
4. **Detalle:** `/producto/[id]` (galería, reseñas, Q&A)
5. **Carrito:** `/carrito` (agregar, modificar cantidades)
6. **Órdenes:** `/pedidos` (historial y detalles)
7. **Soporte:** `/asistente` (chat) o `/soporte` (FAQ)

### Para Vendedores

1. **Registro como vendedor:** en `/register`, marcar "Quiero vender"
2. **Panel:** `/vendedor/productos` (lista de productos)
3. **Publicar:** `/vendedor/publicar` (título, descripción, precio, stock, imágenes)
4. **Editar:** `/vendedor/productos/[id]/editar`
5. **Órdenes:** `/vendedor/pedidos` (tablero Kanban: pendiente → pagado → enviado → entregado)

---

## Testing

### Tests Unitarios (Vitest)

```bash
npm run test              # Corre los 201 tests
npm run test:coverage     # Genera reporte HTML (coverage/)
```

**Cobertura:** 70%+ en servicios, 64%+ en ramas. Mock de Supabase inyectable (NO vi.mock).

### Tests E2E (Playwright)

```bash
# Prerequisito: el app debe estar compilado y corriendo
npm run build
npm run start             # en Terminal 1

# En Terminal 2:
npm run test:e2e          # Corre los 30 tests (chromium solamente)
```

**Cobertura:** flujo completo de comprador (navegar → buscar → agregar carrito → checkout).

### CI/CD

Cada push a `main` o PR dispara GitHub Actions:
- ✅ ESLint + TypeScript check
- ✅ 201 tests unitarios
- ✅ 30 tests E2E (contra Supabase local ephemeral)
- ✅ Compilación de producción

**Branch protection:** `main` requiere que ambos jobs pasen.

---

## Performance y Core Web Vitals

Ver `docs/PERFORMANCE.md` para:
- Mediciones base (ANTES de optimizaciones)
- Optimizaciones aplicadas (dynamic imports, image sizes, etc.)
- Benchmarks finales (Lighthouse ≥90 en Performance)

Objetivos:
- LCP (Largest Contentful Paint) < 2.5 s
- CLS (Cumulative Layout Shift) < 0.1
- INP (Interaction to Next Paint) < 200 ms

---

## Variables de Entorno

### Desarrollo Local (`.env.local`)

Se obtiene de `supabase status -o env` tras `supabase start`:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
HUGGINGFACEHUB_API_TOKEN=hf_...  # Opcional, requerido para chat/búsqueda
```

### Producción (Vercel Dashboard)

Nunca commitear `.env.local`. En Vercel, se cargan a mano en **Project Settings → Environment Variables**:
- `NEXT_PUBLIC_SUPABASE_URL` (pública)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (pública, RLS protege)
- `SUPABASE_SERVICE_ROLE_KEY` (secreta, solo servidor)
- `HUGGINGFACEHUB_API_TOKEN` (secreta)
- `NEXT_PUBLIC_SITE_URL` (pública, prod URL)

Ver `docs/DEPLOY.md` para detalles de gobernanza.

---

## Despliegue

### Deploy a Vercel (Producción)

1. **Crear proyecto Supabase de producción** (en https://supabase.com/dashboard)
   - Guardar contraseña de BD
   - Anotar URL, claves anon y service role

2. **Conectar Vercel a GitHub**
   - En https://vercel.com/new, importar `growlearnjo/mercadotech`
   - Next.js se detecta automáticamente

3. **Cargar variables de entorno en Vercel** (sin CLI, vía dashboard)
   - `NEXT_PUBLIC_SUPABASE_URL` → Production + Preview
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Production + Preview
   - `SUPABASE_SERVICE_ROLE_KEY` → Production + Preview
   - `HUGGINGFACEHUB_API_TOKEN` → Production + Preview
   - `NEXT_PUBLIC_SITE_URL` → Production (URL real), Preview (auto)

4. **Deploy automático**
   - Cada push a `main` → producción
   - Cada PR → preview con URL propia

5. **Verificación post-deploy** (smoke test en `docs/DEPLOY.md`)
   - Home carga
   - Registrarse como vendedor
   - Publicar 1 producto demo
   - Asistente responde con FAQ
   - Logout/login funciona

### Rollback

Si un deploy falla, en Vercel Dashboard → **Deployments → mostrar anterior → Redeploy**. 

**Nota:** El rollback de Vercel NO revierte cambios de base de datos — esos solo se revierten con una migración nueva.

---

## Debugging

Si algo falla, ver `docs/DEBUGGING.md` con:
- 7 errores típicos (RLS, GRANT role, HF 404, vector dimension, npm lock, MCP stdout, Supabase connection refused)
- Tabla: síntoma → causa → primer comando
- Cómo leer logs de CI y Playwright traces

---

## Arquitectura en Profundidad

Ver `docs/ARQUITECTURA.md` para:
- Las 5 capas (Frontend, Hooks, Services, Supabase, IA)
- 5 reglas de independencia (un archivo = una responsabilidad, sin barrels, UI nunca importa AI, flujo único de datos, tunables en constants)
- DTO ENFORCER (servicios mapean respuestas de BD a DTOs limpios, componentes nunca usan tipos crudos de Supabase)
- Decisiones por sesión (S2: BD y RLS; S3: frontend; S4: RAG; S5: MCP; S6: testing y CI; S7: performance y deploy)

---

## RAG (Búsqueda Semántica)

El sistema de soporte y búsqueda de productos usa RAG (Retrieval-Augmented Generation):

1. **Indexación:** productos y artículos de FAQ se transforman en embeddings (384D, Hugging Face)
2. **Almacenamiento:** tabla `knowledge_embeddings` con pgvector
3. **Recuperación:** al buscar, se recuperan los K resultados más cercanos (L2 distance)
4. **Generación:** el LLM genera respuesta citando las fuentes reales

Ver `docs/RAG.md` para flujo completo y endpoints (`/api/v1/search/semantic`, `/api/v1/chat`, `/api/v1/reindex`).

---

## MCP Server

El proyecto incluye un servidor Model Context Protocol (stdio transport) en `mcp/`:
- **10 tools** read-only (listar productos, búsqueda, órdenes, etc.)
- **6 resources** dinámicos (catálogo, FAQ, órdenes, etc.)
- **3 prompts** (búsqueda guiada, soporte, etc.)
- **RLS activo:** tools usan cliente anon, no admin

Ver `mcp/README.md` y `mcp/AUDIT.md` para detalles de seguridad.

---

## Convenciones de Código

Ver `CLAUDE.md` en el repo para:
- Identificadores en inglés (código), español (docs)
- TypeScript strict mode
- Service con cliente inyectable (NO viven secretos en código)
- Hooks encapsulan fetch y estado
- Componentes cero lógica de negocio
- DTOs mapean respuestas de BD
- Tests: Vitest con mock inyectable, Playwright E2E
- Commits con referencia a fase (ej: `perf: optimizar home for Fase 7.2`)

---

## Próximos Pasos

- **Sesión 8:** Agente de voz y demo final del marketplace

---

## Ayuda & Recursos

| Recurso | Qué tiene |
|---|---|
| `docs/BITACORA.md` | Historial de sesiones (qué se construyó, decisiones, desviaciones) |
| `docs/ARQUITECTURA.md` | Capas, reglas de independencia, decisiones por sesión |
| `docs/DEPLOY.md` | Gobernanza de secretos, flujo de despliegue, smoke tests, rollback |
| `docs/PERFORMANCE.md` | Métricas Core Web Vitals, optimizaciones, Lighthouse scores |
| `docs/RAG.md` | Sistema de búsqueda semántica, embeddings, endpoints |
| `docs/DEBUGGING.md` | Runbook: 7 errores típicos, tabla síntoma → fix |
| `mcp/README.md` | Tools, resources, prompts del servidor MCP |
| `CLAUDE.md` | Contrato de desarrollo (reglas, convenciones, estado del proyecto) |

---

**Última actualización:** Sesión 7 (2026-09-02) — Performance, Secretos, Deploy

**Estado:** ✅ En desarrollo (Fase 7.4 en curso: despliegue en Vercel)
