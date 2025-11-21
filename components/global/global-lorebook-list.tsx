"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Book,
  Search,
  Filter,
  Sparkles,
  ArrowUp,
  Tag,
  ExternalLink,
} from "lucide-react";
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

interface LorebookEntry {
  id: string;
  projectId: string;
  key: string;
  value: string;
  category: string | null;
  keys: string | null;
  triggerMode: string;
  priority: number;
  searchable: boolean;
  lastUsed: Date | null;
  useCount: number;
  regexPattern: string | null;
  contextStrategy: string;
  createdAt: Date;
  updatedAt: Date;
  project: { id: string; title: string };
}

interface GlobalLorebookListProps {
  initialEntries: LorebookEntry[];
}

const categories = [
  "Characters",
  "Locations",
  "Magic",
  "Technology",
  "History",
  "Culture",
  "Organizations",
  "Items",
  "Other",
];

export function GlobalLorebookList({
  initialEntries,
}: GlobalLorebookListProps) {
  const [entries] = useState<LorebookEntry[]>(initialEntries);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");

  // Get unique projects
  const projects = Array.from(
    new Map(entries.map((e) => [e.project.id, e.project])).values(),
  );

  const filteredEntries = entries.filter((entry) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      entry.key.toLowerCase().includes(query) ||
      entry.value.toLowerCase().includes(query) ||
      entry.category?.toLowerCase().includes(query);

    const matchesCategory =
      categoryFilter === "all" || entry.category === categoryFilter;
    const matchesProject =
      projectFilter === "all" || entry.project.id === projectFilter;

    return matchesSearch && matchesCategory && matchesProject;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Book className="h-6 w-6" />
            Lorebook ({filteredEntries.length} entries)
          </h2>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search lorebook..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-48">
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
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Book className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              {searchQuery
                ? "No entries found matching your search."
                : "No lorebook entries yet. Create entries in your projects."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <CardTitle className="text-lg">{entry.key}</CardTitle>
                      {entry.category && (
                        <Badge variant="outline">{entry.category}</Badge>
                      )}
                      {entry.triggerMode === "auto" && entry.searchable && (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <Sparkles className="h-3 w-3" />
                          Auto
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <ArrowUp className="h-3 w-3" />
                        {entry.priority}
                      </Badge>
                    </div>
                    {entry.keys && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {JSON.parse(entry.keys).map(
                          (key: string, i: number) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {key}
                            </Badge>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                  <Link href={`/lorebook/${entry.project.id}`}>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 cursor-pointer hover:bg-accent whitespace-nowrap"
                    >
                      {entry.project.title}
                      <ExternalLink className="h-3 w-3" />
                    </Badge>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {entry.value}
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span>Used {entry.useCount} times</span>
                  {entry.lastUsed && (
                    <span>
                      Last used {new Date(entry.lastUsed).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
