'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Star, StarOff, Download, Upload, TestTube } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

interface PromptTemplate {
  id: string
  name: string
  description?: string
  action: string
  template: string
  variables?: string
  isDefault: boolean
  isBuiltin: boolean
  category?: string
}

const ACTION_TYPES = [
  { value: 'continue', label: 'Continue' },
  { value: 'rephrase', label: 'Rephrase' },
  { value: 'expand', label: 'Expand' },
  { value: 'shorten', label: 'Shorten' },
  { value: 'grammar', label: 'Grammar' },
  { value: 'custom', label: 'Custom' },
]

const AVAILABLE_VARIABLES = [
  { name: 'selection', description: 'Currently selected text' },
  { name: 'context', description: 'Scene context' },
  { name: 'genre', description: 'Project genre' },
  { name: 'tone', description: 'Desired tone' },
  { name: 'pov', description: 'Point of view' },
  { name: 'character', description: 'Active character name' },
  { name: 'style', description: 'Writing style preference' },
  { name: 'tense', description: 'Tense (past/present/future)' },
]

export function PromptTemplateManager() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAction, setSelectedAction] = useState<string>('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null)
  const [testResult, setTestResult] = useState<string>('')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    action: 'continue',
    template: '',
    category: 'custom',
    isDefault: false,
  })

  useEffect(() => {
    loadTemplates()
  }, [selectedAction])

  const loadTemplates = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedAction !== 'all') {
        params.append('action', selectedAction)
      }

      const response = await fetch(`/api/prompt-templates?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/prompt-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await loadTemplates()
        setIsCreateOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error('Failed to create template:', error)
    }
  }

  const handleUpdate = async (id: string) => {
    try {
      const response = await fetch(`/api/prompt-templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await loadTemplates()
        setEditingTemplate(null)
        resetForm()
      }
    } catch (error) {
      console.error('Failed to update template:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return

    try {
      const response = await fetch(`/api/prompt-templates/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadTemplates()
      }
    } catch (error) {
      console.error('Failed to delete template:', error)
    }
  }

  const handleSetDefault = async (id: string, action: string) => {
    try {
      const response = await fetch(`/api/prompt-templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true, action }),
      })

      if (response.ok) {
        await loadTemplates()
      }
    } catch (error) {
      console.error('Failed to set default:', error)
    }
  }

  const handleTest = async () => {
    try {
      const testVars = {
        selection: 'The quick brown fox jumps over the lazy dog.',
        context: 'This is a fantasy adventure story.',
        genre: 'Fantasy',
        pov: 'Third Person',
        tense: 'Past',
      }

      const response = await fetch('/api/prompt-templates/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: formData.template,
          variables: testVars,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setTestResult(data.result)
      }
    } catch (error) {
      console.error('Test failed:', error)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/prompt-templates/export')
      if (response.ok) {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json',
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `prompt-templates-${new Date().toISOString().split('T')[0]}.json`
        a.click()
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      const response = await fetch('/api/prompt-templates/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templates: data.templates }),
      })

      if (response.ok) {
        await loadTemplates()
        alert('Templates imported successfully!')
      }
    } catch (error) {
      console.error('Import failed:', error)
      alert('Failed to import templates')
    }
  }

  const insertVariable = (varName: string) => {
    setFormData({
      ...formData,
      template: formData.template + `{{${varName}}}`,
    })
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      action: 'continue',
      template: '',
      category: 'custom',
      isDefault: false,
    })
    setTestResult('')
  }

  const startEdit = (template: PromptTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      description: template.description || '',
      action: template.action,
      template: template.template,
      category: template.category || 'custom',
      isDefault: template.isDefault,
    })
  }

  const filteredTemplates = templates

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Prompt Templates</h2>
          <p className="text-sm text-muted-foreground">
            Create custom AI prompts with variable support
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" asChild>
            <label>
              <Upload className="h-4 w-4 mr-2" />
              Import
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
            </label>
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Prompt Template</DialogTitle>
                <DialogDescription>
                  Create a custom prompt template with variables
                </DialogDescription>
              </DialogHeader>
              <TemplateForm
                formData={formData}
                setFormData={setFormData}
                onSave={handleCreate}
                onTest={handleTest}
                testResult={testResult}
                insertVariable={insertVariable}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-4">
        <Select value={selectedAction} onValueChange={setSelectedAction}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {ACTION_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="text-center py-8">Loading templates...</div>
      ) : (
        <div className="grid gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {template.isDefault && (
                        <Badge variant="default">Default</Badge>
                      )}
                      {template.isBuiltin && (
                        <Badge variant="secondary">Built-in</Badge>
                      )}
                      <Badge variant="outline">{template.action}</Badge>
                    </div>
                    {template.description && (
                      <CardDescription className="mt-1">
                        {template.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {!template.isDefault && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSetDefault(template.id, template.action)}
                        title="Set as default"
                      >
                        <StarOff className="h-4 w-4" />
                      </Button>
                    )}
                    {!template.isBuiltin && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEdit(template)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-3 rounded-md font-mono text-sm">
                  {template.template}
                </div>
                {template.variables && JSON.parse(template.variables).length > 0 && (
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {JSON.parse(template.variables).map((v: string) => (
                      <Badge key={v} variant="outline" className="text-xs">
                        {`{{${v}}}`}
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
      {editingTemplate && (
        <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Template</DialogTitle>
              <DialogDescription>
                Update your custom prompt template
              </DialogDescription>
            </DialogHeader>
            <TemplateForm
              formData={formData}
              setFormData={setFormData}
              onSave={() => handleUpdate(editingTemplate.id)}
              onTest={handleTest}
              testResult={testResult}
              insertVariable={insertVariable}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function TemplateForm({
  formData,
  setFormData,
  onSave,
  onTest,
  testResult,
  insertVariable,
}: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Template Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="My Custom Template"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="What does this template do?"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="action">Action Type</Label>
        <Select
          value={formData.action}
          onValueChange={(value) => setFormData({ ...formData, action: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACTION_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="template">Prompt Template</Label>
        <Textarea
          id="template"
          value={formData.template}
          onChange={(e) =>
            setFormData({ ...formData, template: e.target.value })
          }
          placeholder="Write your prompt here. Use {{variable}} for dynamic content."
          rows={6}
          className="font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label>Available Variables</Label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_VARIABLES.map((v) => (
            <Button
              key={v.name}
              variant="outline"
              size="sm"
              onClick={() => insertVariable(v.name)}
              title={v.description}
            >
              {`{{${v.name}}}`}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isDefault"
          checked={formData.isDefault}
          onChange={(e) =>
            setFormData({ ...formData, isDefault: e.target.checked })
          }
          className="rounded"
        />
        <Label htmlFor="isDefault" className="font-normal">
          Set as default for this action
        </Label>
      </div>

      {testResult && (
        <div className="space-y-2">
          <Label>Test Result</Label>
          <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap">
            {testResult}
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onTest}>
          <TestTube className="h-4 w-4 mr-2" />
          Test Template
        </Button>
        <Button onClick={onSave}>Save Template</Button>
      </div>
    </div>
  )
}
