# DEBUGGING — Runbook de guardia para MercadoTech

**Para cuando algo está roto.** Frases cortas, comando literal a copiar, nunca "probá también".

---

## Ciclo de debugging: síntoma → test → logs → fix → verde

```
1. VES EL ERROR
   ↓
2. REPRODUCIR EN UN TEST (el error debe fallar)
   ↓
3. LEER LOS LOGS (Next, endpoint, Supabase)
   ↓
4. UNA SOLA HIPÓTESIS
   ↓
5. FIX
   ↓
6. TEST DEBE PASAR
```

---

## Tabla de errores típicos

### RLS: "permission denied for schema public"

```
Mensaje literal:
ERROR: permission denied for schema public
```

**Causa:** Row-level security activo. Una política rechaza la query del usuario autenticado actual o del rol anon.

**Primer paso:**

```bash
# Verificar sesión activa
supabase status
# Si auth está en rojo, reinicia: supabase stop && supabase start

# Ver qué usuario es
curl -X GET 'http://localhost:54321/auth/v1/user' \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  | jq .

# Revisar la política que rechaza
# app/api/v1/... LOG → buscar "policy_violation"
# O en supabase UI: Authentication → Policies → [tabla] → revisar condición
```

---

### GRANT: "role has no permission"

```
Mensaje literal:
ERROR: role "anon" has no permission for schema public
```

**Causa:** Un trigger o función SQL hace `SET ROLE` a un usuario que no tiene grant suficiente.

**Primer paso:**

```bash
# Revisar qué roles existen en la base
supabase db push --dry-run | grep "GRANT\|ALTER ROLE"

# O en psql:
psql -h localhost -p 5432 -U postgres -d postgres -c "\du"
```

---

### HuggingFace: "Model not found" o "rate limit"

```
Mensaje literal:
HuggingFace API: 404 Model not found
HuggingFace API: 429 Rate limit exceeded
```

**Causa:** 
- Modelo retirado o nombre cambió (tunables desactualizados en `lib/constants/ai.ts`)
- O: límite de 30,000 tokens/mes gratis agotado

**Primer paso:**

```bash
# Verificar modelo configurado
grep -A2 "HUGGINGFACE_CHAT_MODEL\|EMBEDDING_MODEL" lib/constants/ai.ts

# Probar endpoint manualmente
curl -X POST "https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf/v1/chat/completions" \
  -H "Authorization: Bearer $HUGGINGFACE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}'

# Si 404: modelo retirado. Si 429: esperar o cambiar a otro modelo.
```

---

### Vector: "Dimension mismatch" o query embedding inconsistente

```
Mensaje literal:
ERROR: vector dimension mismatch (384 vs 1536)
ERROR: invalid_request_error from embedding API
```

**Causa:** 
- Embedder cambió de dimensión (tunable en `lib/constants/ai.ts`)
- O: los embeddings viejos en la tabla siguen siendo de dimensión distinta

**Primer paso:**

```bash
# Verificar dimensión en constantes
grep "EMBEDDING_DIMENSION" lib/constants/ai.ts

# Verificar vectores guardados
psql -h localhost -p 5432 -U postgres -d postgres -c \
  "SELECT dimension FROM pgvector_info('knowledge_embeddings', 'embedding');" 

# Si no coinciden: reindexa TODO
npx tsx scripts/index-all.ts
# Esto borra los embeddings viejos y crea nuevos con la dimensión actual
```

---

### Lock file: "Missing from lock file"

```
Mensaje literal:
npm ERR! Missing from lock file:
npm ERR! npm ERR! npm ERR! npm@11.6.2
```

**Causa:** CI runner tiene npm 10.x, pero `package-lock.json` es v3+ (generado por npm 11.6.2). Los formatos no son compatibles.

**Primer paso:**

```bash
# En tu máquina local:
npm install -g npm@11.6.2
npm ci  # Regenera package-lock.json con la versión correcta

# Commit el lock nuevo
git add package-lock.json package.json
git commit -m "chore: update to npm 11.6.2"

# CI detectará "packageManager": "npm@11.6.2" en package.json y lo instalará
```

---

### MCP: "Unexpected token" en stdout o "invalid JSON-RPC"

```
Mensaje literal:
Unexpected token < in JSON at position 0
ERROR: expected JSON-RPC message, got: "<!DOCTYPE html>"
```

**Causa:** El servidor MCP está mandando logs a stdout. Los logs deben ir a stderr. El cliente lee JSON-RPC puro en stdout.

**Primer paso:**

```bash
# Verificar que mcp/src/index.ts redirige logs a stderr
# Debe verse así (línea 2):
grep "console.error\|console.log" mcp/src/index.ts | head -3

# Si ves logs sin redirect a stderr:
# Arreglar todos los console.log/error para usar stderr:
# console.error("log message") en lugar de console.log
# O en el nivel de procesamiento, antes de line 2:
# process.stderr.write("...\n")
```

---

### Supabase ephemeral: "Connection refused"

```
Mensaje literal:
Error: connect ECONNREFUSED 127.0.0.1:5432
Error: connect ECONNREFUSED 127.0.0.1:54321
```

**Causa:** El stack local no está corriendo.

**Primer paso:**

```bash
# Iniciar el stack
supabase start

# Esperar 10 segundos
sleep 10

# Verificar estado
supabase status

# Si sigue rojo, limpiar y reiniciar
supabase stop
rm -rf .supabase/
supabase start
```

---

## Cómo leer un fallo de CI (GitHub Actions)

### 1. Dónde se ve

URL: `https://github.com/mgranciano/MercadoTech/actions`

Últimos runs arriba. Haz click en el fallo rojo.

### 2. Qué job falló

- **Checks:** TypeScript, ESLint, tests unitarios → mira el output del paso exacto.
- **E2E:** Playwright → descargar el artefacto `playwright-report`.

### 3. Leer el output en la UI

```
Jobs (panel izquierdo)
  → checks / e2e (haz click)
    → Steps (panel central)
      → Busca el paso rojo (Ej: "Type-check", "Run Playwright tests")
        → Expand → leer el error
```

**Típico error de checks:**

```
> mercadotech@0.1.0 type-check
> tsc --noEmit

services/order.service.ts:23:10 - error TS2304: Cannot find name 'Client'.
```

**Acción:** Ir a `services/order.service.ts` línea 23, revisar imports.

### 4. Descargar reporte de Playwright

Si el error es en **E2E**:

1. Busca el paso **"Run Playwright tests"** → está rojo.
2. Arriba a la derecha del job, haz click en **"Artifacts"**.
3. Descarga `playwright-report.zip`.
4. Descomprime en tu máquina.
5. Abre `test-results/index.html` en un navegador.
6. Busca el test fallido → verás:
   - Screenshots de cada step
   - Trace interactivo (replay de Playwright)
   - El assert exacto que falló

**Ejemplo:** si falló "Step 3: Click product and navigate", verás:
- Screenshot mostrando si el click ocurrió
- Mensaje literal: "Expected substring: '/producto/' Received string: 'http://localhost:3000/'"
- Trace con video de lo que pasó en el navegador

---

## Cómo pedirle debugging a Claude

**Contexto que tienes que darle (sin excusas):**

1. **El error literal:** copia el mensaje exacto de la consola o log, entre backticks.
2. **Dónde ocurre:** archivo, línea, función.
3. **Pasos para reproducir:** "ejecutar `npm test`, test `X` falla" o "en /producto/[id], click en 'Agregar carrito', falla".
4. **Estado de los logs:**
   - Si es backend: `npm run dev` abierto, mostrando el log de ese endpoint
   - Si es e2e: trace de Playwright (descargado) o screenshot
   - Si es IA: valor de `EMBEDDING_DIMENSION`, salida de `/api/v1/search/semantic`
5. **Lo que ya probaste:** "cambié la URL", "reinicié el servidor" — así Claude no te pide lo mismo.
6. **Constrast local vs CI:** ¿falla solo en CI o también en tu máquina?

**Qué NO hagas:**
- No digas "algo está roto" — sé específico.
- No pegues 500 líneas de log — filtra a lo relevante (5-10 líneas).
- No preguntes "¿qué hago?" — reporta el error y deja que Claude proponga.

**Ejemplo bueno:**

```
Error:
```
Error: ENOENT: no such file or directory, open '.env.local'
```

Ocurre en: app/api/v1/chat/route.ts línea 8 al hacer `readFileSync('.env.local')`

Reproducir: npm run dev, abre /asistente, escribe algo.

Ya probé: creé .env.local con las keys. Siguen faltando.

Solo falla aquí (en CI falla también, lo vimos en GitHub Actions).

¿Qué onda?
```

**Ejemplo malo:**

```
No funciona la IA. Error en el chat.
```

---

## Síntomas RAG y cómo diagnosticarlos

Para síntomas de busca semántica, embeddings o respuestas IA, ver [`docs/RAG.md`](./RAG.md#tabla-de-síntomas-rag).

No se replica aquí (evitar duplicación).

---

## Flujo rápido: 5 minutos para arreglar

| Síntoma | Comando | Fix |
|---------|---------|-----|
| `npm ci` falla con "Missing from lock file" | `npm install -g npm@11.6.2 && npm ci` | Commit lock nuevo |
| Test unitario falla en CI pero pasa local | `npm test -- --updateSnapshot` | Snapshots desactualizados |
| Type-check falla, tests pasan | `npm run type-check` local | Fix TS errores (grep el error en el código) |
| E2E falla, checks verdes | Descarga trace Playwright | Revisar screenshot/video de qué paso falló |
| "Cannot find module 'X'" en un test | Revisar import exacto en el archivo | Cambiar a import absoluto con `@/` |
| Supabase falla en CI con "connection refused" | Ver si está en la spec del workflow | El workflow debe tener `supabase start --ignore-health-check` |
| RLS reject en test local | Revisar `supabase status` | Reiniciar stack: `supabase stop && supabase start` |

---

## Verdicto final: ¿está listo para commitear?

```bash
npm run lint       # ESLint debe pasar
npm run type-check # TypeScript debe pasar
npm run test       # Tests unitarios deben pasar (desde sesión 6)
npm run test:e2e   # E2E si Supabase está verde (desde sesión 6)
```

Si los 4 pasan (o los primeros 2 si aún no hay tests), está listo.

Si uno falla, no commiteés. Usa la tabla de arriba para diagnosticar.

---

*Última actualización: Sesión 6 (Fase 6.8) — Debugging Runbook*
