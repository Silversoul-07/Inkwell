import OpenAI from 'openai'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { characterId, message, conversationHistory } = await request.json()

    // Get character details
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: { project: true },
    })

    if (!character || character.project.userId !== session.user.id) {
      return new Response('Character not found', { status: 404 })
    }

    // Get user settings
    const settings = await prisma.settings.findUnique({
      where: { userId: session.user.id },
    })

    if (!settings?.aiApiKey || !settings?.aiEndpoint) {
      return new Response('AI settings not configured', { status: 400 })
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

    // Build system prompt from character
    const systemPrompt = `You are ${character.name}${character.role ? `, a ${character.role}` : ''}.

${character.description ? `Physical Description: ${character.description}\n` : ''}
${character.traits ? `Personality: ${character.traits}\n` : ''}
${character.background ? `Background: ${character.background}\n` : ''}
${character.goals ? `Goals: ${character.goals}\n` : ''}

Respond to the user's messages in character, maintaining the personality, speech patterns, and knowledge that ${character.name} would have. Be creative and engaging.`

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: message },
    ]

    const stream = await openai.chat.completions.create({
      model: settings.aiModel,
      messages,
      temperature: 0.9, // Higher temperature for more creative character responses
      max_tokens: settings.aiMaxTokens,
      stream: true,
    })

    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ chunk: content })}\n\n`)
              )
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } catch (error) {
          console.error('Streaming error:', error)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`
            )
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Character chat error:', error)
    return new Response(error.message || 'Internal server error', { status: 500 })
  }
}
