'use client'

import { useState, useCallback } from 'react'
import { User, Book, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
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
}

function WikiSection({ title, content, onChange }: WikiSectionProps) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-foreground border-b border-border pb-1 mb-3">
        {title}
      </h2>
      <MiniEditor
        content={content}
        onChange={onChange}
        placeholder={`Enter ${title.toLowerCase()}...`}
        minHeight="60px"
      />
    </div>
  )
}

export function ContentViewer({ type, content, projectId, onBack }: ContentViewerProps) {
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
    if (type === 'character') return <User className="h-6 w-6" />
    return <Book className="h-6 w-6" />
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto p-8 pb-24">
          {/* Wiki Title Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-muted-foreground">{getIcon()}</div>
              <h1 className="text-3xl font-bold text-foreground">{getTitle()}</h1>
            </div>
            <div className="flex items-center gap-2">
              {type === 'character' && charData.role && (
                <Badge variant="secondary">{charData.role}</Badge>
              )}
              {type === 'lorebook' && loreData.category && (
                <Badge variant="secondary">{loreData.category}</Badge>
              )}
              {type === 'lorebook' && (
                <span className="text-sm text-muted-foreground">
                  Used {loreData.useCount} times
                </span>
              )}
            </div>
            <div className="h-px bg-border mt-4" />
          </div>

          {/* Character Wiki Content */}
          {type === 'character' && (
            <div>
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

          {/* Lorebook Wiki Content */}
          {type === 'lorebook' && (
            <div>
              <WikiSection
                title="Content"
                content={loreData.value || ''}
                onChange={(v) => updateLoreField('value', v)}
              />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Floating Bottom Save Bar */}
      {hasChanges && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-background border rounded-full shadow-lg px-4 py-2 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Unsaved changes</span>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-full gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
