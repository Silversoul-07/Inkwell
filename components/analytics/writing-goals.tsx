'use client'

import { useState } from 'react'
import { Target, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

interface WritingGoalsProps {
  projectId: string
  currentWords: number
}

export function WritingGoals({ projectId, currentWords }: WritingGoalsProps) {
  const [dailyGoal, setDailyGoal] = useState(500)
  const [weeklyGoal, setWeeklyGoal] = useState(3500)
  const [projectGoal, setProjectGoal] = useState(80000)
  const [editing, setEditing] = useState(false)

  const projectProgress = Math.min((currentWords / projectGoal) * 100, 100)

  const handleSave = () => {
    // In a real app, save to backend
    localStorage.setItem(
      `goals_${projectId}`,
      JSON.stringify({ dailyGoal, weeklyGoal, projectGoal })
    )
    setEditing(false)
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5" />
            Writing Goals
          </h3>
          <Button
            variant={editing ? 'default' : 'outline'}
            size="sm"
            onClick={() => (editing ? handleSave() : setEditing(true))}
          >
            {editing ? (
              <>
                <Save className="h-3 w-3 mr-2" />
                Save
              </>
            ) : (
              'Edit Goals'
            )}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Daily Goal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Daily Goal</Label>
              {editing ? (
                <Input
                  type="number"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(parseInt(e.target.value) || 0)}
                  className="w-32"
                />
              ) : (
                <span className="text-sm font-medium">{dailyGoal} words</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Write consistently every day
            </p>
          </div>

          {/* Weekly Goal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Weekly Goal</Label>
              {editing ? (
                <Input
                  type="number"
                  value={weeklyGoal}
                  onChange={(e) => setWeeklyGoal(parseInt(e.target.value) || 0)}
                  className="w-32"
                />
              ) : (
                <span className="text-sm font-medium">{weeklyGoal} words</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Weekly writing target
            </p>
          </div>

          {/* Project Goal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Project Goal</Label>
              {editing ? (
                <Input
                  type="number"
                  value={projectGoal}
                  onChange={(e) => setProjectGoal(parseInt(e.target.value) || 0)}
                  className="w-32"
                />
              ) : (
                <span className="text-sm font-medium">{projectGoal.toLocaleString()} words</span>
              )}
            </div>
            <Progress value={projectProgress} />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {currentWords.toLocaleString()} / {projectGoal.toLocaleString()} words
              </span>
              <span>{Math.round(projectProgress)}% complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Stats */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="font-semibold mb-4">Insights</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Words remaining:</span>
            <span className="font-medium">
              {Math.max(0, projectGoal - currentWords).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">At {dailyGoal} words/day:</span>
            <span className="font-medium">
              {Math.ceil(Math.max(0, projectGoal - currentWords) / dailyGoal)} days
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estimated completion:</span>
            <span className="font-medium">
              {new Date(
                Date.now() +
                  Math.ceil(Math.max(0, projectGoal - currentWords) / dailyGoal) *
                    24 *
                    60 *
                    60 *
                    1000
              ).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
