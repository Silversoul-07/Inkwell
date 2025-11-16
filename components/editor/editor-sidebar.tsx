'use client'

import { useState } from 'react'
import { Plus, ChevronRight, ChevronDown, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

interface Project {
  id: string
  title: string
  chapters: Chapter[]
}

interface EditorSidebarProps {
  project: Project
  selectedSceneId: string
  onSelectScene: (sceneId: string) => void
}

export function EditorSidebar({
  project,
  selectedSceneId,
  onSelectScene,
}: EditorSidebarProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(project.chapters.map((c) => c.id))
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

  return (
    <div className="w-64 border-r border-border bg-card overflow-auto">
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Structure</h2>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {project.chapters.map((chapter) => (
          <div key={chapter.id} className="space-y-1">
            <button
              onClick={() => toggleChapter(chapter.id)}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded-md"
            >
              {expandedChapters.has(chapter.id) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span className="flex-1 text-left font-medium">
                {chapter.title}
              </span>
            </button>

            {expandedChapters.has(chapter.id) && (
              <div className="ml-6 space-y-1">
                {chapter.scenes.map((scene, index) => (
                  <button
                    key={scene.id}
                    onClick={() => onSelectScene(scene.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md ${
                      selectedSceneId === scene.id
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <FileText className="h-3 w-3" />
                    <span className="flex-1 text-left truncate">
                      {scene.title || `Scene ${index + 1}`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {scene.wordCount}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
