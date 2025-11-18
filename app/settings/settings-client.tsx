'use client'

import * as React from 'react'
import { SettingsForm } from '@/components/settings/settings-form'
import { PromptTemplateManager } from '@/components/settings/prompt-template-manager'
import { WritingModeManager } from '@/components/settings/writing-mode-manager'
import { UserInstructionsManager } from '@/components/settings/user-instructions-manager'
import { AIModelsManager } from '@/components/settings/ai-models-manager'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings, Paintbrush, FileText, Workflow, User, Menu } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const data = {
  nav: [
    { name: "Editor Preferences", value: "editor", icon: Paintbrush },
    { name: "AI Models", value: "ai-models", icon: Settings },
    { name: "Prompt Templates", value: "templates", icon: FileText },
    { name: "Writing Modes", value: "modes", icon: Workflow },
    { name: "User Instructions", value: "instructions", icon: User },
  ],
}

interface SettingsPageClientProps {
  settings: any
}

export function SettingsPageClient({ settings }: SettingsPageClientProps) {
  const [activeTab, setActiveTab] = React.useState("editor")
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setMobileMenuOpen(false) // Close mobile menu when tab changes
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          {/* Mobile Menu Trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="md:hidden">
                <Menu className="h-4 w-4 mr-2" />
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
                <SheetDescription>
                  Choose a settings category to configure.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <nav className="flex flex-col gap-1">
                  {data.nav.map((item) => (
                    <Button
                      key={item.name}
                      variant={item.value === activeTab ? "secondary" : "ghost"}
                      className="justify-start h-10"
                      onClick={() => handleTabChange(item.value)}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Button>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="rounded-lg border bg-background w-full max-w-[1400px]">
          <SidebarProvider className="items-start">
            <Sidebar collapsible="none" className="hidden md:flex w-64 border-r h-[700px]">
              <SidebarContent className="p-0">
                <SidebarGroup className="p-4">
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {data.nav.map((item) => (
                        <SidebarMenuItem key={item.name}>
                          <SidebarMenuButton
                            isActive={item.value === activeTab}
                            onClick={() => setActiveTab(item.value)}
                            className="w-full justify-start"
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

            <main className="flex flex-1 flex-col h-[700px] overflow-hidden">
              <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {data.nav.find(item => item.value === activeTab)?.name || "Settings"}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </header>

              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === "editor" && <SettingsForm settings={settings} />}
                {activeTab === "ai-models" && <AIModelsManager />}
                {activeTab === "templates" && <PromptTemplateManager />}
                {activeTab === "modes" && <WritingModeManager />}
                {activeTab === "instructions" && <UserInstructionsManager scope="global" />}
              </div>
            </main>
          </SidebarProvider>
        </div>
      </div>
    </div>
  )
}