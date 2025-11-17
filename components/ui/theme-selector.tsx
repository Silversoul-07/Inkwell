'use client'

import { Check, Palette } from 'lucide-react'
import { useTheme, Theme } from '@/components/providers/theme-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const themes: { value: Theme; label: string; description: string; color: string }[] = [
  {
    value: 'light',
    label: 'Light',
    description: 'Clean and bright',
    color: 'bg-white border-2 border-gray-300',
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Easy on the eyes',
    color: 'bg-slate-900 border-2 border-slate-700',
  },
  {
    value: 'sepia',
    label: 'Sepia',
    description: 'Warm and cozy',
    color: 'bg-amber-100 border-2 border-amber-300',
  },
  {
    value: 'novelai',
    label: 'NovelAI',
    description: 'Purple elegance',
    color: 'bg-gradient-to-br from-purple-900 to-violet-900 border-2 border-purple-700',
  },
  {
    value: 'midnight',
    label: 'Midnight',
    description: 'Deep blue night',
    color: 'bg-gradient-to-br from-blue-950 to-cyan-900 border-2 border-blue-800',
  },
  {
    value: 'nord',
    label: 'Nord',
    description: 'Arctic palette',
    color: 'bg-slate-700 border-2 border-slate-500',
  },
  {
    value: 'forest',
    label: 'Forest',
    description: 'Nature inspired',
    color: 'bg-gradient-to-br from-green-950 to-emerald-900 border-2 border-green-800',
  },
]

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Palette className="h-5 w-5" />
          <span className="sr-only">Change theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Choose Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.value}
            onClick={() => setTheme(themeOption.value)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className={`w-6 h-6 rounded-full ${themeOption.color}`} />
            <div className="flex-1">
              <div className="font-medium">{themeOption.label}</div>
              <div className="text-xs text-muted-foreground">
                {themeOption.description}
              </div>
            </div>
            {theme === themeOption.value && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
