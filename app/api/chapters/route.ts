import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, title } = body

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
      include: {
        chapters: {
          orderBy: { order: 'desc' },
          take: 1,
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Calculate next order
    const nextOrder = (project.chapters[0]?.order || 0) + 1

    // Create chapter with a default scene
    const chapter = await prisma.chapter.create({
      data: {
        title: title || `Chapter ${nextOrder}`,
        order: nextOrder,
        projectId,
        scenes: {
          create: {
            title: 'Scene 1',
            content: '',
            wordCount: 0,
            order: 1,
          },
        },
      },
      include: {
        scenes: true,
      },
    })

    return NextResponse.json(chapter)
  } catch (error) {
    console.error('Chapter creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
