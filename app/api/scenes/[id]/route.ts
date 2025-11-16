import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, wordCount } = await request.json()

    // Verify ownership
    const scene = await prisma.scene.findUnique({
      where: { id },
      include: {
        chapter: {
          include: {
            project: true,
          },
        },
      },
    })

    if (!scene || scene.chapter.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Update scene
    const updated = await prisma.scene.update({
      where: { id },
      data: {
        content,
        wordCount,
      },
    })

    // Update project's updatedAt
    await prisma.project.update({
      where: { id: scene.chapter.projectId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Scene update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
