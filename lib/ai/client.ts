import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'

export interface AIGenerationOptions {
  prompt: string
  context?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  modelId?: string // Optional: use specific model instead of default
}

/**
 * Get the AI model to use for generation
 * If modelId is provided, use that specific model
 * Otherwise, use the user's default model
 */
async function getAIModel(userId: string, modelId?: string) {
  let model

  if (modelId) {
    // Use specific model
    model = await prisma.aIModel.findFirst({
      where: {
        id: modelId,
        userId,
      },
    })
  } else {
    // Use default model
    model = await prisma.aIModel.findFirst({
      where: {
        userId,
        isDefault: true,
      },
    })
  }

  // Fallback: try to get any model for this user
  if (!model) {
    model = await prisma.aIModel.findFirst({
      where: { userId },
    })
  }

  if (!model) {
    throw new Error('No AI model configured. Please add an AI model in Settings → AI Models.')
  }

  if (!model.apiKey) {
    throw new Error(`AI model "${model.name}" has no API key configured.`)
  }

  return model
}

export async function generateWithAI(
  userId: string,
  options: AIGenerationOptions,
  onChunk?: (chunk: string) => void
): Promise<string> {
  // Get the AI model to use
  const model = await getAIModel(userId, options.modelId)

  // Get user settings for defaults
  const settings = await prisma.settings.findUnique({
    where: { userId },
  })

  // Normalize endpoint URL
  let baseURL = model.baseUrl?.trim() || 'https://api.openai.com/v1'
  if (baseURL.endsWith('/')) {
    baseURL = baseURL.slice(0, -1)
  }

  // Create OpenAI client with custom endpoint
  const openai = new OpenAI({
    apiKey: model.apiKey || '',
    baseURL: baseURL,
  })

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []

  // Add system prompt if provided
  if (options.systemPrompt || settings?.aiSystemPrompt) {
    messages.push({
      role: 'system',
      content: options.systemPrompt || settings?.aiSystemPrompt || '',
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
        model: model.model,
        messages,
        temperature: options.temperature ?? settings?.aiTemperature ?? 0.7,
        max_tokens: options.maxTokens ?? settings?.aiMaxTokens ?? 2000,
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
        model: model.model,
        messages,
        temperature: options.temperature ?? settings?.aiTemperature ?? 0.7,
        max_tokens: options.maxTokens ?? settings?.aiMaxTokens ?? 2000,
        stream: false,
      })

      return completion.choices[0]?.message?.content || ''
    }
  } catch (error: any) {
    console.error('AI generation error:', error)

    // Provide helpful error messages
    if (error.status === 401) {
      throw new Error(`Authentication failed for model "${model.name}". Please check your API key.`)
    } else if (error.status === 404) {
      throw new Error(`Model "${model.model}" not found. Please verify the model name is correct.`)
    } else if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.')
    } else {
      throw new Error(`AI generation failed: ${error.message || 'Unknown error'}`)
    }
  }
}
