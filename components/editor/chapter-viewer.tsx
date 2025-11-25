'use client'

import { ScrollArea } from '@/components/ui/scroll-area'

interface Chapter {
  id: string
  title: string
  order: number
  content: string | null
  wordCount: number | null
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

          {/* Chapter Content */}
          <div className="space-y-4">
            {chapter.content ? (
              <div
                className="prose prose-gray dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: chapter.content }}
              />
            ) : (
              <div className="text-center text-muted-foreground py-12">This chapter is empty.</div>
            )}
          </div>

          {/* Chapter Footer */}
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            {(chapter.wordCount || 0).toLocaleString()} words
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
