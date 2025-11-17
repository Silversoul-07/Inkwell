import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

type RouteParams = {
  params: Promise<{
    id: string
  }>
}

// GET /api/writing-modes/[id] - Get specific mode
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const mode = await prisma.writingMode.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!mode) {
      return NextResponse.json({ error: 'Mode not found' }, { status: 404 })
    }

    return NextResponse.json(mode)
  } catch (error) {
    console.error('Writing mode fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/writing-modes/[id] - Update mode
export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    // Check if mode exists and belongs to user
    const existing = await prisma.writingMode.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Mode not found' }, { status: 404 })
    }

    // Prevent editing built-in modes
    if (existing.isBuiltin) {
      return NextResponse.json(
        { error: 'Built-in modes cannot be edited' },
        { status: 403 }
      )
    }

    const updated = await prisma.writingMode.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.temperature !== undefined && { temperature: body.temperature }),
        ...(body.maxTokens !== undefined && { maxTokens: body.maxTokens }),
        ...(body.systemPrompt !== undefined && { systemPrompt: body.systemPrompt }),
        ...(body.continuePrompt !== undefined && { continuePrompt: body.continuePrompt }),
        ...(body.preferredActions && {
          preferredActions: JSON.stringify(body.preferredActions),
        }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Writing mode update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/writing-modes/[id] - Delete mode
export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    // Check if mode exists and belongs to user
    const existing = await prisma.writingMode.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Mode not found' }, { status: 404 })
    }

    // Prevent deleting built-in modes
    if (existing.isBuiltin) {
      return NextResponse.json(
        { error: 'Built-in modes cannot be deleted' },
        { status: 403 }
      )
    }

    await prisma.writingMode.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Writing mode deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
