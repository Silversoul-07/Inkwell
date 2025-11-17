import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// POST /api/writing-modes/activate - Activate a writing mode for a project
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, modeId } = body

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // If modeId is provided, verify it belongs to user
    if (modeId) {
      const mode = await prisma.writingMode.findFirst({
        where: {
          id: modeId,
          userId: session.user.id,
        },
      })

      if (!mode) {
        return NextResponse.json({ error: 'Mode not found' }, { status: 404 })
      }
    }

    // Update project with active mode
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        activeWritingMode: modeId || null,
      },
    })

    return NextResponse.json({ success: true, project: updated })
  } catch (error) {
    console.error('Writing mode activation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
