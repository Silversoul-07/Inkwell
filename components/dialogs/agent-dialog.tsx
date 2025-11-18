'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AgentSelector } from '@/components/agents/agent-selector'
import { AgentChat } from '@/components/agents/agent-chat'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FolderOpen } from 'lucide-react'
import { AGENT_NAMES, type AgentType } from '@/lib/agents/system-prompts'
import { useToast } from '@/hooks/use-toast'

interface AgentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentProjectId?: string
  projects?: Array<{ id: string; title: string }>
}

export function AgentDialog({ open, onOpenChange, currentProjectId, projects = [] }: AgentDialogProps) {
  const [activeConversation, setActiveConversation] = useState<any>(null)
  const [selectedProject, setSelectedProject] = useState<string | undefined>(currentProjectId)
  const [conversations, setConversations] = useState<any[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  // Fetch conversations when dialog opens
  useEffect(() => {
    if (open) {
      fetchConversations()
    }
  }, [open])

  // Update selected project when currentProjectId changes
  useEffect(() => {
    if (currentProjectId) {
      setSelectedProject(currentProjectId)
    }
  }, [currentProjectId])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/agents/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

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

  const handleClose = () => {
    setActiveConversation(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <DialogHeader className="border-b p-4 flex-shrink-0">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={handleBackToAgents}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <DialogTitle>
                    {AGENT_NAMES[activeConversation.agentType as AgentType]}
                  </DialogTitle>
                  {activeConversation.project && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <FolderOpen className="w-3 h-3" />
                      {activeConversation.project.title}
                    </p>
                  )}
                </div>
              </div>
            </DialogHeader>

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
          </>
        ) : (
          <>
            {/* Agent Selector Header */}
            <DialogHeader className="border-b p-6 flex-shrink-0">
              <DialogTitle className="text-2xl">AI Writing Assistants</DialogTitle>
              {projects.length > 0 && (
                <div className="flex items-center gap-4 mt-4">
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
                </div>
              )}
            </DialogHeader>

            {/* Agent Selector */}
            <div className="flex-1 overflow-y-auto p-6">
              <AgentSelector
                onSelectAgent={handleSelectAgent}
                recentConversations={conversations.slice(0, 3).map(c => ({
                  id: c.id,
                  agentType: c.agentType,
                  title: c.title,
                  updatedAt: c.updatedAt,
                }))}
                onSelectConversation={handleSelectConversation}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
