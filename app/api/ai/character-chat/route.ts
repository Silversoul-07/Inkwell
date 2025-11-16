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

    // Build system prompt from character
    const systemPrompt = `You are ${character.name}${character.role ? `, a ${character.role}` : ''}.

${character.description ? `Physical Description: ${character.description}\n` : ''}
${character.traits ? `Personality: ${character.traits}\n` : ''}
${character.background ? `Background: ${character.background}\n` : ''}
${character.goals ? `Goals: ${character.goals}\n` : ''}

Respond to the user's messages in character, maintaining the personality, speech patterns, and knowledge that ${character.name} would have. Be creative and engaging.`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: message },
    ]

    const response = await fetch(`${settings.aiEndpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.aiApiKey}`,
      },
      body: JSON.stringify({
        model: settings.aiModel,
        messages,
        temperature: 0.9, // Higher temperature for more creative character responses
        max_tokens: settings.aiMaxTokens,
        stream: true,
      }),
    })

    if (!response.ok) {
      return new Response('AI generation failed', { status: 500 })
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          controller.close()
          return
        }

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n').filter((line) => line.trim() !== '')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                  continue
                }

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices[0]?.delta?.content || ''
                  if (content) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ chunk: content })}\n\n`)
                    )
                  }
                } catch (e) {
                  // Skip parsing errors
                }
              }
            }
          }
        } catch (error) {
          console.error('Streaming error:', error)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
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
