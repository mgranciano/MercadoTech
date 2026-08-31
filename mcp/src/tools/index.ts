import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import type { ToolResultContent } from '../lib/tool-result.js'
import { searchProductsTool } from './search-products.js'
import { getProductTool } from './get-product.js'
import { listCategoriesTool } from './list-categories.js'
import { getProductReviewsTool } from './get-product-reviews.js'
import { getProductQuestionsTool } from './get-product-questions.js'
import { searchKnowledgeTool } from './search-knowledge.js'
import { askChatTool } from './ask-chat.js'
import { getOrderStatusTool } from './get-order-status.js'
import { getStoreStatsTool } from './get-store-stats.js'
import { compareProductsTool } from './compare-products.js'

interface ToolSpec extends Tool {
  handler: (input: unknown) => Promise<ToolResultContent>
}

const TOOL_SPECS: ToolSpec[] = [
  searchProductsTool as ToolSpec,
  getProductTool as ToolSpec,
  listCategoriesTool as ToolSpec,
  getProductReviewsTool as ToolSpec,
  getProductQuestionsTool as ToolSpec,
  searchKnowledgeTool as ToolSpec,
  askChatTool as ToolSpec,
  getOrderStatusTool as ToolSpec,
  getStoreStatsTool as ToolSpec,
  compareProductsTool as ToolSpec,
]

export const TOOLS: Tool[] = TOOL_SPECS.map(({ handler: _h, ...spec }) => spec)

export const toolHandlers = Object.fromEntries(
  TOOL_SPECS.map((tool) => [tool.name, tool.handler])
)
