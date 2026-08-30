import { createClient } from "@/lib/supabase/client"
import type { RegisterInput } from "@/lib/validators/auth"
import type { User } from "@/types/user"

export async function register(input: RegisterInput) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        display_name: input.displayName,
        role: input.role,
      },
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function login(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function logout() {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch profile
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (error) {
    console.error("Error fetching profile:", error)
    return {
      email: user.email || "",
    }
  }

  return {
    email: user.email || "",
    profile,
  }
}

export async function getAuthState() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session
}

// Envuelve onAuthStateChange para que useAuth no importe el cliente
// directamente (regla: solo services/ y app/ pueden importar @/lib/supabase).
export function subscribeToAuthChanges(onChange: (hasSession: boolean) => void): () => void {
  const supabase = createClient()

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    onChange(!!session?.user)
  })

  return () => data.subscription.unsubscribe()
}
