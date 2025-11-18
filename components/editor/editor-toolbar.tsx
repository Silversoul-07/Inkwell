'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Home,
  PanelLeft,
  Minimize2,
  Settings,
  BarChart3,
  Users,
  BookOpen,
  FolderOpen,
  ChevronDown,
  Download,
  Upload,
  Sparkles,
  Bug,
  Timer,
  Bot,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeSelector } from '@/components/ui/theme-selector'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'

interface Project {
  id: string
  title: string
}

interface EditorToolbarProps {
  project: Project
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  aiSidebarOpen: boolean
  setAiSidebarOpen: (open: boolean) => void
  debugSidebarOpen: boolean
  setDebugSidebarOpen: (open: boolean) => void
  zenMode: boolean
  setZenMode: (zen: boolean) => void
  pomodoroOpen: boolean
  setPomodoroOpen: (open: boolean) => void
}

const isClient = typeof window !== 'undefined'

export function EditorToolbar({
  project,
  sidebarOpen,
  setSidebarOpen,
  aiSidebarOpen,
  setAiSidebarOpen,
  debugSidebarOpen,
  setDebugSidebarOpen,
  zenMode,
  setZenMode,
  pomodoroOpen,
  setPomodoroOpen,
}: EditorToolbarProps) {

  const handleExport = async (format: 'txt' | 'md' | 'docx') => {
    try {
      const response = await fetch(`/api/export?projectId=${project.id}&format=${format}`)
      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const filename = filenameMatch ? filenameMatch[1] : `export.${format}`
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export file')
    }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.txt,.md,.docx'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', project.id)

      try {
        const response = await fetch('/api/import', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          alert('Import successful! Refreshing...')
          window.location.reload()
        } else {
          alert('Import failed')
        }
      } catch (error) {
        console.error('Import error:', error)
        alert('Failed to import file')
      }
    }
    input.click()
  }

  return (
    <div className="border-b border-border bg-gradient-to-b from-card to-card/80 backdrop-blur-sm px-3 py-2.5 flex items-center justify-between shadow-sm">
      {/* Left Section - Navigation & Project */}
      <div className="flex items-center gap-2">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="h-9 w-9" title="Back to Dashboard">
            <Home className="h-4 w-4" />
          </Button>
        </Link>

        <Button
          variant={sidebarOpen ? "secondary" : "ghost"}
          size="icon"
          className="h-9 w-9"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title="Toggle Sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-foreground truncate max-w-[200px]">
            {project.title}
          </h1>

          {/* Project Tools Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-1">
                <FolderOpen className="h-3.5 w-3.5" />
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                Project Tools
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/agents" className="cursor-pointer">
                  <Bot className="h-4 w-4 mr-2" />
                  AI Agents
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/analytics/${project.id}`} className="cursor-pointer">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/characters/${project.id}`} className="cursor-pointer">
                  <Users className="h-4 w-4 mr-2" />
                  Characters
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/lorebook/${project.id}`} className="cursor-pointer">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Lorebook
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleImport}>
                <Upload className="h-4 w-4 mr-2" />
                Import File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('md')}>
                <Download className="h-4 w-4 mr-2" />
                Export as Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('txt')}>
                <Download className="h-4 w-4 mr-2" />
                Export as Text
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('docx')}>
                <Download className="h-4 w-4 mr-2" />
                Export as DOCX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Right Section - AI Controls & Settings */}
      <div className="flex items-center gap-1.5">
        {/* AI Assist */}
        <Button
          variant={aiSidebarOpen ? "secondary" : "ghost"}
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => {
            setAiSidebarOpen(!aiSidebarOpen)
            if (!aiSidebarOpen) setDebugSidebarOpen(false) // Close debug when opening AI
          }}
          title="AI Assist"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">AI Assist</span>
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Debug */}
        <Button
          variant={debugSidebarOpen ? "secondary" : "ghost"}
          size="icon"
          className="h-9 w-9"
          onClick={() => {
            setDebugSidebarOpen(!debugSidebarOpen)
            if (!debugSidebarOpen) setAiSidebarOpen(false) // Close AI when opening debug
          }}
          title="Debug"
        >
          <Bug className="h-4 w-4" />
        </Button>

        {/* Pomodoro */}
        <Button
          variant={pomodoroOpen ? "secondary" : "ghost"}
          size="icon"
          className="h-9 w-9"
          onClick={() => setPomodoroOpen(!pomodoroOpen)}
          title="Pomodoro Timer"
        >
          <Timer className="h-4 w-4" />
        </Button>

        {/* Zen Mode */}
        <Button
          variant={zenMode ? "secondary" : "ghost"}
          size="icon"
          className="h-9 w-9"
          onClick={() => setZenMode(!zenMode)}
          title="Zen Mode"
        >
          <Minimize2 className="h-4 w-4" />
        </Button>

        {/* Theme */}
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
    </div>
  )
}
