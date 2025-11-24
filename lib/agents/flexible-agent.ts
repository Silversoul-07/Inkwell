import { dbTools, ContextBuilder } from "./database";
import {
  createProvider,
  getProviderConfig,
  AIProvider,
  ProviderName,
} from "./providers";

export interface AgentOptions {
  provider?: ProviderName;
  model?: string;
}

interface DetectedEntity {
  type: "character" | "lorebook";
  data: any;
}

export class FlexibleAgent {
  protected provider: AIProvider;

  constructor(apiKey: string | undefined, options: AgentOptions = {}) {
    const systemPrompt = `You are an intelligent creative writing assistant for Inkwell, a story writing platform.

Your role is to have natural, helpful conversations while assisting with:
- **Scene Creation & Editing**: Writing and modifying scenes with engaging content
- **Character Development**: Creating detailed characters with personalities, backgrounds, relationships, and goals
- **World Building**: Developing locations, magic systems, cultures, history, and lore
- **Story Planning**: Crafting plot outlines, story arcs, and narrative structures
- **General Writing Help**: Brainstorming, feedback, and creative guidance

IMPORTANT BEHAVIORS:
1. **Take Action Decisively**: When users request changes or creation, proceed with reasonable defaults. Only ask clarifying questions if the request is genuinely ambiguous or contradictory. Prefer action over questions.
2. **Read Context**: You have access to existing characters, lorebook entries, and scene information. Reference them to maintain consistency and remember previous conversations.
3. **Detect Intent**: Understand whether the user wants to create/edit scenes, characters, lorebook entries, or just have a discussion.
4. **Structured Output**: When creating or editing content, output valid JSON for easy saving:

For CHARACTERS:
\`\`\`json
{
  "type": "character",
  "data": {
    "name": "Character Name",
    "age": "25",
    "role": "Protagonist / Antagonist / Supporting",
    "description": "Physical appearance and distinguishing features (2-3 sentences)",
    "traits": ["trait1", "trait2", "trait3", "trait4", "trait5"],
    "background": "Backstory and history (3-5 sentences)",
    "relationships": {
      "Character Name": "relationship description"
    },
    "goals": "Motivations and objectives (2-3 sentences)"
  }
}
\`\`\`

For MULTIPLE CHARACTERS (array):
\`\`\`json
{
  "type": "character",
  "data": [
    { "name": "...", "age": "...", ... },
    { "name": "...", "age": "...", ... }
  ]
}
\`\`\`

For LOREBOOK ENTRIES:
\`\`\`json
{
  "type": "lorebook",
  "data": {
    "key": "Main Keyword",
    "value": "Detailed description of this lore element (2-4 sentences)",
    "category": "Characters|Locations|Magic|Technology|History|Culture|Species|Organizations",
    "keys": ["keyword1", "keyword2", "keyword3"],
    "priority": 5
  }
}
\`\`\`

For MULTIPLE LOREBOOK ENTRIES (array):
\`\`\`json
{
  "type": "lorebook",
  "data": [
    { "key": "...", "value": "...", ... },
    { "key": "...", "value": "...", ... }
  ]
}
\`\`\`

For SCENES (create new or edit existing):
\`\`\`json
{
  "type": "scene",
  "data": {
    "title": "Scene Title",
    "content": "The complete scene content in markdown or plain text format...",
    "action": "create"
  }
}
\`\`\`

For SCENE EDITS (when modifying existing scene):
\`\`\`json
{
  "type": "scene",
  "data": {
    "title": "Updated Scene Title",
    "content": "The updated complete scene content...",
    "action": "update"
  }
}
\`\`\`

5. **Scene Editing**: When a user has a scene selected and asks for changes, provide the COMPLETE updated scene content, not just the changes. Include all unchanged content along with modifications.
6. **Natural Flow**: Don't always output JSON. For questions, discussions, or brainstorming, respond conversationally. Only output JSON when you're creating or modifying actual content.
7. **Remember Context**: Reference the previous conversation history to maintain continuity. Don't repeat information you've already provided or ask for details the user already gave you.

Remember: Be helpful, context-aware, decisive, and flexible. Take action when requested rather than asking excessive questions.`;

    const config = getProviderConfig();
    this.provider = createProvider(
      options.provider || config.provider,
      apiKey || config.apiKey,
      options.model || config.model,
      systemPrompt,
    );
  }

  async chat(
    projectId: string,
    userMessage: string,
    conversationHistory: Array<{ role: string; content: string }> = [],
    sceneContext?: { id: string; title: string | null; content: string; chapterId: string },
  ): Promise<string> {
    // Build context from project data
    const contextBuilder = new ContextBuilder(projectId);

    // Get existing characters
    const charactersResult = await dbTools.getCharacters(projectId);
    const characters = charactersResult.success
      ? charactersResult.characters
      : [];

    // Get existing lorebook entries (limit to relevant ones)
    const loreResult = await dbTools.searchLoreEntries(projectId, userMessage);
    const loreEntries = loreResult.success ? loreResult.entries : [];

    // Build context message
    let contextMessage = "";

    // Add scene context if provided
    if (sceneContext) {
      contextMessage += `\n## Current Scene Context:\n`;
      contextMessage += `**Scene**: ${sceneContext.title || "Untitled Scene"}\n`;
      if (sceneContext.content && sceneContext.content.trim()) {
        const preview = sceneContext.content.length > 500
          ? sceneContext.content.substring(0, 500) + "..."
          : sceneContext.content;
        contextMessage += `**Content Preview**:\n${preview}\n`;
      } else {
        contextMessage += `**Content**: (Empty scene)\n`;
      }
      contextMessage += `**Scene ID**: ${sceneContext.id}\n`;
      contextMessage += `**Chapter ID**: ${sceneContext.chapterId}\n\n`;
      contextMessage += `*Note: When editing this scene, use action: "update". When creating a new scene in this chapter, use action: "create".*\n`;
    }

    if (characters.length > 0) {
      contextMessage += `\n## Existing Characters in Project:\n`;
      characters.forEach((char) => {
        const traits = contextBuilder.parseJSON<string[]>(char.traits);
        contextMessage += `- **${char.name}** (${char.role || "Unknown role"})${char.age ? `, Age: ${char.age}` : ""}\n`;
        if (traits && traits.length > 0) {
          contextMessage += `  Traits: ${traits.join(", ")}\n`;
        }
      });
    }

    if (loreEntries.length > 0) {
      contextMessage += `\n## Relevant Lorebook Entries:\n`;
      loreEntries.slice(0, 10).forEach((entry) => {
        contextMessage += `- [${entry.category || "General"}] **${entry.key}**: ${entry.value ? entry.value.substring(0, 150) : "..."}${entry.value && entry.value.length > 150 ? "..." : ""}\n`;
      });
    }

    // Build conversation context from history (increased from 10 to 30 messages to preserve more context)
    let conversationContext = "";
    if (conversationHistory.length > 0) {
      conversationContext = "\n## Previous Conversation:\n";
      conversationHistory.slice(-30).forEach((msg) => {
        if (msg.role !== "system") {
          conversationContext += `**${msg.role === "user" ? "User" : "Assistant"}**: ${msg.content}\n\n`;
        }
      });
    }

    // Build full message with all context
    let fullMessage = "";
    if (contextMessage) {
      fullMessage += contextMessage;
    }
    if (conversationContext) {
      fullMessage += conversationContext;
    }
    fullMessage += `\n---\n\n**Current User Message**: ${userMessage}`;

    // Clear history and send as single message (stateless per request)
    this.provider.clearHistory();
    return await this.provider.chat(fullMessage);
  }

  clearHistory(): void {
    this.provider.clearHistory();
  }

  /**
   * Detect and parse structured entities from AI response
   */
  static detectEntities(response: string): DetectedEntity[] {
    const entities: DetectedEntity[] = [];

    // Look for JSON code blocks
    const jsonBlockRegex = /```json\s*\n([\s\S]*?)\n```/g;
    let match;

    while ((match = jsonBlockRegex.exec(response)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);

        // Check if it has our type marker
        if (parsed.type === "character" || parsed.type === "lorebook") {
          entities.push({
            type: parsed.type,
            data: parsed.data,
          });
        }
      } catch (e) {
        // Not valid JSON, skip
        console.warn("Failed to parse JSON block:", e);
      }
    }

    // Fallback: Try to detect JSON objects without type markers
    if (entities.length === 0) {
      // Try to find character-like objects
      const charRegex = /"name"\s*:\s*"[^"]+"/;
      if (charRegex.test(response)) {
        try {
          // Find all JSON objects in the response
          const objRegex = /\{[\s\S]*?"name"[\s\S]*?\}/g;
          let objMatch;
          const detectedChars = [];

          while ((objMatch = objRegex.exec(response)) !== null) {
            try {
              const parsed = JSON.parse(objMatch[0]);
              if (parsed.name) {
                detectedChars.push(parsed);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }

          if (detectedChars.length > 0) {
            entities.push({
              type: "character",
              data:
                detectedChars.length === 1 ? detectedChars[0] : detectedChars,
            });
          }
        } catch (e) {
          console.warn("Failed to detect character objects:", e);
        }
      }

      // Try to detect lorebook-like objects
      const loreRegex = /"key"\s*:\s*"[^"]+"/;
      if (loreRegex.test(response)) {
        try {
          const objRegex = /\{[\s\S]*?"key"[\s\S]*?"value"[\s\S]*?\}/g;
          let objMatch;
          const detectedLore = [];

          while ((objMatch = objRegex.exec(response)) !== null) {
            try {
              const parsed = JSON.parse(objMatch[0]);
              if (parsed.key && parsed.value) {
                detectedLore.push(parsed);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }

          if (detectedLore.length > 0) {
            entities.push({
              type: "lorebook",
              data: detectedLore.length === 1 ? detectedLore[0] : detectedLore,
            });
          }
        } catch (e) {
          console.warn("Failed to detect lorebook objects:", e);
        }
      }
    }

    return entities;
  }

  /**
   * Fetch and fill in existing character details
   */
  static async fetchCharacter(
    projectId: string,
    characterName: string,
  ): Promise<any | null> {
    const result = await dbTools.getCharacters(projectId);
    if (!result.success) return null;

    const character = result.characters.find(
      (c) => c.name.toLowerCase() === characterName.toLowerCase(),
    );

    if (!character) return null;

    const contextBuilder = new ContextBuilder(projectId);
    return {
      id: character.id,
      name: character.name,
      age: character.age,
      role: character.role,
      description: character.description,
      traits: contextBuilder.parseJSON<string[]>(character.traits),
      background: character.background,
      relationships: contextBuilder.parseJSON<Record<string, string>>(
        character.relationships,
      ),
      goals: character.goals,
    };
  }

  /**
   * Fetch and fill in existing lorebook entry
   */
  static async fetchLoreEntry(
    projectId: string,
    entryKey: string,
  ): Promise<any | null> {
    const result = await dbTools.searchLoreEntries(projectId, entryKey);
    if (!result.success || result.entries.length === 0) return null;

    const entry = result.entries[0];
    const contextBuilder = new ContextBuilder(projectId);

    return {
      id: entry.id,
      key: entry.key,
      value: entry.value,
      category: entry.category,
      keys: contextBuilder.parseJSON<string[]>(entry.keys),
      priority: entry.priority,
    };
  }
}
