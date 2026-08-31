// Tipo unificado para resultados de herramientas MCP.
// Las herramientas devuelven contenido de texto o imagen, opcionalmente marcado
// como error.

export type ToolResultContent = {
  type: 'text' | 'image'
  text?: string
  mimeType?: string
  data?: string // base64 para imágenes
  isError?: boolean
}

export function textResult(text: string, isError = false): ToolResultContent {
  return { type: 'text', text, isError }
}

export function errorResult(message: string): ToolResultContent {
  return textResult(message, true)
}
