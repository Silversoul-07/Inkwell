/**
 * Lorebook Smart Matching System
 *
 * Intelligently matches and triggers lorebook entries based on context
 */

export interface LorebookEntry {
  id: string
  key: string
  value: string
  category: string | null
  keys: string | null // JSON array of trigger keywords
  triggerMode: string // "auto" or "manual"
  priority: number
  searchable: boolean
  lastUsed: Date | null
  useCount: number
  regexPattern: string | null
  contextStrategy: string // "full" or "summary"
}

export interface TriggeredEntry {
  entry: LorebookEntry
  matchedKeywords: string[]
  relevanceScore: number
}

/**
 * Find lorebook entries that should be triggered based on context
 */
export function matchLorebookEntries(
  entries: LorebookEntry[],
  context: string,
  options: {
    maxEntries?: number
    tokenBudget?: number
  } = {}
): TriggeredEntry[] {
  const { maxEntries = 10, tokenBudget = 2000 } = options

  // Filter to only auto-trigger entries
  const autoEntries = entries.filter(
    (entry) => entry.triggerMode === 'auto' && entry.searchable
  )

  // Find matches
  const triggered: TriggeredEntry[] = []
  const contextLower = context.toLowerCase()

  for (const entry of autoEntries) {
    const matchedKeywords: string[] = []
    let relevanceScore = 0

    // Check primary key
    if (entry.key && contextLower.includes(entry.key.toLowerCase())) {
      matchedKeywords.push(entry.key)
      relevanceScore += 10 // Primary key match gets high score
    }

    // Check additional keys
    if (entry.keys) {
      try {
        const keys: string[] = JSON.parse(entry.keys)
        for (const key of keys) {
          if (contextLower.includes(key.toLowerCase())) {
            matchedKeywords.push(key)
            relevanceScore += 5
          }
        }
      } catch (e) {
        console.error('Failed to parse keys:', entry.keys)
      }
    }

    // Check regex pattern
    if (entry.regexPattern) {
      try {
        const regex = new RegExp(entry.regexPattern, 'gi')
        const regexMatches = context.match(regex)
        if (regexMatches && regexMatches.length > 0) {
          matchedKeywords.push(...regexMatches.slice(0, 3)) // Take first 3 matches
          relevanceScore += regexMatches.length * 3
        }
      } catch (e) {
        console.error('Invalid regex pattern:', entry.regexPattern)
      }
    }

    // If we have matches, add to triggered list
    if (matchedKeywords.length > 0) {
      // Boost score based on priority
      relevanceScore += entry.priority * 2

      // Boost score based on usage (recently/frequently used entries)
      if (entry.lastUsed) {
        const daysSinceUsed = Math.floor(
          (Date.now() - new Date(entry.lastUsed).getTime()) / (1000 * 60 * 60 * 24)
        )
        if (daysSinceUsed < 7) {
          relevanceScore += 3 // Recently used
        }
      }

      triggered.push({
        entry,
        matchedKeywords,
        relevanceScore,
      })
    }
  }

  // Sort by relevance score (highest first)
  triggered.sort((a, b) => b.relevanceScore - a.relevanceScore)

  // Limit by maxEntries
  let selectedEntries = triggered.slice(0, maxEntries)

  // If token budget specified, filter by estimated token usage
  if (tokenBudget) {
    let totalTokens = 0
    const withinBudget: TriggeredEntry[] = []

    for (const item of selectedEntries) {
      const entryTokens = estimateTokens(item.entry.value)
      if (totalTokens + entryTokens <= tokenBudget) {
        withinBudget.push(item)
        totalTokens += entryTokens
      } else {
        break // Budget exhausted
      }
    }

    selectedEntries = withinBudget
  }

  return selectedEntries
}

/**
 * Format triggered entries for AI context
 */
export function formatTriggeredEntries(triggered: TriggeredEntry[]): string {
  if (triggered.length === 0) return ''

  const sections = triggered.map((item) => {
    const header = `[${item.entry.key}]${
      item.entry.category ? ` (${item.entry.category})` : ''
    }`
    return `${header}\n${item.entry.value}`
  })

  return `# World Information\n\n${sections.join('\n\n---\n\n')}`
}

/**
 * Update usage statistics for triggered entries
 */
export async function recordLorebookUsage(
  entryIds: string[],
  prisma: any
): Promise<void> {
  const now = new Date()

  await prisma.lorebookEntry.updateMany({
    where: { id: { in: entryIds } },
    data: {
      lastUsed: now,
      useCount: { increment: 1 },
    },
  })
}

/**
 * Simple token estimation (reused from token-counter)
 */
function estimateTokens(text: string): number {
  if (!text) return 0
  const wordBasedEstimate = text.trim().split(/\s+/).length * 1.3
  const charBasedEstimate = text.length / 4
  return Math.ceil((wordBasedEstimate + charBasedEstimate) / 2)
}

/**
 * Get smart suggestions for keywords based on existing entry
 */
export function suggestKeywords(entry: LorebookEntry): string[] {
  const suggestions: string[] = []
  const value = entry.value.toLowerCase()

  // Extract capitalized words (potential proper nouns)
  const capitalizedWords = entry.value.match(/\b[A-Z][a-z]+\b/g) || []
  suggestions.push(
    ...capitalizedWords.filter((word) => word.length > 3).slice(0, 5)
  )

  // Extract quoted phrases
  const quotedPhrases = entry.value.match(/"([^"]+)"/g) || []
  suggestions.push(...quotedPhrases.map((q) => q.replace(/"/g, '')).slice(0, 3))

  // Category-based suggestions
  if (entry.category) {
    const categoryWords = entry.category.toLowerCase().split(/[\s-_]+/)
    suggestions.push(...categoryWords)
  }

  // Deduplicate and filter
  return [...new Set(suggestions)]
    .filter((s) => s.length > 2)
    .slice(0, 10)
}
