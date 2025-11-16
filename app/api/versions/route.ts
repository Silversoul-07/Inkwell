import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// Create a new version branch
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sceneId, content, branchName, parentId } = await request.json()

    // Verify ownership
    const scene = await prisma.scene.findUnique({
      where: { id: sceneId },
      include: { chapter: { include: { project: true } } },
    })

    if (!scene || scene.chapter.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Calculate word count
    const text = content.replace(/<[^>]*>/g, '').trim()
    const wordCount = text ? text.split(/\s+/).length : 0

    // Create new version
    const version = await prisma.version.create({
      data: {
        sceneId,
        content,
        branchName: branchName || `Branch ${new Date().toLocaleString()}`,
        parentId,
        wordCount,
        isActive: false,
      },
    })

    return NextResponse.json(version, { status: 201 })
  } catch (error) {
    console.error('Version creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get all versions for a scene
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
    const scene = await prisma.scene.findUnique({
      where: { id: sceneId },
      include: { chapter: { include: { project: true } } },
    })

    if (!scene || scene.chapter.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const versions = await prisma.version.findMany({
      where: { sceneId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(versions)
  } catch (error) {
    console.error('Version fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
