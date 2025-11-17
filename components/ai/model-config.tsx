'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Check, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

interface AIModel {
  id: string
  name: string
  provider: string
  apiKey?: string | null
  baseUrl?: string | null
  model: string
  isDefault: boolean
}

interface ModelConfigProps {
  onModelChange?: (modelId: string) => void
}

export function ModelConfig({ onModelChange }: ModelConfigProps) {
  const [models, setModels] = useState<AIModel[]>([])
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [provider, setProvider] = useState('openai')
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [model, setModel] = useState('')

  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    try {
      const response = await fetch('/api/ai-models')
      if (response.ok) {
        const data = await response.json()
        setModels(data)
        const defaultModel = data.find((m: AIModel) => m.isDefault)
        if (defaultModel) {
          setSelectedModel(defaultModel.id)
        } else if (data.length > 0) {
          setSelectedModel(data[0].id)
        }
      }
    } catch (error) {
      console.error('Error loading models:', error)
    }
  }

  const handleAddModel = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          provider,
          apiKey: apiKey || null,
          baseUrl: baseUrl || null,
          model,
          isDefault: models.length === 0,
        }),
      })

      if (response.ok) {
        await loadModels()
        setIsAddDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error adding model:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteModel = async (id: string) => {
    if (!confirm('Delete this AI model?')) return

    try {
      const response = await fetch(`/api/ai-models/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadModels()
      }
    } catch (error) {
      console.error('Error deleting model:', error)
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/ai-models/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      })

      if (response.ok) {
        await loadModels()
      }
    } catch (error) {
      console.error('Error setting default:', error)
    }
  }

  const resetForm = () => {
    setName('')
    setProvider('openai')
    setApiKey('')
    setBaseUrl('')
    setModel('')
  }

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId)
    onModelChange?.(modelId)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">AI Model</Label>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Model
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add AI Model</DialogTitle>
              <DialogDescription>
                Configure a new AI model for text generation
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="My GPT-4 Model"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="groq">Groq</SelectItem>
                    <SelectItem value="ollama">Ollama</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  placeholder="gpt-4-turbo-preview"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>

              {provider !== 'ollama' && (
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="baseUrl">Base URL (Optional)</Label>
                <Input
                  id="baseUrl"
                  placeholder="https://api.openai.com/v1"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                />
              </div>

              <Button onClick={handleAddModel} disabled={loading} className="w-full">
                {loading ? 'Adding...' : 'Add Model'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {models.length > 0 ? (
        <Select value={selectedModel} onValueChange={handleModelChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {models.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{m.name}</span>
                  {m.isDefault && (
                    <Check className="h-4 w-4 ml-2 text-primary" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="text-sm text-muted-foreground text-center py-4">
          No AI models configured. Add one to get started.
        </div>
      )}

      {models.length > 0 && (
        <div className="space-y-2">
          {models.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{m.name}</span>
                  {m.isDefault && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                      Default
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {m.provider} - {m.model}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!m.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetDefault(m.id)}
                  >
                    Set Default
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteModel(m.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
