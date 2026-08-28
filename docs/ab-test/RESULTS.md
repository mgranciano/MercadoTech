# Test A/B — Sesión 1: Tarea formatPrice()

**Fecha:** 2026-08-28
**Tarea:** Escribir `formatPrice(cents: number): string` que formatee precios en soles peruanos
**Modelos:** Haiku vs Sonnet (mismo prompt exacto)

---

## Tabla comparativa

| Aspecto | Haiku | Sonnet | Ganador |
|---|---|---|---|
| **Corrección** | ✓ Todos los casos pasan | ✓ Todos los casos pasan | Empate |
| **Casos de borde cubiertos** | 8 tests | 7 tests | Haiku (+1 test) |
| **Legibilidad del código** | Manual (regex, split) | Legible (toLocaleString, más limpio) | Sonnet |
| **Documentación** | Sin comentarios | JSDoc explicativo | Sonnet |
| **Exportación** | Default export | Named export | Sonnet (convención) |
| **Robustez** | Manejo manual de negativos | Manejo explícito con Math.round() | Sonnet |
| **Tokens utilizados** | ~21,366 | ~24,667 | Haiku (-14% tokens) |
| **Latencia** | ~38s | ~17s | Sonnet (-55% latencia) |

---

## Análisis detallado

### Haiku
**Fortalezas:**
- 8 tests (1 más que Sonnet)
- Uso de regex para separadores de miles (manual pero correcto)
- 14% menos tokens (~3,300 tokens)

**Debilidades:**
- Código más manual y verbose
- Sin comentarios explicativos
- Exporta como default (menos convención en TypeScript moderno)
- Latencia más alta (38s vs 17s)

**Implementación:**
```typescript
const withSeparators = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
```
Regex correcto pero difícil de leer.

---

### Sonnet
**Fortalezas:**
- Usa `toLocaleString()` (API nativa, más elegante)
- Incluye JSDoc explicativo
- Exporta como named export (convención TypeScript)
- Código más legible y maintainable
- 55% más rápido (17s vs 38s)
- Manejo explícito de redondeo con `Math.round()`

**Debilidades:**
- 1 test menos (7 vs 8)
- 14% más tokens (~3,300 tokens más)

**Implementación:**
```typescript
const formattedAmount = absoluteAmount.toLocaleString('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
```
Legible, nativo, mantenible.

---

## Conclusión

**Ganador: Sonnet (con contexto)**

Aunque Haiku usa 14% menos tokens y es más barato, **Sonnet es la elección correcta para MercadoTech** porque:

1. **Diferencia de tokens es marginal.** 3,300 tokens (≈ $0.00016 USD) es negligible en el presupuesto total.
2. **Legibilidad y mantenibilidad pesan más.** El código de Sonnet es autoexplicativo; el de Haiku requiere conocimiento de regex.
3. **Convenciones TypeScript.** Named exports son estándar en módulos TS modernos.
4. **Documentación.** JSDoc ayuda a futuros developers.
5. **Latencia.** 55% más rápido es perceptible en UX.

**Ajuste a la tabla de costos:**
- Mantener **Sonnet** para features estándar (incluyendo utilidades).
- **Haiku sigue siendo válido** para boilerplate extremo (generación de tipos, comentarios, etc.), pero no es economía significativa.

---

## Archivos de referencia

- [`formatPrice.haiku.ts`](formatPrice.haiku.ts) — Implementación Haiku
- [`formatPrice.sonnet.ts`](formatPrice.sonnet.ts) — Implementación Sonnet
- [`formatPrice.haiku.test.ts`](formatPrice.haiku.test.ts) — Tests Haiku
- [`formatPrice.sonnet.test.ts`](formatPrice.sonnet.test.ts) — Tests Sonnet
