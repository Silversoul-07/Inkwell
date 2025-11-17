'use client'

import { Button } from '@/components/ui/button'
import {
  Sparkles,
  RefreshCw,
  Maximize2,
  Minimize2,
  Wand2,
  GitBranch,
  Undo2,
  Redo2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AIToolbarBottomProps {
  onContinue: () => void
  onRephrase: () => void
  onExpand: () => void
  onShorten: () => void
  onFixGrammar: () => void
  onGenerateAlternatives: () => void
  onUndo?: () => void
  onRedo?: () => void
  hasSelection: boolean
  isGenerating: boolean
  canUndo?: boolean
  canRedo?: boolean
  useCustomTemplates?: boolean
  templatesLoaded?: number
}

export function AIToolbarBottom({
  onContinue,
  onRephrase,
  onExpand,
  onShorten,
  onFixGrammar,
  onGenerateAlternatives,
  onUndo,
  onRedo,
  hasSelection,
  isGenerating,
  canUndo = true,
  canRedo = true,
  useCustomTemplates = false,
  templatesLoaded = 0,
}: AIToolbarBottomProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
      <div className="glass rounded-2xl shadow-2xl border-2 p-2 flex items-center gap-1">
        {/* Undo/Redo */}
        {onUndo && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onUndo}
            disabled={!canUndo || isGenerating}
            title="Undo"
            className="rounded-xl"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
        )}

        {onRedo && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRedo}
            disabled={!canRedo || isGenerating}
            title="Redo"
            className="rounded-xl"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        )}

        {(onUndo || onRedo) && <div className="w-px h-6 bg-border mx-1" />}

        {/* Continue Writing */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onContinue}
          disabled={isGenerating}
          title="Continue Writing"
          className="rounded-xl gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Continue
          {onUndo && <Undo2 className="h-3 w-3 opacity-50" />}
        </Button>

        {/* Quick Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={!hasSelection || isGenerating}
              className="rounded-xl gap-2"
            >
              <Wand2 className="h-4 w-4" />
              Quick Actions
              {onUndo && <Undo2 className="h-3 w-3 opacity-50" />}
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
          className="rounded-xl gap-2"
        >
          <GitBranch className="h-4 w-4" />
          Alternatives
          {onUndo && <Undo2 className="h-3 w-3 opacity-50" />}
        </Button>

        {isGenerating && (
          <>
            <div className="w-px h-6 bg-border mx-1" />
            <span className="text-sm text-muted-foreground animate-pulse px-2">
              Generating...
            </span>
          </>
        )}

        {/* Template Indicator */}
        {useCustomTemplates && templatesLoaded > 0 && !isGenerating && (
          <>
            <div className="w-px h-6 bg-border mx-1" />
            <span
              className="text-xs text-muted-foreground px-2 flex items-center gap-1"
              title={`${templatesLoaded} custom templates active`}
            >
              <Wand2 className="h-3 w-3" />
              {templatesLoaded}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
