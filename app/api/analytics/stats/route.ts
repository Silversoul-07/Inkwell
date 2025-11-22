import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/analytics/stats - Get writing statistics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const period = searchParams.get('period') || '30' // days

    const daysAgo = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    // Build query filter
    const where: any = {
      userId: session.user.id,
      date: { gte: startDate },
    }
    if (projectId) {
      where.projectId = projectId
    }

    // Get writing sessions
    const sessions = await prisma.writingSession.findMany({
      where,
      orderBy: { date: 'asc' },
    })

    // Calculate statistics
    const totalWords = sessions.reduce((sum: number, s: any) => sum + s.wordsWritten, 0)
    const totalDuration = sessions.reduce((sum: number, s: any) => sum + s.duration, 0)
    const sessionCount = sessions.length

    // Calculate streak
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get all unique dates with sessions
    const sessionDates = (
      [
        ...new Set(
          sessions.map((s: any) => {
            const date = new Date(s.date)
            date.setHours(0, 0, 0, 0)
            return date.getTime()
          })
        ),
      ] as number[]
    ).sort((a: number, b: number) => b - a)

    // Calculate current streak
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      checkDate.setHours(0, 0, 0, 0)

      if (sessionDates.includes(checkDate.getTime())) {
        currentStreak++
      } else {
        break
      }
    }

    // Calculate longest streak
    for (let i = 0; i < sessionDates.length; i++) {
      if (i === 0) {
        tempStreak = 1
      } else {
        const dayDiff =
          ((sessionDates[i - 1] as number) - (sessionDates[i] as number)) / (1000 * 60 * 60 * 24)
        if (dayDiff <= 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    // Average words per session
    const avgWordsPerSession = sessionCount > 0 ? Math.round(totalWords / sessionCount) : 0
    const avgDurationPerSession = sessionCount > 0 ? Math.round(totalDuration / sessionCount) : 0

    // Group by date for chart data
    const dailyStats = sessions.reduce((acc: any, session: any) => {
      const date = new Date(session.date).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = { date, words: 0, duration: 0, sessions: 0 }
      }
      acc[date].words += session.wordsWritten
      acc[date].duration += session.duration
      acc[date].sessions += 1
      return acc
    }, {})

    const chartData = Object.values(dailyStats)

    // Get project breakdown if no specific project
    let projectBreakdown: any[] = []
    if (!projectId) {
      const projectSessions = await prisma.writingSession.groupBy({
        by: ['projectId'],
        where: {
          userId: session.user.id,
          date: { gte: startDate },
        },
        _sum: {
          wordsWritten: true,
          duration: true,
        },
        _count: {
          id: true,
        },
      })

      const projectIds = projectSessions.map((p: any) => p.projectId)
      const projects = await prisma.project.findMany({
        where: { id: { in: projectIds } },
        select: { id: true, title: true },
      })

      projectBreakdown = projectSessions.map((ps: any) => {
        const project = projects.find((p: any) => p.id === ps.projectId)
        return {
          projectId: ps.projectId,
          projectTitle: project?.title || 'Unknown',
          words: ps._sum.wordsWritten || 0,
          duration: ps._sum.duration || 0,
          sessions: ps._count.id,
        }
      })
    }

    return NextResponse.json({
      totalWords,
      totalDuration,
      sessionCount,
      currentStreak,
      longestStreak,
      avgWordsPerSession,
      avgDurationPerSession,
      chartData,
      projectBreakdown,
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
