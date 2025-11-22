'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { Settings as SettingsIcon, LogOut, Feather, BookOpen, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeSelector } from '@/components/ui/theme-selector'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SettingsDialog } from '@/components/dialogs/settings-dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useReadOnlyMode } from '@/hooks/use-readonly-mode'

interface DashboardHeaderProps {
  user: {
    name?: string | null
    email: string
  }
  settings: any
}

export function DashboardHeader({ user, settings }: DashboardHeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { isReadOnly, toggleReadOnly } = useReadOnlyMode()

  const initials = user.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase()

  return (
    <>
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Feather className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Inkwell
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background/50">
              {isReadOnly ? (
                <BookOpen className="h-4 w-4 text-primary" />
              ) : (
                <Edit className="h-4 w-4 text-muted-foreground" />
              )}
              <Label htmlFor="readonly-mode" className="text-sm cursor-pointer">
                Read Only
              </Label>
              <Switch id="readonly-mode" checked={isReadOnly} onCheckedChange={toggleReadOnly} />
            </div>

            <ThemeSelector />

            <Button
              variant="ghost"
              size="icon"
              title="Settings"
              onClick={() => setSettingsOpen(true)}
            >
              <SettingsIcon className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSettingsOpen(true)} className="cursor-pointer">
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      </header>
    </>
  )
}
