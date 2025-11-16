'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Pin, PinOff, ChevronDown, ChevronRight } from 'lucide-react'
import * as Progress from '@radix-ui/react-progress'

interface ContextItem {
  id: string
  type: 'chapter' | 'character' | 'lorebook'
  title: string
  content: string
  pinned: boolean
  charCount: number
}

interface ContextPanelProps {
  sceneContent: string
  maxContext: number
  onClose: () => void
}

export function ContextPanel({
  sceneContent,
  maxContext = 8000,
  onClose,
}: ContextPanelProps) {
  const [pinnedItems, setPinnedItems] = useState<Set<string>>(new Set())
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['current'])
  )

  // Calculate current context usage
  const currentSceneChars = sceneContent.length
  const pinnedChars = 0 // Would calculate from actual pinned items
  const totalChars = currentSceneChars + pinnedChars
  const percentage = Math.min((totalChars / maxContext) * 100, 100)

  const getProgressColor = () => {
    if (percentage < 60) return 'bg-green-500'
    if (percentage < 85) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const togglePin = (itemId: string) => {
    const newPinned = new Set(pinnedItems)
    if (newPinned.has(itemId)) {
      newPinned.delete(itemId)
    } else {
      newPinned.add(itemId)
    }
    setPinnedItems(newPinned)
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  return (
    <div className="w-80 h-full bg-card border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Context Manager</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>

        {/* Context Budget */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Context Usage</span>
            <span className={percentage > 85 ? 'text-destructive font-medium' : ''}>
              {totalChars.toLocaleString()} / {maxContext.toLocaleString()}
            </span>
          </div>
          <Progress.Root className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <Progress.Indicator
              className={`h-full transition-all ${getProgressColor()}`}
              style={{ width: `${percentage}%` }}
            />
          </Progress.Root>
          {percentage > 85 && (
            <p className="text-xs text-destructive">
              Warning: Context limit almost reached
            </p>
          )}
        </div>
      </div>

      {/* Context Items */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Current Scene */}
        <div>
          <button
            onClick={() => toggleSection('current')}
            className="flex items-center gap-2 w-full text-sm font-medium mb-2"
          >
            {expandedSections.has('current') ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            Current Scene
          </button>

          {expandedSections.has('current') && (
            <div className="ml-6 text-xs text-muted-foreground">
              <div className="flex items-center justify-between mb-1">
                <span>Always included</span>
                <span>{currentSceneChars.toLocaleString()} chars</span>
              </div>
              <p className="line-clamp-3">
                {sceneContent.replace(/<[^>]*>/g, '').slice(0, 200)}...
              </p>
            </div>
          )}
        </div>

        {/* Pinned Items */}
        <div>
          <button
            onClick={() => toggleSection('pinned')}
            className="flex items-center gap-2 w-full text-sm font-medium mb-2"
          >
            {expandedSections.has('pinned') ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            Pinned Items ({pinnedItems.size})
          </button>

          {expandedSections.has('pinned') && pinnedItems.size === 0 && (
            <p className="ml-6 text-xs text-muted-foreground">
              No items pinned. Pin paragraphs or sections to always include them in AI context.
            </p>
          )}
        </div>

        {/* Recent Chapters */}
        <div>
          <button
            onClick={() => toggleSection('chapters')}
            className="flex items-center gap-2 w-full text-sm font-medium mb-2"
          >
            {expandedSections.has('chapters') ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            Recent Chapters
          </button>

          {expandedSections.has('chapters') && (
            <div className="ml-6 space-y-2">
              <p className="text-xs text-muted-foreground">
                Previous chapters are automatically included when space allows
              </p>
            </div>
          )}
        </div>

        {/* Characters */}
        <div>
          <button
            onClick={() => toggleSection('characters')}
            className="flex items-center gap-2 w-full text-sm font-medium mb-2"
          >
            {expandedSections.has('characters') ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            Characters
          </button>

          {expandedSections.has('characters') && (
            <div className="ml-6 space-y-2">
              <p className="text-xs text-muted-foreground">
                Character sheets mentioned in this scene
              </p>
            </div>
          )}
        </div>

        {/* Lorebook */}
        <div>
          <button
            onClick={() => toggleSection('lorebook')}
            className="flex items-center gap-2 w-full text-sm font-medium mb-2"
          >
            {expandedSections.has('lorebook') ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            Lorebook
          </button>

          {expandedSections.has('lorebook') && (
            <div className="ml-6 space-y-2">
              <p className="text-xs text-muted-foreground">
                Relevant world information based on keywords
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
