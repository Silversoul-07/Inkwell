import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// Activate a specific version (make it the current scene content)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const version = await prisma.version.findUnique({
      where: { id: params.id },
      include: {
        scene: {
          include: {
            chapter: {
              include: { project: true },
            },
          },
        },
      },
    })

    if (!version || version.scene.chapter.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Update scene with version content
    await prisma.scene.update({
      where: { id: version.sceneId },
      data: {
        content: version.content,
        wordCount: version.wordCount,
      },
    })

    // Mark this version as active
    await prisma.version.updateMany({
      where: { sceneId: version.sceneId },
      data: { isActive: false },
    })

    await prisma.version.update({
      where: { id: params.id },
      data: { isActive: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Version activation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete a version
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const version = await prisma.version.findUnique({
      where: { id: params.id },
      include: {
        scene: {
          include: {
            chapter: {
              include: { project: true },
            },
          },
        },
      },
    })

    if (!version || version.scene.chapter.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.version.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Version deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
