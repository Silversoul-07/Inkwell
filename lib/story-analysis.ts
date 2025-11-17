/**
 * Story Analysis Utilities
 *
 * Tools for analyzing story content
 */

export interface RepetitionResult {
  word: string
  count: number
  percentage: number
}

export interface DialogueAnalysis {
  totalWords: number
  dialogueWords: number
  narrativeWords: number
  dialoguePercentage: number
  narrativePercentage: number
}

/**
 * Find repetitive words in text
 */
export function findRepetitions(
  text: string,
  minLength: number = 4,
  minOccurrences: number = 3
): RepetitionResult[] {
  if (!text) return []

  // Convert to lowercase and split into words
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter((w) => w.length >= minLength)

  // Common words to exclude
  const stopWords = new Set([
    'that',
    'this',
    'with',
    'from',
    'have',
    'been',
    'were',
    'what',
    'when',
    'where',
    'which',
    'while',
    'their',
    'there',
    'these',
    'those',
    'would',
    'could',
    'should',
    'about',
    'after',
    'before',
    'through',
    'just',
    'very',
    'more',
    'some',
    'other',
    'into',
    'over',
    'then',
    'them',
    'than',
    'such',
    'only',
    'also',
    'well',
    'back',
    'even',
    'still',
    'much',
    'many',
    'most',
    'said',
    'like',
    'make',
    'made',
    'know',
    'come',
    'came',
    'take',
    'took',
    'give',
    'gave',
  ])

  // Count word occurrences
  const wordCount = new Map<string, number>()
  for (const word of words) {
    if (!stopWords.has(word)) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1)
    }
  }

  // Filter and sort
  const totalWords = words.length
  const repetitions: RepetitionResult[] = []

  for (const [word, count] of wordCount.entries()) {
    if (count >= minOccurrences) {
      repetitions.push({
        word,
        count,
        percentage: parseFloat(((count / totalWords) * 100).toFixed(2)),
      })
    }
  }

  // Sort by count descending
  repetitions.sort((a, b) => b.count - a.count)

  return repetitions.slice(0, 50) // Return top 50
}

/**
 * Calculate estimated reading time
 */
export function calculateReadingTime(
  text: string,
  wordsPerMinute: number = 250
): {
  minutes: number
  seconds: number
  totalSeconds: number
  wordCount: number
} {
  if (!text) {
    return { minutes: 0, seconds: 0, totalSeconds: 0, wordCount: 0 }
  }

  const words = text.trim().split(/\s+/)
  const wordCount = words.length

  const totalSeconds = Math.ceil((wordCount / wordsPerMinute) * 60)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return {
    minutes,
    seconds,
    totalSeconds,
    wordCount,
  }
}

/**
 * Analyze dialogue vs description ratio
 */
export function analyzeDialogueRatio(text: string): DialogueAnalysis {
  if (!text) {
    return {
      totalWords: 0,
      dialogueWords: 0,
      narrativeWords: 0,
      dialoguePercentage: 0,
      narrativePercentage: 0,
    }
  }

  // Extract dialogue (text within quotes)
  const dialogueMatches = text.match(/"([^"]*)"/g) || []
  const dialogueText = dialogueMatches.join(' ')

  // Remove dialogue from text to get narrative
  const narrativeText = text.replace(/"([^"]*)"/g, '')

  // Count words
  const countWords = (str: string) => {
    if (!str.trim()) return 0
    return str.trim().split(/\s+/).length
  }

  const totalWords = countWords(text)
  const dialogueWords = countWords(dialogueText)
  const narrativeWords = countWords(narrativeText)

  const dialoguePercentage = totalWords > 0
    ? parseFloat(((dialogueWords / totalWords) * 100).toFixed(1))
    : 0
  const narrativePercentage = totalWords > 0
    ? parseFloat(((narrativeWords / totalWords) * 100).toFixed(1))
    : 0

  return {
    totalWords,
    dialogueWords,
    narrativeWords,
    dialoguePercentage,
    narrativePercentage,
  }
}

/**
 * Analyze sentence structure
 */
export function analyzeSentenceStructure(text: string): {
  totalSentences: number
  avgWordsPerSentence: number
  shortSentences: number // < 10 words
  mediumSentences: number // 10-20 words
  longSentences: number // > 20 words
} {
  if (!text) {
    return {
      totalSentences: 0,
      avgWordsPerSentence: 0,
      shortSentences: 0,
      mediumSentences: 0,
      longSentences: 0,
    }
  }

  // Split into sentences
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  const totalSentences = sentences.length
  if (totalSentences === 0) {
    return {
      totalSentences: 0,
      avgWordsPerSentence: 0,
      shortSentences: 0,
      mediumSentences: 0,
      longSentences: 0,
    }
  }

  let totalWords = 0
  let shortSentences = 0
  let mediumSentences = 0
  let longSentences = 0

  for (const sentence of sentences) {
    const wordCount = sentence.split(/\s+/).length
    totalWords += wordCount

    if (wordCount < 10) {
      shortSentences++
    } else if (wordCount <= 20) {
      mediumSentences++
    } else {
      longSentences++
    }
  }

  const avgWordsPerSentence = parseFloat((totalWords / totalSentences).toFixed(1))

  return {
    totalSentences,
    avgWordsPerSentence,
    shortSentences,
    mediumSentences,
    longSentences,
  }
}

/**
 * Get pacing suggestion based on sentence structure
 */
export function getPacingSuggestion(analysis: ReturnType<typeof analyzeSentenceStructure>): {
  pacing: 'fast' | 'moderate' | 'slow'
  suggestion: string
} {
  const { avgWordsPerSentence, shortSentences, totalSentences } = analysis

  const shortPercentage = totalSentences > 0
    ? (shortSentences / totalSentences) * 100
    : 0

  if (avgWordsPerSentence < 12 || shortPercentage > 50) {
    return {
      pacing: 'fast',
      suggestion: 'Your story has a fast pace with shorter sentences. Great for action scenes!',
    }
  } else if (avgWordsPerSentence > 18) {
    return {
      pacing: 'slow',
      suggestion: 'Your story has a slower, more deliberate pace. Perfect for description and introspection.',
    }
  } else {
    return {
      pacing: 'moderate',
      suggestion: 'Your story has a balanced, moderate pace with good sentence variety.',
    }
  }
}
