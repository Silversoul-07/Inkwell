import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// GET /api/prompt-templates/export - Export all user templates
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const templates = await prisma.promptTemplate.findMany({
      where: {
        userId: session.user.id,
        isBuiltin: false, // Only export user-created templates
      },
      select: {
        name: true,
        description: true,
        action: true,
        template: true,
        variables: true,
        category: true,
        isDefault: true,
      },
    })

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      templates,
    }

    return NextResponse.json(exportData)
  } catch (error) {
    console.error('Template export error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
