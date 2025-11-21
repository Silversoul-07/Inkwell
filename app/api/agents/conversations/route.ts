// API route for managing agent conversations

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { createAgentConversation, getAgentConversations } from '@/lib/agents/executor'
import type { AgentType } from '@/lib/agents/system-prompts'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId') || undefined

    const conversations = await getAgentConversations(session.user.id, projectId)

    return NextResponse.json({ conversations })
  } catch (error: any) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { agentType, projectId, title } = body

    if (!agentType) {
      return NextResponse.json({ error: 'agentType is required' }, { status: 400 })
    }

    const conversation = await createAgentConversation(
      session.user.id,
      agentType as AgentType,
      projectId,
      title
    )

    // Return conversation directly for easier client handling
    return NextResponse.json(conversation)
  } catch (error: any) {
    console.error('Error creating conversation:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
