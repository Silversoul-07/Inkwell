'use client'

import { useState } from 'react'
import { MessageSquare, Settings, Sliders, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AIChatPanelEnhanced } from './ai-chat-panel-enhanced'
import { ModelConfig } from '@/components/ai/model-config'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

interface RightSidebarProps {
  sceneContext: string
  onInsertText?: (text: string) => void
}

export function RightSidebar({ sceneContext, onInsertText }: RightSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')

  const toggleSidebar = (tab?: string) => {
    if (tab) {
      setActiveTab(tab)
      setIsOpen(true)
    } else {
      setIsOpen(!isOpen)
    }
  }

  return (
    <>
      {/* Floating sidebar toggle buttons */}
      {!isOpen && (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40">
          <Button
            variant="default"
            size="icon"
            className="rounded-full shadow-lg"
            onClick={() => toggleSidebar('chat')}
            title="AI Chat"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button
            variant="default"
            size="icon"
            className="rounded-full shadow-lg"
            onClick={() => toggleSidebar('model')}
            title="AI Model"
          >
            <Settings className="h-5 w-5" />
          </Button>
          <Button
            variant="default"
            size="icon"
            className="rounded-full shadow-lg"
            onClick={() => toggleSidebar('writer')}
            title="Writer Settings"
          >
            <Sliders className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Sidebar panel */}
      {isOpen && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-card border-l border-border z-50 flex flex-col shadow-2xl">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">Settings</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
              <TabsTrigger value="chat">
                <MessageSquare className="h-4 w-4 mr-2" />
                AI Chat
              </TabsTrigger>
              <TabsTrigger value="model">
                <Settings className="h-4 w-4 mr-2" />
                Model
              </TabsTrigger>
              <TabsTrigger value="writer">
                <Sliders className="h-4 w-4 mr-2" />
                Writer
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="chat" className="h-full m-0 p-0">
                <AIChatPanelEnhanced
                  onClose={() => setIsOpen(false)}
                  sceneContext={sceneContext}
                  onInsertText={onInsertText}
                />
              </TabsContent>

              <TabsContent value="model" className="h-full m-0 p-4 overflow-auto">
                <ModelConfig />
              </TabsContent>

              <TabsContent value="writer" className="h-full m-0 p-4 overflow-auto">
                <div className="space-y-4">
                  <h3 className="font-semibold">Writer Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Writer-specific settings coming soon...
                  </p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      )}
    </>
  )
}
