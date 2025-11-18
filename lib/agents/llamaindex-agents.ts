// LlamaIndex-based agents for world-building and character development

import { ReActAgent, FunctionTool, Settings } from 'llamaindex'
import { prisma } from '@/lib/prisma'
import { AGENT_SYSTEM_PROMPTS } from './system-prompts'
import type { AgentContext } from './tools'

/**
 * Create a LlamaIndex agent with memory and tools
 */
async function createLlamaIndexAgent(
  agentType: 'world-building' | 'character-development',
  context: AgentContext,
  conversationHistory: Array<{ role: string; content: string }>
) {
  // Get AI model configuration
  let aiModel

  if (context.modelId) {
    // Use specified model
    aiModel = await prisma.aIModel.findFirst({
      where: { id: context.modelId, userId: context.userId },
    })
  } else {
    // Fall back to default model
    aiModel = await prisma.aIModel.findFirst({
      where: { userId: context.userId, isDefault: true },
    })
  }

  if (!aiModel) {
    throw new Error('No AI model configured. Please select a model or set a default in Settings.')
  }

  // Configure LlamaIndex via environment variables
  // LlamaIndex automatically uses OPENAI_API_KEY and OPENAI_API_BASE
  const originalApiKey = process.env.OPENAI_API_KEY
  const originalApiBase = process.env.OPENAI_API_BASE

  process.env.OPENAI_API_KEY = aiModel.apiKey || ''
  if (aiModel.baseUrl) {
    process.env.OPENAI_API_BASE = aiModel.baseUrl
  }

  // Create tools based on agent type
  const tools = createToolsForAgent(agentType, context)

  // Create agent with system prompt
  // LlamaIndex will use configured environment variables for LLM
  const agent = new ReActAgent({
    tools,
    systemPrompt: AGENT_SYSTEM_PROMPTS[agentType],
    verbose: true,
  })

  // Restore original environment variables
  if (originalApiKey !== undefined) {
    process.env.OPENAI_API_KEY = originalApiKey
  }
  if (originalApiBase !== undefined) {
    process.env.OPENAI_API_BASE = originalApiBase
  }

  return agent
}

/**
 * Create LlamaIndex FunctionTools for each agent type
 */
function createToolsForAgent(
  agentType: 'world-building' | 'character-development',
  context: AgentContext
): FunctionTool<any, any>[] {
  if (agentType === 'world-building') {
    return [
      FunctionTool.from<any, any>(
        async ({ category, searchTerm }: { category?: string; searchTerm?: string }) => {
          if (!context.projectId) {
            throw new Error('Project ID required')
          }

          const where: any = { projectId: context.projectId }
          if (category) where.category = category
          if (searchTerm) {
            where.OR = [
              { key: { contains: searchTerm, mode: 'insensitive' } },
              { value: { contains: searchTerm, mode: 'insensitive' } },
            ]
          }

          const entries = await prisma.lorebookEntry.findMany({
            where,
            orderBy: { priority: 'desc' },
          })

          const memories = await prisma.agentMemory.findMany({
            where: {
              projectId: context.projectId,
              agentType: 'world-building',
              ...(category && { category: category.toLowerCase() }),
            },
            orderBy: { importance: 'desc' },
          })

          return JSON.stringify({
            lorebookEntries: entries.map(e => ({
              id: e.id,
              key: e.key,
              value: e.value,
              category: e.category,
              priority: e.priority,
            })),
            worldFacts: memories.map(m => ({
              id: m.id,
              category: m.category,
              key: m.key,
              content: m.content,
              importance: m.importance,
            })),
          })
        },
        {
          name: 'getWorldKnowledge',
          description: 'Retrieve existing lorebook entries and world facts for the project',
          parameters: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: 'Filter by category: Characters, Locations, Magic, Technology, History, Culture',
              },
              searchTerm: {
                type: 'string',
                description: 'Search term to filter entries',
              },
            },
          },
        }
      ),

      FunctionTool.from<any, any>(
        async ({
          key,
          value,
          category,
          priority = 5,
        }: {
          key: string
          value: string
          category: string
          priority?: number
        }) => {
          if (!context.projectId) {
            throw new Error('Project ID required')
          }

          const entry = await prisma.lorebookEntry.create({
            data: {
              projectId: context.projectId,
              key,
              value,
              category,
              priority,
            },
          })

          return JSON.stringify({
            success: true,
            entryId: entry.id,
            message: `Created lorebook entry: ${key}`,
          })
        },
        {
          name: 'createLorebookEntry',
          description: 'Create a new lorebook entry for a world element',
          parameters: {
            type: 'object',
            properties: {
              key: { type: 'string', description: 'The trigger keyword for this entry' },
              value: { type: 'string', description: 'The detailed content of the lorebook entry' },
              category: {
                type: 'string',
                description: 'Category: Characters, Locations, Magic, Technology, History, Culture',
              },
              priority: {
                type: 'number',
                description: 'Priority level (0-10, higher = more important)',
              },
            },
            required: ['key', 'value', 'category'],
          },
        }
      ),

      FunctionTool.from<any, any>(
        async ({
          category,
          key,
          content,
          importance = 5,
        }: {
          category: string
          key: string
          content: string
          importance?: number
        }) => {
          if (!context.projectId) {
            throw new Error('Project ID required')
          }

          const memory = await prisma.agentMemory.create({
            data: {
              userId: context.userId,
              projectId: context.projectId,
              agentType: 'world-building',
              category,
              key,
              content,
              importance,
            },
          })

          return JSON.stringify({
            success: true,
            memoryId: memory.id,
            message: 'World fact saved to memory',
          })
        },
        {
          name: 'saveWorldFact',
          description: 'Save an important world-building fact or decision to memory',
          parameters: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: 'Category: world-fact, rule, theme, timeline-event',
              },
              key: { type: 'string', description: 'A searchable key for this fact' },
              content: { type: 'string', description: 'The detailed content of the fact' },
              importance: { type: 'number', description: 'Importance level (1-10)' },
            },
            required: ['category', 'key', 'content'],
          },
        }
      ),

      FunctionTool.from<any, any>(
        async ({ includeContent = false }: { includeContent?: boolean }) => {
          if (!context.projectId) {
            throw new Error('Project ID required')
          }

          const project = await prisma.project.findUnique({
            where: { id: context.projectId },
            include: {
              chapters: {
                include: {
                  scenes: {
                    select: {
                      id: true,
                      title: true,
                      wordCount: true,
                      order: true,
                      content: includeContent || false,
                    },
                    orderBy: { order: 'asc' },
                  },
                },
                orderBy: { order: 'asc' },
              },
            },
          })

          if (!project) {
            throw new Error('Project not found')
          }

          return JSON.stringify({
            project: {
              id: project.id,
              title: project.title,
              description: project.description,
              genre: project.genre,
              subgenre: project.subgenre,
              targetAudience: project.targetAudience,
              pov: project.pov,
              tense: project.tense,
              targetWordCount: project.targetWordCount,
              status: project.status,
              notes: project.notes,
            },
            chapters: project.chapters.map(ch => ({
              id: ch.id,
              title: ch.title,
              order: ch.order,
              scenes: ch.scenes,
            })),
            totalWordCount: project.chapters.reduce(
              (sum, ch) => sum + ch.scenes.reduce((s, sc) => s + sc.wordCount, 0),
              0
            ),
          })
        },
        {
          name: 'getProjectContext',
          description: 'Get comprehensive project context including chapters, scenes, and metadata',
          parameters: {
            type: 'object',
            properties: {
              includeContent: {
                type: 'boolean',
                description: 'Include full scene content (can be large)',
              },
            },
          },
        }
      ),
    ]
  } else {
    // Character development tools
    return [
      FunctionTool.from<any, any>(
        async () => {
          if (!context.projectId) {
            throw new Error('Project ID required')
          }

          const characters = await prisma.character.findMany({
            where: { projectId: context.projectId },
            orderBy: { name: 'asc' },
          })

          const insights = await prisma.agentMemory.findMany({
            where: {
              projectId: context.projectId,
              agentType: 'character-development',
            },
            orderBy: { importance: 'desc' },
          })

          return JSON.stringify({
            characters: characters.map(c => ({
              id: c.id,
              name: c.name,
              age: c.age,
              role: c.role,
              description: c.description,
              traits: c.traits ? JSON.parse(c.traits) : [],
              background: c.background,
              goals: c.goals,
            })),
            insights: insights.map(i => ({
              category: i.category,
              key: i.key,
              content: i.content,
              characterId: i.characterId,
            })),
          })
        },
        {
          name: 'getCharacters',
          description: 'Retrieve all characters for the project',
          parameters: {
            type: 'object',
            properties: {},
          },
        }
      ),

      FunctionTool.from<any, any>(
        async ({
          characterId,
          category,
          key,
          content,
          importance = 5,
        }: {
          characterId?: string
          category: string
          key: string
          content: string
          importance?: number
        }) => {
          if (!context.projectId) {
            throw new Error('Project ID required')
          }

          const memory = await prisma.agentMemory.create({
            data: {
              userId: context.userId,
              projectId: context.projectId,
              agentType: 'character-development',
              category,
              key,
              content,
              importance,
              characterId: characterId || null,
            },
          })

          return JSON.stringify({
            success: true,
            memoryId: memory.id,
            message: 'Character insight saved to memory',
          })
        },
        {
          name: 'saveCharacterInsight',
          description: 'Save an important character insight or development note',
          parameters: {
            type: 'object',
            properties: {
              characterId: {
                type: 'string',
                description: 'The ID of the character this insight relates to',
              },
              category: {
                type: 'string',
                description: 'Category: character-insight, character-arc, relationship, voice-pattern',
              },
              key: { type: 'string', description: 'A searchable key for this insight' },
              content: { type: 'string', description: 'The detailed insight' },
              importance: { type: 'number', description: 'Importance level (1-10)' },
            },
            required: ['category', 'key', 'content'],
          },
        }
      ),

      FunctionTool.from<any, any>(
        async ({ includeContent = false }: { includeContent?: boolean }) => {
          if (!context.projectId) {
            throw new Error('Project ID required')
          }

          const project = await prisma.project.findUnique({
            where: { id: context.projectId },
            include: {
              chapters: {
                include: {
                  scenes: {
                    select: {
                      id: true,
                      title: true,
                      wordCount: true,
                      order: true,
                      content: includeContent || false,
                    },
                    orderBy: { order: 'asc' },
                  },
                },
                orderBy: { order: 'asc' },
              },
            },
          })

          if (!project) {
            throw new Error('Project not found')
          }

          return JSON.stringify({
            project: {
              id: project.id,
              title: project.title,
              description: project.description,
              genre: project.genre,
              subgenre: project.subgenre,
              targetAudience: project.targetAudience,
              pov: project.pov,
              tense: project.tense,
              targetWordCount: project.targetWordCount,
              status: project.status,
              notes: project.notes,
            },
            chapters: project.chapters.map(ch => ({
              id: ch.id,
              title: ch.title,
              order: ch.order,
              scenes: ch.scenes,
            })),
            totalWordCount: project.chapters.reduce(
              (sum, ch) => sum + ch.scenes.reduce((s, sc) => s + sc.wordCount, 0),
              0
            ),
          })
        },
        {
          name: 'getProjectContext',
          description: 'Get comprehensive project context including chapters, scenes, and metadata',
          parameters: {
            type: 'object',
            properties: {
              includeContent: {
                type: 'boolean',
                description: 'Include full scene content (can be large)',
              },
            },
          },
        }
      ),
    ]
  }
}

/**
 * Execute a LlamaIndex agent
 */
export async function executeLlamaIndexAgent(
  agentType: 'world-building' | 'character-development',
  context: AgentContext,
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>
) {
  const agent = await createLlamaIndexAgent(agentType, context, conversationHistory)

  // Chat with agent (includes full conversation history)
  const response = await agent.chat({
    message: userMessage,
    chatHistory: conversationHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    })),
  })

  return {
    role: 'assistant' as const,
    content: response.response,
    toolCalls: undefined, // LlamaIndex handles tool calls internally
    toolResults: undefined,
  }
}
