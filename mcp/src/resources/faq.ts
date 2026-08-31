import type { Resource } from '@modelcontextprotocol/sdk/types.js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Client = SupabaseClient<Database>

export const faqResource: Resource = {
  uri: 'mercadotech://faq',
  name: 'FAQ y Artículos de Soporte',
  description:
    'Base de conocimiento: respuestas a preguntas frecuentes, políticas, procedimientos y solución de problemas.',
  mimeType: 'text/plain',
}

export async function getFaqContent(supabase: Client): Promise<string> {
  try {
    const { data: articles, error } = await supabase
      .from('support_articles')
      .select('id, title, content')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    if (!articles || articles.length === 0) {
      return 'No hay artículos de soporte disponibles en este momento.'
    }

    const sections = articles.map((a) => `## ${a.title}\n\n${a.content || '(Sin contenido)'}`)

    return `# Base de Conocimiento MercadoTech\n\n${sections.join('\n\n---\n\n')}`
  } catch (error) {
    throw new Error(`Error cargando FAQ: ${error instanceof Error ? error.message : String(error)}`)
  }
}
