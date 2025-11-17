'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Loader2, Plus, Edit2, Trash2, Star, Eye, EyeOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface AIModel {
  id: string
  name: string
  provider: string
  model: string
  apiKey?: string | null
  baseUrl?: string | null
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

interface ModelDialogData {
  name: string
  provider: string
  model: string
  apiKey: string
  baseUrl: string
  isDefault: boolean
}

export function AIModelsManager() {
  const [models, setModels] = useState<AIModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingModel, setEditingModel] = useState<AIModel | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)
  const [formData, setFormData] = useState<ModelDialogData>({
    name: '',
    provider: 'anthropic',
    model: '',
    apiKey: '',
    baseUrl: '',
    isDefault: false,
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    try {
      const response = await fetch('/api/ai-models')
      if (response.ok) {
        const data = await response.json()
        setModels(data)
      }
    } catch (error) {
      console.error('Failed to load models:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (model?: AIModel) => {
    if (model) {
      setEditingModel(model)
      setFormData({
        name: model.name,
        provider: model.provider,
        model: model.model,
        apiKey: model.apiKey || '',
        baseUrl: model.baseUrl || '',
        isDefault: model.isDefault,
      })
    } else {
      setEditingModel(null)
      setFormData({
        name: '',
        provider: 'anthropic',
        model: '',
        apiKey: '',
        baseUrl: '',
        isDefault: models.length === 0, // First model is default
      })
    }
    setShowDialog(true)
    setShowApiKey(false)
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    setEditingModel(null)
    setShowApiKey(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const url = editingModel
        ? `/api/ai-models/${editingModel.id}`
        : '/api/ai-models'

      const method = editingModel ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to save model')

      await loadModels()
      handleCloseDialog()
    } catch (error) {
      console.error('Failed to save model:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this AI model?')) return

    try {
      const response = await fetch(`/api/ai-models/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete model')

      await loadModels()
    } catch (error) {
      console.error('Failed to delete model:', error)
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      const model = models.find(m => m.id === id)
      if (!model) return

      const response = await fetch(`/api/ai-models/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      })

      if (!response.ok) throw new Error('Failed to set default model')

      await loadModels()
    } catch (error) {
      console.error('Failed to set default model:', error)
    }
  }

  const getProviderIcon = (provider: string) => {
    const icons: Record<string, string> = {
      anthropic: '🤖',
      openai: '✨',
      google: '🔷',
      cohere: '🟣',
      custom: '⚙️',
    }
    return icons[provider] || '🤖'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI Models</h3>
          <p className="text-sm text-muted-foreground">
            Configure AI models for writing assistance
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Model
        </Button>
      </div>

      {models.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-12 text-center">
          <div className="text-4xl mb-4">🤖</div>
          <h4 className="text-lg font-semibold mb-2">No AI models configured</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Add your first AI model to start using AI writing assistance
          </p>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Model
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {models.map((model) => (
            <div
              key={model.id}
              className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-2xl">{getProviderIcon(model.provider)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{model.name}</h4>
                      {model.isDefault && (
                        <Badge variant="default" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>
                        <span className="font-medium">Provider:</span>{' '}
                        <span className="capitalize">{model.provider}</span>
                      </div>
                      <div>
                        <span className="font-medium">Model:</span> {model.model}
                      </div>
                      {model.baseUrl && (
                        <div>
                          <span className="font-medium">Base URL:</span>{' '}
                          <span className="truncate">{model.baseUrl}</span>
                        </div>
                      )}
                      <div>
                        <span className="font-medium">API Key:</span>{' '}
                        {model.apiKey ? '••••••••' : 'Not set'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {!model.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(model.id)}
                      title="Set as default"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(model)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(model.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingModel ? 'Edit AI Model' : 'Add AI Model'}
            </DialogTitle>
            <DialogDescription>
              Configure an AI model for writing assistance
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Model Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Claude Sonnet 3.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Select
                value={formData.provider}
                onValueChange={(value) =>
                  setFormData({ ...formData, provider: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                  <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                  <SelectItem value="google">Google (Gemini)</SelectItem>
                  <SelectItem value="cohere">Cohere</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model ID</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                placeholder="e.g., claude-3-5-sonnet-20241022"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key (Optional)</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? 'text' : 'password'}
                  value={formData.apiKey}
                  onChange={(e) =>
                    setFormData({ ...formData, apiKey: e.target.value })
                  }
                  placeholder="sk-ant-..."
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseUrl">Base URL (Optional)</Label>
              <Input
                id="baseUrl"
                value={formData.baseUrl}
                onChange={(e) =>
                  setFormData({ ...formData, baseUrl: e.target.value })
                }
                placeholder="https://api.anthropic.com"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="default">Set as Default</Label>
                <p className="text-xs text-muted-foreground">
                  Use this model by default
                </p>
              </div>
              <Switch
                id="default"
                checked={formData.isDefault}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isDefault: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.name || !formData.model}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingModel ? 'Update' : 'Add'} Model
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
