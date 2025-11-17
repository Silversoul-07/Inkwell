'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SettingsForm } from '@/components/settings/settings-form'
import { PromptTemplateManager } from '@/components/settings/prompt-template-manager'
import { WritingModeManager } from '@/components/settings/writing-mode-manager'
import { UserInstructionsManager } from '@/components/settings/user-instructions-manager'
import { AIModelsManager } from '@/components/settings/ai-models-manager'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialogWrapper({ open, onOpenChange }: SettingsDialogProps) {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      // Load settings when dialog opens
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          setSettings(data)
          setLoading(false)
        })
        .catch((error) => {
          console.error('Failed to load settings:', error)
          setLoading(false)
        })
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[85vh]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="editor" className="flex gap-6 h-full overflow-hidden" orientation="vertical">
          {/* Vertical Sidebar */}
          <TabsList className="flex flex-col h-fit w-56 bg-muted/30 p-2 rounded-lg gap-1 flex-shrink-0">
            <TabsTrigger
              value="editor"
              className="w-full justify-start px-4 py-2.5 text-left data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Editor Preferences
            </TabsTrigger>
            <TabsTrigger
              value="ai-models"
              className="w-full justify-start px-4 py-2.5 text-left data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              AI Models
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className="w-full justify-start px-4 py-2.5 text-left data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Prompt Templates
            </TabsTrigger>
            <TabsTrigger
              value="modes"
              className="w-full justify-start px-4 py-2.5 text-left data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Writing Modes
            </TabsTrigger>
            <TabsTrigger
              value="instructions"
              className="w-full justify-start px-4 py-2.5 text-left data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              User Instructions
            </TabsTrigger>
          </TabsList>

          {/* Content Area */}
          <ScrollArea className="flex-1 pr-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <>
                <TabsContent value="editor" className="mt-0">
                  <SettingsForm settings={settings} />
                </TabsContent>

                <TabsContent value="ai-models" className="mt-0">
                  <AIModelsManager />
                </TabsContent>

                <TabsContent value="templates" className="mt-0">
                  <PromptTemplateManager />
                </TabsContent>

                <TabsContent value="modes" className="mt-0">
                  <WritingModeManager />
                </TabsContent>

                <TabsContent value="instructions" className="mt-0">
                  <UserInstructionsManager scope="global" />
                </TabsContent>
              </>
            )}
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
