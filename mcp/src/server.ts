import { Server } from '@modelcontextprotocol/sdk/server/index.js'

export const SERVER_NAME = 'mercadotech'
export const SERVER_VERSION = '0.0.1'

export function createServer(): Server {
  const server = new Server(
    {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
    {
      capabilities: {},
    }
  )

  // Fase 5.2: servidor vacío, sin herramientas ni recursos.
  // Fase 5.3-5.4: agregarán setRequestHandler para tools/resources/prompts.

  return server
}
