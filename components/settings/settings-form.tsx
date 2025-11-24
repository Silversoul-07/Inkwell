'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'

interface Settings {
  id: string
  aiProvider: string
  aiEndpoint: string
  aiApiKey: string | null
  aiModel: string
  aiTemperature: number
  aiMaxTokens: number
  aiSystemPrompt: string | null
  editorFont: string
  editorFontSize: number
  editorLineHeight: number
  editorWidth: number
  editorTheme: string
  autoSaveInterval: number
}

interface SettingsFormProps {
  settings: Settings | null
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)

  // AI Settings
  const [aiProvider, setAiProvider] = useState(settings?.aiProvider || 'openai')
  const [aiEndpoint, setAiEndpoint] = useState(settings?.aiEndpoint || 'https://api.openai.com/v1')
  const [aiApiKey, setAiApiKey] = useState(settings?.aiApiKey || '')
  const [aiModel, setAiModel] = useState(settings?.aiModel || 'gpt-4')
  const [aiTemperature, setAiTemperature] = useState(settings?.aiTemperature || 0.7)
  const [aiMaxTokens, setAiMaxTokens] = useState(settings?.aiMaxTokens || 2000)

  // Editor Settings
  const [editorFont, setEditorFont] = useState(settings?.editorFont || 'serif')
  const [editorFontSize, setEditorFontSize] = useState(settings?.editorFontSize || 18)
  const [editorLineHeight, setEditorLineHeight] = useState(settings?.editorLineHeight || 1.8)
  const [editorWidth, setEditorWidth] = useState(settings?.editorWidth || 42)
  const [autoSaveInterval, setAutoSaveInterval] = useState(settings?.autoSaveInterval || 30)

  const handleTestConnection = async () => {
    setTestingConnection(true)
    try {
      const response = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: aiProvider,
          endpoint: aiEndpoint,
          apiKey: aiApiKey,
          model: aiModel,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        alert('Connection successful!')
      } else {
        alert(`Connection failed: ${data.error}`)
      }
    } catch (error) {
      alert('Connection test failed')
    } finally {
      setTestingConnection(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiProvider,
          aiEndpoint,
          aiApiKey,
          aiModel,
          aiTemperature,
          aiMaxTokens,
          editorFont,
          editorFontSize,
          editorLineHeight,
          editorWidth,
          autoSaveInterval,
        }),
      })

      if (response.ok) {
        alert('Settings saved successfully!')
        router.refresh()
      } else {
        alert('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold">Editor Appearance</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editorFont">Font</Label>
            <select
              id="editorFont"
              value={editorFont}
              onChange={e => setEditorFont(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={loading}
            >
              <option value="serif">Serif (Merriweather)</option>
              <option value="sans">Sans-serif (Inter)</option>
              <option value="mono">Monospace (JetBrains Mono)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editorFontSize">Font Size (px)</Label>
              <Input
                id="editorFontSize"
                type="number"
                min="12"
                max="32"
                value={editorFontSize}
                onChange={e => setEditorFontSize(parseInt(e.target.value))}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editorLineHeight">Line Height</Label>
              <Input
                id="editorLineHeight"
                type="number"
                step="0.1"
                min="1"
                max="3"
                value={editorLineHeight}
                onChange={e => setEditorLineHeight(parseFloat(e.target.value))}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editorWidth">Editor Width (rem)</Label>
            <Input
              id="editorWidth"
              type="number"
              min="30"
              max="80"
              value={editorWidth}
              onChange={e => setEditorWidth(parseInt(e.target.value))}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Auto-save & Versioning</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Your work is automatically saved and versioned for easy recovery
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="autoSaveInterval">Auto-save Interval</Label>
            <div className="flex items-center gap-3">
              <Input
                id="autoSaveInterval"
                type="number"
                min="10"
                max="300"
                value={autoSaveInterval}
                onChange={e => setAutoSaveInterval(parseInt(e.target.value))}
                disabled={loading}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">seconds</span>
            </div>
            <p className="text-xs text-muted-foreground">
              How often your work is automatically saved. Each save creates a version snapshot that
              you can restore later.
            </p>
          </div>

          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Version History Enabled</p>
                <p className="text-xs text-muted-foreground">
                  All auto-saves are stored as versions. Click the &quot;Version History&quot;
                  button in the editor to view, compare, and restore previous versions of your
                  scenes.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Recommended Settings</p>
                <p className="text-xs text-muted-foreground">
                  30-60 seconds for active writing, 120-180 seconds for longer reading/editing
                  sessions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </div>
    </form>
  )
}
