import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { SettingsForm } from '@/components/settings/settings-form'
import { PromptTemplateManager } from '@/components/settings/prompt-template-manager'
import { WritingModeManager } from '@/components/settings/writing-mode-manager'
import { UserInstructionsManager } from '@/components/settings/user-instructions-manager'
import { AIModelsManager } from '@/components/settings/ai-models-manager'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const settings = await prisma.settings.findUnique({
    where: {
      userId: session.user.id,
    },
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <Tabs defaultValue="editor" className="flex gap-8" orientation="vertical">
          {/* Vertical Sidebar */}
          <TabsList className="flex flex-col h-fit w-64 bg-muted/30 p-2 rounded-lg gap-1">
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
          <div className="flex-1">
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
          </div>
        </Tabs>
      </div>
    </div>
  )
}
