'use client'

import { ScrollArea } from '@/components/ui/scroll-area'

interface Scene {
  id: string
  title: string | null
  content: string
  wordCount: number
  order: number
}

interface Chapter {
  id: string
  title: string
  order: number
  scenes: Scene[]
}

interface ChapterViewerProps {
  chapter: Chapter
  settings: {
    editorFont: string
    editorFontSize: number
    editorLineHeight: number
    editorWidth: number
  } | null
}

export function ChapterViewer({ chapter, settings }: ChapterViewerProps) {
  const editorStyle = {
    fontFamily: settings?.editorFont || 'serif',
    fontSize: `${settings?.editorFontSize || 16}px`,
    lineHeight: settings?.editorLineHeight || 1.6,
    maxWidth: `${settings?.editorWidth || 800}px`,
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="flex justify-center p-8">
        <div style={editorStyle} className="w-full">
          {/* Chapter Title */}
          <h1 className="text-3xl font-bold mb-8 text-center">{chapter.title}</h1>

          {/* Chapter Content - All Scenes */}
          <div className="space-y-8">
            {chapter.scenes.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                This chapter has no scenes yet.
              </div>
            ) : (
              chapter.scenes.map((scene, idx) => (
                <div key={scene.id} className="space-y-4">
                  {/* Scene Title (if exists) */}
                  {scene.title && (
                    <h2 className="text-xl font-semibold opacity-70">{scene.title}</h2>
                  )}

                  {/* Scene Content */}
                  {scene.content ? (
                    <div
                      className="prose prose-gray dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: scene.content }}
                    />
                  ) : (
                    <div className="text-muted-foreground italic">This scene is empty.</div>
                  )}

                  {/* Scene Separator (except for last scene) */}
                  {idx < chapter.scenes.length - 1 && (
                    <div className="flex items-center gap-4 my-8">
                      <div className="flex-1 h-px bg-border" />
                      <div className="text-xs text-muted-foreground">* * *</div>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Chapter Footer */}
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            {chapter.scenes.length} scene{chapter.scenes.length !== 1 ? 's' : ''} ·{' '}
            {chapter.scenes.reduce((sum, s) => sum + s.wordCount, 0).toLocaleString()} words
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
