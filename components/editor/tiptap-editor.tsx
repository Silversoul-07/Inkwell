'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface Scene {
  id: string
  title: string | null
  content: string
  wordCount: number
}

interface Settings {
  editorFont?: string
  editorFontSize?: number
  editorLineHeight?: number
  editorWidth?: number
  autoSaveInterval?: number
}

interface TiptapEditorProps {
  scene: Scene
  projectId: string
  settings: Settings | null
  zenMode: boolean
  onExitZen: () => void
}

export function TiptapEditor({
  scene,
  projectId,
  settings,
  zenMode,
  onExitZen,
}: TiptapEditorProps) {
  const router = useRouter()
  const [wordCount, setWordCount] = useState(scene.wordCount)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const editor = useEditor({
    extensions: [StarterKit],
    content: scene.content,
    editorProps: {
      attributes: {
        class: 'prose prose-lg focus:outline-none',
        'data-placeholder': 'Start writing your story...',
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText()
      const words = text.trim() ? text.trim().split(/\s+/).length : 0
      setWordCount(words)
    },
  })

  // Auto-save functionality
  const saveContent = useCallback(async () => {
    if (!editor) return

    const content = editor.getHTML()
    const text = editor.getText()
    const words = text.trim() ? text.trim().split(/\s+/).length : 0

    setIsSaving(true)
    try {
      await fetch(`/api/scenes/${scene.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, wordCount: words }),
      })
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error saving content:', error)
    } finally {
      setIsSaving(false)
    }
  }, [editor, scene.id])

  // Auto-save effect
  useEffect(() => {
    const interval = settings?.autoSaveInterval || 30
    const timer = setInterval(saveContent, interval * 1000)
    return () => clearInterval(timer)
  }, [saveContent, settings])

  // Save on unmount
  useEffect(() => {
    return () => {
      saveContent()
    }
  }, [saveContent])

  // Zen mode keyboard shortcut (Escape to exit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && zenMode) {
        onExitZen()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [zenMode, onExitZen])

  const fontSize = settings?.editorFontSize || 18
  const lineHeight = settings?.editorLineHeight || 1.8
  const maxWidth = settings?.editorWidth || 42

  return (
    <div className={`h-full flex flex-col ${zenMode ? 'p-8' : 'p-6'}`}>
      {/* Editor toolbar / stats */}
      <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{wordCount.toLocaleString()} words</span>
          {isSaving && (
            <span className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </span>
          )}
          {!isSaving && lastSaved && (
            <span>Saved {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>
      </div>

      {/* Editor */}
      <div
        className="flex-1 overflow-auto"
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: lineHeight.toString(),
        }}
      >
        <div
          className={`mx-auto font-writer-serif`}
          style={{ maxWidth: `${maxWidth}rem` }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}
