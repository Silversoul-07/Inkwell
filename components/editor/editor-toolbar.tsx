'use client'

import Link from 'next/link'
import { Home, PanelLeft, Maximize, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExportImportDialog } from './export-import-dialog'

interface Project {
  id: string
  title: string
}

interface EditorToolbarProps {
  project: Project
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  zenMode: boolean
  setZenMode: (zen: boolean) => void
}

export function EditorToolbar({
  project,
  sidebarOpen,
  setSidebarOpen,
  zenMode,
  setZenMode,
}: EditorToolbarProps) {
  return (
    <div className="border-b border-border bg-card px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <Home className="h-4 w-4" />
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <PanelLeft className="h-4 w-4" />
        </Button>

        <h1 className="text-lg font-semibold ml-2">{project.title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <ExportImportDialog projectId={project.id} />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setZenMode(!zenMode)}
        >
          <Maximize className="h-4 w-4 mr-2" />
          Zen Mode
        </Button>

        <Link href="/settings">
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
