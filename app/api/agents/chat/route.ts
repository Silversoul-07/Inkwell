// API route for agent chat interactions

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { executeAgent } from '@/lib/agents/executor'
import type { AgentType } from '@/lib/agents/system-prompts'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { conversationId, projectId, message, agentType } = body

    if (!conversationId || !message || !agentType) {
      return NextResponse.json(
        { error: 'conversationId, message, and agentType are required' },
        { status: 400 }
      )
    }

    const response = await executeAgent({
      conversationId,
      userId: session.user.id,
      projectId,
      userMessage: message,
      agentType: agentType as AgentType,
    })

    return NextResponse.json({ message: response })
  } catch (error: any) {
    console.error('Error executing agent:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
