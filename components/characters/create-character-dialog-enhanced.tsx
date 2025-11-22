'use client'

import { useState } from 'react'
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
import { ImageUpload, ImageGalleryUpload } from '@/components/ui/image-upload'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface CreateCharacterDialogEnhancedProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  onCharacterCreated: (character: any) => void
}

export function CreateCharacterDialogEnhanced({
  open,
  onOpenChange,
  projectId,
  onCharacterCreated,
}: CreateCharacterDialogEnhancedProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Basic fields
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [role, setRole] = useState('')
  const [occupation, setOccupation] = useState('')
  const [description, setDescription] = useState('')
  const [appearance, setAppearance] = useState('')

  // Personality & Background
  const [traits, setTraits] = useState('')
  const [background, setBackground] = useState('')
  const [voice, setVoice] = useState('')

  // Story elements
  const [relationships, setRelationships] = useState('')
  const [goals, setGoals] = useState('')

  // Abilities & Details
  const [abilities, setAbilities] = useState('')
  const [equipment, setEquipment] = useState('')
  const [fears, setFears] = useState('')
  const [secrets, setSecrets] = useState('')

  // Images
  const [avatar, setAvatar] = useState('')
  const [images, setImages] = useState<string[]>([])

  // Organization
  const [aliases, setAliases] = useState<string[]>([])
  const [aliasInput, setAliasInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [color, setColor] = useState('#3B82F6')
  const [isMainCharacter, setIsMainCharacter] = useState(false)
  const [notes, setNotes] = useState('')

  const handleAddAlias = () => {
    if (aliasInput.trim() && !aliases.includes(aliasInput.trim())) {
      setAliases([...aliases, aliasInput.trim()])
      setAliasInput('')
    }
  }

  const handleRemoveAlias = (alias: string) => {
    setAliases(aliases.filter(a => a !== alias))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          name,
          age: age || null,
          role: role || null,
          occupation: occupation || null,
          description: description || null,
          appearance: appearance || null,
          traits: traits || null,
          background: background || null,
          voice: voice || null,
          relationships: relationships || null,
          goals: goals || null,
          abilities: abilities || null,
          equipment: equipment || null,
          fears: fears || null,
          secrets: secrets || null,
          avatar: avatar || null,
          images: images.length > 0 ? JSON.stringify(images) : null,
          aliases: aliases.length > 0 ? JSON.stringify(aliases) : null,
          tags: tags.length > 0 ? JSON.stringify(tags) : null,
          color: color || null,
          isMainCharacter,
          notes: notes || null,
        }),
      })

      if (response.ok) {
        const character = await response.json()
        onCharacterCreated(character)
        resetForm()
        onOpenChange(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Error creating character:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setName('')
    setAge('')
    setRole('')
    setOccupation('')
    setDescription('')
    setAppearance('')
    setTraits('')
    setBackground('')
    setVoice('')
    setRelationships('')
    setGoals('')
    setAbilities('')
    setEquipment('')
    setFears('')
    setSecrets('')
    setAvatar('')
    setImages([])
    setAliases([])
    setTags([])
    setColor('#3B82F6')
    setIsMainCharacter(false)
    setNotes('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Create New Character</DialogTitle>
          <DialogDescription>
            Add a richly detailed character to your story
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="visual">Visual</TabsTrigger>
              <TabsTrigger value="personality">Personality</TabsTrigger>
              <TabsTrigger value="story">Story</TabsTrigger>
              <TabsTrigger value="abilities">Abilities</TabsTrigger>
              <TabsTrigger value="organization">Organize</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Character name"
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
                    placeholder="25"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Protagonist, Antagonist, etc."
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="Detective, Wizard, Merchant..."
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Physical Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief physical description..."
                  rows={3}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="appearance">Detailed Appearance</Label>
                <Textarea
                  id="appearance"
                  value={appearance}
                  onChange={(e) => setAppearance(e.target.value)}
                  placeholder="Detailed physical features, clothing style, distinguishing marks..."
                  rows={4}
                  disabled={loading}
                />
              </div>
            </TabsContent>

            {/* Visual Tab */}
            <TabsContent value="visual" className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label>Character Avatar</Label>
                <ImageUpload
                  value={avatar}
                  onChange={setAvatar}
                  placeholder="Upload character portrait"
                  aspectRatio="portrait"
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Images</Label>
                <p className="text-sm text-gray-500">Character art, references, concept sketches</p>
                <ImageGalleryUpload
                  values={images}
                  onChange={setImages}
                  maxImages={8}
                />
              </div>
            </TabsContent>

            {/* Personality Tab */}
            <TabsContent value="personality" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="traits">Personality Traits</Label>
                <Textarea
                  id="traits"
                  value={traits}
                  onChange={(e) => setTraits(e.target.value)}
                  placeholder="Brave, cautious, humorous, analytical..."
                  rows={4}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="voice">Voice & Speech Patterns</Label>
                <Textarea
                  id="voice"
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  placeholder="How they speak, accent, catchphrases, tone..."
                  rows={3}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="background">Background & History</Label>
                <Textarea
                  id="background"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  placeholder="Character's backstory, upbringing, key life events..."
                  rows={5}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fears">Fears & Weaknesses</Label>
                <Textarea
                  id="fears"
                  value={fears}
                  onChange={(e) => setFears(e.target.value)}
                  placeholder="What scares them, vulnerabilities, character flaws..."
                  rows={3}
                  disabled={loading}
                />
              </div>
            </TabsContent>

            {/* Story Tab */}
            <TabsContent value="story" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="goals">Goals & Motivations</Label>
                <Textarea
                  id="goals"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="What does this character want? What drives them?"
                  rows={4}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationships">Relationships</Label>
                <Textarea
                  id="relationships"
                  value={relationships}
                  onChange={(e) => setRelationships(e.target.value)}
                  placeholder="Relationships with other characters..."
                  rows={4}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secrets">Secrets & Hidden Information</Label>
                <Textarea
                  id="secrets"
                  value={secrets}
                  onChange={(e) => setSecrets(e.target.value)}
                  placeholder="Plot-relevant secrets, hidden past, concealed identities..."
                  rows={4}
                  disabled={loading}
                />
              </div>
            </TabsContent>

            {/* Abilities Tab */}
            <TabsContent value="abilities" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="abilities">Abilities & Skills</Label>
                <Textarea
                  id="abilities"
                  value={abilities}
                  onChange={(e) => setAbilities(e.target.value)}
                  placeholder="Special powers, talents, learned skills..."
                  rows={4}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipment">Equipment & Possessions</Label>
                <Textarea
                  id="equipment"
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  placeholder="Weapons, tools, important items they carry..."
                  rows={4}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any other information about this character..."
                  rows={4}
                  disabled={loading}
                />
              </div>
            </TabsContent>

            {/* Organization Tab */}
            <TabsContent value="organization" className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="main-character">Main Character</Label>
                  <p className="text-sm text-gray-500">Mark as a primary character in your story</p>
                </div>
                <Switch
                  id="main-character"
                  checked={isMainCharacter}
                  onCheckedChange={setIsMainCharacter}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color Tag</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-20 h-10"
                    disabled={loading}
                  />
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#3B82F6"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aliases">Aliases & Nicknames</Label>
                <div className="flex gap-2">
                  <Input
                    id="aliases"
                    value={aliasInput}
                    onChange={(e) => setAliasInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAlias())}
                    placeholder="Add alias..."
                    disabled={loading}
                  />
                  <Button type="button" onClick={handleAddAlias} disabled={loading}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {aliases.map((alias) => (
                    <Badge key={alias} variant="secondary">
                      {alias}
                      <button
                        type="button"
                        onClick={() => handleRemoveAlias(alias)}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add tag..."
                    disabled={loading}
                  />
                  <Button type="button" onClick={handleAddTag} disabled={loading}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
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
              {loading ? 'Creating...' : 'Create Character'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
