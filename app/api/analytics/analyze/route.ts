import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, content, type } = await request.json()

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId, userId: session.user.id },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const settings = await prisma.settings.findUnique({
      where: { userId: session.user.id },
    })

    if (!settings?.aiApiKey) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 400 })
    }

    let prompt = ''

    switch (type) {
      case 'tone':
        prompt = `Analyze the tone and mood of this text. Describe the emotional atmosphere, writing style, and overall feeling it conveys:\n\n${content}`
        break
      case 'pacing':
        prompt = `Analyze the pacing of this text. Is it fast-paced or slow? Are there areas that drag or rush? Provide specific feedback:\n\n${content}`
        break
      case 'dialogue_ratio':
        prompt = `Analyze the balance between dialogue and description in this text. Calculate the approximate ratio and suggest if adjustments are needed:\n\n${content}`
        break
      case 'plot_holes':
        prompt = `Carefully analyze this text for any plot holes, inconsistencies, or logical gaps. List any issues you find:\n\n${content}`
        break
      case 'repetition':
        prompt = `Identify any repetitive words, phrases, or ideas in this text that should be varied:\n\n${content}`
        break
      case 'reading_time':
        const wordCount = content.split(/\s+/).length
        const readingTime = Math.ceil(wordCount / 200) // 200 words per minute
        return NextResponse.json({
          readingTime,
          wordCount,
          message: `Estimated reading time: ${readingTime} minute${readingTime !== 1 ? 's' : ''} (${wordCount} words at 200 wpm)`,
        })
      default:
        return NextResponse.json({ error: 'Invalid analysis type' }, { status: 400 })
    }

    const response = await fetch(`${settings.aiEndpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.aiApiKey}`,
      },
      body: JSON.stringify({
        model: settings.aiModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      throw new Error('AI analysis failed')
    }

    const data = await response.json()
    const analysis = data.choices[0]?.message?.content || ''

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
