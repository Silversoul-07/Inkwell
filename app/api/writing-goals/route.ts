import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/writing-goals - Create a new writing goal
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, targetWords, projectId, endDate } = body

    if (!type || !targetWords) {
      return NextResponse.json(
        { error: 'type and targetWords are required' },
        { status: 400 }
      )
    }

    // Validate type
    if (!['daily', 'weekly', 'project'].includes(type)) {
      return NextResponse.json(
        { error: 'type must be daily, weekly, or project' },
        { status: 400 }
      )
    }

    // If project goal, verify project ownership
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId: session.user.id,
        },
      })

      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }
    }

    const goal = await prisma.writingGoal.create({
      data: {
        userId: session.user.id,
        projectId: projectId || null,
        type,
        targetWords,
        endDate: endDate ? new Date(endDate) : null,
      },
    })

    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    console.error('Writing goal creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/writing-goals - Get writing goals
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const isActive = searchParams.get('isActive')

    const where: any = { userId: session.user.id }
    if (projectId) {
      where.projectId = projectId
    }
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    const goals = await prisma.writingGoal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    // Calculate progress for each goal
    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        let wordsWritten = 0

        // Calculate based on goal type
        if (goal.type === 'daily') {
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)

          const sessions = await prisma.writingSession.findMany({
            where: {
              userId: session.user.id,
              date: { gte: today, lt: tomorrow },
              ...(goal.projectId ? { projectId: goal.projectId } : {}),
            },
          })

          wordsWritten = sessions.reduce((sum, s) => sum + s.wordsWritten, 0)
        } else if (goal.type === 'weekly') {
          const today = new Date()
          const weekStart = new Date(today)
          weekStart.setDate(today.getDate() - today.getDay())
          weekStart.setHours(0, 0, 0, 0)

          const sessions = await prisma.writingSession.findMany({
            where: {
              userId: session.user.id,
              date: { gte: weekStart },
              ...(goal.projectId ? { projectId: goal.projectId } : {}),
            },
          })

          wordsWritten = sessions.reduce((sum, s) => sum + s.wordsWritten, 0)
        } else if (goal.type === 'project' && goal.projectId) {
          const project = await prisma.project.findUnique({
            where: { id: goal.projectId },
            include: {
              chapters: {
                include: {
                  scenes: true,
                },
              },
            },
          })

          if (project) {
            wordsWritten = project.chapters.reduce(
              (sum, chapter) =>
                sum + chapter.scenes.reduce((s, scene) => s + scene.wordCount, 0),
              0
            )
          }
        }

        const progress = goal.targetWords > 0
          ? Math.min(Math.round((wordsWritten / goal.targetWords) * 100), 100)
          : 0

        return {
          ...goal,
          wordsWritten,
          progress,
        }
      })
    )

    return NextResponse.json(goalsWithProgress)
  } catch (error) {
    console.error('Writing goals fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
