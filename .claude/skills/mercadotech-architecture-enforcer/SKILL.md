---
name: mercadotech-architecture-enforcer
description: Gate PREVIO a escribir o mover código en MercadoTech — verifica SOLO ubicación y dependencias permitidas (nunca estilo ni naming). Actívala ANTES de crear un archivo o decidir dónde va algo, cuando el pedido sea del tipo "crea un componente que consulte productos directamente de Supabase", "agrega una página que llame a Hugging Face", "dónde pongo esta función que arma el precio", "necesito el cliente admin en un hook", "agrega una tool MCP que reimplemente el service de productos", o cualquier pedido de escribir/mover un archivo nuevo. Rechaza y propone la ubicación correcta ANTES de que se escriba el código.
---

# MercadoTech — Architecture Enforcer

## Qué hace esta Skill

Gate previo. Antes de que se escriba o mueva un archivo, verifica que su
**ubicación** y sus **dependencias de import** respeten la arquitectura por
capas de MercadoTech. Es un chequeo mecánico, verificable con un `grep` o una
lectura directa del import — nunca un juicio de estilo, calidad o diseño.

## Qué NO hace (deslinde con las otras 3 Skills)

- No revisa naming, estilo, complejidad ni calidad del código — eso es
  `mercadotech-code-reviewer`, y actúa DESPUÉS, sobre código ya escrito.
- No da un veredicto binario sobre el estado completo del repo — eso es
  `mercadotech-automatic-validator`.
- No pondera decisiones de diseño ni contrasta deuda técnica — eso es
  `mercadotech-tech-lead`.
- No corrige nada. Solo reporta: RECHAZAR (con la ubicación correcta) o
  PERMITIR.

## Fuente de verdad

`CLAUDE.md` en la raíz de `mercadotech/`. Ante cualquier contradicción entre
esta Skill y `CLAUDE.md`, **gana `CLAUDE.md`** — releelo antes de aplicar una
regla que parezca no encajar con el repo real.

## Checklist (cada ítem, verificable con un grep o una lectura)

- [ ] **¿Un componente (`components/**`) hace fetching o llama a Supabase
  directo?** → Rechazar. El fetching vive en un hook, que llama a un
  service. (`CLAUDE.md` — "Un solo camino de datos: hooks → services →
  Supabase con RLS"; verificable con
  `grep -rl "@/lib/supabase" components hooks` → debe ser vacío.)
- [ ] **¿Un `service` (`services/*.service.ts`) importa React o algo de
  `app/`?** → Rechazar. Los services son lógica de negocio pura, sin capa de
  presentación. (`CLAUDE.md`, diagrama de "Arquitectura por capas".)
- [ ] **¿Alguien fuera de `lib/ai/` importa `@huggingface/*`?** → Rechazar.
  (`CLAUDE.md` — "La UI nunca importa `lib/ai/`"; verificable con
  `grep -rln "@huggingface" --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -v lib/ai`
  → debe ser vacío.)
- [ ] **¿Alguien fuera de `lib/voice/` usa la Web Speech API?** → Rechazar.
  Regla que rige desde la sesión 8 (agente de voz), pero ya vigente: la
  carpeta `lib/voice/` existe reservada desde ahora.
- [ ] **¿El cliente admin (`lib/supabase/admin.ts` o uno construido a mano con
  `@supabase/supabase-js` con la service role key) se usa fuera de
  `app/api/v1/*`, `scripts/` o `mcp/src/context.ts`?** → Rechazar y proponer
  mover la lógica a un Route Handler, a un script, o (si es del servidor
  MCP) a `mcp/src/context.ts`. (`CLAUDE.md` — "El cliente admin solo vive en
  Route Handlers y `scripts/`"; verificable con
  `grep -rl "lib/supabase/admin" app components hooks services | grep -v api/v1`
  → debe ser vacío. Nota: un `grep` que solo matchea un COMENTARIO que
  menciona el nombre del archivo, sin un `import` real, no es una
  violación — lee el archivo antes de rechazar.)
- [ ] **¿Se propone una capa REST nueva (endpoint propio) para un CRUD que ya
  funciona vía `hooks` + RLS?** → Rechazar. (`CLAUDE.md` — "Sin capa REST
  paralela. Sin queries directas desde componentes.")
- [ ] **¿Hay un tunable (precio, límite, timeout, modelo de IA, umbral de
  similitud) hardcodeado fuera de `lib/constants/`?** → Rechazar y proponer
  agregarlo al archivo de constantes correspondiente
  (`lib/constants/{catalog,product,orders,roles,ai,tickets}.ts`).
  (`CLAUDE.md` — "Tunables solo en `lib/constants/`".)
- [ ] **¿Un import usa un barrel (`from "@/hooks"`, `from "@/services"`) en
  vez del archivo específico?** → Rechazar. (`CLAUDE.md` — "Sin barrels".)
- [ ] **¿Hay lógica MCP (tools, resources, prompts, o cualquier código que
  hable con `@modelcontextprotocol/sdk`) fuera de `mcp/`?** → Rechazar.
- [ ] **¿Un archivo dentro de `mcp/src/` reimplementa lógica que ya existe en
  un `service` o en `lib/ai/`** (una consulta a Supabase armada a mano en vez
  de llamar al service, o una llamada a Hugging Face repetida en vez de usar
  `lib/ai/`)? → Rechazar. `mcp/` es un consumidor más de `services/` y
  `lib/ai/`, nunca reimplementa lo que ya existe. Única excepción: una
  **derivación documentada** en `mcp/src/shared/` que compone varios
  services existentes para un dato agregado que ningún service ofrece solo
  (ej. estadísticas) — eso sí está permitido, siempre que el comentario diga
  explícitamente que es una derivación y qué services compone.
- [ ] **¿`mcp/src/` importa algo de `app/`, `components/` o `hooks/`?** →
  Rechazar. `mcp/` solo puede importar de `services/`, `lib/ai/`,
  `lib/constants/` y `types/`.

## Formato de salida

Para cada archivo/decisión evaluada:

```
[RECHAZAR | PERMITIR] <ruta del archivo o descripción del cambio>
Regla violada: <la regla exacta de la checklist, o "ninguna">
Ubicación/forma correcta: <dónde debería vivir esto y por qué, citando
  la línea de CLAUDE.md o la regla de esta Skill que lo exige>
```

Si son varios archivos en un mismo pedido, un bloque por archivo. Nunca
edites el código tú mismo — reporta y espera instrucción.
