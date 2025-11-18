/**
 * Agentic AI Implementation using LlamaIndex
 *
 * Provides intelligent writing assistance through an AI agent with tools
 */

import { tool } from 'llamaindex'
import { agent } from '@llamaindex/workflow'
import { OpenAI } from '@llamaindex/openai'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import {
  findRepetitions,
  analyzeDialogueRatio,
  analyzeSentenceStructure,
  getPacingSuggestion
} from '@/lib/story-analysis'

// Tool: Analyze text for repetitive words
const analyzeRepetitionsTool = tool({
  name: 'analyze_repetitions',
  description: 'Analyzes text to find repetitive words that might need variation',
  parameters: z.object({
    text: z.string().describe('The text to analyze for repetitions'),
    minOccurrences: z.number().optional().describe('Minimum number of occurrences to flag (default: 3)'),
  }),
  execute: ({ text, minOccurrences = 3 }) => {
    const repetitions = findRepetitions(text, 4, minOccurrences)
    return {
      repetitions: repetitions.slice(0, 10).map(r => ({
        word: r.word,
        count: r.count,
        percentage: r.percentage
      })),
      summary: `Found ${repetitions.length} repetitive words. Top word: "${repetitions[0]?.word}" used ${repetitions[0]?.count} times.`
    } as Record<string, any>
  },
})

// Tool: Analyze dialogue vs narrative balance
const analyzeDialogueTool = tool({
  name: 'analyze_dialogue',
  description: 'Analyzes the balance between dialogue and narrative description in text',
  parameters: z.object({
    text: z.string().describe('The text to analyze'),
  }),
  execute: ({ text }) => {
    const analysis = analyzeDialogueRatio(text)
    return {
      totalWords: analysis.totalWords,
      dialogueWords: analysis.dialogueWords,
      narrativeWords: analysis.narrativeWords,
      dialoguePercentage: analysis.dialoguePercentage,
      narrativePercentage: analysis.narrativePercentage,
      summary: `Dialogue: ${analysis.dialoguePercentage}%, Narrative: ${analysis.narrativePercentage}%`,
      recommendation: analysis.dialoguePercentage > 70
        ? 'Consider adding more narrative description to balance the dialogue'
        : analysis.dialoguePercentage < 30
        ? 'Consider adding more dialogue to make scenes more dynamic'
        : 'Good balance between dialogue and narrative'
    } as Record<string, any>
  },
})

// Tool: Analyze pacing
const analyzePacingTool = tool({
  name: 'analyze_pacing',
  description: 'Analyzes the pacing of text based on sentence structure',
  parameters: z.object({
    text: z.string().describe('The text to analyze'),
  }),
  execute: ({ text }) => {
    const sentenceAnalysis = analyzeSentenceStructure(text)
    const pacingInfo = getPacingSuggestion(sentenceAnalysis)
    return {
      totalSentences: sentenceAnalysis.totalSentences,
      avgWordsPerSentence: sentenceAnalysis.avgWordsPerSentence,
      shortSentences: sentenceAnalysis.shortSentences,
      mediumSentences: sentenceAnalysis.mediumSentences,
      longSentences: sentenceAnalysis.longSentences,
      pacing: pacingInfo.pacing,
      suggestion: pacingInfo.suggestion,
      summary: `Pacing: ${pacingInfo.pacing}. Average words per sentence: ${sentenceAnalysis.avgWordsPerSentence}`
    } as Record<string, any>
  },
})

// Tool: Get character information
const getCharacterInfoTool = tool({
  name: 'get_character_info',
  description: 'Retrieves detailed information about a character in the project',
  parameters: z.object({
    characterName: z.string().describe('The name of the character to look up'),
    projectId: z.string().describe('The project ID where the character exists'),
  }),
  execute: async ({ characterName, projectId }) => {
    const character = await prisma.character.findFirst({
      where: {
        projectId: projectId,
        name: {
          contains: characterName,
        },
      },
    })

    if (!character) {
      return {
        found: false,
        message: `Character "${characterName}" not found in this project.`
      } as Record<string, any>
    }

    return {
      found: true,
      name: character.name || '',
      age: character.age || null,
      role: character.role || '',
      description: character.description || '',
      traits: character.traits || '',
      background: character.background || '',
      relationships: character.relationships || '',
      goals: character.goals || '',
      summary: `${character.name}, ${character.age ? `age ${character.age}, ` : ''}${character.role || 'character'}. ${character.description || ''}`
    } as Record<string, any>
  },
})

// Tool: Get lorebook entries
const getLorebookInfoTool = tool({
  name: 'get_lorebook_info',
  description: 'Retrieves lorebook entries (world-building information) that match keywords',
  parameters: z.object({
    keyword: z.string().describe('The keyword to search for in lorebook entries'),
    projectId: z.string().describe('The project ID to search within'),
    category: z.string().optional().describe('Optional category filter: characters, locations, magic, technology, history, culture'),
  }),
  execute: async ({ keyword, projectId, category }) => {
    const entries = await prisma.lorebookEntry.findMany({
      where: {
        projectId: projectId,
        ...(category && { category }),
        OR: [
          { key: { contains: keyword } },
          { value: { contains: keyword } },
        ],
      },
      take: 5,
    })

    if (entries.length === 0) {
      return {
        found: false,
        message: `No lorebook entries found for "${keyword}"`
      } as Record<string, any>
    }

    return {
      found: true,
      count: entries.length,
      entries: entries.map(e => ({
        key: e.key,
        category: e.category || '',
        value: e.value,
      })),
      summary: `Found ${entries.length} lorebook entries about "${keyword}"`
    } as Record<string, any>
  },
})

// Tool: Suggest plot ideas
const suggestPlotTool = tool({
  name: 'suggest_plot_ideas',
  description: 'Generates creative plot suggestions based on current story context',
  parameters: z.object({
    context: z.string().describe('Brief summary of the current story situation'),
    genre: z.string().optional().describe('The genre of the story (e.g., fantasy, sci-fi, romance)'),
  }),
  execute: ({ context, genre }) => {
    // This tool returns a structured response that the LLM can use to generate ideas
    return {
      context: context,
      genre: genre || 'general',
      request: 'Based on this context, generate 3 creative plot twist ideas or next steps for the story',
    } as Record<string, any>
  },
})

/**
 * Creates an AI agent configured for writing assistance
 */
export async function createWritingAgent(userId: string) {
  // Support environment variables for testing (GEMINI_API, GEMINI_URL, MODEL)
  const envApiKey = process.env.GEMINI_API
  const envBaseURL = process.env.GEMINI_URL
  const envModel = process.env.MODEL

  let apiKey: string
  let baseURL: string
  let model: string
  let temperature: number = 0.7
  let maxTokens: number = 2000

  if (envApiKey && envBaseURL && envModel) {
    // Use environment variables for testing
    apiKey = envApiKey
    baseURL = envBaseURL.trim()
    model = envModel
    console.log('Using environment variables for agent configuration')
  } else {
    // Get user settings for AI configuration
    const settings = await prisma.settings.findUnique({
      where: { userId },
    })

    if (!settings?.aiApiKey || !settings?.aiEndpoint) {
      throw new Error('AI settings not configured. Please set GEMINI_API, GEMINI_URL, and MODEL environment variables, or configure AI settings in the app.')
    }

    apiKey = settings.aiApiKey
    baseURL = settings.aiEndpoint.trim()
    model = settings.aiModel
    temperature = settings.aiTemperature
    maxTokens = settings.aiMaxTokens
  }

  // Normalize endpoint URL
  if (baseURL.endsWith('/')) {
    baseURL = baseURL.slice(0, -1)
  }

  // Ensure it ends with /v1 for OpenAI-compatible endpoints
  if (!baseURL.endsWith('/v1')) {
    console.warn('Endpoint does not end with /v1, appending it')
    baseURL += '/v1'
  }

  console.log(`Creating agent with model: ${model}, endpoint: ${baseURL}`)

  // Create OpenAI client with user's custom endpoint (works with OpenAI-compatible APIs like Gemini)
  const llm = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
    model: model,
    temperature: temperature,
    maxTokens: maxTokens,
  })

  // Create agent with writing tools
  const writingAgent = agent({
    llm,
    tools: [
      analyzeRepetitionsTool,
      analyzeDialogueTool,
      analyzePacingTool,
      getCharacterInfoTool,
      getLorebookInfoTool,
      suggestPlotTool,
    ],
    systemPrompt: `You are an intelligent writing assistant agent. You have access to various tools to help analyze text, retrieve character information, access world-building details from the lorebook, and provide creative suggestions.

When a user asks for help with their writing:
1. Use the analysis tools to understand their text better
2. Use character and lorebook tools to maintain consistency with established lore
3. Provide thoughtful, creative suggestions that enhance their story
4. Be encouraging and supportive of their creative process

Always explain your reasoning and cite specific details from the text or project when making suggestions.`,
  })

  return writingAgent
}

/**
 * Run an agentic query with streaming support
 */
export async function runAgentQuery(
  userId: string,
  query: string,
  projectId?: string,
  context?: string
) {
  const writingAgent = await createWritingAgent(userId)

  // Build the full query with context
  let fullQuery = query
  if (context) {
    fullQuery = `Context:\n${context}\n\nUser Query: ${query}`
  }
  if (projectId) {
    fullQuery += `\n\nProject ID: ${projectId}`
  }

  // Run the agent
  const result = await writingAgent.run(fullQuery)
  return result
}

/**
 * Run an agentic query with streaming
 *
 * Note: Streaming support depends on LlamaIndex agent implementation
 */
export async function runAgentQueryStream(
  userId: string,
  query: string,
  projectId?: string,
  context?: string,
  onChunk?: (chunk: string) => void
) {
  // For now, use non-streaming and chunk the result
  // TODO: Implement proper streaming when LlamaIndex agent supports it
  const result = await runAgentQuery(userId, query, projectId, context)

  // Simulate streaming by chunking the response
  const resultString = typeof result === 'string' ? result : JSON.stringify(result)
  const chunkSize = 50

  for (let i = 0; i < resultString.length; i += chunkSize) {
    const chunk = resultString.slice(i, i + chunkSize)
    if (onChunk) {
      onChunk(chunk)
    }
    // Small delay to simulate streaming
    await new Promise(resolve => setTimeout(resolve, 10))
  }

  return resultString
}
