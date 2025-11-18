'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bot, MessageSquare, History } from 'lucide-react'
import { AGENT_NAMES, AGENT_DESCRIPTIONS, AGENT_ICONS, type AgentType } from '@/lib/agents/system-prompts'

interface AgentSelectorProps {
  onSelectAgent: (agentType: AgentType) => void
  recentConversations?: Array<{
    id: string
    agentType: AgentType
    title?: string
    updatedAt: Date
  }>
  onSelectConversation?: (conversationId: string) => void
}

export function AgentSelector({
  onSelectAgent,
  recentConversations = [],
  onSelectConversation,
}: AgentSelectorProps) {
  const agentTypes: AgentType[] = ['world-building', 'character-development', 'story-planning']

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Bot className="w-8 h-8" />
          AI Agents
        </h1>
        <p className="text-muted-foreground">
          Specialized AI assistants to help with different aspects of your writing
        </p>
      </div>

      {/* Recent Conversations */}
      {recentConversations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Recent Conversations</h2>
          </div>
          <div className="grid gap-3">
            {recentConversations.slice(0, 3).map(conv => (
              <Card
                key={conv.id}
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => onSelectConversation?.(conv.id)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="text-2xl">{AGENT_ICONS[conv.agentType]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {conv.title || AGENT_NAMES[conv.agentType]}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <MessageSquare className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Agent Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Start New Conversation</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agentTypes.map(agentType => (
            <Card
              key={agentType}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onSelectAgent(agentType)}
            >
              <CardHeader>
                <div className="text-4xl mb-2">{AGENT_ICONS[agentType]}</div>
                <CardTitle className="text-lg">{AGENT_NAMES[agentType]}</CardTitle>
                <CardDescription className="text-sm">
                  {AGENT_DESCRIPTIONS[agentType]}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Start Conversation
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">How AI Agents Work</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span>•</span>
              <span>
                Each agent specializes in a specific aspect of writing and has access to your
                project data
              </span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>
                Agents can create lorebook entries, save insights, and analyze your story
              </span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>
                Conversations are saved and agents remember context from previous discussions
              </span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>You can have multiple active conversations with different agents</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
