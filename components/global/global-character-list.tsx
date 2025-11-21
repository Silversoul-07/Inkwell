"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Search, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  project: { id: string; title: string };
}

interface GlobalCharacterListProps {
  initialCharacters: Character[];
}

export function GlobalCharacterList({
  initialCharacters,
}: GlobalCharacterListProps) {
  const [characters] = useState<Character[]>(initialCharacters);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("all");

  // Get unique projects
  const projects = Array.from(
    new Map(characters.map((c) => [c.project.id, c.project])).values(),
  );

  const filteredCharacters = characters.filter((character) => {
    const matchesSearch =
      character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      character.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      character.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProject =
      projectFilter === "all" || character.project.id === projectFilter;

    return matchesSearch && matchesProject;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Characters ({filteredCharacters.length})
        </h2>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search characters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredCharacters.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-lg">
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No characters found</h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? "Try a different search term"
              : "Create characters in your projects"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCharacters.map((character) => (
            <Card
              key={character.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{character.name}</CardTitle>
                    {character.role && (
                      <p className="text-sm text-muted-foreground">
                        {character.role}
                      </p>
                    )}
                  </div>
                  <Link href={`/characters/${character.project.id}`}>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 cursor-pointer hover:bg-accent"
                    >
                      {character.project.title}
                      <ExternalLink className="h-3 w-3" />
                    </Badge>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {character.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {character.description}
                  </p>
                )}
                {character.traits &&
                  (() => {
                    try {
                      const traits = JSON.parse(character.traits);
                      if (Array.isArray(traits) && traits.length > 0) {
                        return (
                          <div className="flex flex-wrap gap-1">
                            {traits
                              .slice(0, 3)
                              .map((trait: string, i: number) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {trait}
                                </Badge>
                              ))}
                          </div>
                        );
                      }
                    } catch (e) {
                      // Invalid JSON, skip rendering traits
                      return null;
                    }
                  })()}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
