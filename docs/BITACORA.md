# BITÁCORA.md — Historial acumulativo de MercadoTech

Bitácora de proyecto, una sección por sesión, la más reciente primero. Fuente
de verdad: `git log`, el estado real de archivos y `docs/SESION3_CHECKLIST.md`.
Documenta lo **construido**, no el plan — donde el código difiere de la spec
(`MercadoTech_sesion3.md`), se señala como desviación.

---

## Sesión 4 — Integrando IA en tu SaaS con RAG (2026-08-30)

**Nota de alcance:** las 8 fases (4.0–4.8) se ejecutaron en dos tramos de la
misma conversación, un commit por fase como pide la spec. El primer tramo
cubrió el Prompt 0 y las Fases 4.1–4.2; el segundo, a pedido explícito del
usuario (saltando la 4.2, ya hecha, pero completando 4.3–4.8 en el orden
correcto en vez del orden pedido originalmente, que se saltaba 4.3–4.4),
cerró la sesión.

### Fase 4.0 — Verificación de sesión 3, token y dependencias (commit `9b8a658`)

**Construido:** confirmó sesión 3 terminada (`npm run build` limpio), token
de Hugging Face verificado con un smoke test real contra la API (embedding
de 384 dimensiones, completion con `meta-llama/Llama-3.1-8B-Instruct` sin
rotar), instaló `@huggingface/inference` y `tsx`, agregó las 3 variables a
`.env.example`.

**Hallazgo y corrección:** el conteo de productos activos no coincidía con
el esperado (15, no 14) por una fila de prueba manual ajena al seed
(`Teclado mecánico RGB de prueba`); confirmado con el usuario, se borró.

### Fase 4.1 — Infraestructura vectorial (commit `08bc160`)

**Construido:** 4 migraciones nuevas (`0026`–`0029`): extensión `vector`,
tabla `knowledge_embeddings` (una tabla discriminada por `source_type`, sin
FK dura en `source_id`), índice HNSW, RPC `match_knowledge` (`SECURITY
INVOKER`), RLS (SELECT solo `authenticated`).

**Decisiones:**
- **Una tabla, no dos gemelas:** `match_knowledge` necesita buscar en ambas
  fuentes a la vez (chat de soporte) o filtrar a una (catálogo) sin `UNION`.
- **`SECURITY INVOKER`, no `DEFINER`** (a diferencia de
  `create_order_from_cart`): solo hace `SELECT`, debe respetar la RLS del
  caller, no saltársela.
- **`source_id` sin FK:** apunta a `products` o `support_articles` según
  `source_type` — Postgres no soporta FK condicional. Fichas huérfanas
  posibles; las descarta el service de búsqueda (4.4) y las limpia el
  endpoint de reindex (4.3).

**Problemas y solución:**
- Faltaba `supabase/config.toml` en el repo (nunca se commiteó, aunque el
  stack Docker ya corría) — se recreó con `supabase init` y
  `project_id=mercadotech` para que coincidiera con los contenedores.
- **Bug de seguridad detectado y corregido en la misma fase:** la política
  RLS inicial usaba `using (true)`, confiando en que el `GRANT` restringiera
  a `anon`. Pero Supabase local otorga por defecto TODOS los privilegios a
  `anon` en toda tabla nueva (`ALTER DEFAULT PRIVILEGES`, verificado contra
  `information_schema.role_table_grants`) — el `GRANT` era solo
  documentación. Se corrigió a `using (auth.uid() is not null)` +
  `revoke select ... from anon` explícito, verificado con una fila de prueba
  real (`anon` → `42501`; sesión `authenticated` → ve la fila).

### Fase 4.2 — Capa de IA y servicio de embeddings (commit `de58000`)

**Construido:** `lib/constants/ai.ts` (14 tunables documentados),
`lib/ai/embeddings.ts` (`generateEmbedding`, `buildProductEmbeddingText`,
`buildSupportArticleEmbeddingText`), `lib/ai/completion.ts`
(`generateCompletion`, errores distintos por causa), `lib/ai/prompts.ts`
(instrucciones de los dos modos + `buildRagUserMessage`),
`services/embedding.service.ts` (orquesta con cliente admin inyectado).

**Decisión:** embeddings usa el SDK (`InferenceClient.featureExtraction`);
chat usa `fetch` al router OpenAI-compatible — decisión del proveedor (Guía
HF, lecciones 1 y 2), no preferencia de estilo.

### Fase 4.3 — Indexación automática (commit `cc228b9`)

**Construido:** `lib/api-response.ts` (`apiError`),
`app/api/v1/reindex/route.ts` (primer Route Handler del proyecto; sesión
401, body 400, admin + `embedding.service`, limpia fichas huérfanas),
`services/indexing-trigger.service.ts` (fire-and-forget, `console.warn` si
falla), `useProductForm`/`useSellerProducts` ampliados,
`scripts/index-all.ts`.

**Verificado en vivo:** editar un producto real por la UI (`seller1`)
disparó el reindex — la ficha se actualizó (upsert, sin duplicar); insertar
y luego borrar un producto de prueba por SQL, llamando al mismo endpoint,
probó los tres caminos (crear/editar → `indexed`, borrar → `removed`); con
el token renombrado, la publicación siguió funcionando y apareció el
`console.warn` esperado.

### Fase 4.4 — Búsqueda semántica en el catálogo (commit `b3a9f90`)

**Construido:** `services/vector-search.service.ts` (`searchByEmbedding`,
`searchProducts`), `app/api/v1/search/semantic/route.ts`,
`hooks/useSemanticSearch.ts`, pestañas "Coincidencia exacta"/"Resultados con
IA" en `/buscar` (mismo `ProductGrid`, badge de similitud opcional vía
props).

**Verificado en vivo:** "audífonos para el gimnasio" → Sony WH-1000XM5
primero (41%) en la pestaña IA, mientras la pestaña exacta no encuentra
nada; "algo para conectar mi casa a internet" → TP-Link Archer AXE300
primero (50%); sin sesión, la pestaña IA muestra el aviso de login con
`redirectTo` correcto; "autos usados" trajo un resultado de ruido (Cisco
Catalyst 9200, 34%) — primera señal de que el threshold necesitaría
calibrarse (4.8).

### Fase 4.5 — Constructor de contexto (commit `a484de5`)

**Construido:** `lib/ai/context-builder.ts`, función pura (selección por
similitud/longitud mínima, presupuesto de caracteres con truncado o
descarte de la última fuente). Demostración en frío con 8 fuentes de
ejemplo, verificada exacta contra el cálculo manual antes de escribir el
código.

### Fase 4.6 — Servicio conversacional y endpoint (commit `43590da`)

**Construido:** `types/chat.ts`, `services/chat.service.ts` (`ask`, orquesta
búsqueda → contexto → completion sin reimplementar nada),
`app/api/v1/chat/route.ts` (401/400/422, log estructurado por consulta). Se
amplió `vector-search.service.ts` con `searchKnowledge` (búsqueda sin
hidratar, reutilizada tanto por `searchProducts` como por `chat.service`).

**Verificado en vivo:** compras y soporte responden citando fuentes reales
con sus ids; sin cookie → 401; `mode` inválido → 422; body inválido → 400;
los logs estructurados aparecen en la terminal del server con el formato
exacto de la spec.

### Fase 4.7 — Interfaz del asistente (commit `15e6f02`)

**Construido:** `hooks/useChat.ts` (hidrata imagen/precio de fuentes tipo
producto client-side, vía `product.service`), `services/ticket.service.ts`
+ `hooks/useMyTickets.ts`, `components/chat/*` (puros: props y callbacks,
sin conocer el endpoint ni Supabase), `app/(shop)/asistente` y `/soporte`,
`UserMenu`/`MobileNav`/middleware ampliados.

**Problema y solución (bloqueaba TODA la verificación por navegador):**
ningún usuario del seed podía iniciar sesión por password — GoTrue v2.196.0
exige una fila en `auth.identities` que `seed.sql` nunca crea (bug
preexistente, no de esta sesión). Se parcheó en runtime (`insert into
auth.identities...` para los 6 usuarios del seed, más
`instance_id`/`aud`/`role` en `auth.users`) para poder probar; el parche se
pierde en el próximo `db reset` — `seed.sql` sigue sin tocarse (restricción
de la sesión).

**Verificado en vivo:** "laptop liviana para la universidad" en `/asistente`
cita 2 productos reales con mini-cards de imagen/precio; clic en una fuente
abre el producto correcto; `buyer1` ve su ticket del seed en "Mis tickets"
(el otro pertenece a `buyer2`, no a `buyer3` como decía la spec — desviación
del seed real); anónimo en `/asistente` → `/login?redirectTo=/asistente`;
con el token renombrado, el chat responde con el mensaje inline "No pude
procesar tu consulta, intenta de nuevo." y el resto de la app sigue
funcionando.

### Fase 4.8 — Calibración y `docs/RAG.md` (commit `a18a6d4`)

**Construido:** `docs/RAG.md` completo (flujo, 6 casos con evidencia,
calibración, tabla de síntomas).

**Calibración:** 9 consultas reales mostraron que el threshold 0.3 dejaba
pasar ruido (hasta 0.43 en artículos de soporte — más alto que el 0.1–0.2
que documentó ReadHub). Subirlo a 0.44 eliminaba ese ruido pero también
mataba el caso insignia de la sesión (Sony WH-1000XM5 al 41% para
"audífonos para el gimnasio"): no hay un único número que separe limpio
ambos casos en este corpus. Se subió a **0.35** — prioriza no perder
coincidencias reales sobre eliminar todo el ruido; el ruido de soporte que
sigue colando no rompe la experiencia porque las instrucciones del modo
hacen que el modelo admita igual que no tiene la información.

---

### (a) Criterios de aceptación de la sesión (spec, sección "Criterios de aceptación")

| Criterio | Estado | Evidencia |
|---|---|---|
| Los 6 casos de prueba pasan y quedan documentados | ✅ | `docs/RAG.md` |
| Sin `HUGGINGFACEHUB_API_TOKEN`, el resto de la app funciona normal; chat/búsqueda IA devuelven error controlado inline | ✅ | Verificado en 4.3 (endpoint `reindex` → 500 + warn) y 4.7 (chat → mensaje inline, resto de la app intacto) |
| Anónimo: catálogo y búsqueda exacta intactos; pestaña IA, `/asistente` y `/soporte` piden sesión | ✅ | Verificado para pestaña IA y `/asistente`; `/soporte` comparte la misma entrada del middleware, no se verificó por separado |
| `grep -rln "@huggingface" ... \| grep -v lib/ai` → vacío | ✅ | Confirmado en cada fase y al cierre |
| `grep -rl "lib/supabase/admin" app components hooks services \| grep -v api/v1` → vacío | ✅ | Solo coincide un comentario en `embedding.service.ts`, no un import |
| `npm run lint`, `type-check` y `build` pasan | ✅ | Confirmado al cierre de cada fase y al final |

### (b) Deuda técnica y limitaciones conocidas (vigentes en el código actual)

- **`components/shared/AIChatbot.tsx` (el FAB de la Fase 3.9) sigue sin
  conectar** al RAG real: la spec de la sesión 4 optó por páginas dedicadas
  (`/asistente`, `/soporte`) en vez de cablear ese widget. Sigue mostrando
  su eco fijo ("esa parte llega en la próxima sesión") y convive en la UI
  con los links reales del menú — dos entradas de "IA" distintas, una
  falsa. Candidato a eliminar o conectar en la próxima sesión.
- **`seed.sql` no crea filas en `auth.identities`:** ningún usuario del seed
  puede iniciar sesión por password contra GoTrue v2.196.0 sin el parche de
  runtime aplicado en la Fase 4.7 (no persiste tras `supabase db reset`).
  Bug preexistente a esta sesión, no corregido porque `seed.sql` está fuera
  de alcance.
- **El seed real tiene 15 productos activos (no 14) y 2 tickets** (de
  `buyer1` y `buyer2`, no `buyer3`): la spec de la sesión 4 se escribió
  contra una versión distinta del seed. Base real usada en toda la sesión:
  **25 fichas** (15 productos + 10 artículos), documentado en `docs/RAG.md`.
- **El modo soporte no siempre sugiere "crear un ticket"** ante preguntas
  sin respuesta (lo hizo en algunas repeticiones de la calibración, no en
  todas) — problema de instrucciones del modelo
  (`SUPPORT_SYSTEM_INSTRUCTIONS`), no de threshold.
- **Fuera de alcance a propósito (restricciones de la sesión):** streaming
  de respuestas, crear tickets desde el chat (solo listar), voz — todo
  reservado para sesiones futuras.
- Heredadas de sesión 3, sin cambios en esta sesión: nombres de otros
  usuarios no legibles, cancelar pedido no repone stock, pedidos
  multi-vendedor comparten estado, sin realtime, imágenes del seed no
  existen en Storage.

### (c) Pendientes para la sesión 5 y heredados

**Heredado de sesiones 1–3:** sin pendientes reales identificados (ver
bitácora de sesión 3 más abajo).

**Para sesión 5:**
- Decidir el destino de `components/shared/AIChatbot.tsx` (conectar o
  eliminar).
- Considerar arreglar `seed.sql` para que cree `auth.identities` (bug que
  bloquea cualquier login por password en local).
- Revisar si el modo soporte necesita reforzar la instrucción de "sugerir
  ticket" en `lib/ai/prompts.ts`.

---

## Sesión 3 — UI Inteligente y Frontend Multimodal (2026-08-28 a 2026-08-30)

**Nota de alcance:** todo el trabajo de esta sesión terminó commiteado, un
commit por fase (más dos commits pequeños de continuación donde el staging
inicial dejó archivos fuera por error — ver Fase 3.6 y 3.7). Al escribir la
primera versión de esta bitácora, solo `774a690` (Fases 3.1–3.5) existía en
el historial; las Fases 3.6–3.9 se commitearon después, al dividir el
trabajo pendiente por fase.

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

### Fase 3.6 — Carrito, checkout y mis pedidos (2026-08-29, commits `9707fed`, `e7c2825`)

**Construido:** `cart.service.ts`, `order.service.ts`, `useCart.ts`,
`useOrders.ts`, `/carrito`, `/pedidos`, `/pedidos/[id]`, checkout vía RPC
`create_order_from_cart` (Fase 2.2), cancelación de pedidos `pendiente`,
"Agregar al carrito" conectado en el detalle de producto (`e7c2825`, quedó
fuera del primer commit por un descuido de staging).

**Problema encontrado:** cancelar un pedido no restaura el stock — no existe
trigger para eso. Es la limitación #11 de la spec, documentada en la UI
("no se repone stock automáticamente"), no resuelta (fuera de alcance).

**Migraciones nuevas** (bugs de RLS nunca antes ejercidos, existentes desde
la Fase 2.3):
- `0022_fix_orders_buyer_cancel_check.sql` — el `WITH CHECK` de
  `orders_update_policy` exigía que el pedido cancelado siguiera en
  `pendiente`, lo que hacía imposible la propia cancelación que la política
  dice permitir.
- `0023_fix_cart_items_update_using.sql` — `cart_items_update_policy` solo
  tenía `WITH CHECK`, sin `USING`: sin `USING` un `UPDATE` no encuentra
  filas que actualizar (falla silenciosa, "UPDATE 0"), rompía cambiar
  cantidades en el carrito.

**Fuera de alcance:** pasarela de pago real (no existe en ningún momento del
proyecto), reposición automática de stock al cancelar.

### Fase 3.7 — Panel del vendedor con drag & drop (2026-08-29, commits `f78f774`, `4aa6fd9`)

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

**Migraciones nuevas** (mismo tipo de bug de RLS nunca antes ejercido,
descubierto al construir esta fase; el segundo commit `4aa6fd9` las agrega
por un descuido de staging del primero):
- `0024_fix_products_update_using.sql` — `products_update_policy` y
  `product_images_update_policy` con el mismo bug que `0023` (solo
  `WITH CHECK`, sin `USING`) — bloqueaba `updateProduct`, `toggleActive` y
  el reorden de galería.
- `0025_restrict_seller_order_status_values.sql` — refuerza en RLS la
  decisión 9: restringe a qué estados puede mover un pedido el vendedor.

**Nota:** `OrdersKanban.tsx` y `OrderKanbanCard.tsx` se commitearon en esta
fase ya con el restyle visual de la Fase 3.9 (mockup de referencia) —
son archivos nuevos sin commit intermedio contra el que separar los
cambios por fase.

### Fase 3.8 — Responsive, accesibilidad y estados (2026-08-29, commit `13cfe75`)

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

**Verificación de capas al cerrar la fase** (ambas vacías):
```bash
grep -rl "@/lib/supabase" components hooks
grep -rl "from \"@/services" components
```

### Fase 3.9 — Refactor visual con mockup de referencia (2026-08-29/30, commit `4fe33b0`, fuera del plan original)

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
   Commiteado en `f78f774` (Fase 3.7), no aquí — ver nota en esa fase.
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

### Cierre — Bitácora y actualización de CLAUDE.md (2026-08-30, commit `5611cf3`)

Este mismo documento y el diff quirúrgico de `CLAUDE.md` que lo acompaña.
Commiteado antes de dividir el resto del trabajo pendiente (Fases 3.6–3.9)
por fase; esta es la revisión actualizada tras esa división.

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
