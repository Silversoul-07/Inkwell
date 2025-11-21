"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Users,
  MapPin,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
  keys?: string;
  useCount: number;
}

interface SceneContextPanelProps {
  sceneContent: string;
  projectId: string;
  onViewCharacter?: (character: Character) => void;
  onViewLorebook?: (entry: LorebookEntry) => void;
}

interface DetectedContext {
  characters: Character[];
  locations: LorebookEntry[];
  loreEntries: LorebookEntry[];
}

export function SceneContextPanel({
  sceneContent,
  projectId,
  onViewCharacter,
  onViewLorebook,
}: SceneContextPanelProps) {
  const [context, setContext] = useState<DetectedContext>({
    characters: [],
    locations: [],
    loreEntries: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [charactersOpen, setCharactersOpen] = useState(true);
  const [locationsOpen, setLocationsOpen] = useState(true);
  const [loreOpen, setLoreOpen] = useState(true);

  useEffect(() => {
    async function detectContext() {
      if (!sceneContent || sceneContent.length < 10) {
        setContext({ characters: [], locations: [], loreEntries: [] });
        return;
      }

      setIsLoading(true);
      try {
        // Fetch all characters and lorebook entries
        const [charactersRes, lorebookRes] = await Promise.all([
          fetch(`/api/characters?projectId=${projectId}`),
          fetch(`/api/lorebook?projectId=${projectId}`),
        ]);

        const characters = await charactersRes.json();
        const lorebook = await lorebookRes.json();

        // Detect mentions in scene content
        const detectedCharacters: Character[] = [];
        const detectedLocations: LorebookEntry[] = [];
        const detectedLore: LorebookEntry[] = [];

        // Check for character mentions
        characters.forEach((char: Character) => {
          const nameRegex = new RegExp(`\\b${char.name}\\b`, "i");
          if (nameRegex.test(sceneContent)) {
            detectedCharacters.push(char);
          }
        });

        // Check for lorebook mentions
        lorebook.forEach((entry: LorebookEntry) => {
          // Check if the key or any keys match
          let keys = [entry.key];
          if (entry.keys) {
            try {
              const parsedKeys = JSON.parse(entry.keys);
              if (Array.isArray(parsedKeys)) {
                keys = parsedKeys;
              }
            } catch (e) {
              // Use default key
            }
          }

          const mentioned = keys.some((key: string) => {
            const keyRegex = new RegExp(`\\b${key}\\b`, "i");
            return keyRegex.test(sceneContent);
          });

          if (mentioned) {
            if (
              entry.category === "Locations" ||
              entry.category === "Location"
            ) {
              detectedLocations.push(entry);
            } else {
              detectedLore.push(entry);
            }
          }
        });

        setContext({
          characters: detectedCharacters,
          locations: detectedLocations,
          loreEntries: detectedLore,
        });
      } catch (error) {
        console.error("Error detecting scene context:", error);
      } finally {
        setIsLoading(false);
      }
    }

    detectContext();
  }, [sceneContent, projectId]);

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">Scene Context</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Auto-detected from your current scene
        </p>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {isLoading && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Analyzing scene...
            </div>
          )}

          {!isLoading && (
            <>
              {/* Characters Section */}
              <Collapsible
                open={charactersOpen}
                onOpenChange={setCharactersOpen}
              >
                <div className="space-y-2">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between px-2 h-8 hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        {charactersOpen ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                        <Users className="h-3.5 w-3.5 text-blue-500" />
                        <span className="text-sm font-medium">Characters</span>
                      </div>
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                        {context.characters.length}
                      </Badge>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1.5 pl-4">
                    {context.characters.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">
                        No characters detected
                      </p>
                    ) : (
                      context.characters.map((char) => (
                        <button
                          key={char.id}
                          onClick={() => onViewCharacter?.(char)}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-muted/50 transition-colors border border-border/50"
                        >
                          <div className="font-medium text-sm">{char.name}</div>
                          {char.role && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {char.role}
                            </div>
                          )}
                        </button>
                      ))
                    )}
                  </CollapsibleContent>
                </div>
              </Collapsible>

              {/* Locations Section */}
              <Collapsible open={locationsOpen} onOpenChange={setLocationsOpen}>
                <div className="space-y-2">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between px-2 h-8 hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        {locationsOpen ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                        <MapPin className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-sm font-medium">Locations</span>
                      </div>
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                        {context.locations.length}
                      </Badge>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1.5 pl-4">
                    {context.locations.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">
                        No locations detected
                      </p>
                    ) : (
                      context.locations.map((loc) => (
                        <button
                          key={loc.id}
                          onClick={() => onViewLorebook?.(loc)}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-muted/50 transition-colors border border-border/50"
                        >
                          <div className="font-medium text-sm">{loc.key}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {loc.value}
                          </div>
                        </button>
                      ))
                    )}
                  </CollapsibleContent>
                </div>
              </Collapsible>

              {/* Other Lore Section */}
              <Collapsible open={loreOpen} onOpenChange={setLoreOpen}>
                <div className="space-y-2">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between px-2 h-8 hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        {loreOpen ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                        <BookOpen className="h-3.5 w-3.5 text-purple-500" />
                        <span className="text-sm font-medium">Lore</span>
                      </div>
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                        {context.loreEntries.length}
                      </Badge>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1.5 pl-4">
                    {context.loreEntries.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">
                        No lore entries detected
                      </p>
                    ) : (
                      context.loreEntries.map((entry) => (
                        <button
                          key={entry.id}
                          onClick={() => onViewLorebook?.(entry)}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-muted/50 transition-colors border border-border/50"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-medium text-sm">
                              {entry.key}
                            </div>
                            {entry.category && (
                              <Badge
                                variant="outline"
                                className="h-4 px-1.5 text-xs"
                              >
                                {entry.category}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {entry.value}
                          </div>
                        </button>
                      ))
                    )}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
