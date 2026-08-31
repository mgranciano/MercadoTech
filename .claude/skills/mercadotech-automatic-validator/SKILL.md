---
name: mercadotech-automatic-validator
description: Gate binario (VALIDACIÓN APROBADA / VALIDACIÓN FALLIDA) sobre el estado ACTUAL del repo MercadoTech — checklist fija, sin matices, sin "aprobado con observaciones". Actívala cuando pidan "corre el validator", "¿está listo para commitear?", "valida el repo", "cierra la fase" o antes de dar una tarea/fase por terminada. No la uses para pedir una opinión de diseño (eso es mercadotech-tech-lead) ni un informe detallado de calidad (eso es mercadotech-code-reviewer) ni para revisar dónde debería ir un archivo antes de escribirlo (eso es mercadotech-architecture-enforcer).
---

# MercadoTech — Automatic Validator

## Qué hace esta Skill

Portero binario. Corre una checklist FIJA sobre el estado actual del repo y
da un veredicto: **VALIDACIÓN APROBADA** o **VALIDACIÓN FALLIDA**. Un solo
ítem fallido tumba todo el veredicto — no existe "aprobado con
observaciones".

## Qué NO hace (deslinde con las otras 3 Skills)

- No da nota ni matices — es pasa/no pasa, nunca "7/10" ni "casi".
- No propone la ubicación correcta de un archivo mal puesto ni evalúa antes
  de escribir — eso es `mercadotech-architecture-enforcer` (aunque las
  reglas grep-verificables del enforcer SÍ forman parte de esta checklist,
  como evidencia objetiva del estado final).
- No profundiza en el POR QUÉ de un fallo más allá de decir qué falló y
  dónde — no es un informe de code review; para eso, `mercadotech-code-reviewer`.
- No pondera deuda técnica aceptada ni toma decisiones de diseño — eso es
  `mercadotech-tech-lead`. La deuda ya documentada en `docs/BITACORA.md` NO
  cuenta como fallo de esta checklist.
- No corrige nada. Reporta y se detiene.

## Checklist fija

- [ ] `grep -rl "@/lib/supabase" components hooks` → vacío
- [ ] `grep -rl "from \"@/services" components` → vacío
- [ ] `grep -rln "@huggingface" --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -v lib/ai` → vacío
- [ ] `grep -rl "lib/supabase/admin" app components hooks services | grep -v api/v1` → vacío (si un match es solo un comentario de texto sin `import` real, no cuenta como fallo — pero si aparece, repórtalo igual como advertencia para que se reformule y no siga disparando falsos positivos)
- [ ] `npm run lint` (desde `mercadotech/`) → exit 0. Si no, FALLIDA (pegar el error).
- [ ] `npm run type-check` (desde `mercadotech/`) → exit 0. Si no, FALLIDA (pegar el error).
- [ ] Si existe `mcp/src/` (Fase 5.2 en adelante): `npm run type-check` dentro de `mcp/` → exit 0. Si `mcp/src/` todavía no existe, este ítem se omite (no cuenta ni a favor ni en contra).
- [ ] `npm run test` (desde `mercadotech/`) → exit 0. Si no, FALLIDA (pegar el error). Desde Sesión 6.
- [ ] Si `supabase status` muestra todos los servicios en verde (API, DB, Storage, Auth): `npm run test:e2e` (desde `mercadotech/`) → exit 0. Si Supabase está en rojo, este ítem se omite ("N/A — Supabase offline"). Si está verde pero E2E falla, FALLIDA (pegar el error).

## Formato de salida

```
## Validación automática — <fecha/contexto>

- [x] o [ ] <ítem exacto de la checklist> — <resultado o "N/A: <motivo>">
...

## Veredicto: VALIDACIÓN APROBADA | VALIDACIÓN FALLIDA

<si FALLIDA: lista de qué falló y en qué archivo/comando, sin proponer el
fix — eso es trabajo del reviewer, del tech-lead, o de quien corrija>
```

El veredicto es siempre la última línea, literal, en mayúsculas exactas
("VALIDACIÓN APROBADA" o "VALIDACIÓN FALLIDA") para que sea fácil de grep en
una transcripción.
