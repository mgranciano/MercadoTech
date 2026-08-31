import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { TOOLS, toolHandlers } from './tools/index.js'
import { errorResult } from './lib/tool-result.js'

export const SERVER_NAME = 'mercadotech'
export const SERVER_VERSION = '0.0.1'

export function createServer(): Server {
  const server = new Server(
    {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  )

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
  }))

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const handler = toolHandlers[request.params.name]

    if (!handler) {
      return {
        content: [errorResult(`Tool no encontrada: ${request.params.name}`)],
        isError: true,
      }
    }

    try {
      const result = await handler(request.params.arguments)
      return {
        content: [result],
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        content: [errorResult(`Error en ${request.params.name}: ${message}`)],
        isError: true,
      }
    }
  })

  return server
}
