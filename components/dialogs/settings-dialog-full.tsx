'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SettingsForm } from '@/components/settings/settings-form'
import { PromptTemplateManager } from '@/components/settings/prompt-template-manager'
import { WritingModeManager } from '@/components/settings/writing-mode-manager'
import { UserInstructionsManager } from '@/components/settings/user-instructions-manager'
import { AIModelsManager } from '@/components/settings/ai-models-manager'
import { Button } from '@/components/ui/button'
import { Settings, Paintbrush, FileText, Workflow, User } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'

const settingsNav = [
  { name: 'Editor Preferences', value: 'editor', icon: Paintbrush },
  { name: 'AI Models', value: 'ai-models', icon: Settings },
  { name: 'Prompt Templates', value: 'templates', icon: FileText },
  { name: 'Writing Modes', value: 'modes', icon: Workflow },
  { name: 'User Instructions', value: 'instructions', icon: User },
]

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTab?: string
}

export function SettingsDialog({ open, onOpenChange, initialTab = 'editor' }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = React.useState(initialTab)
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fetch settings when dialog opens
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
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading settings...</p>
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[85vh] p-0">
        <SidebarProvider className="flex w-full h-full">
          {/* Sidebar */}
          <Sidebar collapsible="none" className="border-r w-64 h-full">
            <DialogHeader className="p-6 border-b">
              <DialogTitle className="text-2xl">Settings</DialogTitle>
            </DialogHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {settingsNav.map(item => (
                      <SidebarMenuItem key={item.value}>
                        <SidebarMenuButton
                          onClick={() => setActiveTab(item.value)}
                          isActive={activeTab === item.value}
                          className="h-10"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          {/* Main Content */}
          <main className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="border-b p-6 flex-shrink-0">
              <h2 className="text-xl font-semibold">
                {settingsNav.find(item => item.value === activeTab)?.name}
              </h2>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-6">{renderContent()}</div>
            </ScrollArea>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  )
}
