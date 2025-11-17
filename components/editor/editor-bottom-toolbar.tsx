'use client'

import { MessageSquare, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EditorBottomToolbarProps {
  wordCount: number
  characterCount: number
  hasSelection: boolean
  onCommentClick: () => void
  writingTime?: number
}

export function EditorBottomToolbar({
  wordCount,
  characterCount,
  hasSelection,
  onCommentClick,
  writingTime = 0,
}: EditorBottomToolbarProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm z-40">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left Section - Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="font-medium">{wordCount.toLocaleString()}</span>
            <span>words</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-medium">{characterCount.toLocaleString()}</span>
            <span>characters</span>
          </div>
          {writingTime > 0 && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              <span>{formatTime(writingTime)}</span>
            </div>
          )}
        </div>

        {/* Center Section - Comment Button */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Button
            variant={hasSelection ? "default" : "ghost"}
            size="sm"
            onClick={onCommentClick}
            disabled={!hasSelection}
            className={cn(
              "h-8 gap-2 transition-all",
              hasSelection && "shadow-lg scale-105"
            )}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Add Comment</span>
          </Button>
        </div>

        {/* Right Section - Additional Actions (placeholder for future) */}
        <div className="w-[100px]" />
      </div>
    </div>
  )
}
