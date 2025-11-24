import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// POST /api/versions/{id}/restore - Restore a version to the main scene
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get the version and verify it belongs to the user
    const version = await prisma.version.findFirst({
      where: {
        id,
        scene: {
          chapter: {
            project: {
              userId: session.user.id,
            },
          },
        },
      },
      include: {
        scene: {
          include: {
            chapter: {
              include: {
                project: true,
              },
            },
          },
        },
      },
    })

    if (!version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    // Before restoring, save the current scene content as a version
    const currentContent = version.scene.content
    const currentText = currentContent.replace(/<[^>]*>/g, ' ').trim()
    const currentWordCount = currentText ? currentText.split(/\s+/).length : 0

    await prisma.version.create({
      data: {
        sceneId: version.sceneId,
        content: currentContent,
        branchName: 'Auto-saved before restore',
        wordCount: currentWordCount,
        isActive: false,
      },
    })

    // Update the scene with the version's content
    const updatedScene = await prisma.scene.update({
      where: { id: version.sceneId },
      data: {
        content: version.content,
        wordCount: version.wordCount,
      },
    })

    // Update the project's updatedAt timestamp
    await prisma.project.update({
      where: { id: version.scene.chapter.projectId },
      data: { updatedAt: new Date() },
    })

    // Mark this version as active
    await prisma.version.updateMany({
      where: { sceneId: version.sceneId },
      data: { isActive: false },
    })

    await prisma.version.update({
      where: { id },
      data: { isActive: true },
    })

    return NextResponse.json({
      success: true,
      scene: updatedScene,
      restoredVersion: version,
    })
  } catch (error) {
    console.error('Error restoring version:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
