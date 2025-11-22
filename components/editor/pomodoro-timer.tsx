'use client'

import { useState, useEffect, useCallback } from 'react'
import { Timer, Play, Pause, RotateCcw, X, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface PomodoroTimerProps {
  projectId: string
  onSessionComplete?: (duration: number) => void
}

type SessionType = 'work' | 'break' | 'longBreak'

export function PomodoroTimer({ projectId, onSessionComplete }: PomodoroTimerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [sessionType, setSessionType] = useState<SessionType>('work')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)

  // Settings
  const [settings, setSettings] = useState({
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
  })

  const [showSettings, setShowSettings] = useState(false)

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, isPaused, timeLeft]) // eslint-disable-line react-hooks/exhaustive-deps

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Start timer
  const handleStart = async () => {
    if (!isRunning) {
      // Create new session
      try {
        const response = await fetch('/api/pomodoro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            duration: getDurationForType(sessionType),
            sessionType,
          }),
        })

        if (response.ok) {
          const session = await response.json()
          setSessionId(session.id)
          setIsRunning(true)
          setIsPaused(false)
        }
      } catch (error) {
        console.error('Failed to start pomodoro:', error)
      }
    } else {
      // Resume
      setIsPaused(false)
    }
  }

  // Pause timer
  const handlePause = () => {
    setIsPaused(true)
  }

  // Reset timer
  const handleReset = () => {
    setIsRunning(false)
    setIsPaused(false)
    setTimeLeft(getDurationForType(sessionType) * 60)
    setSessionId(null)
  }

  // Timer complete
  const handleTimerComplete = async () => {
    setIsRunning(false)
    setIsPaused(false)

    // Complete session
    if (sessionId) {
      try {
        await fetch(`/api/pomodoro/${sessionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            completedAt: new Date().toISOString(),
            wordsWritten: 0, // Could be tracked
          }),
        })
      } catch (error) {
        console.error('Failed to complete pomodoro:', error)
      }
    }

    // Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Complete!', {
        body: sessionType === 'work' ? 'Time for a break!' : 'Time to work!',
      })
    }

    // Switch session type
    if (sessionType === 'work') {
      setCompletedPomodoros(prev => prev + 1)
      const nextCount = completedPomodoros + 1

      if (nextCount % settings.longBreakInterval === 0) {
        setSessionType('longBreak')
        setTimeLeft(settings.longBreakDuration * 60)
      } else {
        setSessionType('break')
        setTimeLeft(settings.breakDuration * 60)
      }

      if (settings.autoStartBreaks) {
        setTimeout(() => handleStart(), 1000)
      }
    } else {
      setSessionType('work')
      setTimeLeft(settings.workDuration * 60)

      if (settings.autoStartPomodoros) {
        setTimeout(() => handleStart(), 1000)
      }
    }

    if (onSessionComplete) {
      onSessionComplete(getDurationForType(sessionType))
    }
  }

  const getDurationForType = (type: SessionType): number => {
    switch (type) {
      case 'work':
        return settings.workDuration
      case 'break':
        return settings.breakDuration
      case 'longBreak':
        return settings.longBreakDuration
      default:
        return 25
    }
  }

  const getSessionLabel = () => {
    switch (sessionType) {
      case 'work':
        return 'Work'
      case 'break':
        return 'Break'
      case 'longBreak':
        return 'Long Break'
      default:
        return 'Session'
    }
  }

  const getProgressPercent = () => {
    const total = getDurationForType(sessionType) * 60
    return ((total - timeLeft) / total) * 100
  }

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 right-6 z-40 rounded-full h-12 w-12 shadow-lg"
        title="Pomodoro Timer"
      >
        <Timer className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-20 right-6 z-40 w-80 shadow-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Pomodoro</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Pomodoro Settings</DialogTitle>
                  <DialogDescription>Customize your pomodoro timer intervals</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Work Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={settings.workDuration}
                      onChange={e =>
                        setSettings({
                          ...settings,
                          workDuration: parseInt(e.target.value) || 25,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Break Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={settings.breakDuration}
                      onChange={e =>
                        setSettings({
                          ...settings,
                          breakDuration: parseInt(e.target.value) || 5,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Long Break Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={settings.longBreakDuration}
                      onChange={e =>
                        setSettings({
                          ...settings,
                          longBreakDuration: parseInt(e.target.value) || 15,
                        })
                      }
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsVisible(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Badge variant={sessionType === 'work' ? 'default' : 'secondary'}>
          {getSessionLabel()}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-6xl font-bold font-mono tabular-nums">{formatTime(timeLeft)}</div>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-1000"
              style={{ width: `${getProgressPercent()}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          {!isRunning || isPaused ? (
            <Button onClick={handleStart} size="lg">
              <Play className="h-5 w-5 mr-2" />
              {isRunning ? 'Resume' : 'Start'}
            </Button>
          ) : (
            <Button onClick={handlePause} size="lg" variant="outline">
              <Pause className="h-5 w-5 mr-2" />
              Pause
            </Button>
          )}
          <Button onClick={handleReset} size="lg" variant="outline">
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
          <span>Completed today:</span>
          <Badge variant="outline">{completedPomodoros}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
