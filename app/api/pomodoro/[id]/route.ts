import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/pomodoro/:id - Complete or update a pomodoro session
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    // Verify ownership
    const pomodoroSession = await prisma.pomodoroSession.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!pomodoroSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const updatedSession = await prisma.pomodoroSession.update({
      where: { id },
      data: {
        ...body,
        completedAt: body.completedAt || new Date(),
      },
    })

    return NextResponse.json(updatedSession)
  } catch (error) {
    console.error('Pomodoro session update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/pomodoro/:id - Delete a pomodoro session
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    // Verify ownership
    const pomodoroSession = await prisma.pomodoroSession.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!pomodoroSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    await prisma.pomodoroSession.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Pomodoro session deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
