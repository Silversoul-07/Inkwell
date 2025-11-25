'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  User,
  Book,
  MapPin,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface Character {
  id: string
  name: string
  role?: string | null
  age?: string | null
  description?: string | null
  appearance?: string | null
  traits?: string | null
  background?: string | null
  relationships?: string | null
  goals?: string | null
  abilities?: string | null
  equipment?: string | null
  fears?: string | null
  secrets?: string | null
  voice?: string | null
  avatar?: string | null
  images?: string | null
  aliases?: string | null
  tags?: string | null
  color?: string | null
  isMainCharacter?: boolean
  occupation?: string | null
  notes?: string | null
}

interface LorebookEntry {
  id: string
  key: string
  value: string
  category?: string | null
  summary?: string | null
  thumbnail?: string | null
  images?: string | null
  subcategory?: string | null
  tags?: string | null
  aliases?: string | null
  priority: number
  useCount: number
  timeframe?: string | null
  spoilerLevel?: number
  isCanon?: boolean
}

interface EnhancedPreviewPanelProps {
  characters: Character[]
  lorebookEntries: LorebookEntry[]
  sceneContent: string
}

export function EnhancedPreviewPanel({
  characters,
  lorebookEntries,
  sceneContent,
}: EnhancedPreviewPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    characters: true,
    lorebook: true,
  })
  const [selectedItem, setSelectedItem] = useState<{
    type: 'character' | 'lorebook'
    data: Character | LorebookEntry
  } | null>(null)

  // Detect mentioned characters and lorebook entries
  const mentionedCharacters = characters.filter(char => {
    const aliases = char.aliases ? JSON.parse(char.aliases) : []
    const names = [char.name, ...aliases]
    return names.some(name => new RegExp(`\\b${name}\\b`, 'i').test(sceneContent))
  })

  const triggeredLorebook = lorebookEntries.filter(entry => {
    const aliases = entry.aliases ? JSON.parse(entry.aliases) : []
    const keywords = [entry.key, ...aliases]
    return keywords.some(keyword => new RegExp(`\\b${keyword}\\b`, 'i').test(sceneContent))
  })

  const toggleSection = (section: 'characters' | 'lorebook') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const renderCharacterPreview = (character: Character) => {
    const aliases = character.aliases ? JSON.parse(character.aliases) : []
    const tags = character.tags ? JSON.parse(character.tags) : []
    const images = character.images ? JSON.parse(character.images) : []

    return (
      <div className="space-y-4">
        {character.avatar && (
          <div className="flex justify-center">
            <img
              src={character.avatar}
              alt={character.name}
              className="w-48 h-64 object-cover rounded-lg border-2"
              style={{ borderColor: character.color || '#3B82F6' }}
            />
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold">{character.name}</h3>
            {character.isMainCharacter && <Badge variant="default">Main Character</Badge>}
          </div>

          {aliases.length > 0 && (
            <div className="text-sm text-muted-foreground">Also known as: {aliases.join(', ')}</div>
          )}

          <div className="flex flex-wrap gap-2">
            {character.age && <Badge variant="outline">Age: {character.age}</Badge>}
            {character.role && <Badge variant="outline">{character.role}</Badge>}
            {character.occupation && <Badge variant="outline">{character.occupation}</Badge>}
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="personality">Personality</TabsTrigger>
            <TabsTrigger value="story">Story</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="space-y-3">
            {character.description && (
              <div>
                <h4 className="font-semibold mb-1">Physical Description</h4>
                <p className="text-sm text-muted-foreground">{character.description}</p>
              </div>
            )}
            {character.appearance && (
              <div>
                <h4 className="font-semibold mb-1">Detailed Appearance</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {character.appearance}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="personality" className="space-y-3">
            {character.traits && (
              <div>
                <h4 className="font-semibold mb-1">Personality Traits</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {character.traits}
                </p>
              </div>
            )}
            {character.voice && (
              <div>
                <h4 className="font-semibold mb-1">Voice & Speech</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {character.voice}
                </p>
              </div>
            )}
            {character.background && (
              <div>
                <h4 className="font-semibold mb-1">Background</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {character.background}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="story" className="space-y-3">
            {character.goals && (
              <div>
                <h4 className="font-semibold mb-1">Goals & Motivations</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {character.goals}
                </p>
              </div>
            )}
            {character.relationships && (
              <div>
                <h4 className="font-semibold mb-1">Relationships</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {character.relationships}
                </p>
              </div>
            )}
            {character.fears && (
              <div>
                <h4 className="font-semibold mb-1">Fears & Weaknesses</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {character.fears}
                </p>
              </div>
            )}
            {character.secrets && (
              <div>
                <h4 className="font-semibold mb-1 text-orange-600">Secrets</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap italic">
                  {character.secrets}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-3">
            {character.abilities && (
              <div>
                <h4 className="font-semibold mb-1">Abilities & Skills</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {character.abilities}
                </p>
              </div>
            )}
            {character.equipment && (
              <div>
                <h4 className="font-semibold mb-1">Equipment & Possessions</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {character.equipment}
                </p>
              </div>
            )}
            {character.notes && (
              <div>
                <h4 className="font-semibold mb-1">Notes</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {character.notes}
                </p>
              </div>
            )}
            {images.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Gallery</h4>
                <div className="grid grid-cols-2 gap-2">
                  {images.map((img: string, i: number) => (
                    <img
                      key={i}
                      src={img}
                      alt={`${character.name} ${i + 1}`}
                      className="w-full aspect-square object-cover rounded border"
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  const renderLorebookPreview = (entry: LorebookEntry) => {
    const aliases = entry.aliases ? JSON.parse(entry.aliases) : []
    const tags = entry.tags ? JSON.parse(entry.tags) : []
    const images = entry.images ? JSON.parse(entry.images) : []

    return (
      <div className="space-y-4">
        {entry.thumbnail && (
          <div className="flex justify-center">
            <img
              src={entry.thumbnail}
              alt={entry.key}
              className="w-full max-h-64 object-cover rounded-lg border-2 border-gray-200"
            />
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">{entry.key}</h3>
            <div className="flex gap-1">
              {!entry.isCanon && <Badge variant="outline">Non-Canon</Badge>}
              {(entry.spoilerLevel ?? 0) > 0 && (
                <Badge variant="destructive">Spoiler {entry.spoilerLevel}</Badge>
              )}
            </div>
          </div>

          {aliases.length > 0 && (
            <div className="text-sm text-muted-foreground">Also known as: {aliases.join(', ')}</div>
          )}

          <div className="flex flex-wrap gap-2">
            {entry.category && <Badge variant="outline">{entry.category}</Badge>}
            {entry.subcategory && <Badge variant="secondary">{entry.subcategory}</Badge>}
            {entry.timeframe && (
              <Badge variant="outline" className="text-xs">
                {entry.timeframe}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              Priority: {entry.priority}
            </Badge>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {entry.summary && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-semibold mb-1 text-sm">Summary</h4>
              <p className="text-sm text-muted-foreground">{entry.summary}</p>
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-2">Full Description</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{entry.value}</p>
          </div>

          {images.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-1">
                <ImageIcon className="h-4 w-4" />
                Related Images
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {images.map((img: string, i: number) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${entry.key} ${i + 1}`}
                    className="w-full aspect-video object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground pt-2 border-t">
            <p>Used {entry.useCount} times in your writing</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="w-80 border-l bg-background">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Scene Context</h2>
              <p className="text-sm text-muted-foreground">
                Characters and lore detected in this scene
              </p>
            </div>

            {/* Characters Section */}
            <div className="border rounded-lg">
              <button
                onClick={() => toggleSection('characters')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Characters</span>
                  <Badge variant="secondary">{mentionedCharacters.length}</Badge>
                </div>
                {expandedSections.characters ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {expandedSections.characters && (
                <div className="p-2 space-y-1 border-t">
                  {mentionedCharacters.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No characters detected
                    </p>
                  ) : (
                    mentionedCharacters.map(char => (
                      <button
                        key={char.id}
                        onClick={() => setSelectedItem({ type: 'character', data: char })}
                        className="w-full text-left px-3 py-2 rounded hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {char.avatar ? (
                            <img
                              src={char.avatar}
                              alt={char.name}
                              className="w-8 h-8 rounded-full object-cover border"
                              style={{ borderColor: char.color || '#3B82F6' }}
                            />
                          ) : (
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: char.color || '#3B82F6' }}
                            >
                              {char.name[0]}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{char.name}</div>
                            {char.role && (
                              <div className="text-xs text-muted-foreground truncate">
                                {char.role}
                              </div>
                            )}
                          </div>
                          {char.isMainCharacter && <Sparkles className="h-3 w-3 text-yellow-500" />}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Lorebook Section */}
            <div className="border rounded-lg">
              <button
                onClick={() => toggleSection('lorebook')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  <span className="font-medium">Lorebook</span>
                  <Badge variant="secondary">{triggeredLorebook.length}</Badge>
                </div>
                {expandedSections.lorebook ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {expandedSections.lorebook && (
                <div className="p-2 space-y-1 border-t">
                  {triggeredLorebook.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No lorebook entries detected
                    </p>
                  ) : (
                    triggeredLorebook.map(entry => (
                      <button
                        key={entry.id}
                        onClick={() => setSelectedItem({ type: 'lorebook', data: entry })}
                        className="w-full text-left px-3 py-2 rounded hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          {entry.thumbnail ? (
                            <img
                              src={entry.thumbnail}
                              alt={entry.key}
                              className="w-10 h-10 rounded object-cover border"
                            />
                          ) : (
                            <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{entry.key}</div>
                            {entry.category && (
                              <div className="text-xs text-muted-foreground">{entry.category}</div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Preview Dialog */}
      <Dialog open={selectedItem !== null} onOpenChange={open => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.type === 'character' ? 'Character Details' : 'Lorebook Entry'}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.type === 'character'
                ? 'Complete character information'
                : 'Full lorebook entry details'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            {selectedItem?.type === 'character'
              ? renderCharacterPreview(selectedItem.data as Character)
              : selectedItem && renderLorebookPreview(selectedItem.data as LorebookEntry)}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
