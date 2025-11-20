'use client'

import { useState, useMemo } from 'react'
import {
  Search,
  Plus,
  ChevronRight,
  ChevronDown,
  FileText,
  Users,
  MapPin,
  BookOpen,
  Star,
  MoreVertical,
  Maximize2,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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

interface EditorSidebarNewProps {
  project: Project
  selectedSceneId: string
  onSelectScene: (sceneId: string) => void
  onRefresh: () => void
}

type SectionType = 'chapters' | 'characters' | 'locations' | 'notes'

export function EditorSidebarNew({
  project,
  selectedSceneId,
  onSelectScene,
  onRefresh,
}: EditorSidebarNewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSections, setExpandedSections] = useState<Set<SectionType>>(
    new Set(['chapters', 'characters', 'locations', 'notes'])
  )
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(project.chapters.map((c) => c.id))
  )
  const [pinnedCharacters, setPinnedCharacters] = useState<Set<string>>(new Set())
  const [isCreating, setIsCreating] = useState(false)

  const toggleSection = (section: SectionType) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters)
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId)
    } else {
      newExpanded.add(chapterId)
    }
    setExpandedChapters(newExpanded)
  }

  const togglePinCharacter = (characterId: string) => {
    const newPinned = new Set(pinnedCharacters)
    if (newPinned.has(characterId)) {
      newPinned.delete(characterId)
    } else {
      newPinned.add(characterId)
    }
    setPinnedCharacters(newPinned)
  }

  // Filter chapters and scenes based on search
  const filteredChapters = useMemo(() => {
    if (!searchQuery) return project.chapters

    const query = searchQuery.toLowerCase()
    return project.chapters
      .map((chapter) => ({
        ...chapter,
        scenes: chapter.scenes.filter(
          (scene) =>
            chapter.title.toLowerCase().includes(query) ||
            scene.title?.toLowerCase().includes(query)
        ),
      }))
      .filter(
        (chapter) =>
          chapter.title.toLowerCase().includes(query) || chapter.scenes.length > 0
      )
  }, [project.chapters, searchQuery])

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

  const handleDeleteChapter = async (chapterId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this chapter? This will delete all scenes in it.'
      )
    )
      return

    try {
      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onRefresh()
      } else {
        alert('Failed to delete chapter')
      }
    } catch (error) {
      console.error('Error deleting chapter:', error)
      alert('Error deleting chapter')
    }
  }

  const handleDeleteScene = async (sceneId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this scene?')) return

    try {
      const response = await fetch(`/api/scenes/${sceneId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onRefresh()
      } else {
        alert('Failed to delete scene')
      }
    } catch (error) {
      console.error('Error deleting scene:', error)
      alert('Error deleting scene')
    }
  }

  // Placeholder data for characters, locations, notes
  const characters = [
    { id: '1', name: 'Marcus', mentions: 23, pinned: true },
    { id: '2', name: 'Elena', mentions: 8, pinned: true },
    { id: '3', name: 'The Archivist', mentions: 0, pinned: false },
  ]

  const locations = [
    { id: '1', name: 'The Library', mentions: 15 },
    { id: '2', name: 'Shadow Market', mentions: 7 },
  ]

  const notes = [
    { id: '1', title: 'Plot Ideas' },
    { id: '2', title: 'Research Notes' },
  ]

  return (
    <div className="w-[280px] border-r border-border bg-card flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <div className="p-3 border-b border-border space-y-2 flex-shrink-0">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>

        {/* Create Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-between h-9">
              <span className="flex items-center gap-1.5">
                <Plus className="h-4 w-4" />
                Create
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[260px]">
            <DropdownMenuItem onClick={handleCreateChapter}>
              <FileText className="h-4 w-4 mr-2" />
              New Chapter
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <Users className="h-4 w-4 mr-2" />
              New Character
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <MapPin className="h-4 w-4 mr-2" />
              New Location
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <BookOpen className="h-4 w-4 mr-2" />
              New Note
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Chapters & Scenes Section */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection('chapters')}
            className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-md text-sm font-medium"
          >
            {expandedSections.has('chapters') ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <FileText className="h-4 w-4" />
            <span className="flex-1 text-left">Chapters & Scenes</span>
          </button>

          {expandedSections.has('chapters') && (
            <div className="ml-2 space-y-1">
              {filteredChapters.map((chapter) => (
                <div key={chapter.id} className="space-y-0.5">
                  <div className="w-full flex items-center gap-1 group">
                    <button
                      onClick={() => toggleChapter(chapter.id)}
                      className="flex-1 flex items-center gap-2 px-2 py-1 text-sm hover:bg-accent/50 rounded-md min-w-0"
                    >
                      {expandedChapters.has(chapter.id) ? (
                        <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                      )}
                      <span className="flex-1 text-left font-medium truncate">
                        {chapter.title}
                      </span>
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleCreateScene(chapter.id)}
                        >
                          Add Scene
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteChapter(chapter.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3 w-3 mr-2" />
                          Delete Chapter
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {expandedChapters.has(chapter.id) && (
                    <div className="ml-5 space-y-0.5">
                      {chapter.scenes.map((scene, index) => (
                        <div key={scene.id} className="group flex items-center gap-1">
                          <button
                            onClick={() => onSelectScene(scene.id)}
                            className={`flex-1 flex items-center gap-2 px-2 py-1 text-xs rounded-md min-w-0 ${
                              selectedSceneId === scene.id
                                ? 'bg-accent text-accent-foreground'
                                : 'hover:bg-accent/50'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                                selectedSceneId === scene.id
                                  ? 'bg-primary'
                                  : 'bg-transparent'
                              }`}
                            />
                            <span className="flex-1 text-left truncate">
                              {scene.title || `Scene ${index + 1}`}
                            </span>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {scene.wordCount}
                            </span>
                          </button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            onClick={(e) => handleDeleteScene(scene.id, e)}
                            title="Delete scene"
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Characters Section */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection('characters')}
            className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-md text-sm font-medium"
          >
            {expandedSections.has('characters') ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <Users className="h-4 w-4" />
            <span className="flex-1 text-left">Characters ({characters.length})</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation()
                // Open full-screen view
              }}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          </button>

          {expandedSections.has('characters') && (
            <div className="ml-2 space-y-0.5">
              {characters.slice(0, 7).map((character) => (
                <div
                  key={character.id}
                  className="group flex items-center gap-1 px-2 py-1 hover:bg-accent/50 rounded-md"
                >
                  <button
                    onClick={() => togglePinCharacter(character.id)}
                    className="flex-shrink-0"
                  >
                    <Star
                      className={`h-3.5 w-3.5 ${
                        character.pinned || pinnedCharacters.has(character.id)
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                  <span className="flex-1 text-sm truncate">{character.name}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {character.mentions}
                  </span>
                </div>
              ))}
              {characters.length > 7 && (
                <button className="w-full text-left px-2 py-1 text-xs text-muted-foreground hover:text-foreground">
                  ... and {characters.length - 7} more
                </button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start h-8 mt-2"
                disabled
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                New Character
              </Button>
            </div>
          )}
        </div>

        {/* Locations Section */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection('locations')}
            className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-md text-sm font-medium"
          >
            {expandedSections.has('locations') ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <MapPin className="h-4 w-4" />
            <span className="flex-1 text-left">Locations ({locations.length})</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation()
                // Open full-screen view
              }}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          </button>

          {expandedSections.has('locations') && (
            <div className="ml-2 space-y-0.5">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className="group flex items-center gap-2 px-2 py-1 hover:bg-accent/50 rounded-md"
                >
                  <span className="flex-1 text-sm truncate">{location.name}</span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {location.mentions}
                  </span>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start h-8 mt-2"
                disabled
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                New Location
              </Button>
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection('notes')}
            className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-md text-sm font-medium"
          >
            {expandedSections.has('notes') ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <BookOpen className="h-4 w-4" />
            <span className="flex-1 text-left">Notes ({notes.length})</span>
          </button>

          {expandedSections.has('notes') && (
            <div className="ml-2 space-y-0.5">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="group flex items-center gap-2 px-2 py-1 hover:bg-accent/50 rounded-md"
                >
                  <span className="flex-1 text-sm truncate">{note.title}</span>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start h-8 mt-2"
                disabled
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                New Note
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
