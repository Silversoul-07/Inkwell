import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// POST /api/prompt-templates/import - Import templates from JSON
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { templates } = body

    if (!templates || !Array.isArray(templates)) {
      return NextResponse.json(
        { error: 'Templates array is required' },
        { status: 400 }
      )
    }

    // Validate templates
    for (const template of templates) {
      if (!template.name || !template.action || !template.template) {
        return NextResponse.json(
          { error: 'Each template must have name, action, and template fields' },
          { status: 400 }
        )
      }
    }

    // Import templates
    const imported = []
    for (const template of templates) {
      const created = await prisma.promptTemplate.create({
        data: {
          name: template.name,
          description: template.description,
          action: template.action,
          template: template.template,
          variables: template.variables,
          isDefault: template.isDefault || false,
          isBuiltin: false, // Imported templates are not built-in
          category: template.category || 'custom',
          userId: session.user.id,
        },
      })
      imported.push(created)
    }

    return NextResponse.json({
      success: true,
      count: imported.length,
      templates: imported,
    })
  } catch (error) {
    console.error('Template import error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
