import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// GET /api/prompt-templates - List user's prompt templates
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') // Filter by action type
    const category = searchParams.get('category') // Filter by category

    const where: any = {
      userId: session.user.id,
    }

    if (action) {
      where.action = action
    }

    if (category) {
      where.category = category
    }

    const templates = await prisma.promptTemplate.findMany({
      where,
      orderBy: [
        { isDefault: 'desc' }, // Defaults first
        { isBuiltin: 'desc' }, // Built-ins before custom
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Prompt templates fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/prompt-templates - Create new prompt template
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      action,
      template,
      variables,
      isDefault,
      category,
    } = body

    // Validation
    if (!name || !action || !template) {
      return NextResponse.json(
        { error: 'Name, action, and template are required' },
        { status: 400 }
      )
    }

    // If setting as default, unset other defaults for this action
    if (isDefault) {
      await prisma.promptTemplate.updateMany({
        where: {
          userId: session.user.id,
          action,
        },
        data: { isDefault: false },
      })
    }

    // Extract variables from template ({{variable}} format)
    const extractedVars = template.match(/\{\{(\w+)\}\}/g) || []
    const varNames = extractedVars.map((v: string) =>
      v.replace(/\{\{|\}\}/g, '')
    )

    const promptTemplate = await prisma.promptTemplate.create({
      data: {
        name,
        description,
        action,
        template,
        variables: JSON.stringify(varNames),
        isDefault: isDefault || false,
        isBuiltin: false, // User-created templates are never built-in
        category: category || 'custom',
        userId: session.user.id,
      },
    })

    return NextResponse.json(promptTemplate)
  } catch (error) {
    console.error('Prompt template creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
