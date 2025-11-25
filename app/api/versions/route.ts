import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// GET /api/versions?chapterId={chapterId} - List version history for a chapter
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const chapterId = searchParams.get('chapterId')

    if (!chapterId) {
      return NextResponse.json({ error: 'chapterId is required' }, { status: 400 })
    }

    // Verify the chapter belongs to the user's project
    const chapter = await prisma.chapter.findFirst({
      where: {
        id: chapterId,
        project: {
          userId: session.user.id,
        },
      },
    })

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    // Version history feature is currently disabled as chapters are now versioned directly
    // Return the current chapter as the only "version"
    return NextResponse.json({
      versions: [
        {
          id: chapter.id,
          content: chapter.content,
          wordCount: chapter.wordCount,
          createdAt: chapter.updatedAt,
        },
      ],
    })
  } catch (error) {
    console.error('Error fetching versions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/versions - Chapter versioning is handled through direct chapter updates
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Version creation is now handled through chapter updates
    return NextResponse.json(
      { error: 'Version creation is now handled through chapter updates' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error creating version:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
