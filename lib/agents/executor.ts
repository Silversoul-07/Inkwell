// Agent executor - handles agent conversations with tool calling

import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'
import { AGENT_SYSTEM_PROMPTS, type AgentType } from './system-prompts'
import { AGENT_TOOLS, type AgentTool, type AgentContext } from './tools'

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  toolCalls?: any[]
  toolResults?: any[]
}

export interface ExecuteAgentOptions {
  conversationId: string
  userId: string
  projectId?: string
  userMessage: string
  agentType: AgentType
}

/**
 * Execute an agent conversation turn with tool calling support
 */
export async function executeAgent(options: ExecuteAgentOptions): Promise<AgentMessage> {
  const { conversationId, userId, projectId, userMessage, agentType } = options

  // Get AI model configuration
  const aiModel = await prisma.aIModel.findFirst({
    where: { userId, isDefault: true },
  })

  if (!aiModel) {
    throw new Error('No AI model configured. Please add an AI model in Settings.')
  }

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: aiModel.apiKey || '',
    baseURL: aiModel.baseUrl || undefined,
  })

  // Get conversation history
  const conversation = await prisma.agentConversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!conversation) {
    throw new Error('Conversation not found')
  }

  // Build messages array
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: AGENT_SYSTEM_PROMPTS[agentType],
    },
  ]

  // Add conversation history
  for (const msg of conversation.messages) {
    messages.push({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })
  }

  // Add new user message
  messages.push({
    role: 'user',
    content: userMessage,
  })

  // Save user message to database
  await prisma.agentMessage.create({
    data: {
      conversationId,
      role: 'user',
      content: userMessage,
    },
  })

  // Get available tools for this agent type
  const tools = AGENT_TOOLS[agentType] || []
  const toolDefinitions = tools.map(tool => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }))

  // Agent context for tool execution
  const context: AgentContext = {
    userId,
    projectId,
    conversationId,
  }

  let assistantMessage = ''
  const toolCalls: any[] = []
  const toolResults: any[] = []

  // First API call - may include tool calls
  const response = await openai.chat.completions.create({
    model: aiModel.model,
    messages,
    tools: toolDefinitions.length > 0 ? toolDefinitions : undefined,
    temperature: conversation.temperature,
  })

  const firstChoice = response.choices[0]
  const firstMessage = firstChoice.message

  // Handle tool calls if present
  if (firstMessage.tool_calls && firstMessage.tool_calls.length > 0) {
    // Add assistant message with tool calls to history
    messages.push(firstMessage)

    // Execute each tool call
    for (const toolCall of firstMessage.tool_calls) {
      // Type guard for function tool calls
      if (toolCall.type !== 'function' || !toolCall.function) {
        continue
      }

      const tool = tools.find(t => t.name === toolCall.function.name)
      if (!tool) {
        console.error(`Tool not found: ${toolCall.function.name}`)
        continue
      }

      try {
        const params = JSON.parse(toolCall.function.arguments)
        const result = await tool.execute(params, context)

        toolCalls.push({
          id: toolCall.id,
          name: toolCall.function.name,
          arguments: params,
        })

        toolResults.push({
          toolCallId: toolCall.id,
          result,
        })

        // Add tool result to messages
        messages.push({
          role: 'tool',
          content: JSON.stringify(result),
          tool_call_id: toolCall.id,
        })
      } catch (error: any) {
        console.error(`Tool execution error: ${error.message}`)
        messages.push({
          role: 'tool',
          content: JSON.stringify({ error: error.message }),
          tool_call_id: toolCall.id,
        })
      }
    }

    // Second API call to get final response
    const finalResponse = await openai.chat.completions.create({
      model: aiModel.model,
      messages,
      temperature: conversation.temperature,
    })

    assistantMessage = finalResponse.choices[0].message.content || ''
  } else {
    // No tool calls, use the message directly
    assistantMessage = firstMessage.content || ''
  }

  // Save assistant message to database
  await prisma.agentMessage.create({
    data: {
      conversationId,
      role: 'assistant',
      content: assistantMessage,
      toolCalls: toolCalls.length > 0 ? JSON.stringify(toolCalls) : null,
      toolResults: toolResults.length > 0 ? JSON.stringify(toolResults) : null,
    },
  })

  // Update conversation timestamp
  await prisma.agentConversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  })

  return {
    role: 'assistant',
    content: assistantMessage,
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    toolResults: toolResults.length > 0 ? toolResults : undefined,
  }
}

/**
 * Create a new agent conversation
 */
export async function createAgentConversation(
  userId: string,
  agentType: AgentType,
  projectId?: string,
  title?: string
) {
  const conversation = await prisma.agentConversation.create({
    data: {
      userId,
      projectId,
      agentType,
      title: title || `${agentType} conversation`,
      temperature: 0.7,
    },
  })

  return conversation
}

/**
 * Get all conversations for a user/project
 */
export async function getAgentConversations(userId: string, projectId?: string) {
  const where: any = { userId }
  if (projectId) where.projectId = projectId

  const conversations = await prisma.agentConversation.findMany({
    where,
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
      project: {
        select: {
          title: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return conversations
}
