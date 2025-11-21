'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { User, Book, Save, Loader2, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MiniEditor } from './mini-editor'
import { cn } from '@/lib/utils'

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

type ViewType = 'character' | 'lorebook'

interface ContentViewerProps {
  type: ViewType
  content: Character | LorebookEntry
  projectId: string
  onBack: () => void
}

interface WikiSectionProps {
  title: string
  content: string
  onChange: (value: string) => void
  defaultExpanded?: boolean
}

function WikiSection({ title, content, onChange, defaultExpanded = true }: WikiSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div className="border-b border-border/50 last:border-b-0">
      <button
        type="button"
        className="w-full flex items-center gap-2 py-3 px-1 text-left hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <h3 className="font-semibold text-foreground">{title}</h3>
      </button>
      {expanded && (
        <div className="pb-4 px-1">
          <MiniEditor
            content={content}
            onChange={onChange}
            placeholder={`Enter ${title.toLowerCase()}...`}
            minHeight="80px"
          />
        </div>
      )}
    </div>
  )
}

export function ContentViewer({ type, content, projectId, onBack }: ContentViewerProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Character state
  const [charData, setCharData] = useState<Character>(
    type === 'character' ? (content as Character) : ({} as Character)
  )

  // Lorebook state
  const [loreData, setLoreData] = useState<LorebookEntry>(
    type === 'lorebook' ? (content as LorebookEntry) : ({} as LorebookEntry)
  )

  const updateCharField = useCallback((field: keyof Character, value: string) => {
    setCharData((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }, [])

  const updateLoreField = useCallback((field: keyof LorebookEntry, value: string) => {
    setLoreData((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }, [])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      if (type === 'character') {
        await fetch(`/api/characters/${charData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(charData),
        })
      } else {
        await fetch(`/api/lorebook/${loreData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loreData),
        })
      }
      setHasChanges(false)
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setIsSaving(false)
    }
  }, [type, charData, loreData])

  const getTitle = () => {
    if (type === 'character') return charData.name
    return loreData.key
  }

  const getIcon = () => {
    if (type === 'character') return <User className="h-5 w-5" />
    return <Book className="h-5 w-5" />
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">{getIcon()}</div>
          <div>
            <h1 className="text-xl font-bold">{getTitle()}</h1>
            {type === 'character' && charData.role && (
              <Badge variant="secondary" className="mt-1">
                {charData.role}
              </Badge>
            )}
            {type === 'lorebook' && loreData.category && (
              <Badge variant="secondary" className="mt-1">
                {loreData.category}
              </Badge>
            )}
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto p-6">
          {type === 'character' && (
            <div className="space-y-2">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border/50">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    Name
                  </label>
                  <Input
                    value={charData.name || ''}
                    onChange={(e) => updateCharField('name', e.target.value)}
                    placeholder="Character name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    Role
                  </label>
                  <Input
                    value={charData.role || ''}
                    onChange={(e) => updateCharField('role', e.target.value)}
                    placeholder="Protagonist, Antagonist, etc."
                  />
                </div>
              </div>

              {/* Wiki Sections */}
              <WikiSection
                title="Description"
                content={charData.description || ''}
                onChange={(v) => updateCharField('description', v)}
              />
              <WikiSection
                title="Personality Traits"
                content={charData.traits || ''}
                onChange={(v) => updateCharField('traits', v)}
              />
              <WikiSection
                title="Background"
                content={charData.background || ''}
                onChange={(v) => updateCharField('background', v)}
              />
              <WikiSection
                title="Relationships"
                content={charData.relationships || ''}
                onChange={(v) => updateCharField('relationships', v)}
              />
              <WikiSection
                title="Goals & Motivations"
                content={charData.goals || ''}
                onChange={(v) => updateCharField('goals', v)}
              />
            </div>
          )}

          {type === 'lorebook' && (
            <div className="space-y-2">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border/50">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    Entry Name
                  </label>
                  <Input
                    value={loreData.key || ''}
                    onChange={(e) => updateLoreField('key', e.target.value)}
                    placeholder="Entry name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    Category
                  </label>
                  <Input
                    value={loreData.category || ''}
                    onChange={(e) => updateLoreField('category', e.target.value)}
                    placeholder="Location, Magic, etc."
                  />
                </div>
              </div>

              {/* Content */}
              <WikiSection
                title="Content"
                content={loreData.value || ''}
                onChange={(v) => updateLoreField('value', v)}
              />

              {/* Stats */}
              <div className="pt-4 text-sm text-muted-foreground">
                Used {loreData.useCount} times
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
