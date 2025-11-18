import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { runAgentQuery } from '@/lib/ai/agent'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Test endpoint for agentic AI features
 *
 * Use this to verify that the agent is working correctly with your API configuration
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { query, projectId, context } = await request.json()

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    console.log('Testing agent with query:', query)

    try {
      const result = await runAgentQuery(
        session.user.id,
        query,
        projectId,
        context
      )

      return NextResponse.json({
        success: true,
        result: result,
        message: 'Agent executed successfully! ✓',
      })
    } catch (agentError: any) {
      console.error('Agent execution error:', agentError)
      return NextResponse.json(
        {
          error: 'Agent execution failed',
          details: agentError.message,
          stack: agentError.stack,
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Agent test error:', error)

    let errorMessage = error.message || 'Test failed'
    let hint = ''

    if (error.message?.includes('AI settings not configured')) {
      errorMessage = 'AI settings not configured'
      hint = 'Please set GEMINI_API, GEMINI_URL, and MODEL environment variables, or configure AI settings in the app.'
    } else if (error.status === 404) {
      errorMessage = 'API endpoint not found (404)'
      hint = 'The endpoint URL is incorrect. Make sure it ends with /v1 and is a valid OpenAI-compatible API endpoint.'
    } else if (error.status === 401) {
      errorMessage = 'Authentication failed (401)'
      hint = 'Your API key is invalid or expired. Please check your API key.'
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused'
      hint = 'Cannot connect to the endpoint. Make sure the server is running and the URL is correct.'
    }

    return NextResponse.json(
      {
        error: errorMessage,
        hint: hint,
        details: error.message,
        status: error.status,
        stack: error.stack,
      },
      { status: 400 }
    )
  }
}
