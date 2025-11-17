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
    const { text, sceneId, projectId } = body

    let contentToAnalyze = text

    // If sceneId provided, fetch scene content
    if (sceneId && !text) {
      const scene = await prisma.scene.findFirst({
        where: { id: sceneId },
        include: { chapter: { include: { project: true } } },
      })

      if (!scene || scene.chapter.project.userId !== session.user.id) {
        return NextResponse.json({ error: 'Scene not found' }, { status: 404 })
      }

      contentToAnalyze = scene.content
    }

    // If projectId provided, analyze entire project
    if (projectId && !text && !sceneId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId: session.user.id,
        },
        include: {
          chapters: {
            include: {
              scenes: true,
            },
            orderBy: { order: 'asc' },
          },
        },
      })

      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }

      // Combine all scene content
      const allScenes = project.chapters.flatMap((ch) => ch.scenes)
      contentToAnalyze = allScenes.map((s) => s.content).join('\n\n')
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
