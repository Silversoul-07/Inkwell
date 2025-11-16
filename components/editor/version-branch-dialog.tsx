'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GitBranch, Check, Trash2, Clock } from 'lucide-react'

interface Version {
  id: string
  content: string
  branchName: string | null
  parentId: string | null
  isActive: boolean
  wordCount: number
  createdAt: string
}

interface VersionBranchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sceneId: string
  currentContent: string
  onActivateVersion: (content: string) => void
}

export function VersionBranchDialog({
  open,
  onOpenChange,
  sceneId,
  currentContent,
  onActivateVersion,
}: VersionBranchDialogProps) {
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(false)
  const [branchName, setBranchName] = useState('')
  const [creatingBranch, setCreatingBranch] = useState(false)

  useEffect(() => {
    if (open) {
      loadVersions()
    }
  }, [open, sceneId])

  const loadVersions = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/versions?sceneId=${sceneId}`)
      if (response.ok) {
        const data = await response.json()
        setVersions(data)
      }
    } catch (error) {
      console.error('Error loading versions:', error)
    } finally {
      setLoading(false)
    }
  }

  const createBranch = async () => {
    if (!branchName.trim()) return

    setCreatingBranch(true)
    try {
      const response = await fetch('/api/versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneId,
          content: currentContent,
          branchName,
        }),
      })

      if (response.ok) {
        setBranchName('')
        await loadVersions()
      }
    } catch (error) {
      console.error('Error creating branch:', error)
    } finally {
      setCreatingBranch(false)
    }
  }

  const activateVersion = async (versionId: string, content: string) => {
    try {
      const response = await fetch(`/api/versions/${versionId}`, {
        method: 'POST',
      })

      if (response.ok) {
        onActivateVersion(content)
        await loadVersions()
      }
    } catch (error) {
      console.error('Error activating version:', error)
    }
  }

  const deleteVersion = async (versionId: string) => {
    if (!confirm('Delete this version?')) return

    try {
      const response = await fetch(`/api/versions/${versionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadVersions()
      }
    } catch (error) {
      console.error('Error deleting version:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Version Branches
          </DialogTitle>
          <DialogDescription>
            Create and manage different versions of this scene
          </DialogDescription>
        </DialogHeader>

        {/* Create new branch */}
        <div className="bg-muted p-4 rounded-lg space-y-3">
          <Label>Create New Branch</Label>
          <div className="flex gap-2">
            <Input
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              placeholder="Branch name (e.g., Alternative ending)"
              disabled={creatingBranch}
            />
            <Button
              onClick={createBranch}
              disabled={!branchName.trim() || creatingBranch}
            >
              {creatingBranch ? 'Creating...' : 'Create'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Saves the current content as a new branch you can switch back to
          </p>
        </div>

        {/* Version list */}
        <div className="space-y-3">
          <h4 className="font-semibold">Saved Versions</h4>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading versions...
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No saved versions yet. Create a branch to save the current state.
            </div>
          ) : (
            versions.map((version) => (
              <div
                key={version.id}
                className={`border rounded-lg p-4 ${
                  version.isActive ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-medium">
                        {version.branchName || 'Untitled Branch'}
                      </h5>
                      {version.isActive && (
                        <span className="flex items-center gap-1 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                          <Check className="h-3 w-3" />
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(version.createdAt).toLocaleString()}
                      </span>
                      <span>{version.wordCount.toLocaleString()} words</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {version.content.replace(/<[^>]*>/g, '').slice(0, 200)}...
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!version.isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => activateVersion(version.id, version.content)}
                      >
                        Switch To
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteVersion(version.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
