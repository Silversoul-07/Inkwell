'use client'

import { useState } from 'react'
import { X, MessageSquare, Settings, Sliders, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AICanvas } from './ai-canvas'
import { ModelConfig } from '@/components/ai/model-config'
import { ContextDebugPanel } from './context-debug-panel'
import { cn } from '@/lib/utils'

interface RightSidebarPanelProps {
  isOpen: boolean
  onClose: () => void
  sceneContext: string
  selectedText: string
  projectId: string
  onReplaceSelection?: (text: string) => void
  onInsertText?: (text: string) => void
}

export function RightSidebarPanel({
  isOpen,
  onClose,
  sceneContext,
  selectedText,
  projectId,
  onReplaceSelection,
  onInsertText,
}: RightSidebarPanelProps) {
  const [activeTab, setActiveTab] = useState<'canvas' | 'model' | 'writer' | 'debug'>('canvas')

  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[420px] bg-card border-l border-border z-50 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold">AI Assistant</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Rectangular Tabs */}
      <div className="flex gap-2 p-2 border-b border-border bg-muted/30">
        <button
          onClick={() => setActiveTab('canvas')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
            activeTab === 'canvas'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-background hover:bg-accent text-muted-foreground'
          )}
        >
          <MessageSquare className="h-4 w-4" />
          AI Canvas
        </button>
        <button
          onClick={() => setActiveTab('model')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
            activeTab === 'model'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-background hover:bg-accent text-muted-foreground'
          )}
        >
          <Settings className="h-4 w-4" />
          Model
        </button>
        <button
          onClick={() => setActiveTab('writer')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
            activeTab === 'writer'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-background hover:bg-accent text-muted-foreground'
          )}
        >
          <Sliders className="h-4 w-4" />
          Writer
        </button>
        <button
          onClick={() => setActiveTab('debug')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
            activeTab === 'debug'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-background hover:bg-accent text-muted-foreground'
          )}
        >
          <Bug className="h-4 w-4" />
          Debug
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'canvas' && (
          <AICanvas
            sceneContext={sceneContext}
            selectedText={selectedText}
            onReplaceSelection={onReplaceSelection}
            onInsertText={onInsertText}
          />
        )}

        {activeTab === 'model' && (
          <div className="h-full overflow-auto p-4">
            <ModelConfig />
          </div>
        )}

        {activeTab === 'writer' && (
          <div className="h-full overflow-auto p-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Writer Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Configure your writing preferences and editor settings.
                </p>
              </div>

              <div className="space-y-3 pt-4">
                <div className="text-sm">
                  <p className="text-muted-foreground">
                    Advanced writer settings coming soon:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                    <li>Custom writing goals</li>
                    <li>Daily word count targets</li>
                    <li>Writing style preferences</li>
                    <li>Auto-save configuration</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
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
