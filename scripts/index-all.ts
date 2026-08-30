// One-shot: indexa TODOS los productos activos y artículos de soporte
// publicados en knowledge_embeddings. Corre fuera del navegador, con el
// cliente admin.
//
// Es la vía de reindexación si el admin edita support_articles directamente
// por SQL (el trigger de la Fase 4.3 solo cubre productos, vía
// useProductForm/useSellerProducts) — o para poner al día el índice tras un
// `supabase db reset`.
//
// Uso: npx tsx scripts/index-all.ts

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"
import { indexProduct, indexSupportArticle } from "@/services/embedding.service"

try {
  process.loadEnvFile(".env.local")
} catch {
  // Sin .env.local en este directorio: asume que las variables ya están
  // en el entorno (ej. CI).
}

// No reutiliza lib/supabase/admin.ts: ese módulo importa "server-only", que
// lanza en cualquier runtime que no sea el compilador de Next.js (incluido
// tsx). Este script arma su propio cliente admin mínimo, con las mismas
// credenciales.
function createScriptAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno (revisa .env.local)."
    )
  }

  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

async function main() {
  const supabase = createScriptAdminClient()

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id")
    .eq("is_active", true)

  if (productsError) throw productsError

  const { data: articles, error: articlesError } = await supabase
    .from("support_articles")
    .select("id")
    .eq("is_published", true)

  if (articlesError) throw articlesError

  let productCount = 0
  for (const product of products ?? []) {
    await indexProduct(supabase, product.id)
    productCount++
  }

  let articleCount = 0
  for (const article of articles ?? []) {
    await indexSupportArticle(supabase, article.id)
    articleCount++
  }

  console.log(`Productos indexados: ${productCount}`)
  console.log(`Artículos indexados: ${articleCount}`)
  console.log(`Total de fichas: ${productCount + articleCount}`)
}

main().catch((err) => {
  console.error("index-all falló:", err instanceof Error ? err.message : err)
  process.exit(1)
})
