'use client'

import { useState } from 'react'
import { Search, Loader2, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface StoryAnalysisProps {
  projectId: string
}

export function StoryAnalysis({ projectId }: StoryAnalysisProps) {
  const [content, setContent] = useState('')
  const [analysisType, setAnalysisType] = useState('tone')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!content.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/analytics/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          content,
          type: analysisType,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (analysisType === 'reading_time') {
          setResult(data.message)
        } else {
          setResult(data.analysis)
        }
      }
    } catch (error) {
      console.error('Analysis error:', error)
      setResult('Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Story Analysis
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Analysis Type</label>
            <Select value={analysisType} onValueChange={setAnalysisType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tone">Tone & Mood</SelectItem>
                <SelectItem value="pacing">Pacing Analysis</SelectItem>
                <SelectItem value="dialogue_ratio">Dialogue vs Description</SelectItem>
                <SelectItem value="plot_holes">Plot Holes Check</SelectItem>
                <SelectItem value="repetition">Repetition Finder</SelectItem>
                <SelectItem value="reading_time">Reading Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Text to Analyze</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste a scene or chapter here to analyze..."
              rows={8}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              {content.split(/\s+/).filter((w) => w).length} words
            </p>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={loading || !content.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </div>
      </div>

      {result && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="font-semibold mb-3">Analysis Result</h4>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-sm">{result}</p>
          </div>
        </div>
      )}
    </div>
  )
}
