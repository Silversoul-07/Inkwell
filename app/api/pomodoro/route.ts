import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/pomodoro - Create a new pomodoro session
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, duration } = body

    if (!projectId || !duration) {
      return NextResponse.json(
        { error: 'projectId and duration are required' },
        { status: 400 }
      )
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const pomodoroSession = await prisma.pomodoroSession.create({
      data: {
        userId: session.user.id,
        projectId,
        duration,
        startTime: new Date(),
      },
    })

    return NextResponse.json(pomodoroSession, { status: 201 })
  } catch (error) {
    console.error('Pomodoro session creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/pomodoro - Get pomodoro sessions
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = { userId: session.user.id }
    if (projectId) {
      where.projectId = projectId
    }

    const sessions = await prisma.pomodoroSession.findMany({
      where,
      orderBy: { startTime: 'desc' },
      take: limit,
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Pomodoro session fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
