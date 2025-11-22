'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Zap, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface WritingMode {
  id: string
  name: string
  description?: string
  isBuiltin: boolean
  temperature: number
  maxTokens: number
  systemPrompt?: string
  continuePrompt?: string
  preferredActions?: string
}

export function WritingModeManager() {
  const { toast } = useToast()
  const [modes, setModes] = useState<WritingMode[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingMode, setEditingMode] = useState<WritingMode | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    temperature: 0.7,
    maxTokens: 500,
    systemPrompt: '',
    continuePrompt: '',
    preferredActions: [] as string[],
  })

  const loadModes = async () => {
    try {
      const response = await fetch('/api/writing-modes')
      if (response.ok) {
        const data = await response.json()
        setModes(data)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load writing modes',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to load writing modes:', error)
      toast({
        title: 'Error',
        description: 'Failed to load writing modes',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadModes()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/writing-modes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await loadModes()
        setIsCreateOpen(false)
        resetForm()
        toast({
          title: 'Success',
          description: 'Writing mode created successfully',
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to create writing mode',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to create mode:', error)
      toast({
        title: 'Error',
        description: 'Failed to create writing mode',
        variant: 'destructive',
      })
    }
  }

  const handleUpdate = async (id: string) => {
    try {
      const response = await fetch(`/api/writing-modes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await loadModes()
        setEditingMode(null)
        resetForm()
        toast({
          title: 'Success',
          description: 'Writing mode updated successfully',
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to update writing mode',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to update mode:', error)
      toast({
        title: 'Error',
        description: 'Failed to update writing mode',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this writing mode?')) return

    try {
      const response = await fetch(`/api/writing-modes/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadModes()
        toast({
          title: 'Success',
          description: 'Writing mode deleted successfully',
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete writing mode. This may be a built-in mode.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to delete mode:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete writing mode',
        variant: 'destructive',
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      temperature: 0.7,
      maxTokens: 500,
      systemPrompt: '',
      continuePrompt: '',
      preferredActions: [],
    })
  }

  const startEdit = (mode: WritingMode) => {
    setEditingMode(mode)
    setFormData({
      name: mode.name,
      description: mode.description || '',
      temperature: mode.temperature,
      maxTokens: mode.maxTokens,
      systemPrompt: mode.systemPrompt || '',
      continuePrompt: mode.continuePrompt || '',
      preferredActions: mode.preferredActions ? JSON.parse(mode.preferredActions) : [],
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Writing Modes</h2>
          <p className="text-sm text-muted-foreground">
            Quick-switch presets that change AI behavior for different writing styles
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              New Mode
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Writing Mode</DialogTitle>
              <DialogDescription>
                Create a custom writing mode with specific AI settings
              </DialogDescription>
            </DialogHeader>
            <ModeForm formData={formData} setFormData={setFormData} onSave={handleCreate} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Modes Grid */}
      {loading ? (
        <div className="text-center py-8">Loading modes...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {modes.map(mode => (
            <Card key={mode.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{mode.name}</CardTitle>
                      {mode.isBuiltin && <Badge variant="secondary">Built-in</Badge>}
                    </div>
                    {mode.description && (
                      <CardDescription className="mt-1">{mode.description}</CardDescription>
                    )}
                  </div>
                  {!mode.isBuiltin && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(mode)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(mode.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Temperature:</span>
                    <span className="ml-2 font-medium">{mode.temperature}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max Tokens:</span>
                    <span className="ml-2 font-medium">{mode.maxTokens}</span>
                  </div>
                </div>
                {mode.systemPrompt && (
                  <div className="bg-muted p-3 rounded-md text-sm">
                    <div className="font-medium mb-1">System Prompt:</div>
                    <div className="text-muted-foreground line-clamp-2">{mode.systemPrompt}</div>
                  </div>
                )}
                {mode.preferredActions && (
                  <div className="flex gap-1 flex-wrap">
                    {JSON.parse(mode.preferredActions).map((action: string) => (
                      <Badge key={action} variant="outline" className="text-xs">
                        {action}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editingMode && (
        <Dialog open={!!editingMode} onOpenChange={() => setEditingMode(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Writing Mode</DialogTitle>
              <DialogDescription>Update your custom writing mode settings</DialogDescription>
            </DialogHeader>
            <ModeForm
              formData={formData}
              setFormData={setFormData}
              onSave={() => handleUpdate(editingMode.id)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function ModeForm({ formData, setFormData, onSave }: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Mode Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          placeholder="My Custom Mode"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          placeholder="What does this mode do?"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="temperature">Temperature: {formData.temperature.toFixed(2)}</Label>
        <Slider
          id="temperature"
          min={0}
          max={1}
          step={0.05}
          value={[formData.temperature]}
          onValueChange={([value]) => setFormData({ ...formData, temperature: value })}
        />
        <p className="text-xs text-muted-foreground">
          Lower = more focused, Higher = more creative
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxTokens">Max Tokens: {formData.maxTokens}</Label>
        <Slider
          id="maxTokens"
          min={100}
          max={2000}
          step={50}
          value={[formData.maxTokens]}
          onValueChange={([value]) => setFormData({ ...formData, maxTokens: value })}
        />
        <p className="text-xs text-muted-foreground">Maximum length of AI response</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="systemPrompt">System Prompt (Optional)</Label>
        <Textarea
          id="systemPrompt"
          value={formData.systemPrompt}
          onChange={e => setFormData({ ...formData, systemPrompt: e.target.value })}
          placeholder="Additional instructions for this mode..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="continuePrompt">Continue Prompt (Optional)</Label>
        <Textarea
          id="continuePrompt"
          value={formData.continuePrompt}
          onChange={e => setFormData({ ...formData, continuePrompt: e.target.value })}
          placeholder="Custom prompt for continue action..."
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button onClick={onSave}>Save Mode</Button>
      </div>
    </div>
  )
}
