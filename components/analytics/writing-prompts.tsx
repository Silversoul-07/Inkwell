'use client'

import { useState } from 'react'
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function WritingPrompts() {
  const [promptType, setPromptType] = useState('daily')
  const [prompt, setPrompt] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const generatePrompt = async () => {
    setLoading(true)
    setPrompt(null)

    try {
      const response = await fetch(`/api/prompts?type=${promptType}`)
      if (response.ok) {
        const data = await response.json()
        setPrompt(data.prompt)
      }
    } catch (error) {
      console.error('Prompt generation error:', error)
      setPrompt('Failed to generate prompt. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Writing Prompts
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Prompt Type</label>
            <Select value={promptType} onValueChange={setPromptType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Prompt</SelectItem>
                <SelectItem value="character">Character Development</SelectItem>
                <SelectItem value="plot">Plot Twist</SelectItem>
                <SelectItem value="dialogue">Dialogue Exercise</SelectItem>
                <SelectItem value="setting">Setting Description</SelectItem>
                <SelectItem value="whatif">What If? Scenarios</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={generatePrompt} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Prompt
              </>
            )}
          </Button>
        </div>
      </div>

      {prompt && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="font-semibold mb-3">Your Writing Prompt</h4>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{prompt}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Use this prompt to overcome writer's block or try something new!
            </p>
          </div>
        </div>
      )}

      <div className="bg-muted/50 rounded-lg p-4">
        <h5 className="text-sm font-semibold mb-2">Tips</h5>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Try a daily prompt to keep your creativity flowing</li>
          <li>• Use character prompts to develop backstories</li>
          <li>• Plot twists can help when you're stuck</li>
          <li>• Dialogue exercises improve character voice</li>
        </ul>
      </div>
    </div>
  )
}
