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

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'projectId required' }, { status: 400 })
    }

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId, userId: session.user.id },
      include: {
        chapters: {
          include: {
            scenes: true,
          },
        },
        writingSessions: {
          orderBy: { date: 'desc' },
          take: 30, // Last 30 sessions
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Calculate statistics
    const totalWords = project.chapters.reduce(
      (total, chapter) =>
        total + chapter.scenes.reduce((sum, scene) => sum + scene.wordCount, 0),
      0
    )

    const totalSessions = await prisma.writingSession.count({
      where: { projectId },
    })

    const totalDuration = project.writingSessions.reduce(
      (sum, session) => sum + session.duration,
      0
    )

    const totalWordsWritten = project.writingSessions.reduce(
      (sum, session) => sum + session.wordsWritten,
      0
    )

    // Calculate streaks
    const allSessions = await prisma.writingSession.findMany({
      where: { projectId },
      orderBy: { date: 'desc' },
      select: { date: true },
    })

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const sessionDates = allSessions.map((s) => {
      const d = new Date(s.date)
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    })

    const uniqueDates = [...new Set(sessionDates)].sort((a, b) => b - a)

    for (let i = 0; i < uniqueDates.length; i++) {
      const date = uniqueDates[i]
      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - i)
      expectedDate.setHours(0, 0, 0, 0)

      if (date === expectedDate.getTime()) {
        currentStreak++
        tempStreak++
      } else if (i === 0) {
        // Today is missing, check from yesterday
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        if (date === yesterday.getTime()) {
          currentStreak++
          tempStreak++
        } else {
          break
        }
      } else {
        break
      }
    }

    // Calculate longest streak
    tempStreak = 0
    for (let i = 0; i < uniqueDates.length; i++) {
      if (i === 0) {
        tempStreak = 1
      } else {
        const prevDate = uniqueDates[i - 1]
        const currDate = uniqueDates[i]
        const diffDays = Math.round((prevDate - currDate) / (1000 * 60 * 60 * 24))

        if (diffDays === 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    // Average words per session
    const avgWordsPerSession =
      totalSessions > 0 ? Math.round(totalWordsWritten / totalSessions) : 0

    // Average session duration
    const avgSessionDuration =
      totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0

    // Chapter pacing (words per chapter)
    const chapterPacing = project.chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      wordCount: chapter.scenes.reduce((sum, scene) => sum + scene.wordCount, 0),
      sceneCount: chapter.scenes.length,
    }))

    return NextResponse.json({
      totalWords,
      totalSessions,
      totalDuration,
      totalWordsWritten,
      currentStreak,
      longestStreak,
      avgWordsPerSession,
      avgSessionDuration,
      chapterPacing,
      recentSessions: project.writingSessions,
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Log a writing session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, wordsWritten, duration } = await request.json()

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId, userId: session.user.id },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const writingSession = await prisma.writingSession.create({
      data: {
        userId: session.user.id,
        projectId,
        wordsWritten: wordsWritten || 0,
        duration: duration || 0,
      },
    })

    return NextResponse.json(writingSession, { status: 201 })
  } catch (error) {
    console.error('Session logging error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
