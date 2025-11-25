'use client'

import { useState } from 'react'
import { Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CharacterCard } from './character-card'
import { CreateCharacterDialogEnhanced } from './create-character-dialog-enhanced'
import { CharacterChatDialog } from './character-chat-dialog'

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
  createdAt?: Date
  updatedAt?: Date
}

interface CharacterManagerProps {
  projectId: string
  initialCharacters: Character[]
}

export function CharacterManager({ projectId, initialCharacters }: CharacterManagerProps) {
  const [characters, setCharacters] = useState<Character[]>(initialCharacters)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false)

  const handleCharacterCreated = (newCharacter: Character) => {
    setCharacters([newCharacter, ...characters])
  }

  const handleCharacterUpdated = (updatedCharacter: Character) => {
    setCharacters(characters.map(c => (c.id === updatedCharacter.id ? updatedCharacter : c)))
  }

  const handleCharacterDeleted = (characterId: string) => {
    setCharacters(characters.filter(c => c.id !== characterId))
  }

  const handleSelectForChat = (character: Character) => {
    setSelectedCharacter(character)
    setIsChatDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Characters ({characters.length})
        </h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Character
        </Button>
      </div>

      {characters.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-lg">
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No characters yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first character to bring your story to life
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Character
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map(character => (
            <CharacterCard
              key={character.id}
              character={character}
              onUpdate={handleCharacterUpdated}
              onDelete={handleCharacterDeleted}
              onSelect={handleSelectForChat}
            />
          ))}
        </div>
      )}

      <CreateCharacterDialogEnhanced
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        projectId={projectId}
        onCharacterCreated={handleCharacterCreated}
      />

      <CharacterChatDialog
        open={isChatDialogOpen}
        onOpenChange={setIsChatDialogOpen}
        character={selectedCharacter}
      />
    </div>
  )
}
