'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  Book,
  Sparkles,
  FileEdit,
  Filter,
  Edit,
  ExternalLink,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import ReactMarkdown from 'react-markdown'

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

interface Character {
  id: string
  name: string
  role: string | null
  description: string | null
}

interface LorebookEntry {
  id: string
  key: string
  value: string
  category: string | null
  useCount: number
}

interface Note {
  id: string
  content: string
  sceneId: string
}

interface EditorSidebarNewProps {
  project: Project
  selectedSceneId: string
  onSelectScene: (sceneId: string) => void
  onRefresh: () => void
}

type SectionType = 'chapters' | 'characters' | 'lorebook' | 'notes'

export function EditorSidebarNew({
  project,
  selectedSceneId,
  onSelectScene,
  onRefresh,
}: EditorSidebarNewProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSections, setExpandedSections] = useState<Set<SectionType>>(
    new Set(['chapters', 'characters', 'lorebook', 'notes'])
  )
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(project.chapters.map((c) => c.id))
  )
  const [expandedLorebookCategories, setExpandedLorebookCategories] = useState<Set<string>>(
    new Set(['Locations', 'Magic', 'Characters', 'Other'])
  )
  const [pinnedCharacters, setPinnedCharacters] = useState<Set<string>>(new Set())
  const [isCreating, setIsCreating] = useState(false)
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set())

  // Rename dialog state
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [chapterToRename, setChapterToRename] = useState<Chapter | null>(null)
  const [newChapterTitle, setNewChapterTitle] = useState('')

  // Real data from APIs
  const [characters, setCharacters] = useState<Character[]>([])
  const [lorebookEntries, setLorebookEntries] = useState<LorebookEntry[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Fetch real data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch characters
        const charsRes = await fetch(`/api/characters?projectId=${project.id}`)
        if (charsRes.ok) {
          const charsData = await charsRes.json()
          setCharacters(charsData)
        }

        // Fetch lorebook
        const loreRes = await fetch(`/api/lorebook?projectId=${project.id}`)
        if (loreRes.ok) {
          const loreData = await loreRes.json()
          setLorebookEntries(loreData)
        }

        // Fetch notes (comments for the selected scene)
        if (selectedSceneId) {
          const notesRes = await fetch(`/api/comments?sceneId=${selectedSceneId}`)
          if (notesRes.ok) {
            const notesData = await notesRes.json()
            setNotes(notesData)
          }
        }
      } catch (error) {
        console.error('Error fetching sidebar data:', error)
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [project.id, selectedSceneId])

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

  const toggleLorebookCategory = (category: string) => {
    const newExpanded = new Set(expandedLorebookCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedLorebookCategories(newExpanded)
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

  const handleRenameChapter = async () => {
    if (!chapterToRename || !newChapterTitle.trim()) return

    try {
      const response = await fetch(`/api/chapters/${chapterToRename.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newChapterTitle }),
      })

      if (response.ok) {
        setRenameDialogOpen(false)
        setChapterToRename(null)
        setNewChapterTitle('')
        onRefresh()
      } else {
        alert('Failed to rename chapter')
      }
    } catch (error) {
      console.error('Error renaming chapter:', error)
      alert('Error renaming chapter')
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

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const response = await fetch(`/api/comments/${noteId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setNotes(notes.filter((n) => n.id !== noteId))
      } else {
        alert('Failed to delete note')
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('Error deleting note')
    }
  }

  // Group lorebook entries by category
  const lorebookByCategory = useMemo(() => {
    const grouped: Record<string, LorebookEntry[]> = {}
    lorebookEntries.forEach((entry) => {
      const category = entry.category || 'Other'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(entry)
    })
    return grouped
  }, [lorebookEntries])

  return (
    <div className="w-[280px] border-r border-border bg-card flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <div className="p-3 border-b border-border space-y-2 flex-shrink-0">
        {/* Search and Create Button Row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-8 h-9 text-sm"
            />
            <DropdownMenu open={showFilterMenu} onOpenChange={setShowFilterMenu}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-accent"
                >
                  <Filter className={`h-3.5 w-3.5 ${activeFilters.size > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem
                  onClick={() => {
                    const newFilters = new Set(activeFilters)
                    if (newFilters.has('chapters')) {
                      newFilters.delete('chapters')
                    } else {
                      newFilters.add('chapters')
                    }
                    setActiveFilters(newFilters)
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Chapters
                  {activeFilters.has('chapters') && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const newFilters = new Set(activeFilters)
                    if (newFilters.has('characters')) {
                      newFilters.delete('characters')
                    } else {
                      newFilters.add('characters')
                    }
                    setActiveFilters(newFilters)
                  }}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Characters
                  {activeFilters.has('characters') && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const newFilters = new Set(activeFilters)
                    if (newFilters.has('lorebook')) {
                      newFilters.delete('lorebook')
                    } else {
                      newFilters.add('lorebook')
                    }
                    setActiveFilters(newFilters)
                  }}
                >
                  <Book className="h-4 w-4 mr-2" />
                  Lorebook
                  {activeFilters.has('lorebook') && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const newFilters = new Set(activeFilters)
                    if (newFilters.has('notes')) {
                      newFilters.delete('notes')
                    } else {
                      newFilters.add('notes')
                    }
                    setActiveFilters(newFilters)
                  }}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Notes
                  {activeFilters.has('notes') && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                {activeFilters.size > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setActiveFilters(new Set())}
                      className="text-muted-foreground"
                    >
                      Clear filters
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Create Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem onClick={handleCreateChapter}>
                <FileText className="h-4 w-4 mr-2" />
                New Chapter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/characters/${project.id}`)}>
                <Users className="h-4 w-4 mr-2" />
                New Character
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/lorebook/${project.id}`)}>
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
            <span className="flex-1 text-left">Chapters</span>
          </button>

          {expandedSections.has('chapters') && (
            <div className="ml-2 space-y-1">
              {filteredChapters.map((chapter) => (
                <div key={chapter.id} className="space-y-0.5">
                  <div className="w-full flex items-center gap-1 group">
                    <button
                      onClick={() => {
                        // If chapter has no scenes, select the chapter itself
                        if (chapter.scenes.length === 0) {
                          // Just expand/collapse
                          toggleChapter(chapter.id)
                        } else {
                          toggleChapter(chapter.id)
                        }
                      }}
                      className="flex-1 flex items-center gap-2 px-2 py-1 text-sm hover:bg-accent/50 rounded-md min-w-0"
                    >
                      {chapter.scenes.length > 0 ? (
                        expandedChapters.has(chapter.id) ? (
                          <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                        )
                      ) : (
                        <div className="h-3.5 w-3.5 flex-shrink-0" />
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
                          <Plus className="h-3 w-3 mr-2" />
                          Add Scene
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setChapterToRename(chapter)
                            setNewChapterTitle(chapter.title)
                            setRenameDialogOpen(true)
                          }}
                        >
                          <Edit className="h-3 w-3 mr-2" />
                          Rename
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

                  {expandedChapters.has(chapter.id) && chapter.scenes.length > 0 && (
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
                  {expandedChapters.has(chapter.id) && chapter.scenes.length === 0 && (
                    <div className="ml-5 text-xs text-muted-foreground px-2 py-1">
                      No scenes. Right-click chapter to add one.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Characters Section */}
        {!activeFilters.has('characters') && (
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
                  router.push(`/characters/${project.id}`)
                }}
                title="Open Characters page"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </button>

            {expandedSections.has('characters') && (
              <div className="ml-2 space-y-0.5">
                {characters.length === 0 ? (
                  <div className="text-xs text-muted-foreground px-2 py-1">
                    No characters yet
                  </div>
                ) : (
                  characters.slice(0, 7).map((character) => (
                    <div
                      key={character.id}
                      className="group flex items-center gap-1 px-2 py-1 hover:bg-accent/50 rounded-md cursor-pointer"
                      onClick={() => router.push(`/characters/${project.id}`)}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          togglePinCharacter(character.id)
                        }}
                        className="flex-shrink-0"
                      >
                        <Star
                          className={`h-3.5 w-3.5 ${
                            pinnedCharacters.has(character.id)
                              ? 'fill-yellow-500 text-yellow-500'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">{character.name}</div>
                        {character.role && (
                          <div className="text-xs text-muted-foreground truncate">
                            {character.role}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {characters.length > 7 && (
                  <button
                    className="w-full text-left px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => router.push(`/characters/${project.id}`)}
                  >
                    ... and {characters.length - 7} more
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Lorebook Section */}
        {!activeFilters.has('lorebook') && (
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('lorebook')}
              className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-md text-sm font-medium"
            >
              {expandedSections.has('lorebook') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <Book className="h-4 w-4" />
              <span className="flex-1 text-left">Lorebook ({lorebookEntries.length})</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/lorebook/${project.id}`)
                }}
                title="Open Lorebook page"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </button>

            {expandedSections.has('lorebook') && (
              <div className="ml-2 space-y-2">
                {lorebookEntries.length === 0 ? (
                  <div className="text-xs text-muted-foreground px-2 py-1">
                    No lorebook entries yet
                  </div>
                ) : (
                  Object.entries(lorebookByCategory).map(([category, entries]) => (
                    <div key={category} className="space-y-0.5">
                      <button
                        onClick={() => toggleLorebookCategory(category)}
                        className="w-full flex items-center gap-2 px-2 py-1 hover:bg-accent/50 rounded-md text-sm"
                      >
                        {expandedLorebookCategories.has(category) ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="flex-1 text-left">{category} ({entries.length})</span>
                      </button>
                      {expandedLorebookCategories.has(category) && (
                        <div className="ml-5 space-y-0.5">
                          {entries.slice(0, 5).map((entry) => (
                            <div
                              key={entry.id}
                              className="group flex items-center gap-2 px-2 py-1 hover:bg-accent/50 rounded-md cursor-pointer"
                              onClick={() => router.push(`/lorebook/${project.id}`)}
                            >
                              <span className="flex-1 text-xs truncate">{entry.key}</span>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {entry.useCount}
                              </span>
                            </div>
                          ))}
                          {entries.length > 5 && (
                            <button
                              className="w-full text-left px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                              onClick={() => router.push(`/lorebook/${project.id}`)}
                            >
                              ... and {entries.length - 5} more
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Notes Section */}
        {!activeFilters.has('notes') && (
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
                {notes.length === 0 ? (
                  <div className="text-xs text-muted-foreground px-2 py-1">
                    No notes for this scene
                  </div>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="group flex items-start gap-2 px-2 py-1 hover:bg-accent/50 rounded-md"
                    >
                      <div className="flex-1 text-xs prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{note.content}</ReactMarkdown>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={() => handleDeleteNote(note.id)}
                        title="Delete note"
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rename Chapter Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chapter</DialogTitle>
            <DialogDescription>
              Enter a new title for this chapter
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="chapter-title">Chapter Title</Label>
            <Input
              id="chapter-title"
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              placeholder="Chapter title"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRenameDialogOpen(false)
                setChapterToRename(null)
                setNewChapterTitle('')
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleRenameChapter} disabled={!newChapterTitle.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
