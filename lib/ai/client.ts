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

  const messages = []

  if (options.systemPrompt || settings.aiSystemPrompt) {
    messages.push({
      role: 'system',
      content: options.systemPrompt || settings.aiSystemPrompt,
    })
  }

  if (options.context) {
    messages.push({
      role: 'user',
      content: `Context:\n${options.context}`,
    })
  }

  messages.push({
    role: 'user',
    content: options.prompt,
  })

  const response = await fetch(`${settings.aiEndpoint}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.aiApiKey}`,
    },
    body: JSON.stringify({
      model: settings.aiModel,
      messages,
      temperature: options.temperature ?? settings.aiTemperature,
      max_tokens: options.maxTokens ?? settings.aiMaxTokens,
      stream: !!onChunk,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`AI generation failed: ${error}`)
  }

  if (onChunk) {
    // Streaming response
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let fullText = ''

    if (!reader) {
      throw new Error('No response body')
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter((line) => line.trim() !== '')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices[0]?.delta?.content || ''
            if (content) {
              fullText += content
              onChunk(content)
            }
          } catch (e) {
            // Skip parsing errors
          }
        }
      }
    }

    return fullText
  } else {
    // Non-streaming response
    const data = await response.json()
    return data.choices[0]?.message?.content || ''
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
