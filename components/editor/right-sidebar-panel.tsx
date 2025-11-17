'use client'

import { useState } from 'react'
import { Bug, Sparkles } from 'lucide-react'
import { AICanvas } from './ai-canvas'
import { ContextDebugPanel } from './context-debug-panel'
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
  const [activeTab, setActiveTab] = useState<'assistant' | 'debug'>('assistant')

  const tabs = [
    {
      id: 'assistant' as const,
      label: 'AI Assistant',
      icon: Sparkles,
    },
    {
      id: 'debug' as const,
      label: 'Debug',
      icon: Bug,
    },
  ]

  return (
    <div className="h-full bg-card flex flex-col">
      {/* Minimal Tab Navigation */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium transition-all relative',
                isActive
                  ? 'text-foreground bg-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'assistant' && (
          <AICanvas
            sceneContext={sceneContext}
            selectedText={selectedText}
            onReplaceSelection={onReplaceSelection}
            onInsertText={onInsertText}
          />
        )}

        {activeTab === 'debug' && (
          <div className="h-full overflow-auto">
            <ContextDebugPanel
              projectId={projectId}
              sceneContext={sceneContext}
            />
          </div>
        )}
      </div>
    </div>
  )
}
