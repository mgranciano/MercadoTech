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

### Resumen del flujo PR → Producción

```
1. Developer hace push a rama feature
   ↓
2. GitHub Actions CI corre (checks + e2e contra Supabase local ephemeral)
   ↓
3. Si CI pasa: PR puede mergear a main
   ↓
4. Si CI falla: Branch protection bloquea merge (rojo)
   ↓
5. Developer arregla, re-pushea → CI verde
   ↓
6. Merge a main permitido
   ↓
7. Vercel detecta push a main → deploy automático a producción
   ↓
8. URL pública actualizada con nuevo código
```

### Pasos antes de primera producción (Sesión 7.4)

| Paso | Quién | Qué |
|---|---|---|
| 1 | Claude | Crear `supabase/seed.prod.sql` (8 categorías + 10 FAQ, SIN datos de usuario) |
| 2 | Tú | `supabase login` → `supabase link --project-ref <ref>` → `supabase db push` (aplica 29 migraciones a hosted) |
| 3 | Tú | Pegar `seed.prod.sql` en SQL Editor de Supabase dashboard (ejecutar UNA vez) |
| 4 | Tú | Indexar FAQ: `NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/index-all.ts` |
| 5 | Tú | En Supabase Auth → Providers: desactivar "Confirm email" (decisión 8) |
| 6 | Tú | En Vercel: Add New → Project → importar `growlearnjo/mercadotech` → cargar 5-6 variables (a mano, una por una) → Deploy |
| 7 | Tú + Claude | Verificar first deploy: home carga, catálogo vacío (esperado), no errores auth |
| 8 | Tú | GitHub Settings → Branches → Add rule para `main`: requiere checks verdes, sin bypass |
| 9 | Tú + Claude | PR de prueba (`deploy-smoke` con cambio trivial): PR → checks + preview → merge bloqueado en rojo → CI verde → merge → cambio en producción |
| 10 | Tú | Smoke test completo: registrarse, publicar producto demo, soporte responde, logout/login |

### Post-deploy: Síntomas y diagnóstico

| Síntoma | Causa | Solución |
|---|---|---|
| Build falla en Vercel pero pasa local | Falta env var o distinta Node version | Revisar Project Settings → Environment Variables; alinear Node (debe ser 22+) |
| "Invalid API key" / auth rota | Clave pegada con espacios, de otro proyecto, o no redeploy tras cambiar env | Re-pegar desde dashboard Supabase; Vercel Deployments → Redeploy |
| `/soporte` dice "no encontré información" | FAQ sembrada pero SIN indexar (falló paso 4) | Correr `scripts/index-all.ts` con env de prod inline; verificar 10 embeddings en dashboard |
| El chat falla con error de proveedor | Token HF no cargado en Vercel o modelo gratuito rotó | Cargar `HUGGINGFACEHUB_API_TOKEN` + Redeploy; si es rotación: actualizar `HUGGINGFACE_CHAT_MODEL` |
| Imágenes rotas en producción | Producto demo aún sin imagen, o path incorrecto | `ProductImage` muestra placeholder (esperado con catálogo nuevo); subir imagen en UI |

---

## Sección 3: Rollback y marcha atrás

### ¿Cuándo rollback?

- **Un deploy en producción salió mal** (errores críticos, ruptura de UI, funcionalidad no funciona)
- **Necesitas volver URGENTEMENTE** al deploy anterior
- **Nota:** El rollback de Vercel **NO revierte cambios de base de datos**

### Cómo hacer rollback en Vercel

1. Abre el dashboard de Vercel → Project → **Deployments**
2. Busca el deploy anterior (el que funcionaba)
3. Haz clic en **⋯ (más opciones)** → **Promote** o **Redeploy**
4. Vercel vuelve a ejecutar el build y start de ese commit
5. **En ~30-60 segundos**, la URL pública refleja el código anterior

**Ejemplo:**
```
Current (broken):  deploy-20260902-150000  ← URL pública aquí
Previous (ok):     deploy-20260902-140000  ← Clica Redeploy
Result:            URL pública ahora serve deploy-20260902-140000
```

### Lo que rollback NO revierte

**Base de datos:** Si el deploy incluyó migraciones o cambios de datos, el rollback NO los deshace.

**Ejemplo problema:**
```
Commit A: Migración 0030_add_field.sql + código que usa field
  ↓ Deploy OK
Commit B: Migración 0031_drop_field.sql + código sin field
  ↓ Deploy → Error (field no existe)
  ↓ Rollback a A
  ↓ Código espera field, pero DB still NO lo tiene (migración 0031 ya corrió)
```

**Solución:** Si rollback encuentra error de BD, debe haber preparada una "contra-migración" (reverse migration). En PostgreSQL:
```sql
-- Migración 0032_restore_field.sql
ALTER TABLE products ADD COLUMN field_name text;
```

### Plan de marcha atrás completo

1. **Antes de major change:** backup de BD en Supabase dashboard (Settings → Backups)
2. **Deploy nuevo:** Vercel corre build + start
3. **Síntoma de error:** dentro de 5min, revertir via Redeploy anterior
4. **Si BD está corrupta:** restaurar from backup en Supabase dashboard
5. **Post-rollback:** investigar root cause, arreglar, redeploy

### Checklist pre-deploy

- [ ] Todos los tests pasan (`npm run test`, `npm run test:e2e`)
- [ ] Lint y type-check limpios
- [ ] CI verde en GitHub
- [ ] Las variables de entorno están cargadas en Vercel (verificar en Project Settings)
- [ ] Si hay migraciones nuevas: testeadas en local contra Supabase local
- [ ] Backup de BD hecho (si es cambio crítico)
- [ ] Equipo notificado (si es laboratorio, documentar en Slack o equiv.)

### Monitoreo post-deploy

1. **Inmediato (primeros 5 min):**
   - Carga la URL de producción en navegador
   - Home carga sin errores
   - Registrarse funciona
   - Búsqueda funciona

2. **5-15 min:**
   - Publicar un producto (vendedor)
   - Agregar carrito (comprador)
   - Asistente responde preguntas

3. **15-60 min:**
   - Navegar todas las rutas
   - Verificar en DevTools que no hay errores 4xx/5xx en Network
   - Revisar Vercel logs si hay errores

**Si algo falla:** Ejecutar Redeploy al anterior deploy dentro de este window.

