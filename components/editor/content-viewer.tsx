'use client'

import { useState, useCallback, useEffect } from 'react'
import { User, Book, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { WikiEditor } from './wiki-editor'

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

export function ContentViewer({ type, content, projectId, onBack }: ContentViewerProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const [charData, setCharData] = useState<Character>(
    type === 'character' ? (content as Character) : ({} as Character)
  )

  const [loreData, setLoreData] = useState<LorebookEntry>(
    type === 'lorebook' ? (content as LorebookEntry) : ({} as LorebookEntry)
  )

  // Reset state when content changes (navigating between entries)
  useEffect(() => {
    setHasChanges(false)
    if (type === 'character') {
      setCharData(content as Character)
    } else {
      setLoreData(content as LorebookEntry)
    }
  }, [content, type])

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

  const contentId = type === 'character' ? charData.id : loreData.id

  return (
    <div className="h-full flex flex-col relative">
      <ScrollArea className="flex-1">
        <article className="max-w-3xl mx-auto p-8 pb-24">
          {/* Wiki Page Title */}
          <header className="mb-4 pb-3 border-b-2 border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              {type === 'character' ? <User className="h-4 w-4" /> : <Book className="h-4 w-4" />}
              <span className="text-xs uppercase tracking-wide">
                {type === 'character' ? 'Character' : 'Lorebook Entry'}
              </span>
            </div>
            <h1 className="text-3xl font-serif font-bold">
              {type === 'character' ? charData.name : loreData.key}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              {type === 'character' && charData.role && (
                <Badge variant="outline">{charData.role}</Badge>
              )}
              {type === 'lorebook' && loreData.category && (
                <Badge variant="outline">{loreData.category}</Badge>
              )}
              {type === 'lorebook' && (
                <span className="text-xs text-muted-foreground">
                  Referenced {loreData.useCount} times
                </span>
              )}
            </div>
          </header>

          {/* Character Sections */}
          {type === 'character' && (
            <div className="space-y-4">
              <section>
                <h2 className="text-lg font-semibold mb-1 text-foreground">Description</h2>
                <WikiEditor
                  key={`${contentId}-description`}
                  content={charData.description || ''}
                  onChange={(v) => updateCharField('description', v)}
                  placeholder="Physical appearance, distinguishing features..."
                />
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-1 text-foreground">Personality Traits</h2>
                <WikiEditor
                  key={`${contentId}-traits`}
                  content={charData.traits || ''}
                  onChange={(v) => updateCharField('traits', v)}
                  placeholder="Character traits, behaviors, quirks..."
                />
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-1 text-foreground">Background</h2>
                <WikiEditor
                  key={`${contentId}-background`}
                  content={charData.background || ''}
                  onChange={(v) => updateCharField('background', v)}
                  placeholder="History, origin story, past events..."
                />
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-1 text-foreground">Relationships</h2>
                <WikiEditor
                  key={`${contentId}-relationships`}
                  content={charData.relationships || ''}
                  onChange={(v) => updateCharField('relationships', v)}
                  placeholder="Connections with other characters..."
                />
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-1 text-foreground">Goals & Motivations</h2>
                <WikiEditor
                  key={`${contentId}-goals`}
                  content={charData.goals || ''}
                  onChange={(v) => updateCharField('goals', v)}
                  placeholder="What drives this character..."
                />
              </section>
            </div>
          )}

          {/* Lorebook Content */}
          {type === 'lorebook' && (
            <section>
              <WikiEditor
                key={`${contentId}-value`}
                content={loreData.value || ''}
                onChange={(v) => updateLoreField('value', v)}
                placeholder="Enter lore content..."
              />
            </section>
          )}
        </article>
      </ScrollArea>

      {/* Floating Save Bar */}
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
