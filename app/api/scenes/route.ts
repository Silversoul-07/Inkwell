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
    const { chapterId, title } = body

    // Verify chapter exists and user owns the project
    const chapter = await prisma.chapter.findFirst({
      where: {
        id: chapterId,
        project: {
          userId: session.user.id,
        },
      },
      include: {
        scenes: {
          orderBy: { order: 'desc' },
          take: 1,
        },
      },
    })

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    // Calculate next order
    const nextOrder = (chapter.scenes[0]?.order || 0) + 1

    // Create scene
    const scene = await prisma.scene.create({
      data: {
        title: title || `Scene ${nextOrder}`,
        content: '',
        wordCount: 0,
        order: nextOrder,
        chapterId,
      },
    })

    return NextResponse.json(scene)
  } catch (error) {
    console.error('Scene creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
