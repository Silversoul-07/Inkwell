import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { generateWithAI } from '@/lib/ai/client'
import { buildAIContext, formatContextForAI } from '@/lib/context-builder'
import { recordLorebookUsage } from '@/lib/lorebook-matcher'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    const {
      prompt,
      context,
      temperature,
      maxTokens,
      systemPrompt: customSystemPrompt,
      projectId,
      characterId,
      includeUserInstructions = true,
      includeLorebook = true,
      includeCharacters = true,
    } = await request.json()

    if (!prompt) {
      return new Response('Prompt is required', { status: 400 })
    }

    // Build complete context if projectId provided
    let finalSystemPrompt = customSystemPrompt
    let finalContext = context
    let triggeredLorebookIds: string[] = []

    if (projectId) {
      const builtContext = await buildAIContext({
        userId: session.user.id,
        projectId,
        sceneContext: context || '',
        characterId,
        includeUserInstructions,
        includeLorebook,
        includeCharacters,
      })

      const formatted = formatContextForAI(builtContext)

      // Merge system prompts (custom takes precedence)
      finalSystemPrompt = customSystemPrompt || formatted.systemPrompt

      // Combine contexts
      finalContext = formatted.contextText
      triggeredLorebookIds = builtContext.triggeredLorebookIds

      // Record lorebook usage
      if (triggeredLorebookIds.length > 0) {
        await recordLorebookUsage(triggeredLorebookIds, prisma)
      }
    }

    // Create a streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await generateWithAI(
            session.user.id,
            {
              prompt,
              context: finalContext,
              temperature,
              maxTokens,
              systemPrompt: finalSystemPrompt,
            },
            chunk => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`))
            }
          )

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error: any) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`)
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('AI generation error:', error)
    return new Response(error.message || 'Internal server error', {
      status: 500,
    })
  }
}
