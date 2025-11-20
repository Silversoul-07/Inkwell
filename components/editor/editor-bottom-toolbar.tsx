'use client'
//TODO: Make it functional

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
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left: Words and Characters */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="font-medium">{wordCount.toLocaleString()}</span>
            <span>words</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-medium">{characterCount.toLocaleString()}</span>
            <span>characters</span>
          </div>
        </div>

        {/* Right: Auto save and Focus mode */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
          </div>
                    <span className="text-green-500">● Auto Save</span>
          <div className="flex items-center gap-1.5">
            <span>Last saved: {formatLastSaved(lastSaved)}</span>
          </div>

        </div>
      </div>
    </div>
  )
}
