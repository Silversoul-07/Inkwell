'use client'

import Link from 'next/link'
import { Sparkles, Bug, Timer, Minimize2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeSelector } from '@/components/ui/theme-selector'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface EditorIconBarProps {
  aiSidebarOpen: boolean
  setAiSidebarOpen: (open: boolean) => void
  debugSidebarOpen: boolean
  setDebugSidebarOpen: (open: boolean) => void
  pomodoroOpen: boolean
  setPomodoroOpen: (open: boolean) => void
  zenMode: boolean
  setZenMode: (zen: boolean) => void
}

export function EditorIconBar({
  aiSidebarOpen,
  setAiSidebarOpen,
  debugSidebarOpen,
  setDebugSidebarOpen,
  pomodoroOpen,
  setPomodoroOpen,
  zenMode,
  setZenMode,
}: EditorIconBarProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-2 py-3 border-l border-border bg-card/50 backdrop-blur-sm">
      {/* AI Assist */}
      <Button
        variant={aiSidebarOpen ? 'secondary' : 'ghost'}
        size="icon"
        className="h-9 w-9"
        onClick={() => setAiSidebarOpen(!aiSidebarOpen)}
        title="AI Assist"
      >
        <Sparkles className="h-4 w-4" />
      </Button>

      <Separator className="w-6" />

      {/* Debug */}
      <Button
        variant={debugSidebarOpen ? 'secondary' : 'ghost'}
        size="icon"
        className="h-9 w-9"
        onClick={() => setDebugSidebarOpen(!debugSidebarOpen)}
        title="Debug"
      >
        <Bug className="h-4 w-4" />
      </Button>

      {/* Pomodoro */}
      <Button
        variant={pomodoroOpen ? 'secondary' : 'ghost'}
        size="icon"
        className="h-9 w-9"
        onClick={() => setPomodoroOpen(!pomodoroOpen)}
        title="Pomodoro Timer"
      >
        <Timer className="h-4 w-4" />
      </Button>

      <Separator className="w-6" />

      {/* Zen Mode */}
      <Button
        variant={zenMode ? 'secondary' : 'ghost'}
        size="icon"
        className="h-9 w-9"
        onClick={() => setZenMode(!zenMode)}
        title="Zen Mode"
      >
        <Minimize2 className="h-4 w-4" />
      </Button>

      {/* Theme Selector */}
      <ThemeSelector />

      {/* Settings */}
      <Link href="/settings">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}
