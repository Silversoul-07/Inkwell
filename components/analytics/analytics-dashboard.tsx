'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  BarChart,
  TrendingUp,
  Calendar,
  Clock,
  Target,
  Flame,
  BookOpen,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatsCard } from './stats-card'
import { WritingGoals } from './writing-goals'
import { StoryAnalysis } from './story-analysis'
import { WritingPrompts } from './writing-prompts'

interface AnalyticsData {
  totalWords: number
  totalSessions: number
  totalDuration: number
  totalWordsWritten: number
  currentStreak: number
  longestStreak: number
  avgWordsPerSession: number
  avgSessionDuration: number
  chapterPacing: Array<{
    id: string
    title: string
    wordCount: number
    sceneCount: number
  }>
  recentSessions: Array<{
    date: Date
    wordsWritten: number
    duration: number
  }>
}

interface AnalyticsDashboardProps {
  projectId: string
}

export function AnalyticsDashboard({ projectId }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const loadAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics?projectId=${projectId}`)
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Failed to load analytics</div>
      </div>
    )
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Words"
          value={data.totalWords.toLocaleString()}
          icon={<BookOpen className="h-4 w-4" />}
          description="Words in project"
        />
        <StatsCard
          title="Current Streak"
          value={`${data.currentStreak} days`}
          icon={<Flame className="h-4 w-4" />}
          description={`Longest: ${data.longestStreak} days`}
          trend={data.currentStreak > 0 ? 'up' : undefined}
        />
        <StatsCard
          title="Writing Sessions"
          value={data.totalSessions.toString()}
          icon={<Calendar className="h-4 w-4" />}
          description="Total sessions"
        />
        <StatsCard
          title="Time Writing"
          value={formatDuration(data.totalDuration)}
          icon={<Clock className="h-4 w-4" />}
          description="Total time spent"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard
          title="Avg Words/Session"
          value={data.avgWordsPerSession.toLocaleString()}
          icon={<TrendingUp className="h-4 w-4" />}
          description="Average productivity"
        />
        <StatsCard
          title="Avg Session Length"
          value={formatDuration(data.avgSessionDuration)}
          icon={<Clock className="h-4 w-4" />}
          description="Average duration"
        />
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="pacing" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pacing">Pacing</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
        </TabsList>

        <TabsContent value="pacing" className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Chapter Pacing
            </h3>
            <div className="space-y-3">
              {data.chapterPacing.map((chapter) => (
                <div key={chapter.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{chapter.title}</span>
                    <span className="text-muted-foreground">
                      {chapter.wordCount.toLocaleString()} words
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (chapter.wordCount / Math.max(...data.chapterPacing.map((c) => c.wordCount))) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {chapter.sceneCount} scene{chapter.sceneCount !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="goals">
          <WritingGoals projectId={projectId} currentWords={data.totalWords} />
        </TabsContent>

        <TabsContent value="analysis">
          <StoryAnalysis projectId={projectId} />
        </TabsContent>

        <TabsContent value="prompts">
          <WritingPrompts />
        </TabsContent>
      </Tabs>
    </div>
  )
}
