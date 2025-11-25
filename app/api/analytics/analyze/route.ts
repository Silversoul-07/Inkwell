import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import {
  findRepetitions,
  calculateReadingTime,
  analyzeDialogueRatio,
  analyzeSentenceStructure,
  getPacingSuggestion,
} from '@/lib/story-analysis'

/**
 * POST /api/analytics/analyze - Analyze story content
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { text, chapterId, projectId } = body

    let contentToAnalyze = text

    // If chapterId provided, fetch chapter content
    if (chapterId && !text) {
      const chapter = await prisma.chapter.findFirst({
        where: { id: chapterId },
        include: { project: true },
      })

      if (!chapter || chapter.project.userId !== session.user.id) {
        return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
      }

      contentToAnalyze = chapter.content
    }

    // If projectId provided, analyze entire project
    if (projectId && !text && !chapterId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId: session.user.id,
        },
        include: {
          chapters: {
            orderBy: { order: 'asc' },
          },
        },
      })

      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }

      // Combine all chapter content
      const allChapters = project.chapters
      contentToAnalyze = allChapters.map((ch: any) => ch.content).join('\n\n')
    }

    if (!contentToAnalyze) {
      return NextResponse.json({ error: 'No content to analyze' }, { status: 400 })
    }

    // Perform all analyses
    const repetitions = findRepetitions(contentToAnalyze)
    const readingTime = calculateReadingTime(contentToAnalyze)
    const dialogueAnalysis = analyzeDialogueRatio(contentToAnalyze)
    const sentenceStructure = analyzeSentenceStructure(contentToAnalyze)
    const pacingSuggestion = getPacingSuggestion(sentenceStructure)

    return NextResponse.json({
      repetitions,
      readingTime,
      dialogueAnalysis,
      sentenceStructure,
      pacingSuggestion,
    })
  } catch (error) {
    console.error('Story analysis error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
