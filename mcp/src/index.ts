// stdout transporta JSON-RPC: cualquier log va a stderr o corrompe la sesión.
console.log = console.info = console.warn = (...a) => console.error(...a)

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { getEnv } from './env.js'
import { createServer } from './server.js'

async function main() {
  try {
    // Carga variables de entorno desde .env.local (o entorno si existe).
    getEnv()

    // Crea el servidor MCP vacío.
    const server = createServer()

    // Transporte stdio: decodifica JSON-RPC desde stdin, codifica a stdout.
    const transport = new StdioServerTransport()

    // Conecta el servidor al transporte.
    await server.connect(transport)

    console.error('[MercadoTech MCP] Servidor conectado y esperando mensajes.')
  } catch (error) {
    console.error('[MercadoTech MCP] Error fatal:', error)
    process.exit(1)
  }
}

main()
