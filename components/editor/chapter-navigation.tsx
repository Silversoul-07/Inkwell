'use client'

import { Book } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Chapter {
  id: string
  title: string
  order: number
  content: string | null
  wordCount: number | null
}

interface ChapterNavigationProps {
  chapters: Chapter[]
  selectedChapterId: string
  onSelectChapter: (chapterId: string) => void
}

export function ChapterNavigation({
  chapters,
  selectedChapterId,
  onSelectChapter,
}: ChapterNavigationProps) {
  return (
    <div className="w-64 border-r border-border bg-card h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Book className="h-5 w-5" />
          Chapters
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {chapters.map(chapter => {
            const isSelected = selectedChapterId === chapter.id

            return (
              <Button
                key={chapter.id}
                variant={isSelected ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left h-auto py-2 px-3"
                onClick={() => onSelectChapter(chapter.id)}
              >
                <div className="flex items-start gap-2 w-full">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{chapter.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {(chapter.wordCount || 0).toLocaleString()} words
                    </div>
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
