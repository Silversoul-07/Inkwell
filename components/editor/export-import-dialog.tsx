'use client'

import { useState } from 'react'
import { Download, Upload, FileText, FileCode, FileType } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface ExportImportDialogProps {
  projectId: string
}

export function ExportImportDialog({ projectId }: ExportImportDialogProps) {
  const [open, setOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importFormat, setImportFormat] = useState<'txt' | 'md'>('md')
  const [importStatus, setImportStatus] = useState<string>('')

  const handleExport = async (format: 'txt' | 'md' | 'docx') => {
    try {
      const response = await fetch(`/api/export?projectId=${projectId}&format=${format}`)
      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Get the blob and create a download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      // Get filename from Content-Disposition header or use default
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

      // Reload the page after a delay
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error('Import error:', error)
      setImportStatus('Failed to import file. Please check the format and try again.')
    } finally {
      setImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export/Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export / Import Project</DialogTitle>
          <DialogDescription>
            Export your project to different formats or import content from a file
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <div className="space-y-3">
              <Label>Choose export format:</Label>

              <div className="grid gap-2">
                <Button
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => handleExport('txt')}
                >
                  <FileText className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Plain Text (.txt)</div>
                    <div className="text-xs text-muted-foreground">
                      Simple text format, compatible with all text editors
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => handleExport('md')}
                >
                  <FileCode className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Markdown (.md)</div>
                    <div className="text-xs text-muted-foreground">
                      Formatted text with chapter and scene structure
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => handleExport('docx')}
                >
                  <FileType className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Rich Text (.rtf)</div>
                    <div className="text-xs text-muted-foreground">
                      Compatible with Word, Google Docs, and other word processors
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="import-file">Select file to import</Label>
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
                    variant={importFormat === 'txt' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImportFormat('txt')}
                  >
                    Plain Text
                  </Button>
                  <Button
                    variant={importFormat === 'md' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImportFormat('md')}
                  >
                    Markdown
                  </Button>
                </div>
              </div>

              <div className="bg-muted p-3 rounded-md text-sm">
                <p className="font-semibold mb-1">Import Format Guidelines:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Markdown: Use ## for chapters, ### for scenes</li>
                  <li>Plain Text: Separate chapters with blank lines</li>
                  <li>Imported content will be added to your existing project</li>
                </ul>
              </div>

              {importStatus && (
                <div className={`p-3 rounded-md ${importStatus.includes('Success') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
