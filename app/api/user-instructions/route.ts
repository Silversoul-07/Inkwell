import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// GET /api/user-instructions - List user's instructions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const scope = searchParams.get('scope') // Filter by scope
    const projectId = searchParams.get('projectId')
    const characterId = searchParams.get('characterId')

    const where: any = {
      userId: session.user.id,
    }

    if (scope) {
      where.scope = scope
    }

    if (projectId) {
      where.projectId = projectId
    }

    if (characterId) {
      where.characterId = characterId
    }

    const instructions = await prisma.userInstructions.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(instructions)
  } catch (error) {
    console.error('User instructions fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/user-instructions - Create new instruction
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      scope,
      instructions,
      projectId,
      characterId,
      isEnabled,
      priority,
    } = body

    // Validation
    if (!scope || !instructions) {
      return NextResponse.json(
        { error: 'Scope and instructions are required' },
        { status: 400 }
      )
    }

    if (!['global', 'project', 'character'].includes(scope)) {
      return NextResponse.json(
        { error: 'Invalid scope. Must be global, project, or character' },
        { status: 400 }
      )
    }

    // Validate scope-specific requirements
    if (scope === 'project' && !projectId) {
      return NextResponse.json(
        { error: 'Project ID required for project scope' },
        { status: 400 }
      )
    }

    if (scope === 'character' && !characterId) {
      return NextResponse.json(
        { error: 'Character ID required for character scope' },
        { status: 400 }
      )
    }

    // Verify ownership
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId: session.user.id,
        },
      })

      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }
    }

    if (characterId) {
      const character = await prisma.character.findFirst({
        where: {
          id: characterId,
          project: {
            userId: session.user.id,
          },
        },
      })

      if (!character) {
        return NextResponse.json({ error: 'Character not found' }, { status: 404 })
      }
    }

    const instruction = await prisma.userInstructions.create({
      data: {
        scope,
        instructions,
        projectId: scope === 'project' ? projectId : null,
        characterId: scope === 'character' ? characterId : null,
        userId: scope === 'global' ? session.user.id : null,
        isEnabled: isEnabled !== undefined ? isEnabled : true,
        priority: priority || 0,
      },
    })

    return NextResponse.json(instruction)
  } catch (error) {
    console.error('User instruction creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
