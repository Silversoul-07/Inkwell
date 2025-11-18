import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { builtinTemplates, builtinModes, exampleInstructions } from '@/prisma/seed'

/**
 * POST /api/initialize-defaults - Initialize default templates, modes, and instructions for user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Check if user already has templates
    const existingTemplates = await prisma.promptTemplate.count({
      where: { userId },
    })

    const existingModes = await prisma.writingMode.count({
      where: { userId },
    })

    const existingInstructions = await prisma.userInstructions.count({
      where: { userId },
    })

    let created = {
      templates: 0,
      modes: 0,
      instructions: 0,
    }

    // Create built-in templates
    if (existingTemplates === 0) {
      for (const template of builtinTemplates) {
        await prisma.promptTemplate.create({
          data: {
            ...template,
            userId,
          },
        })
        created.templates++
      }
    }

    // Create built-in writing modes
    if (existingModes === 0) {
      for (const mode of builtinModes) {
        await prisma.writingMode.create({
          data: {
            ...mode,
            userId,
          },
        })
        created.modes++
      }
    }

    // Create example user instructions
    if (existingInstructions === 0) {
      for (const instruction of exampleInstructions) {
        await prisma.userInstructions.create({
          data: {
            ...instruction,
            userId,
          },
        })
        created.instructions++
      }
    }

    return NextResponse.json({
      message: 'Defaults initialized successfully',
      created,
      skipped: {
        templates: existingTemplates > 0,
        modes: existingModes > 0,
        instructions: existingInstructions > 0,
      },
    })
  } catch (error) {
    console.error('Initialize defaults error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
