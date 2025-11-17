'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

interface UserInstruction {
  id: string
  scope: string
  instructions: string
  isEnabled: boolean
  priority: number
  projectId?: string
  characterId?: string
}

interface UserInstructionsManagerProps {
  scope?: 'global' | 'project' | 'character'
  projectId?: string
  characterId?: string
}

export function UserInstructionsManager({
  scope = 'global',
  projectId,
  characterId,
}: UserInstructionsManagerProps) {
  const { toast } = useToast()
  const [instructions, setInstructions] = useState<UserInstruction[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingInstruction, setEditingInstruction] = useState<UserInstruction | null>(null)
  const [previewCombined, setPreviewCombined] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    instructions: '',
    priority: 0,
    isEnabled: true,
  })

  useEffect(() => {
    loadInstructions()
  }, [scope, projectId, characterId])

  const loadInstructions = async () => {
    try {
      const params = new URLSearchParams()
      params.append('scope', scope)
      if (projectId) params.append('projectId', projectId)
      if (characterId) params.append('characterId', characterId)

      const response = await fetch(`/api/user-instructions?${params}`)
      if (response.ok) {
        const data = await response.json()
        setInstructions(data)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load user instructions',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to load instructions:', error)
      toast({
        title: 'Error',
        description: 'Failed to load user instructions',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/user-instructions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          scope,
          projectId,
          characterId,
        }),
      })

      if (response.ok) {
        await loadInstructions()
        setIsCreateOpen(false)
        resetForm()
        toast({
          title: 'Success',
          description: 'User instruction created successfully',
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to create user instruction',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to create instruction:', error)
      toast({
        title: 'Error',
        description: 'Failed to create user instruction',
        variant: 'destructive',
      })
    }
  }

  const handleUpdate = async (id: string) => {
    try {
      const response = await fetch(`/api/user-instructions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await loadInstructions()
        setEditingInstruction(null)
        resetForm()
        toast({
          title: 'Success',
          description: 'User instruction updated successfully',
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to update user instruction',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to update instruction:', error)
      toast({
        title: 'Error',
        description: 'Failed to update user instruction',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this instruction?')) return

    try {
      const response = await fetch(`/api/user-instructions/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadInstructions()
        toast({
          title: 'Success',
          description: 'User instruction deleted successfully',
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete user instruction',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to delete instruction:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete user instruction',
        variant: 'destructive',
      })
    }
  }

  const handleToggleEnabled = async (id: string, isEnabled: boolean) => {
    try {
      const response = await fetch(`/api/user-instructions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled }),
      })

      if (response.ok) {
        await loadInstructions()
        toast({
          title: 'Success',
          description: `User instruction ${isEnabled ? 'enabled' : 'disabled'}`,
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to toggle user instruction',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to toggle instruction:', error)
      toast({
        title: 'Error',
        description: 'Failed to toggle user instruction',
        variant: 'destructive',
      })
    }
  }

  const handleChangePriority = async (id: string, delta: number) => {
    const instruction = instructions.find((i) => i.id === id)
    if (!instruction) return

    const newPriority = Math.max(0, Math.min(10, instruction.priority + delta))

    try {
      const response = await fetch(`/api/user-instructions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority }),
      })

      if (response.ok) {
        await loadInstructions()
      }
    } catch (error) {
      console.error('Failed to update priority:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      instructions: '',
      priority: 0,
      isEnabled: true,
    })
  }

  const startEdit = (instruction: UserInstruction) => {
    setEditingInstruction(instruction)
    setFormData({
      instructions: instruction.instructions,
      priority: instruction.priority,
      isEnabled: instruction.isEnabled,
    })
  }

  const getScopeLabel = () => {
    switch (scope) {
      case 'global':
        return 'Global Instructions (All Projects)'
      case 'project':
        return 'Project Instructions'
      case 'character':
        return 'Character Instructions'
      default:
        return 'Instructions'
    }
  }

  const getScopeDescription = () => {
    switch (scope) {
      case 'global':
        return 'These instructions apply to all AI interactions across all projects'
      case 'project':
        return 'These instructions apply only to this project (overrides global)'
      case 'character':
        return 'These instructions apply when writing/chatting with this character (highest priority)'
      default:
        return ''
    }
  }

  const getCombinedInstructions = () => {
    const enabled = instructions.filter((i) => i.isEnabled)
    const sorted = enabled.sort((a, b) => b.priority - a.priority)
    return sorted.map((i) => i.instructions).join('\n\n')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{getScopeLabel()}</h2>
          <p className="text-sm text-muted-foreground">{getScopeDescription()}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewCombined(!previewCombined)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewCombined ? 'Hide' : 'Preview'} Combined
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Instruction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add {scope === 'global' ? 'Global' : scope === 'project' ? 'Project' : 'Character'} Instruction</DialogTitle>
                <DialogDescription>
                  Create a new instruction that influences AI behavior
                </DialogDescription>
              </DialogHeader>
              <InstructionForm
                formData={formData}
                setFormData={setFormData}
                onSave={handleCreate}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Combined Preview */}
      {previewCombined && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Combined Instructions Preview</CardTitle>
            <CardDescription>
              This is what the AI will receive (sorted by priority, highest first)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-background p-4 rounded-md font-mono text-sm whitespace-pre-wrap max-h-96 overflow-auto">
              {getCombinedInstructions() || 'No enabled instructions'}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Character count: {getCombinedInstructions().length}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions List */}
      {loading ? (
        <div className="text-center py-8">Loading instructions...</div>
      ) : instructions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No instructions yet</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Instruction
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {instructions.map((instruction) => (
            <Card
              key={instruction.id}
              className={!instruction.isEnabled ? 'opacity-60' : ''}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-1 pt-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleChangePriority(instruction.id, 1)}
                      disabled={instruction.priority >= 10}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <div className="text-center text-xs font-medium px-1">
                      {instruction.priority}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleChangePriority(instruction.id, -1)}
                      disabled={instruction.priority <= 0}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Priority: {instruction.priority}</Badge>
                        {!instruction.isEnabled && (
                          <Badge variant="secondary">Disabled</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={instruction.isEnabled}
                          onCheckedChange={(checked) =>
                            handleToggleEnabled(instruction.id, checked)
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEdit(instruction)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(instruction.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm">
                      {instruction.instructions}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {instruction.instructions.length} characters
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editingInstruction && (
        <Dialog
          open={!!editingInstruction}
          onOpenChange={() => setEditingInstruction(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Instruction</DialogTitle>
              <DialogDescription>
                Update your instruction
              </DialogDescription>
            </DialogHeader>
            <InstructionForm
              formData={formData}
              setFormData={setFormData}
              onSave={() => handleUpdate(editingInstruction.id)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function InstructionForm({ formData, setFormData, onSave }: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="instructions">Instructions</Label>
        <Textarea
          id="instructions"
          value={formData.instructions}
          onChange={(e) =>
            setFormData({ ...formData, instructions: e.target.value })
          }
          placeholder="Write your instructions here... e.g., 'Write in active voice. Avoid adverbs. Show don't tell.'"
          rows={8}
          className="font-mono"
        />
        <p className="text-xs text-muted-foreground">
          These instructions will be added to the AI system prompt
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority: {formData.priority}</Label>
        <input
          type="range"
          id="priority"
          min="0"
          max="10"
          value={formData.priority}
          onChange={(e) =>
            setFormData({ ...formData, priority: parseInt(e.target.value) })
          }
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Higher priority instructions are included first (0-10)
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="isEnabled"
          checked={formData.isEnabled}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, isEnabled: checked })
          }
        />
        <Label htmlFor="isEnabled" className="font-normal">
          Enabled
        </Label>
      </div>

      <div className="flex gap-2 justify-end">
        <Button onClick={onSave}>Save Instruction</Button>
      </div>
    </div>
  )
}
