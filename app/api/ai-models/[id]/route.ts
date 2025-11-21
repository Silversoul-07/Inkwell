import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Verify ownership
    const aiModel = await prisma.aIModel.findUnique({
      where: { id },
    })

    if (!aiModel || aiModel.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // If setting as default, unset other defaults
    if (body.isDefault) {
      await prisma.aIModel.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      })
    }

    const updated = await prisma.aIModel.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('AI model update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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

    const aiModel = await prisma.aIModel.findUnique({
      where: { id },
    })

    if (!aiModel || aiModel.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.aIModel.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('AI model deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
