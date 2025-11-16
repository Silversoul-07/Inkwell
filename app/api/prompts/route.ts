import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

const PROMPT_CATEGORIES = [
  'general',
  'character',
  'plot',
  'setting',
  'dialogue',
  'conflict',
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'daily'

    const settings = await prisma.settings.findUnique({
      where: { userId: session.user.id },
    })

    if (!settings?.aiApiKey) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 400 })
    }

    let prompt = ''

    switch (type) {
      case 'daily':
        prompt = 'Generate a creative writing prompt for today. Make it interesting, specific, and inspiring. Include a genre, character, and situation.'
        break
      case 'character':
        prompt = 'Generate a character development exercise. Include prompts about backstory, motivations, fears, and quirks.'
        break
      case 'plot':
        prompt = 'Generate a plot twist idea or story complication that could add tension to a narrative.'
        break
      case 'dialogue':
        prompt = 'Generate a dialogue writing exercise with a specific scenario, conflict, and character dynamic.'
        break
      case 'setting':
        prompt = 'Generate a detailed setting description prompt. Include sensory details and atmosphere.'
        break
      case 'whatif':
        prompt = 'Generate 3 "What if?" scenario questions that could take a story in unexpected directions.'
        break
      default:
        return NextResponse.json({ error: 'Invalid prompt type' }, { status: 400 })
    }

    const response = await fetch(`${settings.aiEndpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.aiApiKey}`,
      },
      body: JSON.stringify({
        model: settings.aiModel,
        messages: [
          {
            role: 'system',
            content: 'You are a creative writing coach. Generate inspiring and specific writing prompts.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.9,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      throw new Error('Prompt generation failed')
    }

    const data = await response.json()
    const generatedPrompt = data.choices[0]?.message?.content || ''

    return NextResponse.json({ prompt: generatedPrompt, type })
  } catch (error) {
    console.error('Prompt generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
