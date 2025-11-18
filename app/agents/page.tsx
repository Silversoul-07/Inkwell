import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { AgentsClient } from './agents-client'
import { getAgentConversations } from '@/lib/agents/executor'
import { prisma } from '@/lib/prisma'

export default async function AgentsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  // Get recent conversations
  const conversations = await getAgentConversations(session.user.id)

  // Get user's projects for project selector
  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      title: true,
    },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <AgentsClient
      conversations={conversations}
      projects={projects}
      userId={session.user.id}
    />
  )
}
