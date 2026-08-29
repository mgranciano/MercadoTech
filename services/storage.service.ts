import { createClient } from "@/lib/supabase/client"

export async function getPublicUrl(bucket: string, path: string): Promise<string> {
  const supabase = createClient()

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)

  return data.publicUrl
}
