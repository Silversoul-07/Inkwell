'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  Flame,
  Award,
  Clock,
  BookOpen,
  Loader2,
  Plus,
  Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface AnalyticsData {
  totalWords: number
  totalDuration: number
  sessionCount: number
  currentStreak: number
  longestStreak: number
  avgWordsPerSession: number
  avgDurationPerSession: number
  chartData: Array<{
    date: string
    words: number
    duration: number
    sessions: number
  }>
  projectBreakdown: Array<{
    projectId: string
    projectTitle: string
    words: number
    duration: number
    sessions: number
  }>
}

interface WritingGoal {
  id: string
  type: string
  targetWords: number
  wordsWritten: number
  progress: number
  isActive: boolean
  project?: {
    id: string
    title: string
  }
}

interface WritingAnalyticsDashboardProps {
  projectId?: string
  period?: number
}

export function WritingAnalyticsDashboard({
  projectId,
  period = 30,
}: WritingAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [goals, setGoals] = useState<WritingGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false)

  const [newGoal, setNewGoal] = useState({
    type: 'daily',
    targetWords: 500,
  })

  useEffect(() => {
    loadAnalytics()
    loadGoals()
  }, [projectId, period])

  const loadAnalytics = async () => {
    try {
      let url = `/api/analytics/stats?period=${period}`
      if (projectId) {
        url += `&projectId=${projectId}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadGoals = async () => {
    try {
      let url = '/api/writing-goals?isActive=true'
      if (projectId) {
        url += `&projectId=${projectId}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setGoals(data)
      }
    } catch (error) {
      console.error('Failed to load goals:', error)
    }
  }

  const handleCreateGoal = async () => {
    try {
      const response = await fetch('/api/writing-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newGoal,
          projectId: projectId || null,
        }),
      })

      if (response.ok) {
        await loadGoals()
        setIsCreateGoalOpen(false)
        setNewGoal({ type: 'daily', targetWords: 500 })
      }
    } catch (error) {
      console.error('Failed to create goal:', error)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!analytics) {
    return <div>Failed to load analytics</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Writing Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Your progress over the last {period} days
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Words
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.totalWords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg {analytics.avgWordsPerSession} per session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Writing Time
              </CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatDuration(analytics.totalDuration)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg {formatDuration(analytics.avgDurationPerSession)} per session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Current Streak
              </CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.currentStreak}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.currentStreak === 1 ? 'day' : 'days'} in a row
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Longest Streak
              </CardTitle>
              <Award className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.longestStreak}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Personal best
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Writing Goals */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Writing Goals</CardTitle>
              <CardDescription>Track your progress toward daily, weekly, and project goals</CardDescription>
            </div>
            <Dialog open={isCreateGoalOpen} onOpenChange={setIsCreateGoalOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Writing Goal</DialogTitle>
                  <DialogDescription>
                    Set a new writing target to keep yourself motivated
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="goalType">Goal Type</Label>
                    <Select
                      value={newGoal.type}
                      onValueChange={(value) =>
                        setNewGoal({ ...newGoal, type: value })
                      }
                    >
                      <SelectTrigger id="goalType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        {projectId && <SelectItem value="project">Project</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetWords">Target Words</Label>
                    <Input
                      id="targetWords"
                      type="number"
                      value={newGoal.targetWords}
                      onChange={(e) =>
                        setNewGoal({
                          ...newGoal,
                          targetWords: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateGoalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateGoal}>Create Goal</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No active goals. Create one to get started!</p>
            </div>
          ) : (
            goals.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)}
                    </Badge>
                    {goal.project && (
                      <span className="text-sm text-muted-foreground">
                        {goal.project.title}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    {goal.wordsWritten.toLocaleString()} / {goal.targetWords.toLocaleString()} words
                  </span>
                </div>
                <Progress value={goal.progress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {goal.progress}% complete
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Project Breakdown */}
      {!projectId && analytics.projectBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Project Breakdown</CardTitle>
            <CardDescription>Words written per project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.projectBreakdown.map((project) => (
                <div key={project.projectId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{project.projectTitle}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {project.words.toLocaleString()} words
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {project.sessions} sessions · {formatDuration(project.duration)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>{analytics.sessionCount} writing sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Session history chart visualization would go here
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
