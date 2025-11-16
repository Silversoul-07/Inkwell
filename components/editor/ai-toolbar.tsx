'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  RefreshCw,
  Maximize2,
  Minimize2,
  Wand2,
  MessageSquare,
  GitBranch,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AIToolbarProps {
  onContinue: () => void
  onRephrase: () => void
  onExpand: () => void
  onShorten: () => void
  onFixGrammar: () => void
  onGenerateAlternatives: () => void
  onToggleChat: () => void
  hasSelection: boolean
  isGenerating: boolean
}

export function AIToolbar({
  onContinue,
  onRephrase,
  onExpand,
  onShorten,
  onFixGrammar,
  onGenerateAlternatives,
  onToggleChat,
  hasSelection,
  isGenerating,
}: AIToolbarProps) {
  return (
    <div className="flex items-center gap-2 p-2 border-b border-border bg-card">
      {/* Continue Writing */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onContinue}
        disabled={isGenerating}
        title="Continue Writing"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Continue
      </Button>

      {/* Quick Actions - only enabled if there's a selection */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={!hasSelection || isGenerating}
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Quick Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onRephrase}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Rephrase
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExpand}>
            <Maximize2 className="h-4 w-4 mr-2" />
            Expand
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onShorten}>
            <Minimize2 className="h-4 w-4 mr-2" />
            Shorten
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onFixGrammar}>
            <Wand2 className="h-4 w-4 mr-2" />
            Fix Grammar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Generate Alternatives */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onGenerateAlternatives}
        disabled={!hasSelection || isGenerating}
        title="Generate 3 alternative versions"
      >
        <GitBranch className="h-4 w-4 mr-2" />
        Alternatives
      </Button>

      <div className="flex-1" />

      {/* Toggle AI Chat */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleChat}
        title="Toggle AI Chat Panel"
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        AI Chat
      </Button>

      {isGenerating && (
        <span className="text-sm text-muted-foreground animate-pulse">
          Generating...
        </span>
      )}
    </div>
  )
}
