'use client'

import { useEffect, useState } from 'react'
import { X, Paintbrush, Sparkles, FileText, Workflow, User } from 'lucide-react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SettingsForm } from '@/components/settings/settings-form'
import { PromptTemplateManager } from '@/components/settings/prompt-template-manager'
import { WritingModeManager } from '@/components/settings/writing-mode-manager'
import { UserInstructionsManager } from '@/components/settings/user-instructions-manager'
import { AIModelsManager } from '@/components/settings/ai-models-manager'

const settingsNav = [
  {
    name: 'Editor Preferences',
    value: 'editor',
    icon: Paintbrush,
    description: 'Font, theme, and writing environment'
  },
  {
    name: 'AI Models',
    value: 'ai-models',
    icon: Sparkles,
    description: 'Configure AI providers and models'
  },
  {
    name: 'Prompt Templates',
    value: 'templates',
    icon: FileText,
    description: 'Customize AI prompts for writing'
  },
  {
    name: 'Writing Modes',
    value: 'modes',
    icon: Workflow,
    description: 'Presets for different writing styles'
  },
  {
    name: 'User Instructions',
    value: 'instructions',
    icon: User,
    description: 'Custom instructions for AI behavior'
  },
]

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTab?: string
}

export function SettingsDialog({ open, onOpenChange, initialTab = 'editor' }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      fetchSettings()
    }
  }, [open])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      )
    }

    switch (activeTab) {
      case 'editor':
        return <SettingsForm settings={settings} />
      case 'ai-models':
        return <AIModelsManager />
      case 'templates':
        return <PromptTemplateManager />
      case 'modes':
        return <WritingModeManager />
      case 'instructions':
        return <UserInstructionsManager />
      default:
        return <SettingsForm settings={settings} />
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]",
            "w-[95vw] max-w-[900px] h-[85vh] max-h-[700px]",
            "bg-background border rounded-xl shadow-2xl",
            "flex overflow-hidden",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
          )}
        >
          {/* Sidebar */}
          <div className="w-[240px] flex-shrink-0 border-r bg-muted/30 flex flex-col">
            <div className="p-5 border-b">
              <h2 className="text-lg font-semibold">Settings</h2>
            </div>
            <ScrollArea className="flex-1">
              <nav className="p-3 space-y-1">
                {settingsNav.map(item => {
                  const Icon = item.icon
                  const isActive = activeTab === item.value
                  return (
                    <button
                      key={item.value}
                      onClick={() => setActiveTab(item.value)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
                        "hover:bg-accent/50",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{item.name}</span>
                    </button>
                  )
                })}
              </nav>
            </ScrollArea>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-md p-2 hover:bg-accent transition-colors z-10">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1">
              <div className="p-6 pt-4">
                {renderContent()}
              </div>
            </ScrollArea>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
