'use client'

import { signOut } from 'next-auth/react'
import { Settings as SettingsIcon, LogOut, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/providers/theme-provider'
import Link from 'next/link'

interface DashboardHeaderProps {
  user: {
    name?: string | null
    email: string
  }
  settings: any
}

export function DashboardHeader({ user, settings }: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'sepia'] as const
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Inkwell</h1>
          <span className="text-muted-foreground text-sm">
            {user.name || user.email}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={cycleTheme}
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          <Link href="/settings">
            <Button variant="ghost" size="icon" title="Settings">
              <SettingsIcon className="h-5 w-5" />
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut({ callbackUrl: '/login' })}
            title="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
