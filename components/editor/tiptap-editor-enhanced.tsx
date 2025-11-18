'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useState, useCallback } from 'react'
import { Loader2, X } from 'lucide-react'
import { AIToolbar } from './ai-toolbar'
import { AlternativesDialog } from './alternatives-dialog'
import { Button } from '@/components/ui/button'

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

interface TiptapEditorEnhancedProps {
  scene: Scene
  projectId: string
  settings: Settings | null
  zenMode: boolean
  onExitZen: () => void
  showAIChat: boolean
  onToggleAIChat: () => void
}

export function TiptapEditorEnhanced({
  scene,
  projectId,
  settings,
  zenMode,
  onExitZen,
  showAIChat,
  onToggleAIChat,
}: TiptapEditorEnhancedProps) {
  const [wordCount, setWordCount] = useState(scene.wordCount)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasSelection, setHasSelection] = useState(false)
  const [aiGeneratedRange, setAiGeneratedRange] = useState<{
    from: number
    to: number
  } | null>(null)
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [alternatives, setAlternatives] = useState<string[]>([])

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
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection
      setHasSelection(from !== to)
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

  // AI Generation helper
  const generateAI = useCallback(
    async (prompt: string, replaceSelection: boolean = false) => {
      if (!editor) return

      setIsGenerating(true)
      const context = editor.getText().slice(-4000) // Last 4000 chars as context

      try {
        const response = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, context }),
        })

        if (!response.ok) {
          throw new Error('AI generation failed')
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let generatedText = ''

        if (!reader) return

        const insertPos = replaceSelection
          ? editor.state.selection.from
          : editor.state.selection.to

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter((line) => line.trim() !== '')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                if (parsed.error) {
                  throw new Error(parsed.error)
                }
                if (parsed.chunk) {
                  generatedText += parsed.chunk

                  // Update editor with streaming text
                  if (replaceSelection) {
                    const { from, to } = editor.state.selection
                    editor
                      .chain()
                      .focus()
                      .deleteRange({ from, to })
                      .insertContentAt(from, generatedText)
                      .run()
                  } else {
                    editor
                      .chain()
                      .focus()
                      .insertContentAt(insertPos, generatedText)
                      .run()
                  }
                }
              } catch (e) {
                console.error('Parse error:', e)
              }
            }
          }
        }

        // Mark the generated text range
        if (generatedText) {
          setAiGeneratedRange({
            from: insertPos,
            to: insertPos + generatedText.length,
          })
        }
      } catch (error: any) {
        console.error('AI generation error:', error)
        alert(error.message || 'Failed to generate AI content')
      } finally {
        setIsGenerating(false)
      }
    },
    [editor]
  )

  // AI Actions
  const handleContinue = () => {
    generateAI('Continue writing this story naturally, maintaining the same tone and style.')
  }

  const handleRephrase = () => {
    if (!editor) return
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to, ' ')
    generateAI(`Rephrase this text while keeping the same meaning: "${selectedText}"`, true)
  }

  const handleExpand = () => {
    if (!editor) return
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to, ' ')
    generateAI(`Expand on this text with more detail and description: "${selectedText}"`, true)
  }

  const handleShorten = () => {
    if (!editor) return
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to, ' ')
    generateAI(`Make this text more concise while keeping the key points: "${selectedText}"`, true)
  }

  const handleFixGrammar = () => {
    if (!editor) return
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to, ' ')
    generateAI(`Fix any grammar, spelling, or punctuation errors in this text: "${selectedText}"`, true)
  }

  const handleGenerateAlternatives = async () => {
    if (!editor) return
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to, ' ')

    setIsGenerating(true)
    const alts: string[] = []

    try {
      // Generate 3 alternatives
      for (let i = 0; i < 3; i++) {
        const response = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `Rewrite this text in a different way (variation ${i + 1}): "${selectedText}"`,
            context: editor.getText().slice(-2000),
          }),
        })

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let altText = ''

        if (!reader) continue

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter((line) => line.trim() !== '')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                if (parsed.chunk) {
                  altText += parsed.chunk
                }
              } catch (e) {
                // Skip
              }
            }
          }
        }

        if (altText) {
          alts.push(altText)
        }
      }

      setAlternatives(alts)
      setShowAlternatives(true)
    } catch (error) {
      console.error('Error generating alternatives:', error)
      alert('Failed to generate alternatives')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelectAlternative = (alternative: string) => {
    if (!editor) return
    const { from, to } = editor.state.selection
    editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, alternative).run()
    setShowAlternatives(false)
  }

  const dismissAIHighlight = () => {
    setAiGeneratedRange(null)
  }

  const fontSize = settings?.editorFontSize || 18
  const lineHeight = settings?.editorLineHeight || 1.8
  const maxWidth = settings?.editorWidth || 42

  return (
    <div className={`h-full flex flex-col ${zenMode ? '' : ''}`}>
      {/* AI Toolbar */}
      {!zenMode && (
        <AIToolbar
          onContinue={handleContinue}
          onRephrase={handleRephrase}
          onExpand={handleExpand}
          onShorten={handleShorten}
          onFixGrammar={handleFixGrammar}
          onGenerateAlternatives={handleGenerateAlternatives}
          onToggleChat={onToggleAIChat}
          hasSelection={hasSelection}
          isGenerating={isGenerating}
        />
      )}

      <div className={`flex-1 flex flex-col ${zenMode ? 'p-8' : 'p-6'}`}>

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

      {/* Alternatives Dialog */}
      <AlternativesDialog
        open={showAlternatives}
        onOpenChange={setShowAlternatives}
        alternatives={alternatives}
        onSelect={handleSelectAlternative}
      />
    </div>
  )
}
