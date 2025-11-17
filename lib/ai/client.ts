import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'

export interface AIGenerationOptions {
  prompt: string
  context?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

export async function generateWithAI(
  userId: string,
  options: AIGenerationOptions,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const settings = await prisma.settings.findUnique({
    where: { userId },
  })

  if (!settings?.aiApiKey || !settings?.aiEndpoint) {
    throw new Error('AI settings not configured')
  }

  // Normalize endpoint URL
  let baseURL = settings.aiEndpoint.trim()
  if (baseURL.endsWith('/')) {
    baseURL = baseURL.slice(0, -1)
  }

  // Create OpenAI client with custom endpoint
  const openai = new OpenAI({
    apiKey: settings.aiApiKey,
    baseURL: baseURL,
  })

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []

  // Add system prompt if provided
  if (options.systemPrompt || settings.aiSystemPrompt) {
    messages.push({
      role: 'system',
      content: options.systemPrompt || settings.aiSystemPrompt || '',
    })
  }

  // Add context if provided
  if (options.context) {
    messages.push({
      role: 'user',
      content: `Context:\n${options.context}`,
    })
  }

  // Add the main prompt
  messages.push({
    role: 'user',
    content: options.prompt,
  })

  try {
    if (onChunk) {
      // Streaming response
      const stream = await openai.chat.completions.create({
        model: settings.aiModel,
        messages,
        temperature: options.temperature ?? settings.aiTemperature,
        max_tokens: options.maxTokens ?? settings.aiMaxTokens,
        stream: true,
      })

      let fullText = ''
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          fullText += content
          onChunk(content)
        }
      }

      return fullText
    } else {
      // Non-streaming response
      const completion = await openai.chat.completions.create({
        model: settings.aiModel,
        messages,
        temperature: options.temperature ?? settings.aiTemperature,
        max_tokens: options.maxTokens ?? settings.aiMaxTokens,
        stream: false,
      })

      return completion.choices[0]?.message?.content || ''
    }
  } catch (error: any) {
    console.error('AI generation error:', error)
    throw new Error(`AI generation failed: ${error.message || 'Unknown error'}`)
  }
}

export function buildContextFromScene(
  sceneContent: string,
  maxChars: number = 4000
): string {
  // Get the last N characters of the scene as context
  if (sceneContent.length <= maxChars) {
    return sceneContent
  }

  return '...' + sceneContent.slice(-maxChars)
}

export function buildContextFromProject(
  chapters: Array<{
    title: string
    scenes: Array<{
      content: string
      order: number
    }>
  }>,
  currentSceneId: string,
  maxChars: number = 8000
): string {
  // Build a summary of the project for context
  let context = ''

  for (const chapter of chapters) {
    context += `\n## ${chapter.title}\n\n`
    for (const scene of chapter.scenes.sort((a, b) => a.order - b.order)) {
      // Truncate long scenes
      const content = scene.content.length > 500
        ? scene.content.slice(0, 500) + '...'
        : scene.content
      context += content + '\n\n'
    }
  }

  // Truncate to max chars
  if (context.length > maxChars) {
    context = context.slice(0, maxChars) + '\n\n[Context truncated...]'
  }

  return context
}
