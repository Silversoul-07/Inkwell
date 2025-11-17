'use client'

import { useState, useEffect } from 'react'
import { Zap, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

interface WritingMode {
  id: string
  name: string
  description?: string
  isBuiltin: boolean
  temperature: number
  maxTokens: number
  systemPrompt?: string
  continuePrompt?: string
}

interface WritingModeSelectorProps {
  projectId: string
  activeModeId?: string
  onModeChange: (mode: WritingMode | null) => void
  compact?: boolean
}

export function WritingModeSelector({
  projectId,
  activeModeId,
  onModeChange,
  compact = false,
}: WritingModeSelectorProps) {
  const [modes, setModes] = useState<WritingMode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadModes()
  }, [])

  const loadModes = async () => {
    try {
      const response = await fetch('/api/writing-modes')
      if (response.ok) {
        const data = await response.json()
        setModes(data)

        // Auto-select Balanced mode if no mode active
        if (!activeModeId) {
          const balanced = data.find((m: WritingMode) => m.name === 'Balanced')
          if (balanced) {
            onModeChange(balanced)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load modes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectMode = async (mode: WritingMode | null) => {
    try {
      // Update project's active mode
      await fetch('/api/writing-modes/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          modeId: mode?.id || null,
        }),
      })

      onModeChange(mode)
    } catch (error) {
      console.error('Failed to activate mode:', error)
    }
  }

  const activeMode = modes.find((m) => m.id === activeModeId)

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Zap className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={activeMode ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
        >
          <Zap className="h-4 w-4" />
          {activeMode?.name || 'Select Mode'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        <DropdownMenuLabel>Writing Mode</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => handleSelectMode(null)}>
          <div className="flex flex-col flex-1">
            <span className="font-medium">Default (No Mode)</span>
            <span className="text-xs text-muted-foreground">
              Standard AI behavior
            </span>
          </div>
          {!activeModeId && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {modes.map((mode) => (
          <DropdownMenuItem
            key={mode.id}
            onClick={() => handleSelectMode(mode)}
            className="flex flex-col items-start p-3"
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-medium">{mode.name}</span>
              <div className="flex gap-1 items-center">
                {mode.isBuiltin && (
                  <Badge variant="secondary" className="text-xs">
                    Built-in
                  </Badge>
                )}
                {activeModeId === mode.id && <Check className="h-4 w-4" />}
              </div>
            </div>
            {mode.description && (
              <span className="text-xs text-muted-foreground mt-1">
                {mode.description}
              </span>
            )}
            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
              <span>Temp: {mode.temperature}</span>
              <span>Tokens: {mode.maxTokens}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
