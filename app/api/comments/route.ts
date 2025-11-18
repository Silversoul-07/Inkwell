import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/comments - Create a new comment
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sceneId, content, commentId, startPos, endPos } = body

    if (!sceneId || !content) {
      return NextResponse.json(
        { error: 'sceneId and content are required' },
        { status: 400 }
      )
    }

    // Verify scene ownership
    const scene = await prisma.scene.findFirst({
      where: { id: sceneId },
      include: { chapter: { include: { project: true } } },
    })

    if (!scene || scene.chapter.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 })
    }

    const comment = await prisma.comment.create({
      data: {
        sceneId,
        userId: session.user.id,
        content,
        startPos: startPos || 0,
        endPos: endPos || 0,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Comment creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/comments - Get comments for a scene
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sceneId = searchParams.get('sceneId')

    if (!sceneId) {
      return NextResponse.json({ error: 'sceneId required' }, { status: 400 })
    }

    // Verify ownership
    const scene = await prisma.scene.findFirst({
      where: { id: sceneId },
      include: { chapter: { include: { project: true } } },
    })

    if (!scene || scene.chapter.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 })
    }

    const comments = await prisma.comment.findMany({
      where: { sceneId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Comments fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
