'use client'

import { useState } from 'react'
import { Pencil, Trash2, User, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EditCharacterDialog } from './edit-character-dialog'

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

interface CharacterCardProps {
  character: Character
  onUpdate: (character: Character) => void
  onDelete: (characterId: string) => void
  onSelect: (character: Character) => void
}

export function CharacterCard({
  character,
  onUpdate,
  onDelete,
  onSelect,
}: CharacterCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Delete ${character.name}?`)) return

    try {
      const response = await fetch(`/api/characters/${character.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onDelete(character.id)
      }
    } catch (error) {
      console.error('Error deleting character:', error)
    }
  }

  return (
    <>
      <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{character.name}</h3>
              {character.role && (
                <p className="text-sm text-muted-foreground">{character.role}</p>
              )}
            </div>
          </div>
        </div>

        {character.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {character.description}
          </p>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          {character.age && <span>Age: {character.age}</span>}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Pencil className="h-3 w-3 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onSelect(character)}
          >
            <MessageSquare className="h-3 w-3 mr-2" />
            Chat
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <EditCharacterDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        character={character}
        onCharacterUpdated={onUpdate}
      />
    </>
  )
}
