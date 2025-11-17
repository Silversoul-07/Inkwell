/**
 * Token Counter Utility
 *
 * Provides rough estimates of token counts for text.
 * Uses approximation: ~0.75 tokens per word, or ~4 characters per token
 */

export function estimateTokens(text: string): number {
  if (!text) return 0

  // Use both methods and average them for better accuracy
  const wordBasedEstimate = text.trim().split(/\s+/).length * 1.3
  const charBasedEstimate = text.length / 4

  return Math.ceil((wordBasedEstimate + charBasedEstimate) / 2)
}

export function estimateTokensFromWords(wordCount: number): number {
  return Math.ceil(wordCount * 1.3)
}

export interface ContextBreakdown {
  systemPrompt: { text: string; tokens: number }
  userInstructions: { text: string; tokens: number }
  sceneContext: { text: string; tokens: number }
  lorebookEntries: { text: string; tokens: number; count: number }
  characterInfo: { text: string; tokens: number; count: number }
  chapterSummaries: { text: string; tokens: number; count: number }
  userPrompt: { text: string; tokens: number }
  total: number
}

export function buildContextBreakdown(context: {
  systemPrompt?: string
  userInstructions?: string
  sceneContext?: string
  lorebookEntries?: string[]
  characterInfo?: string[]
  chapterSummaries?: string[]
  userPrompt?: string
}): ContextBreakdown {
  const systemPrompt = {
    text: context.systemPrompt || '',
    tokens: estimateTokens(context.systemPrompt || ''),
  }

  const userInstructions = {
    text: context.userInstructions || '',
    tokens: estimateTokens(context.userInstructions || ''),
  }

  const sceneContext = {
    text: context.sceneContext || '',
    tokens: estimateTokens(context.sceneContext || ''),
  }

  const lorebookText = context.lorebookEntries?.join('\n\n') || ''
  const lorebookEntries = {
    text: lorebookText,
    tokens: estimateTokens(lorebookText),
    count: context.lorebookEntries?.length || 0,
  }

  const characterText = context.characterInfo?.join('\n\n') || ''
  const characterInfo = {
    text: characterText,
    tokens: estimateTokens(characterText),
    count: context.characterInfo?.length || 0,
  }

  const chapterText = context.chapterSummaries?.join('\n\n') || ''
  const chapterSummaries = {
    text: chapterText,
    tokens: estimateTokens(chapterText),
    count: context.chapterSummaries?.length || 0,
  }

  const userPrompt = {
    text: context.userPrompt || '',
    tokens: estimateTokens(context.userPrompt || ''),
  }

  const total =
    systemPrompt.tokens +
    userInstructions.tokens +
    sceneContext.tokens +
    lorebookEntries.tokens +
    characterInfo.tokens +
    chapterSummaries.tokens +
    userPrompt.tokens

  return {
    systemPrompt,
    userInstructions,
    sceneContext,
    lorebookEntries,
    characterInfo,
    chapterSummaries,
    userPrompt,
    total,
  }
}

export function formatTokenCount(tokens: number): string {
  return tokens.toLocaleString()
}

export function getTokenPercentage(tokens: number, total: number): number {
  if (total === 0) return 0
  return Math.round((tokens / total) * 100)
}
