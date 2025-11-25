import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// PATCH /api/versions/{id} - Version updates are now handled through chapter updates
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Version updates are now handled through chapter updates' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating version:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/versions/{id} - Delete a version (chapters cannot be deleted via this route)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Version deletion is not supported; delete the chapter instead' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error deleting version:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/versions/{id} - Get a specific chapter (formerly version)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get the chapter and verify it belongs to the user
    const chapter = await prisma.chapter.findFirst({
      where: {
        id,
        project: {
          userId: session.user.id,
        },
      },
    })

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    return NextResponse.json({
      version: {
        id: chapter.id,
        content: chapter.content,
        wordCount: chapter.wordCount,
        createdAt: chapter.updatedAt,
      },
    })
  } catch (error) {
    console.error('Error fetching version:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
