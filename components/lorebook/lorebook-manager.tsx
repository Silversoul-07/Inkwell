'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface LorebookManagerProps {
  projectId: string
}

export function LorebookManager({ projectId }: LorebookManagerProps) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-xl font-semibold mb-2">Lorebook Management</h3>
        <p className="text-muted-foreground mb-6">
          Use AI Agents to build and manage your world's lorebook entries
        </p>
        <Link href="/agents">
          <Button>
            <Bot className="w-4 h-4 mr-2" />
            Open World-Building Agent
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
