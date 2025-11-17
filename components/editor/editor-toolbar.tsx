'use client'

import Link from 'next/link'
import {
  Home,
  PanelLeft,
  PanelRight,
  Maximize,
  Settings,
  BarChart3,
  Users,
  BookOpen,
  Sparkles,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExportImportDialog } from './export-import-dialog'
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
  rightSidebarOpen: boolean
  setRightSidebarOpen: (open: boolean) => void
  zenMode: boolean
  setZenMode: (zen: boolean) => void
}

export function EditorToolbar({
  project,
  sidebarOpen,
  setSidebarOpen,
  rightSidebarOpen,
  setRightSidebarOpen,
  zenMode,
  setZenMode,
}: EditorToolbarProps) {
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
                <Sparkles className="h-3.5 w-3.5" />
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                Project Tools
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Right Section - Tools & Settings */}
      <div className="flex items-center gap-1.5">
        <ExportImportDialog projectId={project.id} />

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button
          variant={rightSidebarOpen ? "secondary" : "ghost"}
          size="sm"
          className="h-8 gap-2"
          onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
          title="AI Assistant"
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-medium">AI Assistant</span>
        </Button>

        <Button
          variant={zenMode ? "secondary" : "ghost"}
          size="sm"
          className="h-8 gap-2"
          onClick={() => setZenMode(!zenMode)}
          title="Toggle Zen Mode"
        >
          <Maximize className="h-4 w-4" />
          <span className="text-xs font-medium">Zen</span>
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ThemeSelector />

        <Link href="/settings">
          <Button variant="ghost" size="icon" className="h-9 w-9" title="Settings">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
