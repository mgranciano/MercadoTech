import type { Database } from "@/types/database"

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export interface User {
  email: string
  profile?: Profile
}
