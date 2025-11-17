'use client'

import { useState } from 'react'
import { X, Settings, Bug, MessageCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AICanvas } from './ai-canvas'
import { ModelConfig } from '@/components/ai/model-config'
import { ContextDebugPanel } from './context-debug-panel'
import { CommentSidebar } from '@/components/comments/comment-sidebar'
import { cn } from '@/lib/utils'

interface RightSidebarPanelProps {
  isOpen: boolean
  onClose: () => void
  sceneContext: string
  selectedText: string
  projectId: string
  sceneId: string
  onReplaceSelection?: (text: string) => void
  onInsertText?: (text: string) => void
}

export function RightSidebarPanel({
  isOpen,
  onClose,
  sceneContext,
  selectedText,
  projectId,
  sceneId,
  onReplaceSelection,
  onInsertText,
}: RightSidebarPanelProps) {
  const [activeTab, setActiveTab] = useState<'canvas' | 'model' | 'writer' | 'comments' | 'debug'>('canvas')

  if (!isOpen) return null

  const tabs = [
    {
      id: 'canvas' as const,
      label: 'AI Canvas',
      icon: Sparkles,
      description: 'AI writing assistance',
    },
    {
      id: 'model' as const,
      label: 'Model',
      icon: Settings,
      description: 'AI configuration',
    },
    {
      id: 'comments' as const,
      label: 'Comments',
      icon: MessageCircle,
      description: 'Scene comments',
    },
    {
      id: 'debug' as const,
      label: 'Debug',
      icon: Bug,
      description: 'Context info',
    },
  ]

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[440px] bg-gradient-to-b from-card to-card/95 border-l border-border z-50 flex flex-col shadow-2xl backdrop-blur-sm">
      {/* Enhanced Header */}
      <div className="px-4 py-3.5 border-b border-border/60 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">AI Assistant</h2>
            <p className="text-xs text-muted-foreground">
              {tabs.find(t => t.id === activeTab)?.description}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Vertical Tab Navigation */}
      <div className="flex border-b border-border/60 bg-muted/20">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex flex-col items-center gap-1.5 px-3 py-3 text-xs font-medium transition-all relative',
                isActive
                  ? 'text-primary bg-background/80'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
              )}
            >
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
              <Icon className={cn(
                'h-4 w-4 transition-transform',
                isActive && 'scale-110'
              )} />
              <span className="truncate w-full text-center">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content with fade animation */}
      <div className="flex-1 overflow-hidden relative">
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-200",
            activeTab === 'canvas' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
          )}
        >
          <AICanvas
            sceneContext={sceneContext}
            selectedText={selectedText}
            onReplaceSelection={onReplaceSelection}
            onInsertText={onInsertText}
          />
        </div>

        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-200",
            activeTab === 'model' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
          )}
        >
          <div className="h-full overflow-auto p-4">
            <ModelConfig />
          </div>
        </div>

        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-200",
            activeTab === 'comments' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
          )}
        >
          <div className="h-full overflow-auto">
            <CommentSidebar sceneId={sceneId} />
          </div>
        </div>

        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-200",
            activeTab === 'debug' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
          )}
        >
          <div className="h-full overflow-auto">
            <ContextDebugPanel
              projectId={projectId}
              sceneContext={sceneContext}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
