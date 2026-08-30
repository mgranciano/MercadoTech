import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database"

export type Ticket = Database["public"]["Tables"]["support_tickets"]["Row"]

// Solo lectura: crear tickets desde la UI llega con el agente de la
// sesión 8 (decisión 5, spec de la sesión 4).
export async function listMine(userId: string): Promise<Ticket[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching tickets:", error)
    return []
  }

  return data || []
}
