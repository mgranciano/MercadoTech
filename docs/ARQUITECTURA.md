# MercadoTech — Arquitectura Técnica

**Versión:** 1.0 · **Sesión:** 2 · **Fecha:** 2026-08-28

## Tabla de contenidos

1. [Visión general](#visión-general)
2. [Arquitectura de capas](#arquitectura-de-capas)
3. [Organización de carpetas](#organización-de-carpetas)
4. [Modelo relacional](#modelo-relacional)
5. [Decisiones de diseño](#decisiones-de-diseño)
6. [Integración Next.js ↔ Supabase](#integración-nextjs--supabase)
7. [Flujo de autenticación](#flujo-de-autenticación)
8. [Seguridad: Row Level Security (RLS)](#seguridad-row-level-security-rls)
9. [Escalabilidad](#escalabilidad)
10. [Operaciones](#operaciones)

---

## Visión general

MercadoTech es un marketplace multi-vendedor construido sobre:

- **Frontend:** Next.js 15 (App Router) + React 19 + TypeScript + TailwindCSS v4
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Seguridad:** Row Level Security en todas las tablas
- **Almacenamiento:** Supabase Storage con políticas por propietario

**Principios de diseño:**

- Arquitectura escalable por capas (presentación, lógica, persistencia)
- Seguridad primero: RLS en modelo de datos, RBAC en aplicación
- Reproducibilidad: migraciones versionadas, seed data con UUIDs fijos
- Integridad referencial: constraints en BD, validación en aplicación
- Snapshot histórico: order_items guardan precio/título inmutables

---

## Arquitectura de capas

```
┌─────────────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER (React components, pages)                    │
│ ├─ app/(auth)/          Login, register                         │
│ ├─ app/(shop)/          Catálogo, producto, carrito, pedidos    │
│ ├─ app/(seller)/        Panel del vendedor                      │
│ └─ components/          Componentes UI reutilizables            │
├─────────────────────────────────────────────────────────────────┤
│ APPLICATION LAYER (Hooks, services, validators)                 │
│ ├─ hooks/               Estado de cliente                       │
│ ├─ services/            Lógica de negocio (cliente)             │
│ ├─ lib/validators/      Validación de entrada                   │
│ ├─ lib/constants/       Roles, estados, enum values             │
│ └─ types/               TypeScript interfaces                   │
├─────────────────────────────────────────────────────────────────┤
│ API LAYER (Server actions, edge functions)                      │
│ └─ app/api/v1/          REST endpoints (sesión 3+)              │
├─────────────────────────────────────────────────────────────────┤
│ DATA ACCESS LAYER (Supabase clients)                            │
│ ├─ lib/supabase/client.ts    Browser (ANON_KEY)                │
│ ├─ lib/supabase/server.ts    Server (cookies)                  │
│ ├─ lib/supabase/admin.ts     Service role (admin-only)         │
│ └─ lib/supabase/middleware.ts Session refresh                  │
├─────────────────────────────────────────────────────────────────┤
│ PERSISTENCE LAYER (PostgreSQL + Storage)                        │
│ ├─ Database: 14 tablas + 3 funciones transaccionales            │
│ ├─ Storage: 2 buckets (product-images, avatars)                │
│ └─ Auth: Supabase Auth (JWT, cookies, RLS)                     │
└─────────────────────────────────────────────────────────────────┘
```

### Flujo de datos

```
User Input (UI)
    ↓
React Hook / Server Action
    ↓
Supabase Client (browser/server)
    ↓
PostgreSQL (RLS applied)
    ↓
Response (filtered by RLS)
    ↓
React State / Server response
```

---

## Organización de carpetas

```
mercadotech/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (shop)/
│   │   ├── catalog/
│   │   ├── product/[id]/
│   │   ├── cart/
│   │   ├── orders/
│   │   └── layout.tsx
│   ├── (seller)/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── orders/
│   │   └── layout.tsx
│   ├── api/v1/
│   │   ├── auth/
│   │   ├── products/
│   │   └── orders/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home
│   └── error.tsx
├── components/
│   ├── auth/                # Login, register components
│   ├── shop/                # Catálogo, producto, carrito
│   ├── seller/              # Panel de vendedor
│   ├── ui/                  # Primitivos UI (shadcn/ui)
│   └── common/              # Header, footer, navbar
├── hooks/
│   ├── useAuth.ts           # Session, user info
│   ├── useCart.ts           # Cart state management
│   ├── useProducts.ts       # Product queries
│   └── useOrders.ts         # Order queries
├── services/
│   ├── auth.ts              # Login, register, logout
│   ├── products.ts          # CRUD productos
│   ├── cart.ts              # Carrito
│   ├── orders.ts            # Pedidos, checkout
│   └── reviews.ts           # Reseñas, Q&A
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Browser client (ANON_KEY)
│   │   ├── server.ts        # Server client (cookies)
│   │   ├── admin.ts         # Admin client (SERVICE_ROLE)
│   │   └── middleware.ts    # Session refresh middleware
│   ├── validators/
│   │   ├── product.ts
│   │   ├── order.ts
│   │   └── auth.ts
│   ├── constants/
│   │   └── roles.ts         # Roles, estados, enums
│   ├── utils.ts             # cn(), helpers
│   ├── cn.ts                # classnames utility
│   └── ai/                  # RAG, embeddings (sesión 4)
├── types/
│   ├── database.ts          # Generated types (gen-types)
│   ├── product.ts
│   ├── order.ts
│   ├── user.ts
│   └── index.ts
├── supabase/
│   ├── migrations/
│   │   ├── 0001_enable_extensions.sql
│   │   ├── 0002_create_profiles_table.sql
│   │   ├── ...
│   │   └── 0018_create_storage_buckets.sql
│   ├── tests/
│   │   └── rls-validation.sql
│   ├── schema.sql           # Reference snapshot (source: migrations)
│   ├── policies.sql         # Reference snapshot (source: 0017)
│   └── seed.sql             # Test data (6 users, 16 products, 5 orders, ...)
├── docs/
│   ├── ARQUITECTURA.md      # This file
│   ├── DEPLOYMENT.md        # (future)
│   └── API.md               # (future)
├── public/
│   └── images/
├── styles/
│   └── globals.css
├── .env.example
├── .env.local               # (gitignored)
├── tsconfig.json
├── tailwind.config.ts
├── eslint.config.js
├── package.json
├── package-lock.json
├── next.config.ts
├── middleware.ts            # Root middleware (session refresh)
└── CLAUDE.md
```

---

## Modelo relacional

### Diagrama de entidades (texto)

```
auth.users (managed by Supabase)
    ↓ 1:1 (cascade)
profiles
    ├─ 1:N → products (seller_id)
    ├─ 1:N → cart_items (user_id)
    ├─ 1:N → orders (buyer_id)
    ├─ 1:N → questions (user_id)
    ├─ 1:N → reviews (buyer_id)
    ├─ 1:N → favorites (user_id)
    ├─ 1:N → product_views (user_id)
    ├─ 1:N → support_tickets (user_id)
    └─ 1:N → ticket_messages (sender, implicit)

categories
    ├─ 1:N → self (parent_id) [tree structure]
    └─ 1:N → products (category_id)

products
    ├─ 1:N → product_images
    ├─ 1:N → cart_items
    ├─ 1:N → order_items
    ├─ 1:N → questions
    ├─ 1:N → reviews
    ├─ 1:N → favorites
    └─ 1:N → product_views

orders
    ├─ 1:N → order_items (cascade)
    └─ 1:N → reviews (order_id validates delivery)

support_tickets
    └─ 1:N → ticket_messages (cascade)
```

### Entidades clave

#### PROFILES
Extensión de `auth.users` (1:1, cascade). Almacena rol y metadata de usuario.

```sql
id uuid PRIMARY KEY (FK → auth.users)
display_name text
phone text
role text CHECK(role IN ('buyer', 'seller', 'admin')) DEFAULT 'buyer'
avatar_path text
created_at timestamptz
```

**Trigger:** `handle_new_user()` auto-crea profile al registrarse en auth.users.

#### PRODUCTS
Catálogo de vendedores. Solo vendedores pueden crear.

```sql
id uuid PRIMARY KEY
seller_id uuid NOT NULL (FK → profiles)
category_id uuid NOT NULL (FK → categories)
title text NOT NULL
description text
brand text
condition text CHECK(condition IN ('nuevo', 'usado', 'reacondicionado')) DEFAULT 'nuevo'
price numeric(12,2) NOT NULL CHECK(price > 0)
stock integer DEFAULT 0 CHECK(stock >= 0)
is_active boolean DEFAULT true
created_at, updated_at timestamptz
```

**Índices:** `(seller_id)`, `(category_id)`, `(is_active)`

#### ORDER_ITEMS (con snapshot)
Línea de pedido con precio/título históricos. **Crítico:** Estos valores son inmutables, aún si el producto se edita después.

```sql
id uuid PRIMARY KEY
order_id uuid NOT NULL (FK → orders, cascade)
product_id uuid NOT NULL (FK → products)
seller_id uuid NOT NULL (denormalized for RLS)
title_snapshot text NOT NULL -- producto.title al momento de la orden
price_snapshot numeric(12,2) NOT NULL -- producto.price al momento
quantity integer CHECK(quantity > 0)
```

**Por qué snapshots:** Si el vendedor baja el precio después, el comprador no ve cambios en su order_items. Histórico inmutable.

#### CART_ITEMS
Carrito persistente. `unique(user_id, product_id)` — un producto por usuario.

```sql
id uuid PRIMARY KEY
user_id uuid NOT NULL (FK → profiles, cascade)
product_id uuid NOT NULL (FK → products, cascade)
quantity integer CHECK(quantity > 0)
created_at timestamptz
```

#### REVIEWS
Reseñas verificadas. Solo quien recibió el producto (`order.status = 'entregado'`) puede reseñar.

```sql
id uuid PRIMARY KEY
product_id uuid NOT NULL (FK → products, cascade)
buyer_id uuid NOT NULL (FK → profiles)
order_id uuid NOT NULL (FK → orders)
rating integer CHECK(rating BETWEEN 1 AND 5)
comment text
created_at timestamptz
UNIQUE(product_id, buyer_id)
```

**RLS crítica:** Policy INSERT valida que existe `orders` con `status = 'entregado'` y `order_items` contiene el producto.

#### SUPPORT_ARTICLES
FAQ base para RAG (sesión 4).

```sql
id uuid PRIMARY KEY
title text NOT NULL
content text NOT NULL (2-4 párrafos reales)
category text ('envíos', 'pagos', 'devoluciones', 'cuenta')
is_published boolean DEFAULT true
created_at, updated_at timestamptz
```

---

## Decisiones de diseño

### 1. Snapshots en ORDER_ITEMS

**Decisión:** `title_snapshot` y `price_snapshot` son inmutables post-orden.

**Justificación:**
- Histórico de precios real: el comprador ve qué pagó
- Protege al vendedor: cambios de precio no afectan órdenes pasadas
- Simplifica auditoría: no hay "pero el producto costaba más antes"

**Implementación:**
```sql
-- Trigger on products UPDATE previene cambios que afecten order_items existentes
-- (Los snapshots están en order_items, no en products)
-- Inserción en order_items ocurre SOLO desde create_order_from_cart()
```

### 2. seller_id denormalizado en ORDER_ITEMS

**Decisión:** ORDER_ITEMS contiene `seller_id` además de `product_id`.

**Justificación:**
- **Performance RLS:** `order_items_select_policy` accede directamente `seller_id = auth.uid()` sin join a products
- Sin denormalización, cada query debería: `order_items → products → seller_id` (costoso)
- Integridad mantenida: `seller_id` es derivado de `product_id` al insertar

**Implementación:**
```sql
CREATE FUNCTION create_order_from_cart(...)
  -- Al insertar order_item, copia seller_id de producto
  INSERT INTO order_items (order_id, product_id, seller_id, ...)
  SELECT ..., (SELECT seller_id FROM products WHERE id = v_product_id), ...
```

### 3. Checkout como función transaccional

**Decisión:** `create_order_from_cart()` es función PostgreSQL SECURITY DEFINER, no endpoint HTTP.

**Justificación:**
- **Atomicidad:** Una transacción única: validar stock → crear orden → decrementar stock → limpiar carrito
- **Seguridad:** No hay window entre validación y decremento; `FOR UPDATE` bloquea carreras
- **Autorización:** Función valida internamente `p_buyer_id = auth.uid()`
- **Rendimiento:** PL/pgSQL native, sin round-trips

**Flujo:**
```
Client calls: SELECT public.create_order_from_cart(auth.uid())
  ↓
Function validates:
  - Cart not empty
  - Each product active & has stock
  ↓
Function executes (one transaction):
  - Acquires FOR UPDATE locks on products
  - Creates order (status='pendiente')
  - Creates order_items with snapshots
  - Decrements stock
  - Deletes cart items
  ↓
Function returns order_id
```

**Errores esperados:**
- `Cart is empty`
- `Product {id} not active`
- `Insufficient stock for product {title}`
- `Unauthorized: cannot create order for another user`

### 4. PRODUCT_VIEWS como eventos (no contador)

**Decisión:** Cada view es una fila, no agregada.

**Justificación:**
- Permite analytics fino: cuándo, quién, frecuencia
- Para RAG (sesión 4): embeddings basados en producto + contexto de view
- Contador normalizaría, perderíamos temporal info
- Escalable: índice en `(product_id, viewed_at)` es eficiente

**Query de analytics:**
```sql
-- Vistas por producto en últimas 24h
SELECT product_id, COUNT(*) as views_24h
FROM product_views
WHERE viewed_at > now() - interval '24h'
GROUP BY product_id
ORDER BY views_24h DESC;
```

### 5. RLS + GRANT explícito

**Decisión:** RLS habilitado en TODAS las tablas. Cada operación tiene GRANT explícito.

**Justificación:**
- Sin GRANT: incluso con RLS habilitado, error "permission denied" opaco
- Explícito es mejor: GRANT hace evidente quién tiene acceso a qué

**Patrón:**
```sql
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select" ON public.products FOR SELECT USING (...);
CREATE POLICY "products_insert" ON public.products FOR INSERT WITH CHECK (...);
CREATE POLICY "products_update" ON public.products FOR UPDATE WITH CHECK (...);
CREATE POLICY "products_delete" ON public.products FOR DELETE USING (...);

GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
```

### 6. Árbol de categorías (parent_id)

**Decisión:** `categories.parent_id` nullable permite subcategorías.

**Justificación:**
- Taxonomía flexible: Electrónica → Laptops → Gaming Laptops
- Filtro de catálogo: usuario navega por rama

**Estructura ejemplo:**
```
Laptops (id=..., parent_id=NULL)
  ├─ Gaming (parent_id=Laptops)
  └─ Business (parent_id=Laptops)

Componentes PC (id=..., parent_id=NULL)
  ├─ RAM (parent_id=Componentes)
  └─ SSD (parent_id=Componentes)
```

**RLS:** Todos ven categorías; solo admin crea/edita.

### 7. Support tickets + messages (para agent de voz, sesión 8)

**Decisión:** Separar `support_tickets` (metadata) de `ticket_messages` (conversación).

**Justificación:**
- Agente de voz (sesión 8) necesita historial de mensajes
- `channel` (chat/voz) permite router inteligente
- `sender_role` (usuario/agente/humano) distingue quién responde
- Escalable a multi-turn conversations

**Campos:**
```sql
support_tickets:
  id, user_id, subject, status, channel (chat|voz), created_at

ticket_messages:
  id, ticket_id, sender_role (usuario|agente|humano), content, created_at
```

---

## Integración Next.js ↔ Supabase

### Clientes Supabase

#### 1. Browser Client (`lib/supabase/client.ts`)

```typescript
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

**Uso:** React components, client-side queries.

**Restricciones:** RLS aplicado automáticamente con `auth.uid()`.

**Ejemplo:**
```typescript
// En un component
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true)
  // RLS filtra: solo activos (o propios si eres vendedor)
```

#### 2. Server Client (`lib/supabase/server.ts`)

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => { ... }
      }
    }
  )
}
```

**Uso:** Server actions, API routes, middleware.

**Respeta RLS:** Cookies incluyen JWT con `auth.uid()`.

#### 3. Admin Client (`lib/supabase/admin.ts`)

```typescript
import { createClient } from '@supabase/supabase-js'

export const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
// WARNING: Bypasses RLS. Nunca exportar a cliente.
```

**Uso:** Solo servidor (admin operations, batch imports).

**Seguridad:** `SUPABASE_SERVICE_ROLE_KEY` **jamás** en cliente.

#### 4. Middleware (`lib/supabase/middleware.ts` + `middleware.ts` raíz)

```typescript
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
}
```

**Función:** Refresca JWT antes de que expire. Patrón oficial de Supabase.

### Tipos TypeScript

Generados desde schema PostgreSQL:

```bash
supabase gen types typescript > types/database.ts
```

**Uso:**
```typescript
import type { Database } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']
type OrderInsert = Database['public']['Tables']['orders']['Insert']
```

---

## Flujo de autenticación

### 1. Signup

```
User fills form: email + password
    ↓
POST /auth/register (Server Action)
    ↓
supabase.auth.signUpWithPassword(email, password)
    ↓
Supabase Auth creates auth.users
    ↓
Trigger handle_new_user()
    ↓
Inserts into profiles (role='buyer' by default)
    ↓
Session set in cookies (secure, httpOnly)
    ↓
Redirect to /shop/catalog
```

### 2. Login

```
User fills form: email + password
    ↓
POST /auth/login (Server Action)
    ↓
supabase.auth.signInWithPassword(email, password)
    ↓
Supabase Auth validates credentials
    ↓
JWT generated, set in cookies
    ↓
Middleware refreshes session on next request
    ↓
React hook useAuth() reads from session
```

### 3. Session Persistence

```
Browser stores JWT in cookies (secure, httpOnly)
    ↓
Middleware runs on every request
    ↓
Checks token expiry; refreshes if needed (< 30s left)
    ↓
New token set in cookies
    ↓
Client always has valid JWT
```

### 4. Logout

```
User clicks logout
    ↓
POST /auth/logout (Server Action)
    ↓
supabase.auth.signOut()
    ↓
Session removed from cookies
    ↓
Redirect to /
```

### 5. Authorization: useAuth() hook

```typescript
// In any component
const { user, role, isLoading } = useAuth()

if (!user) {
  return <LoginCTA />
}

if (role === 'seller') {
  return <SellerDashboard />
}

return <BuyerCatalog />
```

**Detrás de escenas:**
```typescript
// hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        // Fetch profile to get role
        supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setRole(data?.role))
      }
    })
  }, [])

  return { user, role, isLoading }
}
```

---

## Seguridad: Row Level Security (RLS)

### Filosofía

**Regla de oro:** La base de datos, no la aplicación, es la fuente de verdad para autorización.

Cada política RLS es una función que determina: "¿Puede este usuario ver/modificar esta fila?"

### Helper: is_admin()

```sql
CREATE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

**Por qué SECURITY DEFINER:** La función corre con permisos del owner, no del caller. Sin esto, cada usuario tendría que poder leer `profiles` (no queremos).

**Uso en políticas:**
```sql
CREATE POLICY "admin_moderation"
  ON public.reviews FOR DELETE
  USING (public.is_admin());
```

### Políticas por tabla

#### PROFILES
- **SELECT:** Dueño + admin
- **UPDATE:** Dueño (pero `role` es read-only de facto; trigger evita cambios directos)
- **INSERT:** Trigger (no permite cliente)
- **DELETE:** Nunca (cascade desde auth.users)

#### CATEGORIES
- **SELECT:** Todos (anon incluido)
- **INSERT/UPDATE/DELETE:** Admin

#### PRODUCTS
- **SELECT:** Activos (todos) + propios (vendedor) + todos (admin)
  ```sql
  is_active = true OR seller_id = auth.uid() OR public.is_admin()
  ```
- **INSERT:** Authenticated + role='seller' + seller_id=auth.uid()
  ```sql
  seller_id = auth.uid() AND (SELECT role='seller' FROM profiles WHERE id = auth.uid())
  ```
- **UPDATE/DELETE:** seller_id = auth.uid()

#### PRODUCT_IMAGES
- **SELECT:** Hereda visibilidad de producto
  ```sql
  product_id IN (SELECT id FROM products WHERE is_active OR seller_id = auth.uid() OR ...)
  ```
- **INSERT/UPDATE/DELETE:** seller_id del producto = auth.uid()

#### CART_ITEMS
- **SELECT/INSERT/UPDATE/DELETE:** user_id = auth.uid()

#### ORDERS
- **SELECT:** Comprador (buyer_id=auth.uid()) + vendedor (vía order_items.seller_id) + admin
  ```sql
  buyer_id = auth.uid()
  OR id IN (SELECT order_id FROM order_items WHERE seller_id = auth.uid())
  OR public.is_admin()
  ```
- **INSERT:** FORBIDDEN (solo vía `create_order_from_cart`)
- **UPDATE:** Comprador puede cancelar si status='pendiente'; vendedor puede avanzar si tiene ítems

#### ORDER_ITEMS
- **SELECT:** Comprador de orden + vendedores + admin
  ```sql
  order_id IN (SELECT id FROM orders WHERE buyer_id = auth.uid())
  OR seller_id = auth.uid()
  OR public.is_admin()
  ```
- **INSERT/UPDATE/DELETE:** FORBIDDEN (solo vía función)

#### QUESTIONS
- **SELECT:** Todos (producto es público)
- **INSERT:** Authenticated + user_id=auth.uid()
- **UPDATE:** Vendedor del producto (para responder)
  ```sql
  product_id IN (SELECT id FROM products WHERE seller_id = auth.uid())
  ```
- **DELETE:** Autor + admin

#### REVIEWS
- **SELECT:** Todos
- **INSERT:** Comprador + orden 'entregado' + order_items contiene producto
  ```sql
  buyer_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.buyer_id = auth.uid()
      AND o.status = 'entregado'
      AND oi.product_id = reviews.product_id
  )
  ```
- **UPDATE:** Autor
- **DELETE:** Autor + admin

#### FAVORITES
- **SELECT/INSERT/DELETE:** user_id = auth.uid()

#### PRODUCT_VIEWS
- **SELECT:** Vendedor del producto + admin (para analytics)
- **INSERT:** Authenticated

#### SUPPORT_ARTICLES
- **SELECT:** Publicados + admin
- **INSERT/UPDATE/DELETE:** Admin

#### SUPPORT_TICKETS
- **SELECT:** Dueño + admin
- **INSERT:** Authenticated + user_id=auth.uid()
- **UPDATE:** Dueño + admin

#### TICKET_MESSAGES
- **SELECT:** Dueño del ticket + admin
- **INSERT:** Dueño + admin

### GRANTs

```sql
-- anon: lectura pública
GRANT SELECT ON categories, products, product_images, questions, reviews, support_articles TO anon;

-- authenticated: lectura completa + escrituras controladas
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON products, product_images, cart_items, ... TO authenticated;
```

### Anti-patrones a evitar

❌ **No hacer:** RLS en todas las filas de una tabla (O(n) queries).

✅ **Hacer:** Denormalizar `seller_id` en `order_items` para acceso directo.

❌ **No hacer:** Función sin SECURITY DEFINER que lee profiles en caliente.

✅ **Hacer:** `is_admin()` con SECURITY DEFINER + cacheada.

❌ **No hacer:** Confiar en `auth.uid()` del lado del cliente para autorización.

✅ **Hacer:** RLS en BD que valida `auth.uid()` de JWT.

---

## Escalabilidad

### Horizontal: Réplicas de lectura

**PostgreSQL replication:**
```
Primary (writes)
  ↓
Replica 1 (reads)
Replica 2 (reads)
Replica 3 (reads)
```

**Implementación en Supabase:**
- Supabase Pro/Enterprise: réplicas automáticas
- App routing: leer de réplicas para queries analíticas

### Vertical: Índices

**Actual:**
```sql
products(seller_id)
products(category_id)
products(is_active)
orders(buyer_id)
order_items(order_id, seller_id)  -- composite
product_views(product_id, viewed_at)
cart_items(user_id)
reviews(product_id)
```

**Futuro:** Índices adicionales a medida que crecen datos:
- `products(title) USING GIN` si implementamos full-text search
- `product_views(viewed_at DESC)` para analytics temporal

### Caching

**Browser-side:** React Query / TanStack Query para cachear queries.

```typescript
const { data: products } = useQuery({
  queryKey: ['products', { active: true }],
  queryFn: () => supabase.from('products').select('*').eq('is_active', true)
})
```

**CDN:** Supabase Storage con CDN global para product images.

### Particionamiento (futuro)

Si `orders` supera 10M filas:

```sql
-- Partición por created_at (últimos 3 años)
ALTER TABLE orders PARTITION BY RANGE (created_at);
```

### Async processing

Para operaciones pesadas (RAG embedding, email):
- Supabase Webhooks → mensaje en cola (Redis, Bull)
- Edge Function procesa en background

---

## Operaciones

### Desarrollo local

```bash
# Setup
npm install
cp .env.example .env.local

# Start dev server
npm run dev

# Lint & type check
npm run lint
tsc --noEmit

# Reset BD to seed data
supabase db reset

# View logs
supabase functions list
supabase logs --filter "function_name=my_function"
```

### Migraciones

```bash
# Crear nueva migración
supabase migration new create_users_table

# Aplicar a local
supabase db push

# Reset BD (destruye y reconstruye desde migrations + seed)
supabase db reset

# Listar migraciones
supabase migration list
```

### Variables de entorno

```bash
# .env.example (versionado)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# .env.local (gitignored, secreto)
# Copia de .env.example + valores reales
```

### Monitoring

**Supabase dashboard:**
- Queries lentas: Database → Logs
- Errores de RLS: Auth → Logs
- Storage: Storage → Buckets

**Recomendado para producción:**
- Sentry (error tracking)
- Datadog (observabilidad)
- LogRocket (session replay)

---

## Próximos pasos (Sesión 3+)

- **Sesión 3:** UI (auth, catalog, seller dashboard, checkout)
- **Sesión 4:** IA (RAG para FAQ, embeddings en products)
- **Sesión 5:** Skills personalizadas, protocolo MCP
- **Sesión 6+:** Webhooks, real-time, pagos, voz

---

**Documentación:** supabase/migrations/, supabase/tests/rls-validation.sql

**Actualizar:** Este documento al agregar tablas, políticas o cambios arquitectónicos.
