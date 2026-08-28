# CLAUDE.md — Contrato de desarrollo MercadoTech

Este documento define las convenciones, arquitectura y restricciones que rigen el desarrollo de MercadoTech. **Claude Code debe respetarlas en todas las sesiones.**

---

## ¿Qué es MercadoTech?

MercadoTech es un marketplace de productos tecnológicos donde compradores navegan catálogos, hacen búsquedas, ven detalles con galerías de imágenes, reseñas y Q&A, agregan al carrito y completan checkout simulado. Vendedores publican productos y gestionan pedidos. Un asistente de soporte responde preguntas basadas en FAQ (RAG) y en sesiones futuras evoluciona a agente de voz. **No hay pasarela de pago real en ningún momento.**

---

## Comandos

Scripts npm implementados (actualizados en Sesión 2):

```bash
npm run dev          # Inicia dev server (Next.js, puerto 3000)
npm run build        # Build para producción
npm run start        # Inicia servidor de producción
npm run lint         # Lint de código (ESLint)
npm run type-check   # Verificación TypeScript strict (tsc --noEmit)
npm run test         # Tests unitarios (Jest, por implementar)
npm run test:e2e     # Tests e2e (Playwright, por implementar)
```

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

---

## Fuente de verdad de la base de datos

- **Fuente de verdad:** `supabase/migrations/` (desde sesión 2)
- **Copias de referencia:** `schema.sql` y `policies.sql` son snapshots solo informativos.
- **Nunca alteres la DB a mano.** Cambios solo vía migrations.

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
- **AI:** Claude API (sesiones 4, 8)
- **Testing:** Playwright (e2e), Jest (unitarios)

---

## Estructura del proyecto (Sesión 2)

La Fase 2.1 implementó:

- **App Router** de Next.js 15 con rutas organizadas por feature: `(auth)`, `(shop)`, `(seller)`, `api/v1`.
- **Clientes Supabase**: `lib/supabase/{client,server,middleware,admin}.ts` para el flujo de sesiones.
- **Constantes**: `lib/constants/roles.ts` con tipos de roles, estados de órdenes, tickets, condiciones.
- **Utilidades**: `lib/utils.ts` con función `cn` para Tailwind.
- **Estructura de capas**: directorios vacíos listos para features (`components/`, `hooks/`, `services/`, `types/`).

---

*Última actualización: Sesión 2 (Fase 2.1)*
