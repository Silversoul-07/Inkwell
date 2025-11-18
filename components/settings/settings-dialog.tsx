'use client'

import * as React from 'react'
import { Settings, Paintbrush, FileText, Workflow, User, Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { SettingsForm } from '@/components/settings/settings-form'
import { PromptTemplateManager } from '@/components/settings/prompt-template-manager'
import { WritingModeManager } from '@/components/settings/writing-mode-manager'
import { UserInstructionsManager } from '@/components/settings/user-instructions-manager'
import { AIModelsManager } from '@/components/settings/ai-models-manager'

const settingsSections = [
  { id: 'editor', label: 'Editor Preferences', icon: Paintbrush },
  { id: 'ai-models', label: 'AI Models', icon: Sparkles },
  { id: 'templates', label: 'Prompt Templates', icon: FileText },
  { id: 'modes', label: 'Writing Modes', icon: Workflow },
  { id: 'instructions', label: 'User Instructions', icon: User },
]

interface SettingsDialogProps {
  settings: any
  trigger?: React.ReactNode
}

export function SettingsDialog({ settings, trigger }: SettingsDialogProps) {
  const [activeSection, setActiveSection] = React.useState('editor')
  const [open, setOpen] = React.useState(false)

  const renderContent = () => {
    switch (activeSection) {
      case 'editor':
        return <SettingsForm settings={settings} />
      case 'ai-models':
        return <AIModelsManager />
      case 'templates':
        return <PromptTemplateManager />
      case 'modes':
        return <WritingModeManager />
      case 'instructions':
        return <UserInstructionsManager scope="global" />
      default:
        return <SettingsForm settings={settings} />
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[85vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-2xl">Settings</DialogTitle>
          <DialogDescription>
            Manage your editor preferences, AI models, and writing tools
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation */}
          <div className="w-56 border-r bg-muted/20">
            <ScrollArea className="h-full py-4">
              <nav className="flex flex-col gap-1 px-3">
                {settingsSections.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors',
                        activeSection === section.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {section.label}
                    </button>
                  )
                })}
              </nav>
            </ScrollArea>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">
                    {settingsSections.find(s => s.id === activeSection)?.label}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activeSection === 'editor' && 'Customize your writing experience'}
                    {activeSection === 'ai-models' && 'Configure AI models and providers'}
                    {activeSection === 'templates' && 'Create and manage prompt templates'}
                    {activeSection === 'modes' && 'Set up different writing modes'}
                    {activeSection === 'instructions' && 'Define custom AI instructions'}
                  </p>
                </div>
                {renderContent()}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
