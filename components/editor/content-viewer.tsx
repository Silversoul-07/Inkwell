'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Book, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import ReactMarkdown from 'react-markdown'

interface Character {
  id: string
  name: string
  role: string | null
  description: string | null
  traits: string | null
  background: string | null
  relationships: string | null
  goals: string | null
}

interface LorebookEntry {
  id: string
  key: string
  value: string
  category: string | null
  useCount: number
}

type ViewType = 'character' | 'lorebook'

interface ContentViewerProps {
  type: ViewType
  content: Character | LorebookEntry
  projectId: string
  onBack: () => void
}

export function ContentViewer({ type, content, projectId, onBack }: ContentViewerProps) {
  const router = useRouter()

  const formatCharacterMarkdown = (char: Character) => {
    let md = ''
    if (char.role) md += `**Role:** ${char.role}\n\n`
    if (char.description) md += `## Description\n${char.description}\n\n`
    if (char.traits) md += `## Personality Traits\n${char.traits}\n\n`
    if (char.background) md += `## Background\n${char.background}\n\n`
    if (char.relationships) md += `## Relationships\n${char.relationships}\n\n`
    if (char.goals) md += `## Goals & Motivations\n${char.goals}\n\n`
    return md || '*No details available*'
  }

  const formatLorebookMarkdown = (entry: LorebookEntry) => {
    let md = ''
    if (entry.category) md += `**Category:** ${entry.category}\n\n`
    md += `${entry.value}\n\n`
    md += `---\n\n*Used ${entry.useCount} times*`
    return md
  }

  const getTitle = () => {
    if (type === 'character') return (content as Character).name
    return (content as LorebookEntry).key
  }

  const getIcon = () => {
    if (type === 'character') return <User className="h-5 w-5" />
    return <Book className="h-5 w-5" />
  }

  const getContent = () => {
    if (type === 'character') return formatCharacterMarkdown(content as Character)
    return formatLorebookMarkdown(content as LorebookEntry)
  }

  const handleEditInFullPage = () => {
    if (type === 'character') {
      router.push(`/characters/${projectId}`)
    } else if (type === 'lorebook') {
      router.push(`/lorebook/${projectId}`)
    }
  }

  return (
    <div className="h-full flex flex-col">

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto p-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown>{getContent()}</ReactMarkdown>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
