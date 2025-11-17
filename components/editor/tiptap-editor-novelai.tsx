'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useState, useCallback } from 'react'
import { Loader2, X } from 'lucide-react'
import { AIToolbarBottom } from './ai-toolbar-bottom'
import { AlternativesDialog } from './alternatives-dialog'
import { RightSidebarPanel } from './right-sidebar-panel'
import { WritingModeSelector } from './writing-mode-selector'
import { Button } from '@/components/ui/button'
import { processTemplate, buildEditorVariables } from '@/lib/template-processor'

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

interface TiptapEditorNovelAIProps {
  scene: Scene
  projectId: string
  settings: Settings | null
  zenMode: boolean
  onExitZen: () => void
  rightSidebarOpen: boolean
  onRightSidebarClose: () => void
  projectMetadata?: {
    genre?: string
    pov?: string
    tense?: string
  }
}

export function TiptapEditorNovelAI({
  scene,
  projectId,
  settings,
  zenMode,
  onExitZen,
  rightSidebarOpen,
  onRightSidebarClose,
  projectMetadata,
}: TiptapEditorNovelAIProps) {
  const [wordCount, setWordCount] = useState(scene.wordCount)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasSelection, setHasSelection] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [aiGeneratedRange, setAiGeneratedRange] = useState<{
    from: number
    to: number
  } | null>(null)
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [alternatives, setAlternatives] = useState<string[]>([])

  // Template-based prompt generation
  const [useCustomTemplates, setUseCustomTemplates] = useState(true)
  const [selectedTemplates, setSelectedTemplates] = useState<Record<string, any>>({})

  // Writing mode state
  const [activeWritingMode, setActiveWritingMode] = useState<any>(null)

  // Build context variables for templates
  const buildPromptVariables = useCallback((action: string, customText?: string) => {
    return buildEditorVariables({
      selection: selectedText || customText || '',
      sceneContext: editor?.getText().slice(-4000) || '',
      genre: projectMetadata?.genre || '',
      pov: projectMetadata?.pov || '',
      tense: projectMetadata?.tense || '',
    })
  }, [selectedText, editor, projectMetadata])

  const editor = useEditor({
    extensions: [StarterKit],
    content: scene.content,
    editorProps: {
      attributes: {
        class: 'prose prose-lg focus:outline-none min-h-full',
        'data-placeholder': 'Begin your story here...',
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText()
      const words = text.trim() ? text.trim().split(/\s+/).length : 0
      setWordCount(words)
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection
      const hasText = from !== to
      setHasSelection(hasText)
      if (hasText) {
        const text = editor.state.doc.textBetween(from, to, ' ')
        setSelectedText(text)
      } else {
        setSelectedText('')
      }
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

      // Build request with writing mode settings
      const requestBody: any = {
        prompt,
        context,
        projectId, // Pass projectId for context building
        includeUserInstructions: true,
        includeLorebook: true,
        includeCharacters: false, // TODO: Add character selection
      }

      // Apply writing mode settings if active
      if (activeWritingMode) {
        if (activeWritingMode.temperature !== undefined) {
          requestBody.temperature = activeWritingMode.temperature
        }
        if (activeWritingMode.maxTokens !== undefined) {
          requestBody.maxTokens = activeWritingMode.maxTokens
        }
        if (activeWritingMode.systemPrompt) {
          requestBody.systemPrompt = activeWritingMode.systemPrompt
        }
      }

      try {
        const response = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
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
    [editor, activeWritingMode, projectId]
  )

  // Build prompt using template or fallback to default
  const buildPrompt = useCallback((action: string, fallbackPrompt: string, customText?: string) => {
    if (useCustomTemplates && selectedTemplates[action]?.template) {
      const variables = buildPromptVariables(action, customText)
      return processTemplate(selectedTemplates[action].template, variables)
    }
    return fallbackPrompt
  }, [useCustomTemplates, selectedTemplates, buildPromptVariables])

  // AI Actions
  const handleContinue = () => {
    // Use mode's continuePrompt if available, otherwise use template or fallback
    let fallbackPrompt = 'Continue writing this story naturally, maintaining the same tone and style.'
    if (activeWritingMode?.continuePrompt) {
      fallbackPrompt = activeWritingMode.continuePrompt
    }

    const prompt = buildPrompt('continue', fallbackPrompt)
    generateAI(prompt)
  }

  const handleRephrase = () => {
    if (!editor) return
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to, ' ')
    const prompt = buildPrompt(
      'rephrase',
      `Rephrase this text while keeping the same meaning: "${selectedText}"`,
      selectedText
    )
    generateAI(prompt, true)
  }

  const handleExpand = () => {
    if (!editor) return
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to, ' ')
    const prompt = buildPrompt(
      'expand',
      `Expand on this text with more detail and description: "${selectedText}"`,
      selectedText
    )
    generateAI(prompt, true)
  }

  const handleShorten = () => {
    if (!editor) return
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to, ' ')
    const prompt = buildPrompt(
      'shorten',
      `Make this text more concise while keeping the key points: "${selectedText}"`,
      selectedText
    )
    generateAI(prompt, true)
  }

  const handleFixGrammar = () => {
    if (!editor) return
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to, ' ')
    const prompt = buildPrompt(
      'grammar',
      `Fix any grammar, spelling, or punctuation errors in this text: "${selectedText}"`,
      selectedText
    )
    generateAI(prompt, true)
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

  const handleUndo = () => {
    editor?.chain().focus().undo().run()
  }

  const handleRedo = () => {
    editor?.chain().focus().redo().run()
  }

  const handleInsertText = (text: string) => {
    if (!editor) return
    const pos = editor.state.selection.to
    editor.chain().focus().insertContentAt(pos, `\n\n${text}`).run()
  }

  const handleReplaceSelection = (text: string) => {
    if (!editor) return
    const { from, to } = editor.state.selection
    editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, text).run()
  }

  const dismissAIHighlight = () => {
    setAiGeneratedRange(null)
  }

  const fontSize = settings?.editorFontSize || 18
  const lineHeight = settings?.editorLineHeight || 1.8
  const maxWidth = settings?.editorWidth || 56 // Wider default for desktop

  const canUndo = editor?.can().undo() || false
  const canRedo = editor?.can().redo() || false

  return (
    <div className={`h-full flex flex-col relative ${zenMode ? '' : ''}`}>
      <div className={`flex-1 flex flex-col ${zenMode ? 'p-8' : 'p-6'}`}>
        {/* Editor toolbar / stats */}
        <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{wordCount.toLocaleString()} words</span>
            <WritingModeSelector
              projectId={projectId}
              activeModeId={activeWritingMode?.id}
              onModeChange={setActiveWritingMode}
              compact
            />
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

          {/* AI Generated highlight dismiss */}
          {aiGeneratedRange && (
            <div className="flex items-center gap-2 px-3 py-1 bg-accent rounded-md">
              <span className="text-xs">AI Generated</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4"
                onClick={dismissAIHighlight}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Editor */}
        <div
          className="flex-1 overflow-auto pb-24"
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

      {/* Bottom AI Toolbar - NovelAI Style */}
      {!zenMode && (
        <AIToolbarBottom
          onContinue={handleContinue}
          onRephrase={handleRephrase}
          onExpand={handleExpand}
          onShorten={handleShorten}
          onFixGrammar={handleFixGrammar}
          onGenerateAlternatives={handleGenerateAlternatives}
          onUndo={handleUndo}
          onRedo={handleRedo}
          hasSelection={hasSelection}
          isGenerating={isGenerating}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      )}

      {/* Right Sidebar Panel */}
      {!zenMode && (
        <RightSidebarPanel
          isOpen={rightSidebarOpen}
          onClose={onRightSidebarClose}
          sceneContext={editor?.getText() || ''}
          selectedText={selectedText}
          onReplaceSelection={handleReplaceSelection}
          onInsertText={handleInsertText}
        />
      )}

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
