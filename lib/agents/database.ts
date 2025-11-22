// Database operations for Story Agents
// Uses Prisma in Next.js, in-memory DB for CLI/testing

export type Character = {
  id: string
  projectId: string
  name: string
  age: string | null
  role: string | null
  description: string | null
  traits: string | null
  background: string | null
  relationships: string | null
  goals: string | null
  createdAt: Date
  updatedAt: Date
}

export type LorebookEntry = {
  id: string
  projectId: string
  key: string
  value: string
  category: string | null
  keys: string | null
  triggerMode: string
  priority: number
  searchable: boolean
  regexPattern: string | null
  contextStrategy: string
  useCount: number
  lastUsed: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface CharacterData {
  name: string
  age?: string
  role?: string
  description?: string
  traits?: string[]
  background?: string
  relationships?: Record<string, string>
  goals?: string
}

export interface LoreData {
  key: string
  value: string
  category?: string
  keys?: string[]
  triggerMode?: string
  priority?: number
  searchable?: boolean
  regexPattern?: string
  contextStrategy?: string
}

type Result<T> = ({ success: true } & T) | { success: false; error: string }

// In-memory database for CLI/testing
class InMemoryDB {
  private characters = new Map<string, Character>()
  private lorebookEntries = new Map<string, LorebookEntry>()

  async createCharacter(
    projectId: string,
    data: CharacterData
  ): Promise<Result<{ character: Character }>> {
    const id = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const character: Character = {
      id,
      projectId,
      name: data.name,
      age: data.age || null,
      role: data.role || null,
      description: data.description || null,
      traits: JSON.stringify(data.traits || []),
      background: data.background || null,
      relationships: JSON.stringify(data.relationships || {}),
      goals: data.goals || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.characters.set(id, character)
    return { success: true, character }
  }

  async updateCharacter(
    characterId: string,
    updates: Partial<CharacterData>
  ): Promise<Result<{ character: Character }>> {
    const character = this.characters.get(characterId)
    if (!character) return { success: false, error: 'Character not found' }

    const updated: Character = {
      ...character,
      ...updates,
      traits: updates.traits ? JSON.stringify(updates.traits) : character.traits,
      relationships: updates.relationships
        ? JSON.stringify(updates.relationships)
        : character.relationships,
      updatedAt: new Date(),
    }
    this.characters.set(characterId, updated)
    return { success: true, character: updated }
  }

  async getCharacters(projectId: string): Promise<Result<{ characters: Character[] }>> {
    const characters = Array.from(this.characters.values()).filter(c => c.projectId === projectId)
    return { success: true, characters }
  }

  async getCharacter(characterId: string): Promise<Result<{ character: Character }>> {
    const character = this.characters.get(characterId)
    if (!character) return { success: false, error: 'Character not found' }
    return { success: true, character }
  }

  async createLoreEntry(
    projectId: string,
    data: LoreData
  ): Promise<Result<{ entry: LorebookEntry }>> {
    const id = `lore_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const entry: LorebookEntry = {
      id,
      projectId,
      key: data.key,
      value: data.value,
      category: data.category || null,
      keys: JSON.stringify(data.keys || [data.key]),
      triggerMode: data.triggerMode || 'auto',
      priority: data.priority || 0,
      searchable: data.searchable !== false,
      regexPattern: data.regexPattern || null,
      contextStrategy: data.contextStrategy || 'full',
      useCount: 0,
      lastUsed: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.lorebookEntries.set(id, entry)
    return { success: true, entry }
  }

  async updateLoreEntry(
    entryId: string,
    updates: Partial<LoreData>
  ): Promise<Result<{ entry: LorebookEntry }>> {
    const entry = this.lorebookEntries.get(entryId)
    if (!entry) return { success: false, error: 'Lore entry not found' }

    const updated: LorebookEntry = {
      ...entry,
      ...updates,
      keys: updates.keys ? JSON.stringify(updates.keys) : entry.keys,
      lastUsed: new Date(),
      useCount: entry.useCount + 1,
      updatedAt: new Date(),
    }
    this.lorebookEntries.set(entryId, updated)
    return { success: true, entry: updated }
  }

  async getLoreEntries(
    projectId: string,
    category?: string | null
  ): Promise<Result<{ entries: LorebookEntry[] }>> {
    let entries = Array.from(this.lorebookEntries.values()).filter(e => e.projectId === projectId)
    if (category) entries = entries.filter(e => e.category === category)
    entries.sort((a, b) => b.priority - a.priority || b.useCount - a.useCount)
    return { success: true, entries }
  }

  async searchLoreEntries(
    projectId: string,
    searchTerm: string
  ): Promise<Result<{ entries: LorebookEntry[] }>> {
    const lower = searchTerm.toLowerCase()
    const entries = Array.from(this.lorebookEntries.values())
      .filter(
        e =>
          e.projectId === projectId &&
          e.searchable &&
          (e.key.toLowerCase().includes(lower) ||
            e.value.toLowerCase().includes(lower) ||
            e.keys?.toLowerCase().includes(lower))
      )
      .sort((a, b) => b.priority - a.priority)
    return { success: true, entries }
  }

  async getProject(projectId: string): Promise<
    Result<{
      project: {
        id: string
        characters: Character[]
        lorebookEntries: LorebookEntry[]
      }
    }>
  > {
    const characters = Array.from(this.characters.values()).filter(c => c.projectId === projectId)
    const lorebookEntries = Array.from(this.lorebookEntries.values()).filter(
      l => l.projectId === projectId
    )
    return {
      success: true,
      project: { id: projectId, characters, lorebookEntries },
    }
  }

  clear() {
    this.characters.clear()
    this.lorebookEntries.clear()
  }
}

// Singleton in-memory instance
const memoryDb = new InMemoryDB()

// Check if running in Next.js context
const isNextJs = typeof window !== 'undefined' || process.env.NEXT_RUNTIME !== undefined

// Lazy load Prisma only in Next.js
let prismaClient: typeof import('@/lib/prisma').prisma | null = null
async function getPrisma() {
  if (!prismaClient && isNextJs) {
    const { prisma } = await import('@/lib/prisma')
    prismaClient = prisma
  }
  return prismaClient
}

// Database tools - auto-selects Prisma or in-memory
export const dbTools = {
  async createCharacter(
    projectId: string,
    data: CharacterData
  ): Promise<Result<{ character: Character }>> {
    const prisma = await getPrisma()
    if (prisma) {
      try {
        const character = await prisma.character.create({
          data: {
            projectId,
            name: data.name,
            age: data.age,
            role: data.role,
            description: data.description,
            traits: JSON.stringify(data.traits || []),
            background: data.background,
            relationships: JSON.stringify(data.relationships || {}),
            goals: data.goals,
          },
        })
        return { success: true, character }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    }
    return memoryDb.createCharacter(projectId, data)
  },

  async updateCharacter(
    characterId: string,
    updates: Partial<CharacterData>
  ): Promise<Result<{ character: Character }>> {
    const prisma = await getPrisma()
    if (prisma) {
      try {
        const data: Record<string, unknown> = { ...updates }
        if (updates.traits) data.traits = JSON.stringify(updates.traits)
        if (updates.relationships) data.relationships = JSON.stringify(updates.relationships)
        const character = await prisma.character.update({
          where: { id: characterId },
          data,
        })
        return { success: true, character }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    }
    return memoryDb.updateCharacter(characterId, updates)
  },

  async getCharacters(projectId: string): Promise<Result<{ characters: Character[] }>> {
    const prisma = await getPrisma()
    if (prisma) {
      try {
        const characters = await prisma.character.findMany({
          where: { projectId },
          orderBy: { createdAt: 'desc' },
        })
        return { success: true, characters }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    }
    return memoryDb.getCharacters(projectId)
  },

  async getCharacter(characterId: string): Promise<Result<{ character: Character }>> {
    const prisma = await getPrisma()
    if (prisma) {
      try {
        const character = await prisma.character.findUnique({
          where: { id: characterId },
        })
        if (!character) return { success: false, error: 'Character not found' }
        return { success: true, character }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    }
    return memoryDb.getCharacter(characterId)
  },

  async createLoreEntry(
    projectId: string,
    data: LoreData
  ): Promise<Result<{ entry: LorebookEntry }>> {
    const prisma = await getPrisma()
    if (prisma) {
      try {
        const entry = await prisma.lorebookEntry.create({
          data: {
            projectId,
            key: data.key,
            value: data.value,
            category: data.category,
            keys: JSON.stringify(data.keys || [data.key]),
            triggerMode: data.triggerMode || 'auto',
            priority: data.priority || 0,
            searchable: data.searchable !== false,
            regexPattern: data.regexPattern,
            contextStrategy: data.contextStrategy || 'full',
          },
        })
        return { success: true, entry }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    }
    return memoryDb.createLoreEntry(projectId, data)
  },

  async updateLoreEntry(
    entryId: string,
    updates: Partial<LoreData>
  ): Promise<Result<{ entry: LorebookEntry }>> {
    const prisma = await getPrisma()
    if (prisma) {
      try {
        const data: Record<string, unknown> = { ...updates }
        if (updates.keys) data.keys = JSON.stringify(updates.keys)
        const entry = await prisma.lorebookEntry.update({
          where: { id: entryId },
          data: { ...data, lastUsed: new Date(), useCount: { increment: 1 } },
        })
        return { success: true, entry }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    }
    return memoryDb.updateLoreEntry(entryId, updates)
  },

  async getLoreEntries(
    projectId: string,
    category?: string | null
  ): Promise<Result<{ entries: LorebookEntry[] }>> {
    const prisma = await getPrisma()
    if (prisma) {
      try {
        const entries = await prisma.lorebookEntry.findMany({
          where: { projectId, ...(category && { category }) },
          orderBy: [{ priority: 'desc' }, { useCount: 'desc' }],
        })
        return { success: true, entries }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    }
    return memoryDb.getLoreEntries(projectId, category)
  },

  async searchLoreEntries(
    projectId: string,
    searchTerm: string
  ): Promise<Result<{ entries: LorebookEntry[] }>> {
    const prisma = await getPrisma()
    if (prisma) {
      try {
        const lower = searchTerm.toLowerCase()
        const entries = await prisma.lorebookEntry.findMany({
          where: {
            projectId,
            searchable: true,
            OR: [
              { key: { contains: lower } },
              { value: { contains: lower } },
              { keys: { contains: lower } },
            ],
          },
          orderBy: { priority: 'desc' },
        })
        return { success: true, entries }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    }
    return memoryDb.searchLoreEntries(projectId, searchTerm)
  },

  async getProject(projectId: string): Promise<
    Result<{
      project: {
        id: string
        characters: Character[]
        lorebookEntries: LorebookEntry[]
      }
    }>
  > {
    const prisma = await getPrisma()
    if (prisma) {
      try {
        const [characters, lorebookEntries] = await Promise.all([
          prisma.character.findMany({ where: { projectId } }),
          prisma.lorebookEntry.findMany({ where: { projectId } }),
        ])
        return {
          success: true,
          project: { id: projectId, characters, lorebookEntries },
        }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    }
    return memoryDb.getProject(projectId)
  },

  // For testing - clears in-memory DB
  clearMemory() {
    memoryDb.clear()
  },
}

//Future state management for agents
class AgentState {
  projectId: string | null = null
  currentTask: string | null = null
  worldContext: unknown[] = []
  characters: unknown[] = []
  loreEntries: unknown[] = []
  storyOutline: unknown | null = null
  conversationHistory: Array<{
    role: string
    content: string
    timestamp: Date
  }> = []
  planningNotes: Array<{ note: string; timestamp: Date }> = []

  addMessage(role: string, content: string): void {
    this.conversationHistory.push({ role, content, timestamp: new Date() })
  }

  addPlanningNote(note: string): void {
    this.planningNotes.push({ note, timestamp: new Date() })
  }
}

export class ContextBuilder {
  private projectId: string

  constructor(projectId: string, _maxTokens = 6000) {
    this.projectId = projectId
  }

  extractKeywords(text: string): string[] {
    const stopWords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'from',
      'as',
      'is',
      'was',
      'are',
      'were',
      'been',
      'be',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'should',
      'could',
      'may',
      'might',
      'can',
      'about',
      'create',
      'develop',
      'write',
      'make',
      'add',
      'build',
      'describe',
      'tell',
      'show',
      'give',
    ])
    return [
      ...new Set(
        text
          .toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter(word => word.length > 2 && !stopWords.has(word))
      ),
    ]
  }

  calculateLoreScore(entry: LorebookEntry, keywords: string[], category?: string | null): number {
    let score = entry.priority || 0
    const entryKeywords = this.parseJSON<string[]>(entry.keys) || []
    const entryText = `${entry.key} ${entry.value} ${entryKeywords.join(' ')}`.toLowerCase()
    for (const keyword of keywords) if (entryText.includes(keyword)) score += 3
    if (category && entry.category === category) score += 2
    if (entry.lastUsed && (Date.now() - new Date(entry.lastUsed).getTime()) / 86400000 < 7)
      score += 2
    if (entry.useCount > 5) score += 1
    return score
  }

  async buildWorldContext(userPrompt: string, category?: string | null) {
    const keywords = this.extractKeywords(userPrompt)
    const context: {
      task: string
      keywords: string[]
      lore: Array<{
        id: string
        key: string
        value?: string
        category?: string | null
        priority: number
      }>
      summary: string | null
    } = {
      task: 'world_building',
      keywords,
      lore: [],
      summary: null,
    }
    const loreResult = await dbTools.getLoreEntries(this.projectId, category)
    if (!loreResult.success) return context
    const scoredLore = loreResult.entries.map(e => ({
      ...e,
      score: this.calculateLoreScore(e, keywords, category),
    }))
    scoredLore.sort((a, b) => b.score - a.score)
    context.lore = scoredLore.slice(0, 10).map(e => ({
      id: e.id,
      key: e.key,
      category: e.category,
      priority: e.priority,
      value:
        e.contextStrategy === 'summary'
          ? e.value.substring(0, 150) + '...'
          : e.contextStrategy === 'reference'
            ? undefined
            : e.value,
    }))
    if (context.lore.length > 0)
      context.summary = `Existing world elements: ${[
        ...new Set(
          context.lore
            .slice(0, 5)
            .map(l => l.category)
            .filter(Boolean)
        ),
      ].join(', ')}`
    return context
  }

  async buildCharacterContext(userPrompt: string, targetCharacterId?: string | null) {
    const keywords = this.extractKeywords(userPrompt)
    const context: {
      task: string
      keywords: string[]
      mainCharacter: {
        name: string
        role?: string | null
        age?: string | null
        description?: string | null
        traits: string[] | null
        background?: string | null
        goals?: string | null
        relationships: Record<string, string> | null
      } | null
      otherCharacters: Array<{
        id: string
        name: string
        role?: string | null
        age?: string | null
      }>
      relevantLore: Array<{
        key: string
        value: string
        category?: string | null
      }>
    } = {
      task: 'character_development',
      keywords,
      mainCharacter: null,
      otherCharacters: [],
      relevantLore: [],
    }
    if (targetCharacterId) {
      const r = await dbTools.getCharacter(targetCharacterId)
      if (r.success)
        context.mainCharacter = {
          ...r.character,
          traits: this.parseJSON(r.character.traits),
          relationships: this.parseJSON(r.character.relationships),
        }
    }
    const allChars = await dbTools.getCharacters(this.projectId)
    if (allChars.success)
      context.otherCharacters = allChars.characters
        .filter(c => c.id !== targetCharacterId)
        .map(c => ({ id: c.id, name: c.name, role: c.role, age: c.age }))
    const searchTerms = [
      ...keywords,
      ...(context.mainCharacter ? [context.mainCharacter.name.toLowerCase()] : []),
    ]
    const loreScores = new Map<string, number>()
    for (const term of searchTerms) {
      const r = await dbTools.searchLoreEntries(this.projectId, term)
      if (r.success)
        r.entries.forEach(e => loreScores.set(e.id, (loreScores.get(e.id) || 0) + e.priority + 1))
    }
    const topIds = [...loreScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id)
    const allLore = await dbTools.getLoreEntries(this.projectId)
    if (allLore.success)
      context.relevantLore = allLore.entries
        .filter(e => topIds.includes(e.id))
        .map(e => ({ key: e.key, value: e.value, category: e.category }))
    return context
  }

  async buildStoryContext(userPrompt: string) {
    const keywords = this.extractKeywords(userPrompt)
    const context: {
      task: string
      keywords: string[]
      characterSummaries: Array<{
        name: string
        role?: string | null
        goals?: string | null
        traits?: string[]
      }>
      worldSummaries: Array<{ category: string; key: string; summary: string }>
      themes: string[]
    } = {
      task: 'story_planning',
      keywords,
      characterSummaries: [],
      worldSummaries: [],
      themes: [],
    }
    const chars = await dbTools.getCharacters(this.projectId)
    if (chars.success)
      context.characterSummaries = chars.characters.map(c => ({
        name: c.name,
        role: c.role,
        goals: c.goals,
        traits: this.parseJSON<string[]>(c.traits)?.slice(0, 3),
      }))
    const lore = await dbTools.getLoreEntries(this.projectId)
    if (lore.success) {
      const byCategory: Record<string, LorebookEntry[]> = {}
      lore.entries.forEach(e => {
        const cat = e.category || 'General'
        ;(byCategory[cat] ||= []).push(e)
      })
      context.worldSummaries = Object.entries(byCategory).map(([cat, entries]) => {
        const top = entries.sort((a, b) => b.priority - a.priority)[0]
        return {
          category: cat,
          key: top.key,
          summary: top.value.substring(0, 200),
        }
      })
    }
    return context
  }

  async buildEditContext(selectedText: string, userInstruction: string) {
    const keywords = this.extractKeywords(selectedText + ' ' + userInstruction)
    const context: {
      task: string
      selectedText: string
      instruction: string
      keywords: string[]
      mentionedCharacters: Array<{
        name: string
        role?: string | null
        traits?: string[]
        goals?: string | null
        description?: string | null
      }>
      mentionedLore: Array<{
        key: string
        value: string
        category?: string | null
      }>
    } = {
      task: 'editing',
      selectedText,
      instruction: userInstruction,
      keywords,
      mentionedCharacters: [],
      mentionedLore: [],
    }
    const allChars = await dbTools.getCharacters(this.projectId)
    if (allChars.success) {
      const lower = selectedText.toLowerCase()
      context.mentionedCharacters = allChars.characters
        .filter(c => lower.includes(c.name.toLowerCase()))
        .map(c => ({
          name: c.name,
          role: c.role,
          traits: this.parseJSON<string[]>(c.traits)?.slice(0, 5),
          goals: c.goals,
          description: c.description,
        }))
    }
    const loreScores = new Map<string, number>()
    for (const kw of keywords.slice(0, 5)) {
      const r = await dbTools.searchLoreEntries(this.projectId, kw)
      if (r.success)
        r.entries
          .slice(0, 3)
          .forEach(e => loreScores.set(e.id, (loreScores.get(e.id) || 0) + e.priority + 1))
    }
    const topIds = [...loreScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id)
    const allLore = await dbTools.getLoreEntries(this.projectId)
    if (allLore.success)
      context.mentionedLore = allLore.entries
        .filter(e => topIds.includes(e.id))
        .map(e => ({
          key: e.key,
          value: e.value.substring(0, 300),
          category: e.category,
        }))
    return context
  }

  async buildContext(taskType: string, keywords: string[] = []) {
    const prompt = keywords.join(' ')
    switch (taskType) {
      case 'world_building':
        return this.buildWorldContext(prompt)
      case 'character_development':
        return this.buildCharacterContext(prompt)
      case 'story_planning':
        return this.buildStoryContext(prompt)
      default:
        return this.buildWorldContext(prompt)
    }
  }

  parseJSON<T>(jsonString: string | null | undefined): T | null {
    try {
      return jsonString ? JSON.parse(jsonString) : null
    } catch {
      return null
    }
  }
}
