'use client'

import { useState } from 'react'
import { Plus, ChevronRight, ChevronDown, FileText, FilePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
  onRefresh: () => void
}

export function EditorSidebar({
  project,
  selectedSceneId,
  onSelectScene,
  onRefresh,
}: EditorSidebarProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(project.chapters.map((c) => c.id))
  )
  const [isCreating, setIsCreating] = useState(false)

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters)
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId)
    } else {
      newExpanded.add(chapterId)
    }
    setExpandedChapters(newExpanded)
  }

  const handleCreateChapter = async () => {
    setIsCreating(true)
    try {
      const response = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id }),
      })

      if (response.ok) {
        onRefresh()
      } else {
        alert('Failed to create chapter')
      }
    } catch (error) {
      console.error('Error creating chapter:', error)
      alert('Error creating chapter')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCreateScene = async (chapterId: string) => {
    setIsCreating(true)
    try {
      const response = await fetch('/api/scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId }),
      })

      if (response.ok) {
        onRefresh()
      } else {
        alert('Failed to create scene')
      }
    } catch (error) {
      console.error('Error creating scene:', error)
      alert('Error creating scene')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="w-64 border-r border-border bg-card overflow-auto">
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Structure</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6" disabled={isCreating}>
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCreateChapter}>
                <FileText className="h-4 w-4 mr-2" />
                New Chapter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {project.chapters.map((chapter) => (
          <div key={chapter.id} className="space-y-1">
            <div className="w-full flex items-center gap-1 group">
              <button
                onClick={() => toggleChapter(chapter.id)}
                className="flex-1 flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded-md"
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
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleCreateScene(chapter.id)}
                disabled={isCreating}
                title="Add scene"
              >
                <FilePlus className="h-3 w-3" />
              </Button>
            </div>

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
