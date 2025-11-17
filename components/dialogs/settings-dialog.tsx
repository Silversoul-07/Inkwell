'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="editor" className="flex gap-6 h-full" orientation="vertical">
          {/* Vertical Sidebar */}
          <TabsList className="flex flex-col h-fit w-56 bg-muted/30 p-2 rounded-lg gap-1">
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
            <TabsContent value="editor" className="mt-0">
              <div className="text-sm text-muted-foreground">
                Editor settings will be loaded here
              </div>
            </TabsContent>

            <TabsContent value="ai-models" className="mt-0">
              <div className="text-sm text-muted-foreground">
                AI models will be loaded here
              </div>
            </TabsContent>

            <TabsContent value="templates" className="mt-0">
              <div className="text-sm text-muted-foreground">
                Templates will be loaded here
              </div>
            </TabsContent>

            <TabsContent value="modes" className="mt-0">
              <div className="text-sm text-muted-foreground">
                Writing modes will be loaded here
              </div>
            </TabsContent>

            <TabsContent value="instructions" className="mt-0">
              <div className="text-sm text-muted-foreground">
                User instructions will be loaded here
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
