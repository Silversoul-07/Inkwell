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

    const body = await request.json()
    const { title, content, wordCount } = body

    // Verify ownership
    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: {
        project: true,
      },
    })

    if (!chapter || chapter.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Build update data object
    const updateData: {
      title?: string
      content?: string
      wordCount?: number
    } = {}

    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (wordCount !== undefined) updateData.wordCount = wordCount

    // Update chapter
    const updated = await prisma.chapter.update({
      where: { id },
      data: updateData,
    })

    // Update project's updatedAt
    await prisma.project.update({
      where: { id: chapter.projectId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Chapter update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: {
        project: true,
      },
    })

    if (!chapter || chapter.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Delete chapter (this will cascade delete scenes if configured in schema)
    await prisma.chapter.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Chapter delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
