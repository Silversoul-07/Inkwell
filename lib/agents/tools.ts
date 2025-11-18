// Agent tools - functions that agents can call to interact with project data

import { prisma } from '@/lib/prisma'

export interface AgentTool {
  name: string
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, any>
    required: string[]
  }
  execute: (params: any, context: AgentContext) => Promise<any>
}

export interface AgentContext {
  userId: string
  projectId?: string
  conversationId: string
}

// World-Building Tools
export const getWorldKnowledge: AgentTool = {
  name: 'getWorldKnowledge',
  description: 'Retrieve existing lorebook entries and world facts for the project',
  parameters: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        description: 'Filter by category: Characters, Locations, Magic, Technology, History, Culture',
        enum: ['Characters', 'Locations', 'Magic', 'Technology', 'History', 'Culture'],
      },
      searchTerm: {
        type: 'string',
        description: 'Search term to filter entries',
      },
    },
    required: [],
  },
  execute: async (params, context) => {
    if (!context.projectId) {
      throw new Error('Project ID required for getWorldKnowledge')
    }

    const where: any = { projectId: context.projectId }
    if (params.category) where.category = params.category
    if (params.searchTerm) {
      where.OR = [
        { key: { contains: params.searchTerm, mode: 'insensitive' } },
        { value: { contains: params.searchTerm, mode: 'insensitive' } },
      ]
    }

    const entries = await prisma.lorebookEntry.findMany({ where, orderBy: { priority: 'desc' } })

    // Also get agent memories for world-building
    const memories = await prisma.agentMemory.findMany({
      where: {
        projectId: context.projectId,
        agentType: 'world-building',
        ...(params.category && { category: params.category.toLowerCase() }),
      },
      orderBy: { importance: 'desc' },
    })

    return {
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
    }
  },
}

export const createLorebookEntry: AgentTool = {
  name: 'createLorebookEntry',
  description: 'Create a new lorebook entry for a world element',
  parameters: {
    type: 'object',
    properties: {
      key: {
        type: 'string',
        description: 'The trigger keyword for this entry',
      },
      value: {
        type: 'string',
        description: 'The detailed content of the lorebook entry',
      },
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
  execute: async (params, context) => {
    if (!context.projectId) {
      throw new Error('Project ID required for createLorebookEntry')
    }

    const entry = await prisma.lorebookEntry.create({
      data: {
        projectId: context.projectId,
        key: params.key,
        value: params.value,
        category: params.category,
        priority: params.priority || 5,
      },
    })

    return { success: true, entryId: entry.id, message: `Created lorebook entry: ${params.key}` }
  },
}

export const saveWorldFact: AgentTool = {
  name: 'saveWorldFact',
  description: 'Save an important world-building fact or decision to memory',
  parameters: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        description: 'Category: world-fact, rule, theme, timeline-event',
      },
      key: {
        type: 'string',
        description: 'A searchable key for this fact',
      },
      content: {
        type: 'string',
        description: 'The detailed content of the fact',
      },
      importance: {
        type: 'number',
        description: 'Importance level (1-10)',
      },
    },
    required: ['category', 'key', 'content'],
  },
  execute: async (params, context) => {
    if (!context.projectId) {
      throw new Error('Project ID required for saveWorldFact')
    }

    const memory = await prisma.agentMemory.create({
      data: {
        userId: context.userId,
        projectId: context.projectId,
        agentType: 'world-building',
        category: params.category,
        key: params.key,
        content: params.content,
        importance: params.importance || 5,
      },
    })

    return { success: true, memoryId: memory.id, message: 'World fact saved to memory' }
  },
}

// Character Development Tools
export const getCharacters: AgentTool = {
  name: 'getCharacters',
  description: 'Retrieve all characters for the project',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async (params, context) => {
    if (!context.projectId) {
      throw new Error('Project ID required for getCharacters')
    }

    const characters = await prisma.character.findMany({
      where: { projectId: context.projectId },
      orderBy: { name: 'asc' },
    })

    // Get character insights from agent memory
    const insights = await prisma.agentMemory.findMany({
      where: {
        projectId: context.projectId,
        agentType: 'character-development',
      },
      orderBy: { importance: 'desc' },
    })

    return {
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
    }
  },
}

export const saveCharacterInsight: AgentTool = {
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
      key: {
        type: 'string',
        description: 'A searchable key for this insight',
      },
      content: {
        type: 'string',
        description: 'The detailed insight',
      },
      importance: {
        type: 'number',
        description: 'Importance level (1-10)',
      },
    },
    required: ['category', 'key', 'content'],
  },
  execute: async (params, context) => {
    if (!context.projectId) {
      throw new Error('Project ID required for saveCharacterInsight')
    }

    const memory = await prisma.agentMemory.create({
      data: {
        userId: context.userId,
        projectId: context.projectId,
        agentType: 'character-development',
        category: params.category,
        key: params.key,
        content: params.content,
        importance: params.importance || 5,
        characterId: params.characterId || null,
      },
    })

    return { success: true, memoryId: memory.id, message: 'Character insight saved to memory' }
  },
}

// Story Planning Tools
export const getProjectContext: AgentTool = {
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
    required: [],
  },
  execute: async (params, context) => {
    if (!context.projectId) {
      throw new Error('Project ID required for getProjectContext')
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
                content: params.includeContent || false,
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

    return {
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
    }
  },
}

export const savePlotPoint: AgentTool = {
  name: 'savePlotPoint',
  description: 'Save an important plot point or story decision',
  parameters: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        description: 'Category: plot-point, timeline-event, theme, structure-decision',
      },
      key: {
        type: 'string',
        description: 'A searchable key for this plot point',
      },
      content: {
        type: 'string',
        description: 'The detailed description',
      },
      importance: {
        type: 'number',
        description: 'Importance level (1-10)',
      },
    },
    required: ['category', 'key', 'content'],
  },
  execute: async (params, context) => {
    if (!context.projectId) {
      throw new Error('Project ID required for savePlotPoint')
    }

    const memory = await prisma.agentMemory.create({
      data: {
        userId: context.userId,
        projectId: context.projectId,
        agentType: 'story-planning',
        category: params.category,
        key: params.key,
        content: params.content,
        importance: params.importance || 5,
      },
    })

    return { success: true, memoryId: memory.id, message: 'Plot point saved to memory' }
  },
}

// Tool registry by agent type
export const AGENT_TOOLS: Record<string, AgentTool[]> = {
  'world-building': [getWorldKnowledge, createLorebookEntry, saveWorldFact, getProjectContext],
  'character-development': [getCharacters, saveCharacterInsight, getProjectContext],
  'story-planning': [getProjectContext, savePlotPoint],
}
