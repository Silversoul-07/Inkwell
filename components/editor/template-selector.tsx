'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

interface PromptTemplate {
  id: string
  name: string
  description?: string
  action: string
  template: string
  isDefault: boolean
  isBuiltin: boolean
}

interface TemplateSelectorProps {
  action: string // 'continue', 'rephrase', etc.
  selectedTemplateId?: string
  onSelect: (template: PromptTemplate) => void
  compact?: boolean
}

export function TemplateSelector({
  action,
  selectedTemplateId,
  onSelect,
  compact = false,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<PromptTemplate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTemplates()
  }, [action])

  const loadTemplates = async () => {
    try {
      const response = await fetch(`/api/prompt-templates?action=${action}`)
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)

        // Auto-select default template if none selected
        if (!selectedTemplateId) {
          const defaultTemplate = data.find((t: PromptTemplate) => t.isDefault)
          if (defaultTemplate) {
            onSelect(defaultTemplate)
          } else if (data.length > 0) {
            onSelect(data[0])
          }
        }
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId)

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        Loading...
      </Button>
    )
  }

  if (templates.length === 0) {
    return null
  }

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Choose template">
            <Settings2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Template</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {templates.map((template) => (
            <DropdownMenuItem
              key={template.id}
              onClick={() => onSelect(template)}
              className="flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{template.name}</span>
                {template.description && (
                  <span className="text-xs text-muted-foreground">
                    {template.description}
                  </span>
                )}
              </div>
              {template.isDefault && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Default
                </Badge>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <span className="text-xs">
            {selectedTemplate?.name || 'Select template'}
          </span>
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        <DropdownMenuLabel>Choose Template</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {templates.map((template) => (
          <DropdownMenuItem
            key={template.id}
            onClick={() => onSelect(template)}
            className="flex flex-col items-start p-3"
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-medium">{template.name}</span>
              <div className="flex gap-1">
                {template.isDefault && (
                  <Badge variant="default" className="text-xs">
                    Default
                  </Badge>
                )}
                {template.isBuiltin && (
                  <Badge variant="secondary" className="text-xs">
                    Built-in
                  </Badge>
                )}
              </div>
            </div>
            {template.description && (
              <span className="text-xs text-muted-foreground mt-1">
                {template.description}
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
