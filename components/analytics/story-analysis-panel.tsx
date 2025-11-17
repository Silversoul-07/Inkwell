'use client'

import { useState } from 'react'
import {
  SearchCheck,
  Clock,
  MessageSquare,
  Activity,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'

interface StoryAnalysisResult {
  repetitions: Array<{
    word: string
    count: number
    percentage: number
  }>
  readingTime: {
    minutes: number
    seconds: number
    totalSeconds: number
    wordCount: number
  }
  dialogueAnalysis: {
    totalWords: number
    dialogueWords: number
    narrativeWords: number
    dialoguePercentage: number
    narrativePercentage: number
  }
  sentenceStructure: {
    totalSentences: number
    avgWordsPerSentence: number
    shortSentences: number
    mediumSentences: number
    longSentences: number
  }
  pacingSuggestion: {
    pacing: 'fast' | 'moderate' | 'slow'
    suggestion: string
  }
}

interface StoryAnalysisPanelProps {
  sceneId?: string
  projectId?: string
}

export function StoryAnalysisPanel({
  sceneId,
  projectId,
}: StoryAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<StoryAnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/analytics/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneId,
          projectId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAnalysis(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Analysis failed')
      }
    } catch (err) {
      console.error('Analysis error:', err)
      setError('Failed to analyze story')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Story Analysis</h2>
          <p className="text-sm text-muted-foreground">
            Analyze your writing for repetition, pacing, and more
          </p>
        </div>
        <Button onClick={handleAnalyze} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <SearchCheck className="h-4 w-4 mr-2" />
              Analyze
            </>
          )}
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!analysis && !loading && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <SearchCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Click "Analyze" to get insights about your story
            </p>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <>
          {/* Reading Time */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle>Reading Time</CardTitle>
              </div>
              <CardDescription>
                Estimated time for readers to finish
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-4xl font-bold">
                  {analysis.readingTime.minutes}m {analysis.readingTime.seconds}s
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on {analysis.readingTime.wordCount.toLocaleString()} words at 250 words/min
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Dialogue vs Description */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle>Dialogue vs Description</CardTitle>
              </div>
              <CardDescription>
                Balance between conversation and narrative
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Dialogue</span>
                  <Badge variant="outline">
                    {analysis.dialogueAnalysis.dialoguePercentage}%
                  </Badge>
                </div>
                <Progress value={analysis.dialogueAnalysis.dialoguePercentage} />
                <p className="text-xs text-muted-foreground">
                  {analysis.dialogueAnalysis.dialogueWords.toLocaleString()} words
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Narrative</span>
                  <Badge variant="outline">
                    {analysis.dialogueAnalysis.narrativePercentage}%
                  </Badge>
                </div>
                <Progress value={analysis.dialogueAnalysis.narrativePercentage} />
                <p className="text-xs text-muted-foreground">
                  {analysis.dialogueAnalysis.narrativeWords.toLocaleString()} words
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sentence Structure & Pacing */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <CardTitle>Sentence Structure & Pacing</CardTitle>
              </div>
              <CardDescription>
                Sentence variety and story rhythm
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sentences</p>
                  <p className="text-2xl font-bold">
                    {analysis.sentenceStructure.totalSentences}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Words/Sentence</p>
                  <p className="text-2xl font-bold">
                    {analysis.sentenceStructure.avgWordsPerSentence}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Short (&lt; 10 words)</span>
                  <Badge variant="outline">
                    {analysis.sentenceStructure.shortSentences}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Medium (10-20 words)</span>
                  <Badge variant="outline">
                    {analysis.sentenceStructure.mediumSentences}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Long (&gt; 20 words)</span>
                  <Badge variant="outline">
                    {analysis.sentenceStructure.longSentences}
                  </Badge>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant={
                      analysis.pacingSuggestion.pacing === 'fast'
                        ? 'default'
                        : analysis.pacingSuggestion.pacing === 'moderate'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {analysis.pacingSuggestion.pacing.toUpperCase()} PACING
                  </Badge>
                </div>
                <p className="text-sm">{analysis.pacingSuggestion.suggestion}</p>
              </div>
            </CardContent>
          </Card>

          {/* Repetitions */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <SearchCheck className="h-5 w-5 text-primary" />
                <CardTitle>Word Repetitions</CardTitle>
              </div>
              <CardDescription>
                Most frequently used words (excluding common words)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysis.repetitions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No significant repetitions found. Great variety!
                </p>
              ) : (
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {analysis.repetitions.slice(0, 20).map((rep, index) => (
                      <div
                        key={rep.word}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 justify-center">
                            {index + 1}
                          </Badge>
                          <span className="font-medium">{rep.word}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            {rep.count} times
                          </span>
                          <Badge variant="secondary">{rep.percentage}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
