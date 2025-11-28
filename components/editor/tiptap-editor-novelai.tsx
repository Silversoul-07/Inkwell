'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useState, useCallback, useRef } from 'react'
import { Bold, Italic, List, ListOrdered, Heading1, Heading2 } from 'lucide-react'
import { AlternativesDialog } from './alternatives-dialog'
import { EditorContextMenu } from './editor-context-menu'
import { processTemplate, buildEditorVariables } from '@/lib/template-processor'
import { EditorBottomToolbar } from './editor-bottom-toolbar'

interface Scene {
  id: string
  title: string
  content: string | null
  wordCount: number | null
}

interface Settings {
  editorFont?: string
  editorFontSize?: number
  editorLineHeight?: number
  editorWidth?: number
  autoSaveInterval?: number
}

interface TiptapEditorNovelAIProps {
  chapter: Scene
  projectId: string
  settings: Settings | null
  zenMode: boolean
  onExitZen: () => void
  chapterTitle?: string
  projectMetadata?: {
    genre?: string
    pov?: string
    tense?: string
  }
}

export function TiptapEditorNovelAI({
  chapter,
  projectId,
  settings,
  zenMode,
  onExitZen,
  chapterTitle,
  projectMetadata,
}: TiptapEditorNovelAIProps) {
  const [wordCount, setWordCount] = useState(chapter.wordCount || 0)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasSelection, setHasSelection] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [alternatives, setAlternatives] = useState<string[]>([])

  // Template-based prompt generation
  const [selectedTemplates, setSelectedTemplates] = useState<Record<string, any>>({})

  // Writing mode state
  const [activeWritingMode, setActiveWritingMode] = useState<any>(null)
  const [characterCount, setCharacterCount] = useState(0)
  const editorRef = useRef<HTMLDivElement>(null)

  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        // Load default templates for each action
        const actions = ['continue', 'rephrase', 'expand', 'shorten', 'grammar']
        const templates: Record<string, any> = {}

        for (const action of actions) {
          const response = await fetch(`/api/prompt-templates?action=${action}`)
          if (response.ok) {
            const data = await response.json()
            const defaultTemplate = data.find((t: any) => t.isDefault)
            if (defaultTemplate) {
              templates[action] = defaultTemplate
            }
          }
        }

        setSelectedTemplates(templates)
      } catch (error) {
        console.error('Failed to load templates:', error)
      }
    }

    loadTemplates()
  }, [])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit as any],
    content: chapter.content,
    editorProps: {
      attributes: {
        class: 'prose prose-lg focus:outline-none min-h-full',
        'data-placeholder': 'Begin your story here...',
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText()
      const words = text.trim() ? text.trim().split(/\s+/).length : 0
      const chars = text.length
      setWordCount(words)
      setCharacterCount(chars)
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

  // Build context variables for templates
  const buildPromptVariables = useCallback(
    (action: string, customText?: string) => {
      return buildEditorVariables({
        selection: selectedText || customText || '',
        sceneContext: editor?.getText().slice(-4000) || '',
        genre: projectMetadata?.genre || '',
        pov: projectMetadata?.pov || '',
        tense: projectMetadata?.tense || '',
      })
    },
    [selectedText, editor, projectMetadata]
  )

  // Immediate save functionality
  const saveContent = useCallback(async () => {
    if (!editor) return

    const content = editor.getHTML()
    const text = editor.getText()
    const words = text.trim() ? text.trim().split(/\s+/).length : 0

    try {
      // Update the chapter content immediately
      const chapterResponse = await fetch(`/api/chapters/${chapter.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, wordCount: words }),
      })

      if (!chapterResponse.ok) {
        throw new Error('Failed to save chapter')
      }

      setLastSaved(new Date())
    } catch (error) {
      console.error('Error saving content:', error)
      // Show user-facing error notification
      alert('Failed to save your work. Please check your connection and try again.')
    }
  }, [editor, chapter.id])

  // Save on content changes with debouncing
  useEffect(() => {
    if (!editor) return

    const handleUpdate = () => {
      // Save immediately on content changes
      saveContent()
    }

    editor.on('update', handleUpdate)
    return () => {
      editor.off('update', handleUpdate)
    }
  }, [editor, saveContent])

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

        const insertPos = replaceSelection ? editor.state.selection.from : editor.state.selection.to

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter(line => line.trim() !== '')

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
                    editor.chain().focus().insertContentAt(insertPos, generatedText).run()
                  }
                }
              } catch (e) {
                console.error('Parse error:', e)
              }
            }
          }
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
  const buildPrompt = useCallback(
    (action: string, fallbackPrompt: string, customText?: string) => {
      if (selectedTemplates[action]?.template) {
        const variables = buildPromptVariables(action, customText)
        return processTemplate(selectedTemplates[action].template, variables)
      }
      return fallbackPrompt
    },
    [selectedTemplates, buildPromptVariables]
  )

  // AI Actions
  const handleContinue = () => {
    // Use mode's continuePrompt if available, otherwise use template or fallback
    let fallbackPrompt =
      'Continue writing this story naturally, maintaining the same tone and style.'
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
          const lines = chunk.split('\n').filter(line => line.trim() !== '')

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

  const fontSize = settings?.editorFontSize || 18
  const lineHeight = settings?.editorLineHeight || 1.8
  const maxWidth = settings?.editorWidth || 56 // Wider default for desktop

  const formatItems = [
    {
      icon: Bold,
      label: 'Bold',
      action: () => (editor as any)?.chain().focus().toggleBold().run(),
      active: (editor as any)?.isActive('bold'),
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => (editor as any)?.chain().focus().toggleItalic().run(),
      active: (editor as any)?.isActive('italic'),
    },
    {
      icon: Heading1,
      label: 'Heading 1',
      action: () => (editor as any)?.chain().focus().toggleHeading({ level: 1 }).run(),
      active: (editor as any)?.isActive('heading', { level: 1 }),
    },
    {
      icon: Heading2,
      label: 'Heading 2',
      action: () => (editor as any)?.chain().focus().toggleHeading({ level: 2 }).run(),
      active: (editor as any)?.isActive('heading', { level: 2 }),
    },
    {
      icon: List,
      label: 'Bullet List',
      action: () => (editor as any)?.chain().focus().toggleBulletList().run(),
      active: (editor as any)?.isActive('bulletList'),
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      action: () => (editor as any)?.chain().focus().toggleOrderedList().run(),
      active: (editor as any)?.isActive('orderedList'),
    },
  ]

  return (
    <div ref={editorRef} className={`h-full flex flex-col relative ${zenMode ? '' : ''}`}>
      <EditorContextMenu
        hasSelection={hasSelection}
        isGenerating={isGenerating}
        onContinue={handleContinue}
        onAlternative={handleGenerateAlternatives}
        onFixGrammar={handleFixGrammar}
        onRephrase={handleRephrase}
        onShorten={handleShorten}
        formatItems={formatItems}
      >
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
              className={`mx-auto font-writer-serif w-full`}
              style={{
                maxWidth: zenMode ? `${maxWidth}rem` : `${maxWidth * 1.5}rem`,
              }}
            >
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </EditorContextMenu>

      {/* Alternatives Dialog */}
      <AlternativesDialog
        open={showAlternatives}
        onOpenChange={setShowAlternatives}
        alternatives={alternatives}
        onSelect={handleSelectAlternative}
      />

      <EditorBottomToolbar
        wordCount={wordCount}
        characterCount={characterCount}
        lastSaved={lastSaved}
        chapterTitle={chapterTitle}
      />
    </div>
  )
}
