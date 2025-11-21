import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { runAgentQueryStream } from '@/lib/ai/agent'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Agentic AI endpoint - uses LlamaIndex agent with tools
 *
 * This endpoint provides intelligent writing assistance through an AI agent
 * that can analyze text, retrieve character/lorebook info, and provide suggestions
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { query, projectId, context } = await request.json()

    if (!query) {
      return new Response('Query is required', { status: 400 })
    }

    // Create a streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await runAgentQueryStream(session.user.id, query, projectId, context, chunk => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`))
          })

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error: any) {
          console.error('Agent error:', error)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: error.message || 'Agent execution failed' })}\n\n`
            )
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
    console.error('AI agent error:', error)
    return new Response(error.message || 'Internal server error', {
      status: 500,
    })
  }
}
