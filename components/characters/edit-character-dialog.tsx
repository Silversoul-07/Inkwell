'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

interface EditCharacterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  character: Character
  onCharacterUpdated: (character: Character) => void
}

export function EditCharacterDialog({
  open,
  onOpenChange,
  character,
  onCharacterUpdated,
}: EditCharacterDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(character.name)
  const [age, setAge] = useState(character.age || '')
  const [role, setRole] = useState(character.role || '')
  const [description, setDescription] = useState(character.description || '')
  const [traits, setTraits] = useState(character.traits || '')
  const [background, setBackground] = useState(character.background || '')
  const [relationships, setRelationships] = useState(character.relationships || '')
  const [goals, setGoals] = useState(character.goals || '')

  useEffect(() => {
    setName(character.name)
    setAge(character.age || '')
    setRole(character.role || '')
    setDescription(character.description || '')
    setTraits(character.traits || '')
    setBackground(character.background || '')
    setRelationships(character.relationships || '')
    setGoals(character.goals || '')
  }, [character])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/characters/${character.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          age: age || null,
          role: role || null,
          description: description || null,
          traits: traits || null,
          background: background || null,
          relationships: relationships || null,
          goals: goals || null,
        }),
      })

      if (response.ok) {
        const updated = await response.json()
        onCharacterUpdated(updated)
        onOpenChange(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating character:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Edit Character</DialogTitle>
          <DialogDescription>
            Update character details and attributes
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="story">Story</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Physical Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  disabled={loading}
                />
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="traits">Personality Traits</Label>
                <Textarea
                  id="traits"
                  value={traits}
                  onChange={(e) => setTraits(e.target.value)}
                  rows={4}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="background">Background & History</Label>
                <Textarea
                  id="background"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  rows={4}
                  disabled={loading}
                />
              </div>
            </TabsContent>

            <TabsContent value="story" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="relationships">Relationships</Label>
                <Textarea
                  id="relationships"
                  value={relationships}
                  onChange={(e) => setRelationships(e.target.value)}
                  rows={4}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals">Goals & Motivations</Label>
                <Textarea
                  id="goals"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  rows={4}
                  disabled={loading}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
