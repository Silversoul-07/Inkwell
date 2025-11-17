import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

type RouteParams = {
  params: Promise<{
    id: string
  }>
}

// GET /api/prompt-templates/[id] - Get specific template
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const template = await prisma.promptTemplate.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('Prompt template fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/prompt-templates/[id] - Update template
export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const {
      name,
      description,
      action,
      template,
      isDefault,
      category,
    } = body

    // Check if template exists and belongs to user
    const existing = await prisma.promptTemplate.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Prevent editing built-in templates
    if (existing.isBuiltin) {
      return NextResponse.json(
        { error: 'Built-in templates cannot be edited' },
        { status: 403 }
      )
    }

    // If setting as default, unset other defaults for this action
    if (isDefault && action) {
      await prisma.promptTemplate.updateMany({
        where: {
          userId: session.user.id,
          action,
          id: { not: id },
        },
        data: { isDefault: false },
      })
    }

    // Extract variables if template is being updated
    let varNames = existing.variables ? JSON.parse(existing.variables) : []
    if (template) {
      const extractedVars = template.match(/\{\{(\w+)\}\}/g) || []
      varNames = extractedVars.map((v: string) =>
        v.replace(/\{\{|\}\}/g, '')
      )
    }

    const updated = await prisma.promptTemplate.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(action && { action }),
        ...(template && {
          template,
          variables: JSON.stringify(varNames),
        }),
        ...(isDefault !== undefined && { isDefault }),
        ...(category && { category }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Prompt template update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/prompt-templates/[id] - Delete template
export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    // Check if template exists and belongs to user
    const existing = await prisma.promptTemplate.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Prevent deleting built-in templates
    if (existing.isBuiltin) {
      return NextResponse.json(
        { error: 'Built-in templates cannot be deleted' },
        { status: 403 }
      )
    }

    await prisma.promptTemplate.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Prompt template deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
