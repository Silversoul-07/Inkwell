import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// POST /api/versions/{id}/restore - Version restoration is handled through chapter updates
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
      include: {
        project: true,
      },
    })

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    // Version restoration is no longer supported as versions are now handled through SQLite/database directly
    return NextResponse.json(
      {
        success: false,
        message: 'Version restoration is not available in the new architecture',
        note: 'Chapters are versioned automatically through the database. To restore content, manually update the chapter.',
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error restoring version:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
