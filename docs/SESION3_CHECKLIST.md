# Checklist — Fase 3.8 (Sesión 3)

Pasada de calidad sobre las 14 pantallas del mapa de rutas. No se agregó
funcionalidad nueva; se cerraron gaps de fases anteriores y se verificó la
separación de capas.

Leyenda: ✅ cumple · 🔧 no cumplía, se corrigió en esta fase · N/A no aplica
a esta pantalla (p. ej. "Carga" en un formulario sin listas).

## Verificación de capas

```bash
$ grep -rl "@/lib/supabase" components hooks
(vacío)
```

```bash
$ grep -rl "from \"@/services" components
(vacío)
```

Ambos comandos devuelven vacío. El segundo NO era vacío al empezar esta fase:
11 componentes importaban tipos de dominio (`ProductWithDetails`, `Review`,
`SellerOrder`, etc.) directamente desde archivos `services/*.service.ts`,
porque la capa `types/` que la Fase 3.1 debía crear (`types/product.ts`,
`types/order.ts`, `types/user.ts`, `types/question.ts`, `types/review.ts`)
nunca se creó — ni en esa fase ni en ninguna posterior. Se creó la capa
completa (`types/product.ts`, `category.ts`, `question.ts`, `review.ts`,
`cart.ts`, `order.ts`, `seller.ts`, `favorite.ts`, `user.ts`) y se migraron
services, hooks y componentes para importar los tipos desde ahí. El primer
grep tampoco era vacío: `hooks/useAuth.ts` importaba `@/lib/supabase/client`
directo para `onAuthStateChange`; se envolvió en
`auth.service.subscribeToAuthChanges`.

## Checklist por pantalla

| Pantalla | Responsive | Carga | Vacío | Error | Teclado | Imágenes | Tema |
|---|---|---|---|---|---|---|---|
| `/` | ✅ | ✅ | ✅ | 🔧 | ✅ | ✅ | ✅ |
| `/buscar` | ✅ | ✅ | ✅ | 🔧 | ✅ | ✅ | ✅ |
| `/categoria/[slug]` | ✅ | 🔧 | 🔧 | 🔧 | ✅ | ✅ | ✅ |
| `/producto/[id]` | ✅ | 🔧 | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/favoritos` | ✅ | ✅ | 🔧 | 🔧 | ✅ | ✅ | ✅ |
| `/carrito` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/pedidos` | ✅ | ✅ | 🔧 | ✅ | ✅ | N/A | ✅ |
| `/pedidos/[id]` | ✅ | ✅ | N/A | ✅ | ✅ | N/A | ✅ |
| `/vendedor/productos` | 🔧 | ✅ | 🔧 | ✅ | ✅ | ✅ | ✅ |
| `/vendedor/publicar` | 🔧 | N/A | N/A | ✅ | ✅ | ✅ | ✅ |
| `/vendedor/productos/[id]/editar` | 🔧 | ✅ | N/A | ✅ | ✅ | ✅ | ✅ |
| `/vendedor/pedidos` | 🔧 | ✅ | N/A* | ✅ | ✅ | N/A | ✅ |
| `/login` | ✅ | N/A | N/A | ✅ | ✅ | N/A | ✅ |
| `/register` | ✅ | N/A | N/A | ✅ | ✅ | N/A | ✅ |

\* Columnas vacías del kanban se representan como columnas sin tarjetas, no
como un `EmptyState` de página completa — es la convención estándar de un
tablero kanban (la estructura de columnas ES la información).

## Bugs encontrados y corregidos en esta fase

**Responsive**
- El panel del vendedor (`(seller)/layout.tsx` + `SellerSidebar`) no tenía
  ninguna forma de navegar en mobile: el `<aside>` era `hidden md:flex` sin
  alternativa, y el contenedor padre era `flex` (fila) sin `flex-col` para
  mobile. Un vendedor en un teléfono no podía moverse entre "Mis productos",
  "Publicar producto" y "Pedidos" salvo escribiendo la URL a mano. Se agregó
  una barra con menú desplegable (mismo patrón que `MobileNav` del navbar de
  tienda) y se corrigió el contenedor a `flex-col md:flex-row`.

**Carga**
- `QuestionsSection` mostraba `<p>Cargando preguntas...</p>` (texto plano)
  en vez de `LoadingState`.
- `ReviewsSection` ni siquiera recibía `loading` como prop: mientras
  `useReviews` cargaba, `reviews` estaba vacío y la sección mostraba
  brevemente el `EmptyState` de "sin reseñas" antes de que llegaran los
  datos reales (parpadeo de vacío-falso).
- `/categoria/[slug]` usaba `<div>Cargando categoría...</div>` en vez de
  `LoadingState`.

**Vacío**
- `EmptyState` en `/pedidos` y en `ProductsTable` (vendedor) no tenían
  `action` — se agregaron enlaces "Explorar productos" / "Publicar producto".
- `ProductGrid` no exponía forma de pasar una `action` a su `EmptyState`;
  se agregó `emptyAction` y se usó en `/favoritos` ("Explorar productos").

**Error**
- `ProductGrid` mostraba un `<div>` con texto rojo en vez de `ErrorState`,
  sin `onRetry` — afectaba `/`, `/buscar`, `/categoria/[slug]` y
  `/favoritos`. Se cambió a `ErrorState` con `onRetry`.
- `useProducts().retry` no funcionaba: solo hacía `setLoading(true)`, que no
  está en las dependencias del `useEffect` que dispara el fetch, así que no
  reintentaba nada. Se corrigió con el mismo patrón `refreshKey` usado en el
  resto de hooks de la sesión.
- `/categoria/[slug]` mostraba `<div>Categoría no encontrada</div>` en vez
  de `ErrorState` (sin acción de reintentar).

**Otros (fuera de las 7 columnas, pero "quedó a medias")**
- `UserMenu` mostraba siempre "Usuario" en vez del nombre real: `Navbar`
  espera `user.display_name`, pero `useAuth().user` es `{email, profile}` —
  el nombre vive en `profile.display_name`, nunca en `user.display_name`.
  Bug presente desde la Fase 3.3 en `(shop)/layout.tsx` y nunca conectado en
  `(seller)/layout.tsx` (que además pasaba `user={null}` fijo, mostrando
  "Ingresar" con sesión activa y sin botón de cerrar sesión). Se corrigieron
  ambos layouts.
- `app/dev/ui/page.tsx` (muestra de componentes de la Fase 3.1) eliminado,
  junto con `app/shop/`, `app/seller/`, `app/auth/` — carpetas del scaffold
  original de la Fase 2.1 (antes de adoptar route groups en la 3.2),
  vacías salvo por `.gitkeep`, nunca limpiadas. `app/api/v1/.gitkeep` se
  dejó intacto: está reservado a propósito para la sesión 4.
- No quedan placeholders "Próximamente" (`grep -rln "Próximamente" app
  components` → vacío).

## Cómo se verificó

- `npm run lint`, `npm run type-check` y `npm run build` pasan limpios.
- Responsive: `document.documentElement.scrollWidth === clientWidth` en
  375/768/1280px para las 14 rutas (sin scroll horizontal de página); las
  tablas (`ProductsTable`, `OrderItemsTable`) y el kanban scrollean dentro
  de su propio contenedor (`overflow-x-auto`), no la página.
- Tema: capturas en `prefers-color-scheme: light` y `dark` para catálogo,
  detalle de producto, tabla de vendedor y kanban — sin contrastes rotos.
- Teclado: ambos drag & drop (`SortableImageGallery`, `OrdersKanban`) se
  operan con `Space` (tomar/soltar) + flechas (mover), con anuncios
  `aria-live` de dnd-kit confirmados en consola durante las pruebas de la
  Fase 3.7.
