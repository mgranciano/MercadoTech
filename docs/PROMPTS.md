# PROMPTS.md — Biblioteca de plantillas de prompts

Plantillas estándar para solicitar trabajo a Claude Code. Cada una define estructura, restricciones y un ejemplo completo.

**Regla de estilo:** Contexto mínimo suficiente. Criterio de aceptación explícito. Siempre indicar qué archivos se pueden tocar y cuáles no.

---

## 1. Prompt de fase

**Patrón:** Contexto → archivo de spec → fase a ejecutar → restricciones → criterio de aceptación.

**Estructura:**

```
Lee `<archivo spec>` completamente y ejecuta la Fase <N>: <título breve>.

Contexto: <1-2 frases sobre el objetivo general de esta fase>

Restricciones:
- <restricción 1>
- <restricción 2>
- NO <prohibición explícita>

Criterios de aceptación:
- <criterio 1>
- <criterio 2>
- Todos los cambios commiteados.
```

**Ejemplo:**

```
Lee `MercadoTech_sesion1.md` completamente y ejecuta la Fase 1.2: genera el CLAUDE.md fundacional.

Contexto: El CLAUDE.md es el contrato entre el equipo y Claude Code. Define convenciones, arquitectura y restricciones que rigen todas las sesiones futuras.

Restricciones:
- NO crear código de producción.
- NO crear Next.js ni instalar dependencias.
- Incluir las 5 reglas de independencia de capas.

Criterios de aceptación:
- CLAUDE.md contiene las 6 secciones listadas en la Fase 1.2.
- Un desarrollador que lee CLAUDE.md sabe dónde poner un archivo nuevo.
- Commit con mensaje "chore: add foundational CLAUDE.md...".
```

---

## 2. Prompt de feature

**Patrón:** Qué → Dónde (capa) → Contratos (tipos) → Qué NO tocar.

**Estructura:**

```
Implementa <feature>:

Qué: <descripción funcional de 1-2 frases>

Dónde:
- Componente: `components/<nombre>.tsx` (+ Storybook si existe)
- Hook: `hooks/use<Nombre>.ts`
- Service: `services/<dominio>.service.ts`
- Type: `lib/types/<dominio>.ts`

Contrato (tipos esperados):
```typescript
interface <Nombre> {
  id: string
  // ... definición de tipos
}
export function <functionName>(input: <InputType>): <ReturnType>
```

Casos de prueba:
- <caso 1>
- <caso 2>

NO toques:
- `lib/ai/` (reservado para IA)
- `lib/voice/` (reservado para voz)
- Componentes de admin
- La base de datos (sesión 2)

Criterio de aceptación:
- Tipos en TypeScript strict.
- Tests (`npm run test` pasa, o placeholder de tests si es boilerplate).
- Sin barrels; importa del archivo específico.
- Sigue convenciones de CLAUDE.md.
```

**Ejemplo:**

```
Implementa el hook useCart para gestionar el carrito de compras:

Qué: Hook que maneja agregar/quitar items del carrito, cálculo de totales y persistencia en sessionStorage mientras no hay backend.

Dónde:
- Hook: `hooks/useCart.ts`
- Type: `lib/types/cart.ts`

Contrato:
```typescript
interface CartItem {
  productId: string
  quantity: number
  price: number
}
export function useCart() {
  return {
    items: CartItem[]
    addItem: (productId: string, quantity: number) => void
    removeItem: (productId: string) => void
    total: number
    clear: () => void
  }
}
```

Casos de prueba:
- Agregar ítem al carrito vacío
- Incrementar cantidad de ítem existente
- Quitar ítem
- Total se calcula correctamente
- Persistencia en sessionStorage

NO toques: lib/ai/, lib/voice/, componentes admin

Criterio de aceptación:
- TypeScript strict; sin any.
- Tests con Jest.
- No usa Supabase directo (sessionStorage por ahora).
- Hook exportado desde hooks/useCart.ts (sin barrels).
```

---

## 3. Prompt de debugging

**Patrón:** Síntoma → Reproducción → Logs → Hipótesis pedida.

**Estructura:**

```
Bug: <título breve>

Síntoma: <qué sale mal desde el punto de vista del usuario>

Reproducción:
1. <paso 1>
2. <paso 2>
3. <paso 3>

Contexto / evidencia:
- Archivo: `<ruta>`
- Error en consola / logs: <pega aquí>
- Comportamiento esperado: <qué debería pasar>

Hipótesis a verificar:
- ¿Falta validación en <función>?
- ¿El type <Tipo> es incorrecto?
- ¿RLS está bloqueando la query?

NO toques:
- <archivo/sección que no debe cambiarse>

Criterio de aceptación:
- Bug reproducido y raíz identificada.
- Fix aplicado.
- Test agregado para evitar regresión.
```

**Ejemplo:**

```
Bug: Carrito no persiste al recargar la página

Síntoma: Agrego 2 items al carrito, recargo la página (F5) y el carrito está vacío.

Reproducción:
1. Navego a /products
2. Hago clic en "Add to cart" en un producto
3. Veo el item en el carrito (cantidad = 1)
4. Recargo la página
5. El carrito está vacío

Contexto / evidencia:
- Archivo: hooks/useCart.ts
- No hay error en consola
- Comportamiento esperado: items persisten tras reload

Hipótesis a verificar:
- ¿sessionStorage.setItem se llama al agregar items?
- ¿useCart lee sessionStorage en mount?
- ¿useEffect tiene dependencias correctas?

NO toques: lib/ai/, Supabase schema

Criterio de aceptación:
- useCart persiste en sessionStorage.
- Test: agregar item → reload → item sigue ahí.
- TypeScript strict.
```

---

## 4. Prompt de revisión

**Patrón:** Diff/archivos → Checklist → Formato del informe.

**Estructura:**

```
Revisa la rama/commit/PR <target> enfocándote en:

Checklist:
- [ ] Independencia de capas: ¿UI importa lib/ai/ o lib/voice/?
- [ ] RLS: ¿queries Supabase incluyen políticas?
- [ ] TypeScript: ¿strict mode, sin any?
- [ ] Nombres: ¿servicios <dominio>.service.ts, hooks use<Dominio>.ts?
- [ ] Barrels: ¿hay index.ts innecesarios?
- [ ] Tests: ¿casos de borde cubiertos?
- [ ] Documentación: ¿comentarios explican el POR QUÉ?

Formato del informe:
- Hallazgos por categoría (corrección, simplificación, eficiencia).
- Cada hallazgo: archivo, línea, problema, sugerencia.
- Conclusión: "LISTO" si no hay bloqueadores; "CAMBIOS REQUERIDOS" con lista.

NO revisar:
- Cambios en <archivo/directorio no relevante>
```

**Ejemplo:**

```
Revisa la rama main (últimos 3 commits) enfocándote en:

Checklist:
- [ ] Independencia de capas: ¿UI importa lib/ai/?
- [ ] TypeScript: ¿strict mode, sin any?
- [ ] Nombres: ¿servicios .service.ts, hooks use*.ts?
- [ ] Barrels: ¿index.ts sin necesidad?
- [ ] Constantes: ¿todos los tunables en lib/constants/?

Formato del informe:
- Hallazgos por categoría.
- Archivo, línea, problema, sugerencia.
- LISTO o CAMBIOS REQUERIDOS.

NO revisar: docs/COSTOS.md (no es código)
```

---

## 5. Prompt de documentación

**Patrón:** Audiencia → Alcance → Formato.

**Estructura:**

```
Escribe documentación: <título>

Audiencia: <quién la leerá: developer onboarding, ops, product>

Alcance:
- Incluye: <qué cubrir>
- Excluye: <qué no cubrir>

Formato:
- Markdown, español.
- Máximo X líneas / secciones.
- Incluir ejemplos de código si aplica.

Criterio de aceptación:
- Alguien nuevo entiende <concepto> en 5 minutos.
- Links a otros docs donde sea necesario.
```

**Ejemplo:**

```
Escribe documentación: Guía de RLS en Supabase para MercadoTech

Audiencia: Developers que van a escribir policies en sesión 2.

Alcance:
- Incluye: qué es RLS, por qué la usamos, patrón de seller_id, patrón de role.
- Excluye: SQL avanzado, debugging de policies.

Formato:
- Markdown, español.
- Máximo 100 líneas.
- 2-3 ejemplos de policies reales.

Criterio de aceptación:
- Un developer sin experiencia en RLS puede escribir su primera policy.
- Ejemplos copypastables.
```

---

## Cómo usar estas plantillas

1. **Elige la plantilla que aplica** a tu tarea (fase, feature, bug, revisión, docs).
2. **Rellena los campos** respetando la estructura.
3. **Sé explícito sobre restricciones** ("NO toques X").
4. **Define criterios de aceptación medibles** (no "está bien"; "TypeScript strict, tests pasan, sin any").
5. **Pasa el prompt a Claude Code** tal como lo escribiste.

---

## Regla de oro

> **Contexto mínimo suficiente.** Un prompt no debe ser más largo que la especificación a ejecutar. Si necesitas pegar todo el archivo, enlaza a él en lugar de copiarlo.

---

*Última actualización: Sesión 1*
