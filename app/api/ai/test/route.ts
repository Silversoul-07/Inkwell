import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { provider, endpoint, apiKey, model } = await request.json()

    if (!apiKey || !endpoint) {
      return NextResponse.json(
        { error: 'API key and endpoint are required' },
        { status: 400 }
      )
    }

    if (!model) {
      return NextResponse.json(
        { error: 'Model name is required' },
        { status: 400 }
      )
    }

    // Validate endpoint format
    let baseURL = endpoint.trim()
    
    // Remove trailing slash
    if (baseURL.endsWith('/')) {
      baseURL = baseURL.slice(0, -1)
    }
    
    // Ensure it ends with /v1 for OpenAI-compatible endpoints
    if (!baseURL.endsWith('/v1')) {
      return NextResponse.json(
        { 
          error: 'Invalid endpoint format. The endpoint should end with /v1 (e.g., https://api.openai.com/v1)',
          hint: 'Common endpoints:\n' +
                '• OpenAI: https://api.openai.com/v1\n' +
                '• Groq: https://api.groq.com/openai/v1\n' +
                '• Together AI: https://api.together.xyz/v1\n' +
                '• OpenRouter: https://openrouter.ai/api/v1\n' +
                '• Local (Ollama): http://localhost:11434/v1'
        },
        { status: 400 }
      )
    }

    // Create OpenAI client with custom endpoint
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL,
    })

    // Test the connection with a simple completion request using the user's specified model
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'user', content: 'Say "test successful" if you can read this.' },
      ],
      max_tokens: 50,
    })

    return NextResponse.json({ 
      success: true,
      message: 'Connection successful! ✓',
      endpoint: baseURL,
      model: model,
      response: completion.choices[0]?.message?.content || 'No response'
    })
  } catch (error: any) {
    console.error('AI test error:', error)
    
    // Provide more specific error messages
    let errorMessage = error.message || 'Connection test failed'
    let hint = ''
    
    if (error.status === 404) {
      errorMessage = 'API endpoint not found (404)'
      hint = 'The endpoint URL is incorrect. Make sure it ends with /v1 and is a valid OpenAI-compatible API endpoint.'
    } else if (error.status === 401) {
      errorMessage = 'Authentication failed (401)'
      hint = 'Your API key is invalid or expired. Please check your API key.'
    } else if (error.status === 403) {
      errorMessage = 'Access forbidden (403)'
      hint = 'Your API key does not have permission to access this endpoint.'
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused'
      hint = 'Cannot connect to the endpoint. If using a local endpoint (like Ollama), make sure the server is running.'
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        hint: hint,
        details: error.message,
        status: error.status
      },
      { status: 400 }
    )
  }
}
