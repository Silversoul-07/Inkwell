// Agent type definitions and metadata

export type AgentType =
  | "world-building"
  | "character-development"
  | "story-planning";

export const AGENT_NAMES: Record<AgentType, string> = {
  "world-building": "World Builder",
  "character-development": "Character Developer",
  "story-planning": "Story Planner",
};

export const AGENT_DESCRIPTIONS: Record<AgentType, string> = {
  "world-building":
    "Creates rich fictional worlds with geography, culture, magic systems, and lorebook entries",
  "character-development":
    "Develops characters with traits, backstories, relationships, and motivations",
  "story-planning":
    "Plans story structures, plot points, pacing, and scene outlines",
};

export const AGENT_ICONS: Record<AgentType, string> = {
  "world-building": "🌍",
  "character-development": "👤",
  "story-planning": "📖",
};
