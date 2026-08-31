import type { Prompt } from '@modelcontextprotocol/sdk/types.js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Client = SupabaseClient<Database>

export const generarArticuloFaqPrompt: Prompt = {
  name: 'generar_articulo_faq',
  description:
    'Genera un artículo de FAQ claro y útil sobre un tema de soporte o política de la plataforma.',
  arguments: [
    {
      name: 'topic',
      description:
        'Tema del artículo: "devoluciones", "garantía", "envío", "seguridad", etc.',
      required: true,
    },
  ],
}

export async function getGenerarArticuloFaqContent(topic: string, _supabase: Client): Promise<string> {
  // Este prompt NO necesita datos de Supabase — es una plantilla instructiva
  // que el modelo llena con instrucciones.

  return `
Eres un especialista en redacción de documentos de soporte para un marketplace de tecnología. Tu tarea es redactar un artículo de FAQ profesional sobre:

**Tema:** ${topic}

## Instrucciones
1. **Estructura clara:** Usa encabezados (##, ###) para organizar la respuesta.
2. **Sé concreto:** Incluye ejemplos y pasos cuando sea aplicable.
3. **Tono:** Profesional pero accesible — evita jerga técnica innecesaria.
4. **Cubre casos comunes:** Responde las preguntas que los clientes hacen típicamente.
5. **Honestidad:** Si hay excepciones o limitaciones, menciónalas.
6. **Máximo 500 palabras.**

Ejemplo de estructura:
- Pregunta principal (como encabezado ##)
- Respuesta clara
- Casos especiales (si aplica)
- Cómo contactar soporte (si aplica)

Redacta el artículo ahora:
`.trim()
}
