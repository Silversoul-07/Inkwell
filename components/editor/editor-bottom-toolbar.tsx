'use client'

import { Clock } from 'lucide-react'

interface EditorBottomToolbarProps {
  wordCount: number
  characterCount: number
  writingTime?: number
  lastSaved?: Date | null
  chapterTitle?: string
  sceneTitle?: string
}

export function EditorBottomToolbar({
  wordCount,
  characterCount,
  writingTime = 0,
  lastSaved,
  chapterTitle,
  sceneTitle,
}: EditorBottomToolbarProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatLastSaved = (date: Date | null | undefined) => {
    if (!date) return 'Not saved'

    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 5) return 'Just now'
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm z-40">
      <div className="flex items-center px-4 py-2">
        {/* Stats & Context */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {/* Chapter/Scene Indicator */}
          {(chapterTitle || sceneTitle) && (
            <div className="flex items-center gap-1.5 font-medium">
              {chapterTitle && <span>{chapterTitle}</span>}
              {chapterTitle && sceneTitle && <span>›</span>}
              {sceneTitle && <span>{sceneTitle}</span>}
            </div>
          )}

          {/* Separator */}
          {(chapterTitle || sceneTitle) && <span className="text-border">|</span>}

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

          {/* Last Saved */}
          <span className="text-border">|</span>
          <div className="flex items-center gap-1.5">
            <span>Last saved: {formatLastSaved(lastSaved)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
