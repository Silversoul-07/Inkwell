'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Bug,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  buildContextBreakdown,
  formatTokenCount,
  getTokenPercentage,
  type ContextBreakdown,
} from '@/lib/token-counter'

interface ContextDebugPanelProps {
  projectId: string
  sceneContext: string
  contextWindowSize?: number
  onToggleSource?: (source: string, enabled: boolean) => void
}

interface ContextSection {
  id: string
  label: string
  description: string
  enabled: boolean
  tokens: number
  content: string
  count?: number
}

export function ContextDebugPanel({
  projectId,
  sceneContext,
  contextWindowSize = 8000,
  onToggleSource,
}: ContextDebugPanelProps) {
  const [sections, setSections] = useState<ContextSection[]>([
    {
      id: 'systemPrompt',
      label: 'System Prompt',
      description: 'Base AI instructions',
      enabled: true,
      tokens: 0,
      content: '',
    },
    {
      id: 'userInstructions',
      label: 'User Instructions',
      description: 'Your custom instructions',
      enabled: true,
      tokens: 0,
      content: '',
    },
    {
      id: 'sceneContext',
      label: 'Scene Context',
      description: 'Current scene content',
      enabled: true,
      tokens: 0,
      content: sceneContext,
    },
    {
      id: 'lorebookEntries',
      label: 'Lorebook Entries',
      description: 'Triggered world-building info',
      enabled: true,
      tokens: 0,
      content: '',
      count: 0,
    },
    {
      id: 'characterInfo',
      label: 'Character Info',
      description: 'Active character details',
      enabled: true,
      tokens: 0,
      content: '',
      count: 0,
    },
    {
      id: 'chapterSummaries',
      label: 'Chapter Summaries',
      description: 'Previous chapter context',
      enabled: true,
      tokens: 0,
      content: '',
      count: 0,
    },
  ])

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  )

  // Load context data
  useEffect(() => {
    loadContextData()
  }, [projectId, sceneContext])

  const loadContextData = async () => {
    // TODO: Fetch actual context from API
    // For now, use mock data
    const breakdown = buildContextBreakdown({
      systemPrompt: 'You are a creative writing assistant...',
      userInstructions: 'Write in active voice. Avoid adverbs.',
      sceneContext,
      lorebookEntries: [],
      characterInfo: [],
      chapterSummaries: [],
    })

    setSections((prev) =>
      prev.map((section) => {
        switch (section.id) {
          case 'systemPrompt':
            return {
              ...section,
              tokens: breakdown.systemPrompt.tokens,
              content: breakdown.systemPrompt.text,
            }
          case 'userInstructions':
            return {
              ...section,
              tokens: breakdown.userInstructions.tokens,
              content: breakdown.userInstructions.text,
            }
          case 'sceneContext':
            return {
              ...section,
              tokens: breakdown.sceneContext.tokens,
              content: breakdown.sceneContext.text,
            }
          case 'lorebookEntries':
            return {
              ...section,
              tokens: breakdown.lorebookEntries.tokens,
              content: breakdown.lorebookEntries.text,
              count: breakdown.lorebookEntries.count,
            }
          case 'characterInfo':
            return {
              ...section,
              tokens: breakdown.characterInfo.tokens,
              content: breakdown.characterInfo.text,
              count: breakdown.characterInfo.count,
            }
          case 'chapterSummaries':
            return {
              ...section,
              tokens: breakdown.chapterSummaries.tokens,
              content: breakdown.chapterSummaries.text,
              count: breakdown.chapterSummaries.count,
            }
          default:
            return section
        }
      })
    )
  }

  const totalTokens = useMemo(() => {
    return sections
      .filter((s) => s.enabled)
      .reduce((sum, s) => sum + s.tokens, 0)
  }, [sections])

  const tokenUsagePercent = useMemo(() => {
    return Math.min((totalTokens / contextWindowSize) * 100, 100)
  }, [totalTokens, contextWindowSize])

  const handleToggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    )

    const section = sections.find((s) => s.id === id)
    if (section && onToggleSource) {
      onToggleSource(id, !section.enabled)
    }
  }

  const handleToggleExpanded = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const getStatusIcon = () => {
    if (tokenUsagePercent >= 90) {
      return <AlertTriangle className="h-5 w-5 text-destructive" />
    }
    if (tokenUsagePercent >= 70) {
      return <Info className="h-5 w-5 text-warning" />
    }
    return <CheckCircle2 className="h-5 w-5 text-success" />
  }

  const getStatusColor = () => {
    if (tokenUsagePercent >= 90) return 'text-destructive'
    if (tokenUsagePercent >= 70) return 'text-warning'
    return 'text-success'
  }

  return (
    <div className="h-full flex flex-col space-y-4 p-4">
      <div className="flex items-center gap-2">
        <Bug className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Context Debug</h3>
      </div>

      {/* Token Usage Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Token Usage</CardTitle>
            {getStatusIcon()}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Tokens</span>
              <span className={`font-bold ${getStatusColor()}`}>
                {formatTokenCount(totalTokens)} / {formatTokenCount(contextWindowSize)}
              </span>
            </div>
            <Progress value={tokenUsagePercent} className="h-2" />
            <div className="text-xs text-muted-foreground text-right">
              {tokenUsagePercent.toFixed(1)}% used
            </div>
          </div>

          {tokenUsagePercent >= 90 && (
            <div className="bg-destructive/10 text-destructive text-xs p-2 rounded-md">
              ⚠️ Context window nearly full. Consider disabling some sources or
              reducing scene context.
            </div>
          )}

          {tokenUsagePercent >= 70 && tokenUsagePercent < 90 && (
            <div className="bg-warning/10 text-warning text-xs p-2 rounded-md">
              ⚠️ Context usage is high. Monitor token usage to avoid truncation.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Context Sources */}
      <div className="space-y-2 flex-1 overflow-auto">
        <h4 className="text-sm font-medium text-muted-foreground">
          Context Sources
        </h4>

        {sections.map((section) => (
          <Card key={section.id} className={!section.enabled ? 'opacity-60' : ''}>
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1">
                    <Switch
                      checked={section.enabled}
                      onCheckedChange={() => handleToggleSection(section.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium cursor-pointer">
                          {section.label}
                        </Label>
                        {section.count !== undefined && section.count > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {section.count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {formatTokenCount(section.tokens)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getTokenPercentage(section.tokens, totalTokens)}%
                    </div>
                  </div>
                </div>

                {section.content && section.tokens > 0 && (
                  <Collapsible
                    open={expandedSections.has(section.id)}
                    onOpenChange={() => handleToggleExpanded(section.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-1 h-7"
                      >
                        {expandedSections.has(section.id) ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                        <span className="text-xs">
                          {expandedSections.has(section.id) ? 'Hide' : 'Show'}{' '}
                          content
                        </span>
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="bg-muted p-2 rounded-md text-xs font-mono max-h-48 overflow-auto">
                        {section.content || '(empty)'}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Footer */}
      <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
        <p>
          💡 <strong>Tip:</strong> Token counts are estimates. Disable unused
          sources to save tokens for longer AI responses.
        </p>
      </div>
    </div>
  )
}
