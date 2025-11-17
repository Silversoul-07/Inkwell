import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

// POST /api/prompt-templates/test - Test template with sample variables
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { template, variables } = body

    if (!template) {
      return NextResponse.json(
        { error: 'Template is required' },
        { status: 400 }
      )
    }

    // Replace variables with provided values
    let result = template
    if (variables && typeof variables === 'object') {
      Object.keys(variables).forEach((key) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
        result = result.replace(regex, variables[key])
      })
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error('Template test error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
