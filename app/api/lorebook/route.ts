import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      projectId,
      key,
      value,
      category,
      keys,
      triggerMode = 'auto',
      priority = 0,
      searchable = true,
      regexPattern,
      contextStrategy = 'full',
      thumbnail,
      images,
      subcategory,
      relatedEntries,
      tags,
      aliases,
      color,
      summary,
      spoilerLevel = 0,
      timeframe,
      isCanon = true,
      isArchived = false,
    } = body

    const project = await prisma.project.findUnique({
      where: { id: projectId, userId: session.user.id },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const entry = await prisma.lorebookEntry.create({
      data: {
        projectId,
        key,
        value,
        category,
        keys,
        triggerMode,
        priority,
        searchable,
        regexPattern,
        contextStrategy,
        thumbnail,
        images,
        subcategory,
        relatedEntries,
        tags,
        aliases,
        color,
        summary,
        spoilerLevel,
        timeframe,
        isCanon,
        isArchived,
      },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Lorebook creation error:', error)
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
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const category = searchParams.get('category')

    if (!projectId) {
      return NextResponse.json({ error: 'projectId required' }, { status: 400 })
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId, userId: session.user.id },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const where: any = { projectId, isArchived: false }
    if (category) {
      where.category = category
    }

    const orderBy: any = {}
    if (sortBy === 'priority') {
      orderBy.priority = 'desc'
    } else if (sortBy === 'useCount') {
      orderBy.useCount = 'desc'
    } else if (sortBy === 'lastUsed') {
      orderBy.lastUsed = 'desc'
    } else {
      orderBy.createdAt = 'desc'
    }

    const entries = await prisma.lorebookEntry.findMany({
      where,
      orderBy,
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Lorebook fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
