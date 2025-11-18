'use client'

import { useState } from 'react'
import { AgentSelector } from '@/components/agents/agent-selector'
import { AgentChat } from '@/components/agents/agent-chat'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, FolderOpen } from 'lucide-react'
import { AGENT_NAMES, type AgentType } from '@/lib/agents/system-prompts'
import { useToast } from '@/hooks/use-toast'

interface AgentsClientProps {
  conversations: any[]
  projects: Array<{ id: string; title: string }>
  userId: string
}

export function AgentsClient({ conversations, projects, userId }: AgentsClientProps) {
  const [activeConversation, setActiveConversation] = useState<any>(null)
  const [selectedProject, setSelectedProject] = useState<string | undefined>(undefined)
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  const handleSelectAgent = async (agentType: AgentType) => {
    setIsCreating(true)
    try {
      const response = await fetch('/api/agents/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType,
          projectId: selectedProject,
          title: `${AGENT_NAMES[agentType]} - ${new Date().toLocaleDateString()}`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create conversation')
      }

      const data = await response.json()
      setActiveConversation({
        ...data.conversation,
        messages: [],
      })
    } catch (error) {
      console.error('Error creating conversation:', error)
      toast({
        title: 'Error',
        description: 'Failed to start conversation. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleSelectConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/agents/conversations/${conversationId}`)

      if (!response.ok) {
        throw new Error('Failed to load conversation')
      }

      const data = await response.json()
      setActiveConversation(data.conversation)
    } catch (error) {
      console.error('Error loading conversation:', error)
      toast({
        title: 'Error',
        description: 'Failed to load conversation. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleBackToAgents = () => {
    setActiveConversation(null)
  }

  if (activeConversation) {
    return (
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBackToAgents}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">
                {AGENT_NAMES[activeConversation.agentType as AgentType]}
              </h1>
              {activeConversation.project && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <FolderOpen className="w-3 h-3" />
                  {activeConversation.project.title}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden">
          <AgentChat
            conversationId={activeConversation.id}
            agentType={activeConversation.agentType}
            projectId={activeConversation.projectId}
            initialMessages={activeConversation.messages.map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              toolCalls: m.toolCalls ? JSON.parse(m.toolCalls) : undefined,
              createdAt: new Date(m.createdAt),
            }))}
            agentName={AGENT_NAMES[activeConversation.agentType as AgentType]}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Project Selector */}
      {projects.length > 0 && (
        <div className="border-b p-4 bg-muted/50">
          <div className="max-w-6xl mx-auto flex items-center gap-4">
            <FolderOpen className="w-5 h-5 text-muted-foreground" />
            <label className="text-sm font-medium">Active Project:</label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="No project selected" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No project</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {selectedProject && selectedProject !== 'none'
                ? 'Agents will have access to this project'
                : 'Select a project for context-aware assistance'}
            </p>
          </div>
        </div>
      )}

      {/* Agent Selector */}
      <div className="max-w-6xl mx-auto">
        <AgentSelector
          onSelectAgent={handleSelectAgent}
          recentConversations={conversations.map(c => ({
            id: c.id,
            agentType: c.agentType,
            title: c.title,
            updatedAt: c.updatedAt,
          }))}
          onSelectConversation={handleSelectConversation}
        />
      </div>
    </div>
  )
}
