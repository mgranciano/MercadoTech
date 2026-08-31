// Manejo de errores seguro para el servidor MCP.
// Convierte errores desconocidos en mensajes genéricos para no exponer
// detalles internos al cliente.

export class MCPError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message)
    this.name = 'MCPError'
  }
}

export function formatErrorMessage(error: unknown): string {
  if (error instanceof MCPError) {
    return `[${error.code}] ${error.message}`
  }

  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

export function isSafeToExpose(error: unknown): boolean {
  return (
    error instanceof MCPError ||
    (error instanceof Error && error.name === 'ValidationError')
  )
}
