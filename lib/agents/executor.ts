// Hybrid agent executor - routes to LlamaIndex or custom OpenAI based on agent type

import { prisma } from '@/lib/prisma'
import type { AgentType } from './system-prompts'
import { executeLlamaIndexAgent } from './llamaindex-agents'
import { executeStoryPlanningAgent } from './planning-agent'
import type { AgentContext } from './tools'

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
  modelId?: string
}

/**
 * Execute an agent conversation turn
 * Routes to appropriate implementation based on agent type:
 * - world-building → LlamaIndex (memory + tools)
 * - character-development → LlamaIndex (memory + tools)
 * - story-planning → Custom OpenAI (multi-phase planning)
 */
export async function executeAgent(options: ExecuteAgentOptions): Promise<AgentMessage> {
  const { conversationId, userId, projectId, userMessage, agentType, modelId } = options

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

  // Build conversation history
  const conversationHistory = conversation.messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }))

  // Agent context
  const context: AgentContext = {
    userId,
    projectId,
    conversationId,
    modelId,
  }

  // Save user message to database
  await prisma.agentMessage.create({
    data: {
      conversationId,
      role: 'user',
      content: userMessage,
    },
  })

  let assistantMessage: AgentMessage

  // Route to appropriate agent implementation
  if (agentType === 'world-building' || agentType === 'character-development') {
    // Use LlamaIndex for data-heavy agents with memory
    assistantMessage = await executeLlamaIndexAgent(
      agentType,
      context,
      userMessage,
      conversationHistory
    )
  } else if (agentType === 'story-planning') {
    // Use custom multi-phase planning agent
    assistantMessage = await executeStoryPlanningAgent(
      context,
      userMessage,
      conversationHistory
    )
  } else {
    throw new Error(`Unknown agent type: ${agentType}`)
  }

  // Save assistant message to database
  await prisma.agentMessage.create({
    data: {
      conversationId,
      role: 'assistant',
      content: assistantMessage.content,
      toolCalls: assistantMessage.toolCalls ? JSON.stringify(assistantMessage.toolCalls) : null,
      toolResults: assistantMessage.toolResults
        ? JSON.stringify(assistantMessage.toolResults)
        : null,
    },
  })

  // Update conversation timestamp
  await prisma.agentConversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  })

  return assistantMessage
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
