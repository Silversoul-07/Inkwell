"use client";

import { User, Book } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";

interface Character {
  id: string;
  name: string;
  age: string | null;
  role: string | null;
  description: string | null;
  traits: string | null;
  background: string | null;
  relationships: string | null;
  goals: string | null;
}

interface LorebookEntry {
  id: string;
  key: string;
  value: string;
  category: string | null;
  useCount: number;
}

type ViewType = "character" | "lorebook";

interface ContentViewerProps {
  type: ViewType;
  content: Character | LorebookEntry;
  projectId: string;
  onBack: () => void;
}

export function ContentViewer({
  type,
  content,
  projectId,
  onBack,
}: ContentViewerProps) {
  const charData = type === "character" ? (content as Character) : null;
  const loreData = type === "lorebook" ? (content as LorebookEntry) : null;

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <article className="max-w-3xl mx-auto p-8">
          {/* Wiki Page Title */}
          <header className="mb-6 pb-4 border-b-2 border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              {type === "character" ? (
                <User className="h-4 w-4" />
              ) : (
                <Book className="h-4 w-4" />
              )}
              <span className="text-xs uppercase tracking-wide">
                {type === "character" ? "Character" : "Lorebook Entry"}
              </span>
            </div>
            <h1 className="text-3xl font-serif font-bold">
              {charData?.name || loreData?.key}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              {charData?.role && (
                <Badge variant="outline">{charData.role}</Badge>
              )}
              {loreData?.category && (
                <Badge variant="outline">{loreData.category}</Badge>
              )}
              {loreData && (
                <span className="text-xs text-muted-foreground">
                  Referenced {loreData.useCount} times
                </span>
              )}
            </div>
          </header>

          {/* Character Content */}
          {charData && (
            <div className="space-y-6 prose prose-sm dark:prose-invert max-w-none">
              {charData.description && (
                <section>
                  <h2 className="text-lg font-semibold mb-2">Description</h2>
                  <ReactMarkdown>{charData.description}</ReactMarkdown>
                </section>
              )}
              {charData.traits && (
                <section>
                  <h2 className="text-lg font-semibold mb-2">
                    Personality Traits
                  </h2>
                  <ReactMarkdown>{charData.traits}</ReactMarkdown>
                </section>
              )}
              {charData.background && (
                <section>
                  <h2 className="text-lg font-semibold mb-2">Background</h2>
                  <ReactMarkdown>{charData.background}</ReactMarkdown>
                </section>
              )}
              {charData.relationships && (
                <section>
                  <h2 className="text-lg font-semibold mb-2">Relationships</h2>
                  <ReactMarkdown>{charData.relationships}</ReactMarkdown>
                </section>
              )}
              {charData.goals && (
                <section>
                  <h2 className="text-lg font-semibold mb-2">
                    Goals & Motivations
                  </h2>
                  <ReactMarkdown>{charData.goals}</ReactMarkdown>
                </section>
              )}
            </div>
          )}

          {/* Lorebook Content */}
          {loreData && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{loreData.value}</ReactMarkdown>
            </div>
          )}
        </article>
      </ScrollArea>
    </div>
  );
}
