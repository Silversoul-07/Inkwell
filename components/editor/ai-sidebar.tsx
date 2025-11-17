'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AICanvas } from './ai-canvas'

interface AISidebarProps {
  isOpen: boolean
  onClose: () => void
  sceneContext: string
  selectedText: string
  onReplaceSelection?: (text: string) => void
  onInsertText?: (text: string) => void
}

export function AISidebar({
  isOpen,
  onClose,
  sceneContext,
  selectedText,
  onReplaceSelection,
  onInsertText,
}: AISidebarProps) {
  if (!isOpen) return null

  return (
    <div className="w-[360px] border-l border-border bg-card flex-shrink-0 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
        <h3 className="text-sm font-semibold">AI Assist</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-7 w-7"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AICanvas
          sceneContext={sceneContext}
          selectedText={selectedText}
          onReplaceSelection={onReplaceSelection}
          onInsertText={onInsertText}
        />
      </div>
    </div>
  )
}
