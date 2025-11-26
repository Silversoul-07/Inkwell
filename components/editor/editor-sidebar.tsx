'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Plus,
  ChevronRight,
  ChevronDown,
  FileText,
  Users,
  MapPin,
  MoreVertical,
  Trash2,
  Book,
  Filter,
  Edit,
  BookOpen,
  User,
  Tag,
  Bookmark,
  Crown,
  Skull,
  UserCheck,
  UserMinus,
  Globe,
  Zap,
  Wand2,
  Shield,
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

interface Scene {
  id: string
  title: string
  content: string | null
  wordCount: number | null
  order: number
}

interface Chapter {
  id: string
  title: string
  order: number
  content: string | null
  wordCount: number | null
}

interface Project {
  id: string
  title: string
  chapters: Chapter[]
}

interface Character {
  id: string
  name: string
  age: string | null
  role: string | null
  description: string | null
  traits: string | null
  background: string | null
  relationships: string | null
  goals: string | null
}

interface LorebookEntry {
  id: string
  key: string
  value: string
  category: string | null
  useCount: number
}

interface EditorSidebarNewProps {
  project: Project
  selectedChapterId: string
  onSelectChapter: (chapterId: string) => void
  onRefresh: () => void
  onViewCharacter?: (character: Character) => void
  onViewLorebook?: (entry: LorebookEntry) => void
  selectedViewType?: 'character' | 'lorebook'
  selectedViewId?: string
}

type SectionType = 'chapters' | 'characters' | 'lorebook'

export function EditorSidebarNew({
  project,
  selectedChapterId,
  onSelectChapter,
  onRefresh,
  onViewCharacter,
  onViewLorebook,
  selectedViewType,
  selectedViewId,
}: EditorSidebarNewProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSections, setExpandedSections] = useState<Set<SectionType>>(
    new Set(['chapters', 'characters', 'lorebook'])
  )
  const [expandedLorebookCategories, setExpandedLorebookCategories] = useState<Set<string>>(
    new Set(['Locations', 'Magic', 'Characters', 'Other'])
  )
  const [expandedCharacterCategories, setExpandedCharacterCategories] = useState<Set<string>>(
    new Set(['Main', 'Antagonist', 'Supporting', 'Minor', 'Other'])
  )
  const [isCreating, setIsCreating] = useState(false)
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Set<'chapters' | 'characters' | 'lorebook'>>(
    new Set(['chapters', 'characters', 'lorebook'])
  )

  // Resize functionality
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Character dialogs
  const [characterToEdit, setCharacterToEdit] = useState<Character | null>(null)
  const [editCharacterDialogOpen, setEditCharacterDialogOpen] = useState(false)
  const [deleteCharacterDialogOpen, setDeleteCharacterDialogOpen] = useState(false)

  // Rename dialog state
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [chapterToRename, setChapterToRename] = useState<Chapter | null>(null)
  const [newChapterTitle, setNewChapterTitle] = useState('')

  // Real data from APIs
  const [characters, setCharacters] = useState<Character[]>([])
  const [lorebookEntries, setLorebookEntries] = useState<LorebookEntry[]>([])
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
      } catch (error) {
        console.error('Error fetching sidebar data:', error)
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [project.id, selectedChapterId])

  const toggleSection = (section: SectionType) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
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

  const toggleCharacterCategory = (category: string) => {
    const newExpanded = new Set(expandedCharacterCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCharacterCategories(newExpanded)
  }

  const toggleFilter = (filter: 'chapters' | 'characters' | 'lorebook') => {
    const newFilters = new Set(activeFilters)
    if (newFilters.has(filter)) {
      newFilters.delete(filter)
    } else {
      newFilters.add(filter)
    }
    setActiveFilters(newFilters)
  }

  // Determine which sections to show based on active filters
  const showChapters = activeFilters.has('chapters')
  const showCharacters = activeFilters.has('characters')
  const showLorebook = activeFilters.has('lorebook')

  // Resize handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      const newWidth = e.clientX
      // Constrain width between 200px and 500px
      if (newWidth >= 200 && newWidth <= 500) {
        setSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  const handleMouseDown = () => {
    setIsResizing(true)
  }

  // Filter chapters based on search
  const filteredChapters = useMemo(() => {
    if (!searchQuery) return project.chapters

    const query = searchQuery.toLowerCase()
    return project.chapters.filter(chapter => chapter.title.toLowerCase().includes(query))
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
      !confirm('Are you sure you want to delete this chapter? This will delete all scenes in it.')
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

  // Group lorebook entries by category
  const lorebookByCategory = useMemo(() => {
    const grouped: Record<string, LorebookEntry[]> = {}
    lorebookEntries.forEach(entry => {
      const category = entry.category || 'Other'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(entry)
    })
    return grouped
  }, [lorebookEntries])

  // Group characters by role category
  const charactersByCategory = useMemo(() => {
    const categories = {
      Main: [] as Character[],
      Antagonist: [] as Character[],
      Supporting: [] as Character[],
      Minor: [] as Character[],
      Other: [] as Character[],
    }

    characters.forEach(character => {
      const role = character.role?.toLowerCase() || ''
      if (role.includes('protagonist') || role.includes('main')) {
        categories.Main.push(character)
      } else if (role.includes('antagonist') || role.includes('villain')) {
        categories.Antagonist.push(character)
      } else if (role.includes('supporting') || role.includes('secondary')) {
        categories.Supporting.push(character)
      } else if (role.includes('minor')) {
        categories.Minor.push(character)
      } else {
        categories.Other.push(character)
      }
    })

    // Remove empty categories
    return Object.fromEntries(Object.entries(categories).filter(([_, chars]) => chars.length > 0))
  }, [characters])

  // Get icon for character category
  const getCharacterCategoryIcon = (category: string) => {
    switch (category) {
      case 'Main':
        return <Crown className="h-3.5 w-3.5 text-yellow-500" />
      case 'Antagonist':
        return <Skull className="h-3.5 w-3.5 text-red-500" />
      case 'Supporting':
        return <UserCheck className="h-3.5 w-3.5 text-blue-500" />
      case 'Minor':
        return <UserMinus className="h-3.5 w-3.5 text-gray-500" />
      default:
        return <Users className="h-3.5 w-3.5 text-purple-400" />
    }
  }

  // Get icon for character entry
  const getCharacterEntryIcon = (category: string) => {
    switch (category) {
      case 'Main':
        return <Crown className="h-3 w-3 text-yellow-400" />
      case 'Antagonist':
        return <Skull className="h-3 w-3 text-red-400" />
      case 'Supporting':
        return <UserCheck className="h-3 w-3 text-blue-400" />
      case 'Minor':
        return <UserMinus className="h-3 w-3 text-gray-400" />
      default:
        return <User className="h-3 w-3 text-purple-300" />
    }
  }

  // Get icon for lorebook category
  const getLorebookCategoryIcon = (category: string) => {
    const cat = category.toLowerCase()
    if (cat.includes('location') || cat.includes('place')) {
      return <MapPin className="h-3.5 w-3.5 text-green-500" />
    } else if (cat.includes('magic') || cat.includes('spell')) {
      return <Wand2 className="h-3.5 w-3.5 text-purple-500" />
    } else if (cat.includes('character')) {
      return <Users className="h-3.5 w-3.5 text-blue-500" />
    } else if (cat.includes('item') || cat.includes('object')) {
      return <Shield className="h-3.5 w-3.5 text-orange-500" />
    } else if (cat.includes('world') || cat.includes('lore')) {
      return <Globe className="h-3.5 w-3.5 text-cyan-500" />
    } else if (cat.includes('power') || cat.includes('ability')) {
      return <Zap className="h-3.5 w-3.5 text-yellow-500" />
    } else {
      return <Tag className="h-3.5 w-3.5 text-amber-400" />
    }
  }

  return (
    <div
      ref={sidebarRef}
      className="border-r border-border bg-card flex flex-col overflow-hidden relative"
      style={{ width: `${sidebarWidth}px` }}
    >
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
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-8 h-9 text-sm"
            />
            <DropdownMenu open={showFilterMenu} onOpenChange={setShowFilterMenu}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-accent"
                >
                  <Filter
                    className={`h-3.5 w-3.5 ${activeFilters.size < 3 ? 'text-primary' : 'text-muted-foreground'}`}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[220px]">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Show Sections
                </div>
                <DropdownMenuItem onClick={() => toggleFilter('chapters')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Chapters
                  {activeFilters.has('chapters') && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleFilter('characters')}>
                  <Users className="h-4 w-4 mr-2" />
                  Characters
                  {activeFilters.has('characters') && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleFilter('lorebook')}>
                  <Book className="h-4 w-4 mr-2" />
                  Lorebook
                  {activeFilters.has('lorebook') && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Chapters & Scenes Section */}
        {showChapters && (
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('chapters')}
              className="w-full flex items-center gap-2 px-2 py-2 hover:bg-accent rounded-md text-sm font-semibold"
            >
              {expandedSections.has('chapters') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="flex-1 text-left">Chapters</span>
            </button>

            {expandedSections.has('chapters') && (
              <div className="ml-4 space-y-0.5 mt-0.5">
                {filteredChapters.map((chapter, index) => (
                  <div key={chapter.id} className="space-y-0.5">
                    <div className="w-full flex items-center gap-1 group">
                      <button
                        onClick={() => onSelectChapter(chapter.id)}
                        className={`flex-1 flex items-center gap-2 px-2 py-1.5 text-sm rounded-md min-w-0 transition-colors ${
                          selectedChapterId === chapter.id && selectedViewType === undefined
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-accent/50'
                        }`}
                      >
                        <span className="text-xs text-muted-foreground font-mono w-2 flex-shrink-0">
                          {index + 1}
                        </span>
                        <BookOpen className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                        <span className="flex-1 text-left truncate">{chapter.title}</span>
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setChapterToRename(chapter)
                              setNewChapterTitle(chapter.title)
                              setRenameDialogOpen(true)
                            }}
                          >
                            <Edit className="h-3.5 w-3.5 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteChapter(chapter.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Delete Chapter
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Characters Section */}
        {showCharacters && (
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('characters')}
              className="w-full flex items-center gap-2 px-2 py-2 hover:bg-accent rounded-md text-sm font-semibold"
            >
              {expandedSections.has('characters') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <Users className="h-4 w-4 text-purple-500" />
              <span className="flex-1 text-left">Characters ({characters.length})</span>
            </button>

            {expandedSections.has('characters') && (
              <div className="ml-4 space-y-1.5 mt-0.5">
                {characters.length === 0 ? (
                  <div className="text-xs text-muted-foreground px-2 py-1.5">No characters yet</div>
                ) : (
                  Object.entries(charactersByCategory).map(([category, chars]) => (
                    <div key={category} className="space-y-0.5">
                      <button
                        onClick={() => toggleCharacterCategory(category)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-accent/50 rounded-md text-sm transition-colors"
                      >
                        {expandedCharacterCategories.has(category) ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                        {getCharacterCategoryIcon(category)}
                        <span className="flex-1 text-left">
                          {category} ({chars.length})
                        </span>
                      </button>
                      {expandedCharacterCategories.has(category) && (
                        <div className="ml-5 space-y-0.5">
                          {chars.map(character => (
                            <div
                              key={character.id}
                              className="w-full flex items-center gap-1 group"
                            >
                              <button
                                onClick={() => onViewCharacter?.(character)}
                                className={`flex-1 flex items-center gap-2 px-2 py-1.5 text-sm rounded-md min-w-0 transition-colors ${
                                  selectedViewType === 'character' &&
                                  selectedViewId === character.id
                                    ? 'bg-primary/10 text-primary'
                                    : 'hover:bg-accent/50'
                                }`}
                              >
                                {getCharacterEntryIcon(category)}
                                <span className="flex-1 text-left truncate">
                                  {character.name}
                                  {character.role && (
                                    <span className="text-muted-foreground text-xs">
                                      {' '}
                                      ({character.role})
                                    </span>
                                  )}
                                </span>
                              </button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                  >
                                    <MoreVertical className="h-3.5 w-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setCharacterToEdit(character)
                                      setEditCharacterDialogOpen(true)
                                    }}
                                  >
                                    <Edit className="h-3.5 w-3.5 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setCharacterToEdit(character)
                                      setDeleteCharacterDialogOpen(true)
                                    }}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Lorebook Section */}
        {showLorebook && (
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('lorebook')}
              className="w-full flex items-center gap-2 px-2 py-2 hover:bg-accent rounded-md text-sm font-semibold"
            >
              {expandedSections.has('lorebook') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <Book className="h-4 w-4 text-amber-500" />
              <span className="flex-1 text-left">Lorebook ({lorebookEntries.length})</span>
            </button>

            {expandedSections.has('lorebook') && (
              <div className="ml-4 space-y-1.5 mt-0.5">
                {lorebookEntries.length === 0 ? (
                  <div className="text-xs text-muted-foreground px-2 py-1.5">
                    No lorebook entries yet
                  </div>
                ) : (
                  Object.entries(lorebookByCategory).map(([category, entries]) => (
                    <div key={category} className="space-y-0.5">
                      <button
                        onClick={() => toggleLorebookCategory(category)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-accent/50 rounded-md text-sm transition-colors"
                      >
                        {expandedLorebookCategories.has(category) ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                        {getLorebookCategoryIcon(category)}
                        <span className="flex-1 text-left">
                          {category} ({entries.length})
                        </span>
                      </button>
                      {expandedLorebookCategories.has(category) && (
                        <div className="ml-5 space-y-0.5">
                          {entries.slice(0, 5).map(entry => (
                            <div
                              key={entry.id}
                              className={`group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                                selectedViewType === 'lorebook' && selectedViewId === entry.id
                                  ? 'bg-primary/10 text-primary'
                                  : 'hover:bg-accent/50'
                              }`}
                              onClick={() => onViewLorebook?.(entry)}
                            >
                              <Bookmark className="h-3 w-3 text-amber-300 flex-shrink-0" />
                              <span className="flex-1 text-sm truncate">{entry.key}</span>
                            </div>
                          ))}
                          {entries.length > 5 && (
                            <button
                              className="w-full text-left px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-colors"
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
      </div>

      {/* Rename Chapter Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chapter</DialogTitle>
            <DialogDescription>Enter a new title for this chapter</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="chapter-title">Chapter Title</Label>
            <Input
              id="chapter-title"
              value={newChapterTitle}
              onChange={e => setNewChapterTitle(e.target.value)}
              placeholder="Chapter title"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameChapter} disabled={!newChapterTitle.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Character Dialog - Not Implemented */}
      <Dialog open={editCharacterDialogOpen} onOpenChange={setEditCharacterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Character</DialogTitle>
            <DialogDescription>
              This feature is not yet implemented. Please use the Characters page to edit
              characters.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCharacterDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => router.push(`/characters/${project.id}`)}>
              Go to Characters Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Character Dialog - Not Implemented */}
      <Dialog open={deleteCharacterDialogOpen} onOpenChange={setDeleteCharacterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Character</DialogTitle>
            <DialogDescription>
              This feature is not yet implemented. Please use the Characters page to delete
              characters.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCharacterDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => router.push(`/characters/${project.id}`)}>
              Go to Characters Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resize Handle */}
      <div
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/50 transition-colors group"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute top-0 right-0 w-1 h-full bg-transparent group-hover:bg-primary/30" />
      </div>
    </div>
  )
}
