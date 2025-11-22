import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const models = await prisma.aIModel.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    // If no models configured, return default fallback models
    if (models.length === 0) {
      return NextResponse.json([
        {
          id: 'claude-sonnet',
          name: 'Claude Sonnet 3.5',
          provider: 'anthropic',
          model: 'claude-3-5-sonnet-20241022',
          isDefault: true,
          isEnabled: true,
        },
        {
          id: 'gpt-4',
          name: 'GPT-4',
          provider: 'openai',
          model: 'gpt-4',
          isDefault: false,
          isEnabled: true,
        },
      ])
    }

    // Add isEnabled field if it doesn't exist (for compatibility)
    const modelsWithEnabled = models.map((m: any) => ({
      ...m,
      isEnabled: (m as any).isEnabled !== false,
    }))

    return NextResponse.json(modelsWithEnabled)
  } catch (error) {
    console.error('AI models fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, provider, apiKey, baseUrl, model, isDefault } = body

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.aIModel.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      })
    }

    const aiModel = await prisma.aIModel.create({
      data: {
        name,
        provider,
        apiKey,
        baseUrl,
        model,
        isDefault: isDefault || false,
        userId: session.user.id,
      },
    })

    return NextResponse.json(aiModel)
  } catch (error) {
    console.error('AI model creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
