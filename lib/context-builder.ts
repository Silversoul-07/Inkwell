/**
 * Context Builder
 *
 * Builds complete AI context from various sources
 */

import { prisma } from '@/lib/prisma'

export interface ContextOptions {
  userId: string
  projectId: string
  sceneContext: string
  characterId?: string
  includeUserInstructions?: boolean
  includeLorebook?: boolean
  includeCharacters?: boolean
  maxLorebookEntries?: number
  lorebookTokenBudget?: number
}

export interface BuiltContext {
  systemPrompt: string
  userInstructions: string
  sceneContext: string
  lorebookEntries: string
  characterInfo: string
  triggeredLorebookIds: string[]
}

/**
 * Build combined user instructions from global → project → character
 */
export async function buildUserInstructions(
  userId: string,
  projectId?: string,
  characterId?: string
): Promise<string> {
  const instructions: Array<{ scope: string; instructions: string; priority: number }> = []

  // Fetch all relevant instructions
  const allInstructions = await prisma.userInstructions.findMany({
    where: {
      OR: [
        { userId, projectId: null, characterId: null, scope: 'global' },
        projectId ? { projectId, scope: 'project' } : {},
        characterId ? { characterId, scope: 'character' } : {},
      ],
      isEnabled: true,
    },
    orderBy: { priority: 'desc' },
  })

  if (allInstructions.length === 0) {
    return ''
  }

  // Sort by scope hierarchy (character > project > global) and then by priority
  const scopeOrder = { character: 3, project: 2, global: 1 }
  const sorted = allInstructions.sort((a: any, b: any) => {
    const scopeDiff =
      scopeOrder[b.scope as keyof typeof scopeOrder] -
      scopeOrder[a.scope as keyof typeof scopeOrder]
    if (scopeDiff !== 0) return scopeDiff
    return b.priority - a.priority
  })

  // Combine into single string
  const combined = sorted.map((i: any) => i.instructions).join('\n\n')
  return combined
}

/**
 * Build complete context for AI generation
 */
export async function buildAIContext(options: ContextOptions): Promise<BuiltContext> {
  const {
    userId,
    projectId,
    sceneContext,
    characterId,
    includeUserInstructions = true,
    includeLorebook = true,
    includeCharacters = true,
    maxLorebookEntries = 10,
    lorebookTokenBudget = 2000,
  } = options

  let systemPrompt = 'You are a creative writing assistant helping authors craft engaging stories.'
  let userInstructions = ''
  let lorebookEntries = ''
  let characterInfo = ''
  let triggeredLorebookIds: string[] = []

  // Build user instructions
  if (includeUserInstructions) {
    userInstructions = await buildUserInstructions(userId, projectId, characterId)
  }

  // Build lorebook context
  if (includeLorebook && sceneContext) {
    const { matchLorebookEntries, formatTriggeredEntries } = await import('./lorebook-matcher')

    const entries = await prisma.lorebookEntry.findMany({
      where: { projectId },
    })

    const triggered = matchLorebookEntries(entries, sceneContext, {
      maxEntries: maxLorebookEntries,
      tokenBudget: lorebookTokenBudget,
    })

    lorebookEntries = formatTriggeredEntries(triggered)
    triggeredLorebookIds = triggered.map(t => t.entry.id)
  }

  // Build character info
  if (includeCharacters && characterId) {
    const character = await prisma.character.findFirst({
      where: { id: characterId, projectId },
    })

    if (character) {
      characterInfo = `# Character: ${character.name}\n\n${character.description || ''}`
    }
  }

  return {
    systemPrompt,
    userInstructions,
    sceneContext,
    lorebookEntries,
    characterInfo,
    triggeredLorebookIds,
  }
}

/**
 * Format complete context for AI prompt
 */
export function formatContextForAI(context: BuiltContext): {
  systemPrompt: string
  contextText: string
} {
  const parts: string[] = []

  // System prompt with user instructions
  let systemPrompt = context.systemPrompt
  if (context.userInstructions) {
    systemPrompt += '\n\n## User Instructions\n' + context.userInstructions
  }

  // Build context sections
  if (context.lorebookEntries) {
    parts.push(context.lorebookEntries)
  }

  if (context.characterInfo) {
    parts.push(context.characterInfo)
  }

  if (context.sceneContext) {
    parts.push('# Current Scene\n\n' + context.sceneContext)
  }

  const contextText = parts.join('\n\n---\n\n')

  return {
    systemPrompt,
    contextText,
  }
}
