import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

type RouteParams = {
  params: Promise<{
    id: string
  }>
}

// PATCH /api/user-instructions/[id] - Update instruction
export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    // Check ownership
    const existing = await prisma.userInstructions.findFirst({
      where: {
        id,
        OR: [
          { userId: session.user.id },
          {
            project: {
              userId: session.user.id,
            },
          },
          {
            character: {
              project: {
                userId: session.user.id,
              },
            },
          },
        ],
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Instruction not found' }, { status: 404 })
    }

    const updated = await prisma.userInstructions.update({
      where: { id },
      data: {
        ...(body.instructions && { instructions: body.instructions }),
        ...(body.isEnabled !== undefined && { isEnabled: body.isEnabled }),
        ...(body.priority !== undefined && { priority: body.priority }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('User instruction update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/user-instructions/[id] - Delete instruction
export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    // Check ownership
    const existing = await prisma.userInstructions.findFirst({
      where: {
        id,
        OR: [
          { userId: session.user.id },
          {
            project: {
              userId: session.user.id,
            },
          },
          {
            character: {
              project: {
                userId: session.user.id,
              },
            },
          },
        ],
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Instruction not found' }, { status: 404 })
    }

    await prisma.userInstructions.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('User instruction deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
