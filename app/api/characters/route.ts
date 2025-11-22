import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createCharacterSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1),
  age: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  appearance: z.string().optional().nullable(),
  traits: z.string().optional().nullable(),
  background: z.string().optional().nullable(),
  voice: z.string().optional().nullable(),
  relationships: z.string().optional().nullable(),
  goals: z.string().optional().nullable(),
  abilities: z.string().optional().nullable(),
  equipment: z.string().optional().nullable(),
  fears: z.string().optional().nullable(),
  secrets: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  images: z.string().optional().nullable(),
  aliases: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  isMainCharacter: z.boolean().optional(),
  notes: z.string().optional().nullable(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createCharacterSchema.parse(body)

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: data.projectId, userId: session.user.id },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const character = await prisma.character.create({
      data,
    })

    return NextResponse.json(character, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Character creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'projectId required' }, { status: 400 })
    }

    // Verify ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId, userId: session.user.id },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const characters = await prisma.character.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(characters)
  } catch (error) {
    console.error('Characters fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
