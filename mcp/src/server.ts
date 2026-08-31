import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { TOOLS, toolHandlers } from './tools/index.js'
import { RESOURCES, RESOURCE_TEMPLATES, getResourceContent, listAllResources } from './resources/index.js'
import { PROMPTS, getPromptContent } from './prompts/index.js'
import { errorResult, textResult } from './lib/tool-result.js'
import { createContext } from './context.js'

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
        resources: {},
        prompts: {},
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

  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    try {
      const { anon } = await createContext()
      // Lección 7: degrada recursos caídos, no falla todo
      const resources = await listAllResources(anon)
      return {
        resources: resources as unknown,
        resourceTemplates: RESOURCE_TEMPLATES,
      }
    } catch (error) {
      // Si algo falla catastrófico, devuelve recursos vacíos pero templates
      return {
        resources: RESOURCES,
        resourceTemplates: RESOURCE_TEMPLATES,
      }
    }
  })

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    try {
      const { anon } = await createContext()
      const content = await getResourceContent(request.params.uri, anon)
      return {
        contents: [
          {
            uri: request.params.uri,
            mimeType: 'text/plain',
            text: content,
          },
        ],
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        contents: [
          {
            uri: request.params.uri,
            mimeType: 'text/plain',
            text: `Error: ${message}`,
          },
        ],
      }
    }
  })

  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: PROMPTS,
  }))

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    try {
      const { anon } = await createContext()
      const args = request.params.arguments ? Object.values(request.params.arguments) : []
      const promptContent = await getPromptContent(request.params.name, anon, args as string[])
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: promptContent,
            },
          },
        ],
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Error cargando prompt: ${message}`,
            },
          },
        ],
      }
    }
  })

  return server
}
