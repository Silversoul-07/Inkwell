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
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'
import { Clock, RotateCcw, Trash2, Check } from 'lucide-react'

interface Version {
  id: string
  content: string
  branchName: string | null
  parentId: string | null
  isActive: boolean
  wordCount: number
  createdAt: string
}

interface VersionHistoryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sceneId: string
  onRestore?: () => void
}

export function VersionHistory({ open, onOpenChange, sceneId, onRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null)
  const [restoring, setRestoring] = useState(false)

  useEffect(() => {
    if (open && sceneId) {
      fetchVersions()
    }
  }, [open, sceneId])

  const fetchVersions = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/versions?sceneId=${sceneId}`)
      if (response.ok) {
        const data = await response.json()
        setVersions(data.versions || [])
      } else {
        console.error('Failed to fetch versions')
      }
    } catch (error) {
      console.error('Error fetching versions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (versionId: string) => {
    if (
      !confirm(
        'Are you sure you want to restore this version? Your current content will be saved as a new version before restoring.'
      )
    ) {
      return
    }

    setRestoring(true)
    try {
      const response = await fetch(`/api/versions/${versionId}/restore`, {
        method: 'POST',
      })

      if (response.ok) {
        alert('Version restored successfully!')
        onOpenChange(false)
        if (onRestore) {
          onRestore()
        }
        // Reload the page to show the restored content
        window.location.reload()
      } else {
        const error = await response.json()
        alert(`Failed to restore version: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error restoring version:', error)
      alert('Failed to restore version. Please try again.')
    } finally {
      setRestoring(false)
    }
  }

  const handleDelete = async (versionId: string) => {
    if (!confirm('Are you sure you want to delete this version? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/versions/${versionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove from list
        setVersions(versions.filter(v => v.id !== versionId))
        setSelectedVersion(null)
      } else {
        alert('Failed to delete version')
      }
    } catch (error) {
      console.error('Error deleting version:', error)
      alert('Failed to delete version. Please try again.')
    }
  }

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Unknown time'
    }
  }

  const getPreview = (content: string) => {
    // Remove HTML tags and get first 100 characters
    const text = content.replace(/<[^>]*>/g, ' ').trim()
    return text.length > 100 ? text.substring(0, 100) + '...' : text
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>View and restore previous versions of this scene</DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 h-[60vh]">
          {/* Version List */}
          <div className="w-1/3 border-r pr-4">
            <ScrollArea className="h-full">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading versions...</p>
              ) : versions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No versions found</p>
              ) : (
                <div className="space-y-2">
                  {versions.map(version => (
                    <div
                      key={version.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedVersion?.id === version.id
                          ? 'bg-accent border-accent-foreground'
                          : 'hover:bg-accent/50'
                      }`}
                      onClick={() => setSelectedVersion(version)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">
                          {version.branchName || 'Unnamed'}
                        </span>
                        {version.isActive && <Check className="w-3 h-3 text-green-600" />}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(version.createdAt)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {version.wordCount} words
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Version Preview */}
          <div className="flex-1 flex flex-col">
            {selectedVersion ? (
              <>
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-1">
                    {selectedVersion.branchName || 'Unnamed Version'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {formatTimeAgo(selectedVersion.createdAt)} • {selectedVersion.wordCount} words
                  </p>
                </div>

                <ScrollArea className="flex-1 border rounded-lg p-4 mb-4">
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedVersion.content }}
                  />
                </ScrollArea>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleRestore(selectedVersion.id)}
                    disabled={restoring || selectedVersion.isActive}
                    className="flex-1"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {restoring
                      ? 'Restoring...'
                      : selectedVersion.isActive
                        ? 'Current Version'
                        : 'Restore This Version'}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(selectedVersion.id)}
                    disabled={restoring || selectedVersion.isActive}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a version to preview
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
