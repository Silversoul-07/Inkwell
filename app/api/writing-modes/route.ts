import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// GET /api/writing-modes - List user's writing modes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const modes = await prisma.writingMode.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [
        { isBuiltin: 'desc' }, // Built-ins first
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(modes)
  } catch (error) {
    console.error('Writing modes fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/writing-modes - Create new writing mode
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      temperature,
      maxTokens,
      systemPrompt,
      continuePrompt,
      preferredActions,
    } = body

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const mode = await prisma.writingMode.create({
      data: {
        name,
        description,
        temperature: temperature || 0.7,
        maxTokens: maxTokens || 500,
        systemPrompt,
        continuePrompt,
        preferredActions: preferredActions ? JSON.stringify(preferredActions) : null,
        isBuiltin: false, // User-created modes are never built-in
        userId: session.user.id,
      },
    })

    return NextResponse.json(mode)
  } catch (error) {
    console.error('Writing mode creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
