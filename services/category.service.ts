import { createClient } from "@/lib/supabase/client"
import type { Category } from "@/types/category"

export async function listCategories(): Promise<Category[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return data || []
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error) {
    console.error("Error fetching category:", error)
    return null
  }

  return data
}
