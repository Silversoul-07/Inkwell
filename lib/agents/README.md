# Story Agents - AI for World Building & Story Planning

AI agents for creative world building, character development, and story planning integrated with Inkwell. Uses Prisma for database operations.

## Features

- **World Building Agent** - Create detailed world settings, locations, and lore
- **Character Development Agent** - Create characters with arcs and relationships
- **Story Planning Agent** - Generate story outlines and plot points
- **Editing Agent** - Edit and improve prose while maintaining consistency

## Usage

```typescript
import { AgentCoordinator, dbTools } from "@/lib/agents";

const coordinator = new AgentCoordinator(process.env.GEMINI_API_KEY);

// World Building
const worldResult = await coordinator.worldBuilder.buildWorld(
  projectId,
  "A steampunk city built inside a giant mechanical whale",
);

// Character Development
const character = await coordinator.characterDev.developCharacter(
  projectId,
  "A grizzled airship captain with a mysterious past",
);

// Story Planning
const outline = await coordinator.storyPlanner.createOutline(
  projectId,
  "A heist story in a magical academy",
  "three-act",
);
```

## CLI & Testing

```bash
# Interactive CLI (uses in-memory DB)
npm run agents:cli

# Run tests (uses in-memory DB)
npm run agents:test
```

## Environment Variables

See `.env.example` for all available options:

```bash
AI_PROVIDER="gemini"
GEMINI_API_KEY="your-key"
```

## Supported Providers

| Provider   | Models                                             |
| ---------- | -------------------------------------------------- |
| Gemini     | gemini-2.0-flash, gemini-1.5-flash, gemini-1.5-pro |
| OpenAI     | gpt-4o, gpt-4o-mini, gpt-4-turbo                   |
| Anthropic  | claude-sonnet-4, claude-3.5-haiku, claude-3-opus   |
| DeepSeek   | deepseek-chat, deepseek-reasoner                   |
| OpenRouter | Various models via unified API                     |

## API Reference

### AgentCoordinator

```typescript
const coordinator = new AgentCoordinator(apiKey?: string);

coordinator.worldBuilder    // WorldBuilderAgent
coordinator.characterDev    // CharacterDeveloperAgent
coordinator.storyPlanner    // StoryPlannerAgent
coordinator.editor          // EditingAgent

// Process any task
await coordinator.processTask(projectId, task, taskType, options);

// Full project creation
await coordinator.coordinateFullProject(projectId, description);
```

### Database Tools (Prisma)

```typescript
import { dbTools } from '@/lib/agents';

// Characters
await dbTools.createCharacter(projectId, characterData);
await dbTools.getCharacters(projectId);
await dbTools.getCharacter(characterId);

// Lorebook
await dbTools.createLoreEntry(projectId, loreData);
await dbTools.getLoreEntries(projectId, category?);
await dbTools.searchLoreEntries(projectId, searchTerm);
```

## File Structure

```
lib/agents/
├── index.ts      # Main exports
├── agents.ts     # Agent implementations
├── database.ts   # DB tools (Prisma in Next.js, in-memory for CLI)
├── providers.ts  # AI provider abstraction
└── README.md

scripts/
├── agents-cli.ts   # Interactive CLI
└── agents-test.ts  # Test script
```
