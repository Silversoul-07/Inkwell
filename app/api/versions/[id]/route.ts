import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// PATCH /api/versions/{id} - Update a version (typically to set isActive or branchName)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { isActive, branchName } = body

    // Verify the version belongs to the user's scene
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
    })

    if (!version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    // If setting this version as active, deactivate all others in the scene
    if (isActive === true) {
      await prisma.version.updateMany({
        where: { sceneId: version.sceneId },
        data: { isActive: false },
      })
    }

    // Update the version
    const updatedVersion = await prisma.version.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(branchName !== undefined && { branchName }),
      },
    })

    return NextResponse.json({ version: updatedVersion })
  } catch (error) {
    console.error('Error updating version:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/versions/{id} - Delete a version
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify the version belongs to the user's scene
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
    })

    if (!version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    // Delete the version
    await prisma.version.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting version:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/versions/{id} - Get a specific version
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
      select: {
        id: true,
        content: true,
        branchName: true,
        parentId: true,
        isActive: true,
        wordCount: true,
        createdAt: true,
        sceneId: true,
      },
    })

    if (!version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    return NextResponse.json({ version })
  } catch (error) {
    console.error('Error fetching version:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
