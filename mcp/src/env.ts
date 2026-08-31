import { join } from 'path'

const envPath = join(process.cwd(), '.env.local')

// Carga .env.local desde la raíz del proyecto (mercadotech/).
// El servidor MCP corre como script independiente, no en Next.js,
// así que usa process.loadEnvFile() en lugar de importar server-only.
try {
  process.loadEnvFile(envPath)
} catch {
  // Sin .env.local: asume que las variables ya están en el entorno (ej. CI).
}

export function getEnv(): {
  supabaseUrl: string
  supabaseServiceRoleKey: string
} {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error(
      'Falta NEXT_PUBLIC_SUPABASE_URL en .env.local o entorno (consulta CLAUDE.md).'
    )
  }

  if (!supabaseServiceRoleKey) {
    throw new Error(
      'Falta SUPABASE_SERVICE_ROLE_KEY en .env.local o entorno (consulta CLAUDE.md).'
    )
  }

  return {
    supabaseUrl,
    supabaseServiceRoleKey,
  }
}
