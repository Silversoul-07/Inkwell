'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2, Wand2, Edit3, Sparkles, RotateCcw, ChevronDown } from 'lucide-react'
import { MarkdownRenderer } from '@/components/ai/markdown-renderer'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AICanvasProps {
  sceneContext: string
  selectedText: string
  onReplaceSelection?: (text: string) => void
  onInsertText?: (text: string) => void
}

export function AICanvas({
  sceneContext,
  selectedText,
  onReplaceSelection,
  onInsertText,
}: AICanvasProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingText, setEditingText] = useState('')
  const [selectedModel, setSelectedModel] = useState('claude-sonnet')
  const [availableModels, setAvailableModels] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load available AI models from settings
  useEffect(() => {
    const loadModels = async () => {
      try {
        const response = await fetch('/api/ai-models')
        if (response.ok) {
          const models = await response.json()
          setAvailableModels(models.filter((m: any) => m.isEnabled))
          if (models.length > 0) {
            const defaultModel = models.find((m: any) => m.isDefault) || models[0]
            setSelectedModel(defaultModel.id)
          }
        }
      } catch (error) {
        console.error('Failed to load models:', error)
        // Fallback to default models
        setAvailableModels([
          { id: 'claude-sonnet', name: 'Claude Sonnet', provider: 'anthropic' },
          { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
        ])
      }
    }
    loadModels()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // When selected text changes, update editing text
  useEffect(() => {
    if (selectedText) {
      setEditingText(selectedText)
    }
  }, [selectedText])

  const sendMessage = async (customPrompt?: string, customContext?: string) => {
    const promptToSend = customPrompt || input
    if (!promptToSend.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: promptToSend }
    setMessages((prev) => [...prev, userMessage])
    if (!customPrompt) setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          context: customContext || sceneContext.slice(-4000),
          systemPrompt:
            'You are an expert creative writing assistant. Provide clear, actionable feedback and suggestions. When editing text, return ONLY the edited version without explanations unless asked.',
        }),
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      if (!reader) return

      // Add an empty assistant message that we'll update
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

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
                assistantMessage += parsed.chunk
                // Update the last message
                setMessages((prev) => [
                  ...prev.slice(0, -1),
                  { role: 'assistant', content: assistantMessage },
                ])
              }
            } catch (e) {
              // Skip parsing errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    // Check if input is a slash command
    if (input.trim().startsWith('/')) {
      const handled = await handleSlashCommand(input)
      if (handled) {
        setInput('')
        return
      }
    }
    sendMessage()
  }

  const handleImprove = () => {
    if (!editingText.trim()) return
    sendMessage(
      `Improve this text by making it more engaging and polished. Return ONLY the improved version:\n\n${editingText}`,
      editingText
    )
  }

  const handleRewrite = () => {
    if (!editingText.trim()) return
    sendMessage(
      `Rewrite this text in a different way while keeping the same meaning. Return ONLY the rewritten version:\n\n${editingText}`,
      editingText
    )
  }

  const handleMakeEdits = () => {
    if (!editingText.trim() || !input.trim()) return
    sendMessage(
      `${input}\n\nText to edit:\n${editingText}`,
      editingText
    )
  }

  const handleApplyToEditor = (content: string) => {
    if (selectedText && onReplaceSelection) {
      onReplaceSelection(content)
    } else if (onInsertText) {
      onInsertText(content)
    }
  }

  const handleResetEdit = () => {
    setEditingText(selectedText || '')
  }

  // Handle slash commands
  const handleSlashCommand = async (command: string) => {
    const trimmed = command.trim().toLowerCase()

    if (trimmed.startsWith('/character ')) {
      const name = command.slice(11).trim()
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: `/character ${name}` },
        { role: 'assistant', content: `Creating character: ${name}...\n\nPlease provide character details in the Characters page.` },
      ])
      // TODO: Open character creation dialog or navigate to characters page
    } else if (trimmed.startsWith('/lorebook ')) {
      const entry = command.slice(10).trim()
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: `/lorebook ${entry}` },
        { role: 'assistant', content: `Creating lorebook entry: ${entry}...\n\nPlease add details in the Lorebook page.` },
      ])
      // TODO: Open lorebook creation dialog or navigate to lorebook page
    } else if (trimmed === '/analyze') {
      sendMessage('Analyze the current scene for plot, pacing, and character development.')
    } else {
      // Regular message
      return false
    }
    return true
  }

  return (
    <div className="w-full h-full flex flex-col bg-background">

      {/* Edit Mode */}
      {editMode && (
        <div className="flex-1 flex flex-col p-4 space-y-4 overflow-auto">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Editing Text</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetEdit}
                disabled={editingText === selectedText}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>
            <Textarea
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              className="min-h-[200px] font-mono text-sm resize-none"
              placeholder="Select text in the editor to edit it here..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Instructions (Optional)</label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleMakeEdits()
                }
              }}
              placeholder="e.g., Make it more dramatic, Add more dialogue, etc."
              className="resize-none"
              rows={2}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleImprove}
              disabled={!editingText.trim() || isLoading}
              className="flex-1"
              variant="outline"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Improve
            </Button>
            <Button
              onClick={handleRewrite}
              disabled={!editingText.trim() || isLoading}
              className="flex-1"
              variant="outline"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Rewrite
            </Button>
            {input.trim() && (
              <Button
                onClick={handleMakeEdits}
                disabled={!editingText.trim() || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Apply
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Results in edit mode */}
          {messages.length > 0 && (
            <div className="flex-1 space-y-4 overflow-auto border-t pt-4">
              <label className="text-sm font-medium">Results</label>
              {messages.slice().reverse().map((message, index) => (
                message.role === 'assistant' && (
                  <div
                    key={index}
                    className="rounded-lg p-3 bg-muted relative group"
                  >
                    <MarkdownRenderer content={message.content} />
                    <Button
                      variant="default"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => handleApplyToEditor(message.content)}
                    >
                      Apply to Editor
                    </Button>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chat Mode */}
      {!editMode && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-semibold">AI Writing Canvas</p>
                <p className="mt-2 text-xs max-w-xs mx-auto">
                  Ask questions, get suggestions, or switch to Edit mode to work on selected text.
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex flex-col ${
                  message.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.role === 'user' ? (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <MarkdownRenderer content={message.content} />
                  )}
                </div>
                {message.role === 'assistant' && message.content && !isLoading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1"
                    onClick={() => handleApplyToEditor(message.content)}
                  >
                    Apply to Editor
                  </Button>
                )}
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border space-y-3">
            {/* Model selector and Ask/Edit toggle */}
            <div className="flex items-center gap-2">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="h-8 text-xs w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model.id} value={model.id} className="text-xs">
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1 border border-border rounded-lg p-0.5">
                <Button
                  variant={editMode ? 'ghost' : 'secondary'}
                  size="sm"
                  onClick={() => setEditMode(false)}
                  className="h-7 px-3"
                >
                  <Sparkles className="h-3 w-3 mr-1.5" />
                  Ask
                </Button>
                <Button
                  variant={editMode ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setEditMode(true)}
                  disabled={!selectedText}
                  className="h-7 px-3"
                >
                  <Edit3 className="h-3 w-3 mr-1.5" />
                  Edit
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Ask for help... (Type / for commands)"
                className="resize-none"
                rows={3}
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="self-end"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send • Type / for commands
            </p>
          </div>
        </>
      )}
    </div>
  )
}
