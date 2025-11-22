import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// GET /api/versions?sceneId={sceneId} - List versions for a scene
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sceneId = searchParams.get('sceneId')

    if (!sceneId) {
      return NextResponse.json({ error: 'sceneId is required' }, { status: 400 })
    }

    // Verify the scene belongs to the user's project
    const scene = await prisma.scene.findFirst({
      where: {
        id: sceneId,
        chapter: {
          project: {
            userId: session.user.id,
          },
        },
      },
    })

    if (!scene) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 })
    }

    // Get all versions for this scene, ordered by creation date (newest first)
    const versions = await prisma.version.findMany({
      where: { sceneId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        branchName: true,
        parentId: true,
        isActive: true,
        wordCount: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ versions })
  } catch (error) {
    console.error('Error fetching versions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/versions - Create a new version
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sceneId, content, branchName, parentId, isActive } = body

    if (!sceneId || content === undefined) {
      return NextResponse.json({ error: 'sceneId and content are required' }, { status: 400 })
    }

    // Verify the scene belongs to the user's project
    const scene = await prisma.scene.findFirst({
      where: {
        id: sceneId,
        chapter: {
          project: {
            userId: session.user.id,
          },
        },
      },
    })

    if (!scene) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 })
    }

    // Calculate word count
    const text = content.replace(/<[^>]*>/g, ' ').trim()
    const wordCount = text ? text.split(/\s+/).length : 0

    // If this version should be active, deactivate all other versions
    if (isActive) {
      await prisma.version.updateMany({
        where: { sceneId },
        data: { isActive: false },
      })
    }

    // Create the new version
    const version = await prisma.version.create({
      data: {
        sceneId,
        content,
        branchName: branchName || null,
        parentId: parentId || null,
        isActive: isActive ?? false,
        wordCount,
      },
    })

    return NextResponse.json({ version }, { status: 201 })
  } catch (error) {
    console.error('Error creating version:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
