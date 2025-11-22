'use client'

import { useState } from 'react'
import { Book, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set([selectedChapterId])
  )

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters)
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId)
    } else {
      newExpanded.add(chapterId)
    }
    setExpandedChapters(newExpanded)
  }

  const getChapterWordCount = (chapter: Chapter) => {
    return chapter.scenes.reduce((sum, scene) => sum + scene.wordCount, 0)
  }

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
            const isExpanded = expandedChapters.has(chapter.id)
            const isSelected = selectedChapterId === chapter.id
            const wordCount = getChapterWordCount(chapter)

            return (
              <div key={chapter.id} className="space-y-1">
                <Button
                  variant={isSelected ? 'secondary' : 'ghost'}
                  className="w-full justify-start text-left h-auto py-2 px-3"
                  onClick={() => {
                    onSelectChapter(chapter.id)
                    if (!isExpanded) {
                      toggleChapter(chapter.id)
                    }
                  }}
                >
                  <div className="flex items-start gap-2 w-full">
                    <div
                      role="button"
                      tabIndex={0}
                      className="mt-0.5 hover:bg-accent rounded p-0.5 cursor-pointer"
                      onClick={e => {
                        e.stopPropagation()
                        toggleChapter(chapter.id)
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation()
                          e.preventDefault()
                          toggleChapter(chapter.id)
                        }
                      }}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{chapter.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {chapter.scenes.length} scenes · {wordCount.toLocaleString()} words
                      </div>
                    </div>
                  </div>
                </Button>

                {isExpanded && chapter.scenes.length > 0 && (
                  <div className="ml-6 pl-2 border-l-2 border-border space-y-1">
                    {chapter.scenes.map((scene, idx) => (
                      <div key={scene.id} className="text-sm text-muted-foreground py-1 px-2">
                        <div className="truncate">{scene.title || `Scene ${idx + 1}`}</div>
                        <div className="text-xs">{scene.wordCount.toLocaleString()} words</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
