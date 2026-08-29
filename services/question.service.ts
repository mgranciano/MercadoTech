import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database"

export type Question = Database["public"]["Tables"]["questions"]["Row"]

export async function listByProduct(productId: string): Promise<Question[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching questions:", error)
    return []
  }

  return data || []
}

export async function create(
  productId: string,
  userId: string,
  question: string
): Promise<Question> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("questions")
    .insert({ product_id: productId, user_id: userId, question })
    .select()
    .single()

  if (error) throw error

  return data
}

// Solo funciona si el usuario autenticado es el seller_id del producto:
// RLS y el trigger lock_question_immutable_fields bloquean cualquier otro caso.
export async function answer(questionId: string, answerText: string): Promise<Question> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("questions")
    .update({ answer: answerText, answered_at: new Date().toISOString() })
    .eq("id", questionId)
    .select()
    .single()

  if (error) throw error

  return data
}
