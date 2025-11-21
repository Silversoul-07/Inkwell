'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface ImportDialogProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportDialog({ projectId, open, onOpenChange }: ImportDialogProps) {
  const [importing, setImporting] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importFormat, setImportFormat] = useState<'txt' | 'md'>('md')
  const [importStatus, setImportStatus] = useState<string>('')

  const handleImport = async () => {
    if (!importFile) {
      alert('Please select a file to import')
      return
    }

    setImporting(true)
    setImportStatus('Importing...')

    try {
      const formData = new FormData()
      formData.append('file', importFile)
      formData.append('projectId', projectId)
      formData.append('format', importFormat)

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Import failed')
      }

      const result = await response.json()
      setImportStatus(
        `Success! Imported ${result.chaptersImported} chapters and ${result.scenesImported} scenes.`
      )

      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error('Import error:', error)
      setImportStatus('Failed to import file. Please check the format and try again.')
    } finally {
      setImporting(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setImportFile(null)
      setImportStatus('')
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Import Content</DialogTitle>
          <DialogDescription>
            Import chapters and scenes from a file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="import-file">Select file</Label>
            <Input
              id="import-file"
              type="file"
              accept=".txt,.md,.markdown"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="space-y-2">
            <Label>File format</Label>
            <div className="flex gap-2">
              <Button
                variant={importFormat === 'md' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setImportFormat('md')}
              >
                Markdown
              </Button>
              <Button
                variant={importFormat === 'txt' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setImportFormat('txt')}
              >
                Plain Text
              </Button>
            </div>
          </div>

          <div className="bg-muted p-3 rounded-md text-sm">
            <p className="font-medium mb-1">Format guidelines:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
              <li>Markdown: Use ## for chapters, ### for scenes</li>
              <li>Plain Text: Separate chapters with blank lines</li>
              <li>Content will be added to your existing project</li>
            </ul>
          </div>

          {importStatus && (
            <div className={`p-3 rounded-md text-sm ${
              importStatus.includes('Success')
                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
            }`}>
              {importStatus}
            </div>
          )}

          <Button
            onClick={handleImport}
            disabled={!importFile || importing}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {importing ? 'Importing...' : 'Import File'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
