"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Users,
  BookOpen,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AIContextIndicatorProps {
  sceneContext: string;
  projectId: string;
  selectedText?: string;
}

export function AIContextIndicator({
  sceneContext,
  projectId,
  selectedText,
}: AIContextIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [sceneOpen, setSceneOpen] = useState(true);
  const [selectionOpen, setSelectionOpen] = useState(true);

  const sceneWordCount = sceneContext.split(/\s+/).filter(Boolean).length;
  const selectionWordCount =
    selectedText?.split(/\s+/).filter(Boolean).length || 0;

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">AI Context</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          What the AI currently sees
        </p>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Scene Context Section */}
          <Collapsible open={sceneOpen} onOpenChange={setSceneOpen}>
            <div className="space-y-2">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between px-2 h-8 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    {sceneOpen ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                    <FileText className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-sm font-medium">Scene Content</span>
                  </div>
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {sceneWordCount} words
                  </Badge>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4">
                {sceneContext ? (
                  <div className="px-3 py-2 rounded-md bg-muted/50 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">
                      Last {Math.min(4000, sceneContext.length)} characters
                    </p>
                    <div className="text-xs max-h-32 overflow-y-auto">
                      <pre className="whitespace-pre-wrap font-mono text-xs">
                        {sceneContext.slice(-4000)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-2 px-3">
                    No scene content available
                  </p>
                )}
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Selected Text Section */}
          {selectedText && (
            <Collapsible open={selectionOpen} onOpenChange={setSelectionOpen}>
              <div className="space-y-2">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between px-2 h-8 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      {selectionOpen ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                      <FileText className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-sm font-medium">Selected Text</span>
                    </div>
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {selectionWordCount} words
                    </Badge>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4">
                  <div className="px-3 py-2 rounded-md bg-muted/50 border border-border/50">
                    <div className="text-xs max-h-32 overflow-y-auto">
                      <pre className="whitespace-pre-wrap font-mono text-xs">
                        {selectedText}
                      </pre>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}

          {/* Project Context Info */}
          <div className="px-3 py-2 rounded-md bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-3.5 w-3.5 text-purple-500" />
              <span className="text-sm font-medium">Additional Context</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3" />
                <span>Project characters available</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-3 w-3" />
                <span>Lorebook entries available</span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="px-3 py-2 rounded-md bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Info className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                Tip
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              The AI sees your recent scene content. You can reference specific
              characters or lore entries by name to get more detailed responses.
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
