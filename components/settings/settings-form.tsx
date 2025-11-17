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
      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="ai">AI Settings</TabsTrigger>
          <TabsTrigger value="editor">Editor Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold">API Configuration</h3>
            <p className="text-sm text-muted-foreground">
              Configure your AI provider. Inkwell uses OpenAI-compatible API format and supports:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mb-2">
              <li><strong>OpenAI:</strong> https://api.openai.com/v1</li>
              <li><strong>Groq:</strong> https://api.groq.com/openai/v1</li>
              <li><strong>Together AI:</strong> https://api.together.xyz/v1</li>
              <li><strong>OpenRouter:</strong> https://openrouter.ai/api/v1</li>
              <li><strong>Local (Ollama/LM Studio):</strong> http://localhost:1234/v1</li>
              <li>Any other OpenAI-compatible API</li>
            </ul>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aiProvider">Provider (optional label)</Label>
                <Input
                  id="aiProvider"
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  placeholder="openai, groq, together, ollama, etc."
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  This is just a label for your reference
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aiEndpoint">API Endpoint</Label>
                <Input
                  id="aiEndpoint"
                  value={aiEndpoint}
                  onChange={(e) => setAiEndpoint(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Must be an OpenAI-compatible endpoint (ends with /v1)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aiApiKey">API Key</Label>
                <Input
                  id="aiApiKey"
                  type="password"
                  value={aiApiKey}
                  onChange={(e) => setAiApiKey(e.target.value)}
                  placeholder="sk-..."
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aiModel">Model Name</Label>
                <Input
                  id="aiModel"
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  placeholder="gpt-4, gpt-3.5-turbo, llama-3.1-70b-versatile, etc."
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Model name depends on your provider (e.g., gpt-4 for OpenAI, llama3-70b for Groq)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aiTemperature">Temperature</Label>
                  <Input
                    id="aiTemperature"
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={aiTemperature}
                    onChange={(e) => setAiTemperature(parseFloat(e.target.value))}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aiMaxTokens">Max Tokens</Label>
                  <Input
                    id="aiMaxTokens"
                    type="number"
                    value={aiMaxTokens}
                    onChange={(e) => setAiMaxTokens(parseInt(e.target.value))}
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={testingConnection || loading}
              >
                {testingConnection && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test Connection
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="editor" className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold">Editor Appearance</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editorFont">Font</Label>
                <select
                  id="editorFont"
                  value={editorFont}
                  onChange={(e) => setEditorFont(e.target.value)}
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
                    onChange={(e) => setEditorFontSize(parseInt(e.target.value))}
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
                    onChange={(e) => setEditorLineHeight(parseFloat(e.target.value))}
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
                  onChange={(e) => setEditorWidth(parseInt(e.target.value))}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="autoSaveInterval">Auto-save Interval (seconds)</Label>
                <Input
                  id="autoSaveInterval"
                  type="number"
                  min="10"
                  max="300"
                  value={autoSaveInterval}
                  onChange={(e) => setAutoSaveInterval(parseInt(e.target.value))}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </div>
    </form>
  )
}
