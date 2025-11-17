import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import {
  matchLorebookEntries,
  formatTriggeredEntries,
  recordLorebookUsage,
} from '@/lib/lorebook-matcher'

/**
 * POST /api/lorebook/match
 * Find and return lorebook entries that match the given context
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      projectId,
      context,
      maxEntries = 10,
      tokenBudget = 2000,
      recordUsage = true,
    } = body

    if (!projectId || !context) {
      return NextResponse.json(
        { error: 'projectId and context are required' },
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

    // Fetch all lorebook entries for the project
    const entries = await prisma.lorebookEntry.findMany({
      where: { projectId },
    })

    // Match entries based on context
    const triggered = matchLorebookEntries(entries, context, {
      maxEntries,
      tokenBudget,
    })

    // Record usage if requested
    if (recordUsage && triggered.length > 0) {
      const entryIds = triggered.map((t) => t.entry.id)
      await recordLorebookUsage(entryIds, prisma)
    }

    // Format for AI context
    const formattedContext = formatTriggeredEntries(triggered)

    return NextResponse.json({
      triggered: triggered.map((t) => ({
        id: t.entry.id,
        key: t.entry.key,
        value: t.entry.value,
        category: t.entry.category,
        matchedKeywords: t.matchedKeywords,
        relevanceScore: t.relevanceScore,
      })),
      formattedContext,
      count: triggered.length,
    })
  } catch (error) {
    console.error('Lorebook match error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
