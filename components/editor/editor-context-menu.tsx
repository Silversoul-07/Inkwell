'use client'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { ArrowRight, Wand2, CheckCircle, RefreshCw, Minimize2 } from 'lucide-react'

interface EditorContextMenuProps {
  children: React.ReactNode
  hasSelection: boolean
  isGenerating: boolean
  onContinue: () => void
  onAlternative: () => void
  onFixGrammar: () => void
  onRephrase: () => void
  onShorten: () => void
}

export function EditorContextMenu({
  children,
  hasSelection,
  isGenerating,
  onContinue,
  onAlternative,
  onFixGrammar,
  onRephrase,
  onShorten,
}: EditorContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {!hasSelection && (
          <>
            <ContextMenuItem onClick={onContinue} disabled={isGenerating}>
              <ArrowRight className="mr-2 h-4 w-4" />
              <span>Continue Writing</span>
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}

        {hasSelection && (
          <>
            <ContextMenuItem onClick={onAlternative} disabled={isGenerating}>
              <Wand2 className="mr-2 h-4 w-4" />
              <span>Generate Alternative</span>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onFixGrammar} disabled={isGenerating}>
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>Fix Grammar</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={onRephrase} disabled={isGenerating}>
              <RefreshCw className="mr-2 h-4 w-4" />
              <span>Rephrase</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={onShorten} disabled={isGenerating}>
              <Minimize2 className="mr-2 h-4 w-4" />
              <span>Shorten</span>
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
