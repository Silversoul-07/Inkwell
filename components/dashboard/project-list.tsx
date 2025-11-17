'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Book, FileText, BarChart3, Users, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreateProjectDialog } from './create-project-dialog'

interface Project {
  id: string
  title: string
  description: string | null
  createdAt: Date
  updatedAt: Date
  chapters: Array<{
    id: string
    scenes: Array<{
      id: string
      wordCount: number
    }>
  }>
}

interface ProjectListProps {
  projects: Project[]
}

export function ProjectList({ projects }: ProjectListProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const getTotalWords = (project: Project) => {
    return project.chapters.reduce(
      (total, chapter) =>
        total + chapter.scenes.reduce((sum, scene) => sum + scene.wordCount, 0),
      0
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Your Projects</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <Book className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first project to start writing
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col"
            >
              <Link href={`/editor/${project.id}`} className="block mb-4">
                <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
                  {project.title}
                </h3>
                {project.description && (
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {project.description}
                  </p>
                )}
              </Link>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Book className="h-4 w-4" />
                  <span>{project.chapters.length} chapters</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{getTotalWords(project).toLocaleString()} words</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground mb-4">
                Updated {new Date(project.updatedAt).toLocaleDateString()}
              </div>

              <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-border">
                <Link href={`/analytics/${project.id}`}>
                  <Button variant="outline" size="sm" className="w-full" title="Analytics">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/characters/${project.id}`}>
                  <Button variant="outline" size="sm" className="w-full" title="Characters">
                    <Users className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/lorebook/${project.id}`}>
                  <Button variant="outline" size="sm" className="w-full" title="Lorebook">
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  )
}
