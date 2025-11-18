'use client'

import { useState, useEffect } from 'react'
import { Trash2, Clock, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'

interface PomodoroSession {
  id: string
  startTime: Date
  endTime?: Date
  duration: number
  wordsWritten: number
  completed: boolean
  project?: {
    id: string
    title: string
  }
}

export function PomodoroManager() {
  const { toast } = useToast()
  const [sessions, setSessions] = useState<PomodoroSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/pomodoro?limit=50')
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load Pomodoro sessions',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to load Pomodoro sessions:', error)
      toast({
        title: 'Error',
        description: 'Failed to load Pomodoro sessions',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this Pomodoro session?')) return

    try {
      const response = await fetch(`/api/pomodoro/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadSessions()
        toast({
          title: 'Success',
          description: 'Pomodoro session deleted successfully',
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete Pomodoro session',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to delete session:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete Pomodoro session',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm('Delete all Pomodoro sessions? This cannot be undone.')) return

    try {
      const deletePromises = sessions.map((session) =>
        fetch(`/api/pomodoro/${session.id}`, { method: 'DELETE' })
      )

      await Promise.all(deletePromises)
      await loadSessions()
      toast({
        title: 'Success',
        description: 'All Pomodoro sessions deleted successfully',
      })
    } catch (error) {
      console.error('Failed to delete all sessions:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete all sessions',
        variant: 'destructive',
      })
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getStats = () => {
    const completedSessions = sessions.filter(s => s.completed)
    const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0)
    const totalWords = sessions.reduce((sum, s) => sum + s.wordsWritten, 0)

    return {
      total: sessions.length,
      completed: completedSessions.length,
      totalTime: formatDuration(totalTime),
      totalWords,
    }
  }

  const stats = getStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pomodoro Sessions</h2>
          <p className="text-sm text-muted-foreground">
            View and manage your Pomodoro writing sessions
          </p>
        </div>
        {sessions.length > 0 && (
          <Button variant="destructive" size="sm" onClick={handleDeleteAll}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete All
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTime}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Words Written</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWords.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="text-center py-8">Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No Pomodoro sessions yet</h3>
            <p className="text-sm text-muted-foreground">
              Start a Pomodoro session from the editor to track your focused writing time
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-base">
                        {formatDuration(session.duration)} Session
                      </CardTitle>
                      {session.completed ? (
                        <Badge variant="default">Completed</Badge>
                      ) : (
                        <Badge variant="secondary">Incomplete</Badge>
                      )}
                    </div>
                    <CardDescription className="mt-1 flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(session.startTime), { addSuffix: true })}
                      </span>
                      {session.project && (
                        <span>Project: {session.project.title}</span>
                      )}
                      {session.wordsWritten > 0 && (
                        <span>{session.wordsWritten} words written</span>
                      )}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(session.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
