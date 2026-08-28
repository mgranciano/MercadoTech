# COSTOS.md — Estrategia de modelos y control de gastos

Estrategia explícita de uso de modelos Claude para MercadoTech, justificada por costo/beneficio y auditable sesión a sesión.

---

## Tabla: Tarea → Modelo

| Tipo de tarea | Modelo | Justificación |
|---|---|---|
| Boilerplate, renombrados, documentación mecánica, mensajes de commit | Haiku | Barato y suficiente para tareas determinísticas |
| Features estándar (componentes, hooks, services, tests) | Sonnet | Mejor relación calidad/costo; maneja complejidad moderada |
| Arquitectura, migraciones RLS, debugging difícil, revisión final | Opus | El error aquí cuesta más que el modelo; decisiones de alto riesgo |

**Criterio de elección:** Por defecto Sonnet. Usa Haiku solo para tareas mecánicas o documentación. Sube a Opus cuando el riesgo de error es alto (seguridad, datos, arquitectura).

---

## Técnicas de ahorro de tokens

### Aplicables en cualquier sesión

1. **Plan Mode antes de cambios grandes.** Usa `/plan` antes de refactors o features complejas. Mejor tener un plan consensuado que regenerar código 3 veces.

2. **`/clear` al cambiar de tema.** Si terminas una feature y empiezas un bug distinto, limpia el contexto. No mezcles contextos.

3. **Pedir cambios por fase.** "Ejecuta la Fase X" en lugar de "haz todo el CLAUDE.md en un prompt". Las fases son secuencias que ahorran tokens porque cada una construye sobre la anterior.

4. **No pegues archivos completos si basta la ruta.** Escribe `[src/components/Header.tsx](src/components/Header.tsx)` en lugar de copiar todo el archivo. Claude lo puede abrir.

5. **Agrupa preguntas.** Mejor un prompt con 5 preguntas que 5 prompts con una pregunta cada uno.

6. **Prefiere ediciones quirúrgicas a regeneraciones.** Usa `Edit` para cambiar 3 líneas, no `Write` para reescribir todo el archivo.

7. **Reutiliza la especificación.** Lee una sola vez `MercadoTech_sesion1.md` y refiere a sus secciones por número/nombre, no pegues todo de nuevo.

---

## Presupuesto orientativo por sesión

| Sesión | Fase | Modelo dominante | Presupuesto estimado de tokens | Observaciones |
|---|---|---|---|---|
| 1 | Setupbase y documentación | Haiku/Sonnet | 15,000–20,000 | Bajo costo; muchas fases mecánicas |
| 2 | Proyecto Next.js + Supabase setup | Sonnet | 40,000–60,000 | Arquitectura e integración compleja |
| 3 | Catálogo, búsqueda, carrito | Sonnet/Opus | 60,000–80,000 | Features estándar + estado complejo |
| 4 | RAG y AI | Opus | 80,000–100,000 | Lógica de embeddings y retrieval |
| 5 | Ordenamiento, pago simulado | Sonnet | 40,000–60,000 | Feature estándar |
| 6 | Admin, moderación | Sonnet | 40,000–60,000 | Feature estándar |
| 7 | Documentación y limpieza | Haiku | 10,000–15,000 | Mecánica |
| 8 | Agente de voz | Opus | 100,000–150,000 | Agente autónomo, lógica compleja |

### Si excedes el presupuesto

1. **Baja de modelo para tareas mecánicas.** Si Sonnet se dispara en documentación, usa Haiku para eso.
2. **Reduce alcance de la fase.** Prioriza por valor: catálogo antes que filtros avanzados.
3. **Nunca saltes tests.** Los tests cuestan upfront pero ahorran debugging después (donde Opus es caro).
4. **Pausa y audita.** Si llegas a 150% del presupuesto, detente y revisa qué salió mal.

---

## Técnicas específicas de ahorro para MercadoTech

- **Reutiliza TypeScript types.** Define `Product`, `Order`, `User` una sola vez en `lib/types/` y importa siempre desde ahí. No redefiniciones.
- **Abstracciones mínimas.** No crees componentes genéricos "por si acaso". Cuando tres componentes son idénticos, recién entonces abstraes.
- **Services orientados a dominios.** `products.service`, `orders.service`, etc. Evita un `api.service` que hace de todo.
- **Favorecer Supabase RLS sobre lógica en app.** Si una política RLS puede hacer algo, no lo repitas en services.

---

## Registro de gasto

Tabla de auditoría, se completa al final de cada sesión.

| Sesión | Fecha | Tareas principales | Modelo dominante | Tokens (est.) | Observaciones |
|---|---|---|---|---|---|
| 1 | 2026-08-28 | Repo setup, CLAUDE.md, COSTOS.md, PROMPTS.md, test A/B | Haiku/Sonnet | ~46,000 | Test A/B completado; Sonnet ganador |

---

## Test A/B — Sesión 1

### Descripción de la tarea

Escribir una función `formatPrice(cents: number): string` que formatee precios en **soles peruanos** con notación `S/ 1,299.90`. Incluir tests que cubran:
- Cero
- Números negativos
- Redondeo a 2 decimales
- Separadores de miles

### Comparación: Haiku vs Sonnet

Mismo prompt exacto ejecutado en paralelo el 2026-08-28.

#### Tabla comparativa

| Aspecto | Haiku | Sonnet | Ganador |
|---|---|---|---|
| **Corrección** | ✓ Todos los casos pasan | ✓ Todos los casos pasan | Empate |
| **Casos de borde cubiertos** | 8 tests | 7 tests | Haiku |
| **Legibilidad del código** | Manual (regex, split) | Legible (toLocaleString) | Sonnet |
| **Documentación** | Sin comentarios | JSDoc explicativo | Sonnet |
| **Exportación** | Default export | Named export | Sonnet |
| **Robustez** | Manejo manual de negativos | Math.round() explícito | Sonnet |
| **Tokens utilizados** | ~21,366 | ~24,667 | Haiku (-14%) |
| **Latencia** | ~38s | ~17s | Sonnet (-55%) |

#### Conclusión y recomendación

**Ganador: Sonnet** (con contexto de MercadoTech)

Aunque Haiku usa 14% menos tokens, Sonnet es la elección correcta porque:

1. **Diferencia de tokens es marginal.** 3,300 tokens ≈ $0.00016 USD; negligible en presupuesto.
2. **Legibilidad > ahorro marginal.** El código de Sonnet es autoexplicativo; el de Haiku requiere saber regex.
3. **Convenciones TypeScript.** Named exports son estándar moderno; better tooling support.
4. **Documentación.** JSDoc ayuda a futuros developers.
5. **Latencia.** 55% más rápido es perceptible en UX.

**Ajuste a tabla Tarea → Modelo:** No se requiere; la recomendación original (Sonnet para features estándar) se valida. Haiku sigue siendo válido solo para boilerplate extremo, pero no es economía significativa.

**Archivos de referencia:** Ver [`docs/ab-test/RESULTS.md`](ab-test/RESULTS.md) para detalles completos, código de ambos modelos y tests.

---

*Última actualización: Sesión 1*
