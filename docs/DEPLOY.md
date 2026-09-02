# DEPLOY.md — Despliegue y operaciones de MercadoTech

## Sección 1: Variables de entorno y gobernanza de secretos

### Decisión de arquitectura (Sesión 7.3)

Los secretos de MercadoTech se manejan conforme la **decisión 2 de la spec:**
- **Vercel (Production + Preview):** Carga manual de variables en su dashboard (una por una)
- **GitHub Actions:** NINGUNA variable, NINGÚN secreto (el CI corre contra stack local efímero)
- **Valores:** Nunca viajan por el chat ni por commit; Claude maneja NOMBRES, el operador pega VALORES

---

### Tabla de gobernanza

| Variable | Dónde vive | Quién la lee | Pública/Secreta | Propósito |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel (Production + Preview), a mano | Navegador y servidor | **Pública** | URL del proyecto Supabase hosted (ej: `https://abc.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel (Production + Preview), a mano | Navegador y servidor (RLS gobierna) | **Pública** | Clave anon de Supabase (solo lectura, RLS protege) |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel (Production + Preview), a mano — solo runtime de servidor | `lib/supabase/admin.ts` en Route Handlers (`app/api/v1/*`) | **SECRETA** | Clave admin de Supabase (permisos sin RLS, solo servidor) |
| `HUGGINGFACEHUB_API_TOKEN` | Vercel (Production + Preview), a mano | `lib/ai/` vía Route Handlers (`app/api/v1/chat`, `/reindex`, `/search/semantic`) | **SECRETA** | Token de API de Hugging Face para modelos de embeddings y chat |
| `NEXT_PUBLIC_SITE_URL` | Vercel, por entorno (prod = URL real; preview = auto-detect) | Redirects de auth (`middleware.ts`) | **Pública** | Origen para redirects post-login (prod: `https://mercadotech.vercel.app`, preview: `https://mercadotech-xyz.vercel.app`) |
| `HUGGINGFACE_*_MODEL` (opcionales) | Vercel solo si se necesita rotar modelo | `lib/ai/` | **Pública** | Sobreescribe modelo de embeddings/chat (rota ocasionalmente) |
| **GitHub Actions** | — | — | **NINGUNO** | El CI corre contra Supabase local ephemeral + credenciales dinámicas (paso: Read Supabase credentials) |

---

### Reglas de operación

1. **Nunca commitear `.env.local` ni `.env*.local`**
   - Ya está en `.gitignore` (líneas 36, 44)
   - Verificación: `git log --all -p -- .env.local` debe estar vacío ✅

2. **Si un secreto se expone accidentalmente:**
   - Rotación inmediata en el dashboard de Supabase o Hugging Face
   - Regenerar tokens/claves (la interfaz lo hace automáticamente)
   - Redeploy en Vercel (paso: Redeploy option en Deployments)
   - Revisar `git log` para verificar que nunca llegó al repo

3. **Previews comparten proyecto Supabase de producción (decisión 9)**
   - Riesgo: un preview puede tocar datos reales
   - Aceptable en laboratorio; en producción: proyecto de staging separado
   - Mitigación: los tests E2E no apuntan a prod (usan stack ephemeral local)

4. **Tras cambiar una env en Vercel → redeploy obligatorio (decisión 10)**
   - Cambiar una variable en Project Settings NO afecta deploys existentes
   - Solución: Deployments → mostrar último deploy → "Redeploy"
   - Esto re-ejecuta el build + start con las nuevas env vars

5. **El workflow de CI (.github/workflows/ci.yml) NO usa secrets**
   - Verificación: `grep "secrets\." .github/workflows/ci.yml` debe estar vacío ✅
   - Las credenciales de E2E son dinámicas (leídas del stack local ephemeral en tiempo de ejecución)

---

### Verificación de seguridad (Fase 7.3)

**Resultado de greps anti-fuga:**

```bash
# Grep 1: HuggingFace tokens (hf_)
grep -rn "hf_" --include="*.ts" --include="*.tsx" --include="*.mjs" --include="*.sql" --include="*.yml" . \
  | grep -v node_modules | grep -v package-lock | grep -v mcp/node_modules | grep -v docs/
→ ✅ (vacío)

# Grep 2: Supabase secret keys (sb_secret)
grep -rn "sb_secret" --include="*.ts" --include="*.tsx" --include="*.mjs" --include="*.sql" --include="*.yml" . \
  | grep -v node_modules | grep -v package-lock | grep -v mcp/node_modules | grep -v docs/
→ ✅ (vacío)

# Grep 3: JWT tokens legacy (eyJ)
grep -rn "eyJ" --include="*.ts" --include="*.tsx" --include="*.mjs" --include="*.sql" --include="*.yml" . \
  | grep -v node_modules | grep -v package-lock | grep -v mcp/node_modules | grep -v docs/
→ ✅ (vacío)

# Git history verification
git log --all -p -- .env.local
→ ✅ (vacío — nunca fue commiteado)

# Workflow verification
grep "secrets\." .github/workflows/ci.yml
→ ✅ (vacío — no usa secrets)
```

---

## Sección 2: Flujo de despliegue (Fase 7.4)

*(a completar en la Fase 7.4)*

---

## Sección 3: Rollback y marcha atrás (Fase 7.5)

*(a completar en la Fase 7.5)*

