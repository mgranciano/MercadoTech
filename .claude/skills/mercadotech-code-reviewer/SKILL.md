---
name: mercadotech-code-reviewer
description: Revisión de calidad estilo PR sobre código YA ESCRITO de MercadoTech — informe con nota /10, errores críticos/importantes y sugerencias, nunca bloquea. Actívala cuando pidan "revisa este service", "revisa el PR", "¿qué tal quedó este hook/componente?", "haz code review de estos cambios", o después de terminar una fase o feature que toque RLS, pedidos, stock, RAG o cualquier lógica de negocio. No la uses ANTES de escribir código (eso es mercadotech-architecture-enforcer) ni para dar un veredicto pasa/no-pasa (eso es mercadotech-automatic-validator).
---

# MercadoTech — Code Reviewer

## Qué hace esta Skill

Revisión de código ya escrito, estilo PR: nota /10, hallazgos clasificados
por severidad, con `archivo:línea` cuando sea posible. Informa — nunca
bloquea ni impide continuar.

## Qué NO hace (deslinde con las otras 3 Skills)

- No decide si un archivo está en el lugar correcto — eso ya lo filtró
  `mercadotech-architecture-enforcer` ANTES de que este código existiera.
- No da un veredicto binario del repo completo — eso es
  `mercadotech-automatic-validator`.
- No pondera decisiones de arquitectura ni contrasta deuda técnica aceptada
  — eso es `mercadotech-tech-lead`. Si un hallazgo de este informe coincide
  con deuda ya documentada en `docs/BITACORA.md`, señálalo como tal ("deuda
  ya aceptada, ver bitácora §X") en vez de tratarlo como hallazgo nuevo.
- No corrige nada. Reporta; la corrección es un paso humano-supervisado
  aparte.

## Checklist del dominio (cada punto viene de `CLAUDE.md` o de la spec real)

- **RLS:** ¿la operación nueva respeta las políticas de Row Level Security
  existentes, o las esquiva usando el cliente admin donde no correspondía?
  (El cliente admin solo se justifica en Route Handlers, `scripts/` o
  `mcp/src/context.ts` — ver `mercadotech-architecture-enforcer`, pero el
  reviewer evalúa si el USO del admin ahí es realmente necesario, no solo si
  está en el lugar correcto.)
- **Snapshots de pedidos:** ¿el código usa `price_snapshot`/`title_snapshot`
  de `order_items` para mostrar datos históricos de un pedido, o lee el
  precio/título ACTUAL del producto? Leer el actual es un bug — un pedido
  viejo mostraría precios que nunca se cobraron.
- **Stock:** ¿toda mutación de `products.stock` pasa por el RPC
  `create_order_from_cart`, o hay un `update` de stock hecho a mano en otra
  parte del código?
- **Orden del pipeline RAG:** en cualquier código que toque el chat o la
  búsqueda semántica, ¿se preserva el orden búsqueda (`vector-search
  service`) → contexto (`lib/ai/context-builder.ts`) → completion
  (`lib/ai/completion.ts`)? ¿Los umbrales, modelos y límites usados están en
  `lib/constants/ai.ts`, o aparecen hardcodeados en el archivo?
- **`numeric` de Postgres:** llega como `string` desde PostgREST
  (`price`, `total`, `price_snapshot`). ¿El `service` lo convierte con
  `Number()` antes de devolverlo, o el componente recibe el string crudo?
- **Componentes puros:** ¿un componente de `components/` recibe datos y
  callbacks por props, o esconde lógica de fetching/side-effects que debería
  vivir en un hook?
- **`any`:** ¿aparece `any` en TypeScript en vez de un tipo concreto o
  `unknown`? (`CLAUDE.md` — "No `any`".)
- **Manejo de errores accionable:** si el código habla con Hugging Face o
  con Supabase, ¿los errores distinguen la causa (401 / modelo no
  disponible / cuota agotada / RLS) con un mensaje que permita diagnosticar
  sin leer el código fuente, como hace `lib/ai/completion.ts`? ¿O es un
  `catch` genérico que oculta la causa real?

## Formato de salida

```
## Code Review — <archivo(s) o feature revisada>

**Nota: X/10**

### Errores críticos
- `archivo:línea` — <qué está mal y por qué importa>

### Errores importantes
- `archivo:línea` — <qué está mal y por qué importa>

### Sugerencias
- `archivo:línea` — <mejora opcional, no bloqueante>

### Deuda ya aceptada (no es hallazgo nuevo)
- <si aplica: qué coincide con qué sección de docs/BITACORA.md>
```

Si no hay nada que reportar en una sección, se omite o se marca "ninguno" —
nunca se inventa un hallazgo para llenar la sección.
