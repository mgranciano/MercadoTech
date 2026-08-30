# BITÁCORA.md — Historial acumulativo de MercadoTech

Bitácora de proyecto, una sección por sesión, la más reciente primero. Fuente
de verdad: `git log`, el estado real de archivos y `docs/SESION3_CHECKLIST.md`.
Documenta lo **construido**, no el plan — donde el código difiere de la spec
(`MercadoTech_sesion3.md`), se señala como desviación.

---

## Sesión 3 — UI Inteligente y Frontend Multimodal (2026-08-28 a 2026-08-30)

**Nota de alcance:** al escribir esta bitácora, solo el commit `774a690`
(Fases 3.1–3.5) está en el historial de `mercadotech/`. El trabajo de las
Fases 3.6–3.9 y este mismo cierre existen en el árbol de trabajo pero
**no estaban commiteados** — se documentan igual porque están construidos y
verificados, y se marcan explícitamente como pendientes de commit.

### Fase 3.0 — Provisión del entorno (2026-08-28, commit `16816d1`)

**Construido:** stack Supabase local levantado, `.env.local` completado,
dependencias nuevas instaladas (`lucide-react`, `@dnd-kit/*`, `sonner` y el
resto de componentes shadcn de la spec).

### Fases 3.1–3.5 (2026-08-28/29, commit `774a690`, bundle único)

**Desviación:** la spec espera un commit por fase; en ejecución real las
cinco primeras fases se integraron en un solo commit. Se documentan juntas
por eso.

**Construido:**
- `types/database.ts` + sistema visual (`app/globals.css`, `tailwind.config.ts`)
  y componentes base shadcn (`components/ui/`).
- Layouts `(auth)/(shop)/(seller)`, navbar, sidebar de vendedor, mapa de rutas
  bajo prefijo `/vendedor/...`.
- Auth: migración `0019_handle_new_user_metadata.sql` (lee `role` y
  `display_name` de `raw_user_meta_data`, porque `protect_profile_role`
  bloquea cambiar el rol después de creado el perfil), `auth.service.ts`,
  `useAuth.ts`, `/login`, `/register` con guard de rol.
- Catálogo: `product.service.ts`, `category.service.ts`, `useProducts.ts`,
  home con grid, filtros en URL y búsqueda.
- Detalle de producto: galería, Q&A, reseñas verificadas (solo tras pedido
  `entregado`), favoritos.

**Problema encontrado y resuelto en el mismo bundle:** `handle_new_user`
tenía un bug adicional de columnas → migración de corrección
`0020_fix_handle_new_user_profile_columns.sql`; y una recursión de RLS entre
`orders`/`order_items` detectada al probar reseñas →
`0021_fix_orders_order_items_rls_recursion.sql`.

**Decisión (#8 de la spec):** `profiles` solo es legible por su dueño o admin,
así que no hay nombres de otros usuarios visibles; se muestra "Comprador
verificado" / "Usuario" en vez de crear una vista `public_profiles` (fuera de
alcance explícito).

**Fuera de alcance:** confirmación de email por correo real (Supabase Auth
hosted lo simula), recuperación de contraseña.

### Fase 3.6 — Carrito, checkout y mis pedidos (2026-08-29, sin commit)

**Construido:** `cart.service.ts`, `order.service.ts`, `useCart.ts`,
`useOrders.ts`, `/carrito`, `/pedidos`, `/pedidos/[id]`, checkout vía RPC
`create_order_from_cart` (Fase 2.2), cancelación de pedidos `pendiente`.

**Problema encontrado:** cancelar un pedido no restaura el stock — no existe
trigger para eso. Es la limitación #11 de la spec, documentada en la UI
("no se repone stock automáticamente"), no resuelta (fuera de alcance).

**Fuera de alcance:** pasarela de pago real (no existe en ningún momento del
proyecto), reposición automática de stock al cancelar.

### Fase 3.7 — Panel del vendedor con drag & drop (2026-08-29, sin commit)

**Construido:** `seller.service.ts`, `useSellerProducts.ts`,
`useSellerOrders.ts`, CRUD de productos (`/vendedor/productos`,
`/vendedor/publicar`, `/vendedor/productos/[id]/editar`),
`SortableImageGallery` (reorden de imágenes con `@dnd-kit/sortable`,
persistido en `position`), `OrdersKanban` + `OrderKanbanCard` (drag & drop
con `@dnd-kit/core`).

**Decisión (#9 de la spec):** el vendedor no puede mover un pedido a
`cancelado` — RLS solo permite `pagado/enviado/entregado` desde el estado
correspondiente y no valida la secuencia completa, solo el destino
inmediato. La columna "Cancelado" del kanban es de solo lectura y la
secuencia (`ORDER_STATUS_FLOW`, un paso adelante a la vez) se valida en
`useSellerOrders.move()` **antes** de llamar al service, para no depender
solo de RLS.

**Decisión (#12 de la spec):** el path de Storage exige `product_id`, así
que "Publicar producto" crea el registro primero y el reorden de imágenes es
local hasta el submit.

**Problema encontrado:** `deleteProduct` falla si el producto ya tiene
ventas (`order_items.product_id` es `on delete restrict`). Se muestra un
error claro sugiriendo desactivar el producto en vez de borrarlo (decisión
#10 de la spec).

**Migración nueva:** `0022_fix_orders_buyer_cancel_check.sql` (el `CHECK` de
cancelación por comprador rechazaba casos válidos).

### Fase 3.8 — Responsive, accesibilidad y estados (2026-08-29, sin commit)

**Construido:** pasada de calidad sobre las 14 pantallas del mapa de rutas,
documentada en `docs/SESION3_CHECKLIST.md`. No agrega funcionalidad; cierra
huecos de fases anteriores.

**Problema más grande encontrado:** la Fase 3.1 debía crear la capa
`types/` (decisión #5 de la spec) y nunca se hizo — 11 componentes
importaban tipos de dominio directo desde `services/*.service.ts`, violando
la regla de capas. Se creó la capa completa (`types/product.ts`,
`category.ts`, `question.ts`, `review.ts`, `cart.ts`, `order.ts`,
`seller.ts`, `favorite.ts`, `user.ts`) y se migraron services, hooks y
componentes. `hooks/useAuth.ts` también importaba `@/lib/supabase/client`
directo para `onAuthStateChange`; se envolvió en
`auth.service.subscribeToAuthChanges`.

**Otros bugs corregidos** (detalle completo en `docs/SESION3_CHECKLIST.md`):
- Sidebar de vendedor sin navegación en mobile (`hidden md:flex` sin
  alternativa) → menú desplegable, mismo patrón que `MobileNav`.
- Estados de carga con texto plano en vez de `LoadingState`
  (`QuestionsSection`, `/categoria/[slug]`); `ReviewsSection` sin prop
  `loading`, mostraba un `EmptyState` falso mientras cargaba.
- `ProductGrid` mostraba errores con un `<div>` rojo sin `onRetry`; y
  `useProducts().retry` no funcionaba (`setLoading(true)` fuera de las
  dependencias del `useEffect`) — se corrigió con el patrón `refreshKey` ya
  usado en el resto de hooks.
- `UserMenu` mostraba siempre "Usuario": `Navbar` esperaba
  `user.display_name`, pero el nombre vive en `profile.display_name`. Bug
  presente desde la Fase 3.3, nunca conectado en `(seller)/layout.tsx`
  (que además pasaba `user={null}` fijo).
- Limpieza: `app/dev/ui/page.tsx`, `app/shop/`, `app/seller/`, `app/auth/`
  (scaffold de la Fase 2.1, vacíos salvo `.gitkeep`, nunca borrados tras
  adoptar route groups en 3.2).

**Migraciones nuevas:** `0023_fix_cart_items_update_using.sql`,
`0024_fix_products_update_using.sql` (a ambas policies de `UPDATE` les
faltaba la cláusula `USING`, solo tenían `WITH CHECK` — un `UPDATE` sin fila
que calce `USING` no filtra nada y puede tocar filas ajenas),
`0025_restrict_seller_order_status_values.sql` (reforzar en RLS la decisión
#9: el vendedor no puede escribir `cancelado`).

**Verificación de capas al cerrar la fase** (ambas vacías):
```bash
grep -rl "@/lib/supabase" components hooks
grep -rl "from \"@/services" components
```

### Fase 3.9 — Refactor visual con mockup de referencia (2026-08-29/30, sin commit, fuera del plan original)

**Desviación de alcance:** no existe en `MercadoTech_sesion3.md`. El usuario
pidió, en cuatro prompts independientes posteriores a la Fase 3.8, aplicar
el diseño visual de `docs/mockup-referencia.tsx` (un mockup de referencia
en React que el usuario pegó como archivo, no producido por ninguna fase) a
la UI ya funcional, sin tocar lógica. Se ejecutó en este orden:

1. **Tokens de diseño** — se extrajeron los colores del mockup a
   `app/globals.css` (variables HSL, tema claro y oscuro), sin tocar
   componentes.
2. **Pantallas de autenticación** — `app/(auth)/layout.tsx` (layout de dos
   columnas), `AuthTabs.tsx` (nuevo), `LoginForm.tsx`, `RegisterForm.tsx`
   (selector de rol como tarjetas seleccionables sobre `RadioGroup`).
   Se instalaron los componentes shadcn que la Fase 3.1 debía dejar listos y
   estaban a 0 bytes (`card`, `input`, `label`, `tabs`, `separator`,
   `radio-group`) — otro hueco heredado de 3.1, igual que la capa `types/`.
3. **Catálogo** — banner, `ProductGrid` (grid fluido `auto-fill`),
   `ProductCard` (rediseño manteniendo los mismos props resueltos).
4. **Kanban del vendedor** — `OrdersKanban.tsx`, `OrderKanbanCard.tsx`,
   adaptación a mobile con accesos rápidos por columna (`scrollTo`, sin
   desmontar columnas, para no romper el drop entre ellas de `@dnd-kit`).
5. **`components/shared/AIChatbot.tsx`** (nuevo) — FAB + ventana de chat
   extraídos del mockup, montado en `app/(shop)/layout.tsx`. **Solo UI**: sin
   llamadas a API ni lógica RAG. Al enviar un mensaje se hace eco visual y se
   responde con un texto fijo ("esa parte llega en la próxima sesión"), sin
   ramas condicionales que simulen inteligencia.

**Tensión con la spec:** la restricción de sesión dice "NO implementar IA,
embeddings, chat... (sesiones 4 y 8)". El componente `AIChatbot` sí agrega
una superficie de chat en la sesión 3, adelantada a pedido explícito del
usuario. No viola la restricción en espíritu — no hay RAG, API ni datos
reales — pero si la sesión 4 espera partir de cero, debe saber que el
shell visual ya existe en `components/shared/AIChatbot.tsx` y solo falta
conectar la lógica.

**Bug encontrado durante la verificación (no relacionado con el mockup):**
Tailwind v4 no leía `tailwind.config.ts` — le faltaba la directiva
`@config "../tailwind.config.ts";` en `app/globals.css`. Sin ella, **ninguna**
utilidad de color con nombre (`bg-primary`, `border-input`, gradientes con
stops nombrados, variantes `data-[state=*]`) generaba CSS en toda la app,
no solo en las pantallas tocadas. Se corrigió agregando la directiva.

**Fuera de alcance (correcto, no es una fase por hacer):** `FiltersPanel.tsx`
no se tocó — no estaba en el pedido de ninguno de los cuatro prompts.

### Cierre — Bitácora y actualización de CLAUDE.md (2026-08-30)

Este mismo documento y el diff quirúrgico de `CLAUDE.md` que lo acompaña.

---

### (a) Criterios de aceptación de la sesión (spec, sección "Criterios de aceptación")

| Criterio | Estado | Evidencia |
|---|---|---|
| Flujo comprador completo (registro → explorar → filtrar → detalle → preguntar → carrito → checkout → ver pedido → cancelar) | ✅ | Verificado por partes en cada fase; checkout probado end-to-end contra Postgres real en la Fase 3.3 (registro) y en pruebas manuales de carrito/checkout de la Fase 3.6 |
| Flujo vendedor completo (registro → publicar con imágenes reordenadas → visible en catálogo → recibir pedido → mover por kanban → comprador ve el nuevo estado) | ✅ | Drag & drop de kanban probado en vivo esta sesión: pedido movido de `pagado` a `enviado`, confirmado con `psql` directo a Postgres |
| Reseña solo posible tras pedido `entregado` (UI y RLS) | ✅ | Implementado en Fase 3.5; RLS de `reviews` sin modificar desde sesión 2 |
| Transiciones inválidas del kanban rechazadas en el hook sin llegar al service | ✅ | `useSellerOrders.move()` compara contra `ORDER_STATUS_FLOW` antes de llamar `updateOrderStatus` |
| `npm run lint`, `npm run type-check` y `npm run build` pasan | ✅ | Verificado repetidamente durante la sesión, última vez tras la Fase 3.9 |
| `grep -rl "@/lib/supabase" components hooks` vacío | ✅ | Confirmado al cerrar 3.8 y de nuevo tras 3.9 |

### (b) Deuda técnica y limitaciones conocidas (vigentes en el código actual)

- **Nombres de otros usuarios no legibles**: `profiles` solo lo lee su dueño
  o un admin (RLS); la UI muestra "Comprador verificado"/"Usuario". Sin vista
  `public_profiles` (fuera de alcance, decisión #8).
- **Cancelar un pedido no repone stock**: no hay trigger para eso
  (decisión #11).
- **Pedidos multi-vendedor**: `orders.status` es del pedido completo, no de
  "los ítems de este vendedor". En un pedido con productos de varios
  vendedores, mover la tarjeta en el kanban de uno cambia el estado para
  todos. Comentado en `hooks/useSellerOrders.ts`, limitación del modelo de
  datos, fuera de alcance de esta sesión.
- **Sin realtime**: el comprador ve el nuevo estado de su pedido solo al
  recargar, no en vivo.
- **`AIChatbot` es solo UI**: sin conexión a RAG/API (ver Fase 3.9).
- **Imágenes del seed no existen en Storage**: `ProductImage` cae a
  placeholder ante el 404 (comportamiento esperado, decisión #13).
- **87 archivos modificados/nuevos sin commit** al momento de escribir esta
  bitácora (Fases 3.6 a 3.9). El commit de cierre de esta sesión solo cubre
  `docs/BITACORA.md` y `CLAUDE.md`; el resto queda pendiente de decisión del
  usuario sobre cómo dividir el commit del código.

### (c) Pendientes para la sesión 4 y heredados de sesiones anteriores

**Heredado de sesión 2** — la spec de sesión 3 asumía pendientes las Fases
2.6 y 2.7, pero **ambas están completas y commiteadas**: 2.6 en `88b0681`
(`supabase/tests/rls-validation.sql`, 9 escenarios) y 2.7 en `8a472ee`
(`docs/ARQUITECTURA.md`). No hay pendiente real heredado de sesión 2.

**Heredado de sesión 1** — no se ejecutó como sesión independiente (sin
commits propios); `docs/COSTOS.md` y `docs/PROMPTS.md` ya existen desde el
primer commit de sesión 2 (`88d952b`), probablemente preparados junto con
el scaffold. No hay pendiente identificable.

**Para sesión 4** (según CLAUDE.md, "AI: Claude API (sesiones 4, 8)" y las
restricciones de esta sesión):
- Conectar `components/shared/AIChatbot.tsx` a RAG real (embeddings,
  `pgvector` ya habilitado desde la Fase 2.2, base de conocimiento).
- Commitear el trabajo de las Fases 3.6–3.9 (pendiente de decisión del
  usuario sobre cómo dividirlo).
- Considerar la vista `public_profiles` si se decide mostrar nombres reales.
- Trigger de reposición de stock al cancelar, si se decide resolver la
  limitación.
- Route Handlers en `app/api/v1/` (reservados, vacíos a propósito).

---

## Sesión 2 — reconstruida a partir de commits (sin bitácora propia)

*Esta sección se reconstruyó desde `git log`, no desde una bitácora escrita
durante la sesión.*

- `88d952b` (2026-08-28) — Fase 2.1: proyecto Next.js 15 + Supabase clients
  + arquitectura de carpetas + `docs/COSTOS.md`/`docs/PROMPTS.md`.
- `9122d0f` — Fase 2.2: 16 migraciones, esquema relacional completo,
  RPC `create_order_from_cart`.
- `55fe7fa` — Fase 2.3: políticas RLS para todas las tablas.
- `2fa5c08` — Fase 2.4: buckets de Storage y políticas de acceso.
- `e59068e` — Fase 2.5: `seed.sql` con datos de prueba.
- `88b0681` — Fase 2.6: `supabase/tests/rls-validation.sql`, 9 escenarios.
- `8a472ee` — Fase 2.7: `docs/ARQUITECTURA.md`.

## Sesión 1 — reconstruida a partir de commits (sin bitácora propia)

*No hay commits propios de una "sesión 1": `3823e48` ("Initial commit from
Create Next App") es el scaffold de Next.js sin personalizar. No hay
evidencia en `git log` de que la sesión 1 se haya ejecutado como tal.*
