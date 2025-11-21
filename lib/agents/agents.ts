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

export class BaseAgent {
  protected provider: AIProvider;
  protected role: string;

  constructor(
    apiKey: string | undefined,
    role: string,
    systemPrompt: string,
    options: AgentOptions = {},
  ) {
    const config = getProviderConfig();
    this.provider = createProvider(
      options.provider || config.provider,
      apiKey || config.apiKey,
      options.model || config.model,
      systemPrompt,
    );
    this.role = role;
  }

  async chat(message: string, context: unknown = null): Promise<string> {
    let fullMessage = message;
    if (context) {
      fullMessage = `Context:\n${JSON.stringify(context, null, 2)}\n\nTask: ${message}`;
    }
    return await this.provider.chat(fullMessage);
  }

  clearHistory(): void {
    this.provider.clearHistory();
  }
}

export class WorldBuilderAgent extends BaseAgent {
  constructor(apiKey?: string) {
    const systemPrompt = `You are a world builder specializing in creating rich fictional worlds.

IMPORTANT: Never use conversational phrases like "Okay", "Sure", "I will", "Here's". Output content directly.

Your responsibilities:
- Design coherent world settings with geography, culture, technology, and magic systems
- Create lorebook entries that capture essential world elements
- Ensure consistency across all world-building elements
- Categories: Locations, Magic, Technology, History, Culture, Species, Organizations

When creating lorebook entries, output ONLY a JSON array:
[{
  "key": "trigger_word",
  "value": "detailed description",
  "category": "Category",
  "keys": ["related", "keywords"],
  "priority": 5,
  "contextStrategy": "full"
}]`;

    super(apiKey, "world_builder", systemPrompt);
  }

  async buildWorld(
    projectId: string,
    userPrompt: string,
    category?: string | null,
  ): Promise<string> {
    const contextBuilder = new ContextBuilder(projectId);
    const context = await contextBuilder.buildWorldContext(
      userPrompt,
      category,
    );

    const prompt = `Based on the user's request and existing world context, create new world-building elements.

User Request: ${userPrompt}
${category ? `Focus Category: ${category}` : ""}

EXISTING WORLD CONTEXT:
${context.summary || "No existing world elements"}

Relevant Existing Lore (${context.lore.length} entries):
${context.lore.map((l) => `- [${l.category}] ${l.key}: ${l.value ? l.value.substring(0, 100) : "Reference only"}`).join("\n")}

TASK:
1. Analyze the request and existing context for consistency
2. Create NEW lorebook entries that complement existing lore
3. Suggest connections between new and existing elements
4. Ensure no contradictions with established world rules

For each NEW lorebook entry, provide in this JSON format:
{
  "key": "trigger_word",
  "value": "detailed description (2-4 sentences)",
  "category": "Locations|Magic|Technology|History|Culture|Species|Organizations",
  "keys": ["related", "keywords", "that", "trigger", "this"],
  "priority": 5,
  "contextStrategy": "full"
}

Provide 2-5 new lorebook entries as a JSON array.`;

    return await this.chat(prompt);
  }

  async expandLore(
    projectId: string,
    topic: string,
    depth = "detailed",
  ): Promise<string> {
    const contextBuilder = new ContextBuilder(projectId);
    const context = await contextBuilder.buildWorldContext(topic);

    const prompt = `Expand on the topic: "${topic}"

Depth level: ${depth}

EXISTING CONTEXT:
${
  context.lore.length > 0
    ? context.lore
        .map((l) => `- [${l.category}] ${l.key}: ${l.value}`)
        .join("\n")
    : "No existing lore found for this topic"
}

TASK:
Provide ${depth === "detailed" ? "comprehensive, multi-layered" : "focused, essential"} expansion that:
1. Builds upon existing lore elements
2. Adds new dimensions and depth
3. Creates interesting story possibilities
4. Maintains consistency with existing world rules

Create 1-3 new lorebook entries that expand this topic, formatted as JSON array.`;

    return await this.chat(prompt);
  }
}

export class CharacterDeveloperAgent extends BaseAgent {
  constructor(apiKey?: string) {
    const systemPrompt = `You are a character developer specializing in creating compelling, multi-dimensional characters.

IMPORTANT: Never use conversational phrases like "Okay", "Sure", "I will", "Here's". Output content directly.

When creating characters, output ONLY a JSON object:
{
  "name": "character name",
  "age": "age",
  "role": "their role/occupation",
  "description": "physical description (2-3 sentences)",
  "traits": ["trait1", "trait2", "trait3", "trait4", "trait5"],
  "background": "detailed background story (3-5 sentences)",
  "relationships": {"CharacterName": "relationship description"},
  "goals": "goals and motivations (2-3 sentences)"
}`;

    super(apiKey, "character_developer", systemPrompt);
  }

  async developCharacter(
    projectId: string,
    characterPrompt: string,
    existingCharacterId?: string | null,
  ): Promise<string> {
    const contextBuilder = new ContextBuilder(projectId);
    const context = await contextBuilder.buildCharacterContext(
      characterPrompt,
      existingCharacterId,
    );

    let prompt: string;
    if (existingCharacterId && context.mainCharacter) {
      prompt = `Develop and expand the existing character based on user request.

CURRENT CHARACTER:
Name: ${context.mainCharacter.name}
Role: ${context.mainCharacter.role || "Not defined"}
Age: ${context.mainCharacter.age || "Not defined"}
Description: ${context.mainCharacter.description || "Not defined"}
Traits: ${context.mainCharacter.traits?.join(", ") || "None"}
Background: ${context.mainCharacter.background || "Not defined"}
Goals: ${context.mainCharacter.goals || "Not defined"}
Existing Relationships: ${JSON.stringify(context.mainCharacter.relationships || {})}

OTHER CHARACTERS IN WORLD:
${context.otherCharacters.map((c) => `- ${c.name} (${c.role || "Unknown role"})`).join("\n")}

RELEVANT WORLD LORE:
${context.relevantLore.map((l) => `- [${l.category}] ${l.key}`).join("\n")}

USER REQUEST: ${characterPrompt}

TASK:
Provide detailed improvements or expansions to this character:
1. Enhanced or refined traits
2. Deeper background story
3. Potential relationships with other characters
4. Clear goals and motivations
5. Character arc possibilities

Output as JSON with fields: name, age, role, description, traits (array), background, relationships (object), goals`;
    } else {
      prompt = `Create a NEW character based on user request.

USER REQUEST: ${characterPrompt}

EXISTING CHARACTERS (for avoiding duplicates and creating relationships):
${context.otherCharacters.map((c) => `- ${c.name} (${c.role || "Unknown role"}, Age: ${c.age || "Unknown"})`).join("\n")}

WORLD CONTEXT:
${context.relevantLore.map((l) => `- [${l.category}] ${l.key}: ${l.value.substring(0, 100)}`).join("\n")}

TASK:
Create a unique, compelling character that:
1. Has distinct personality and appearance
2. Fits naturally into the existing world
3. Has potential for interesting relationships with existing characters
4. Has clear, compelling goals and motivations
5. Has a rich background that connects to the world

Provide complete character data in JSON format:
{
  "name": "character name",
  "age": "age or age range",
  "role": "their role/occupation",
  "description": "physical description (2-3 sentences)",
  "traits": ["trait1", "trait2", "trait3", "trait4", "trait5"],
  "background": "detailed background story (3-5 sentences)",
  "relationships": {"CharacterName": "relationship description"},
  "goals": "goals and motivations (2-3 sentences)"
}`;
    }

    return await this.chat(prompt);
  }

  async analyzeCharacterDynamics(
    projectId: string,
    characterIds?: string[] | null,
  ): Promise<string> {
    const contextBuilder = new ContextBuilder(projectId);

    const allCharsResult = await dbTools.getCharacters(projectId);
    if (!allCharsResult.success) {
      return "No characters found for analysis.";
    }

    let characters = allCharsResult.characters;
    if (characterIds) {
      characters = characters.filter((c) => characterIds.includes(c.id));
    }

    if (characters.length === 0) {
      return "No characters available for dynamics analysis.";
    }

    const parsedCharacters = characters.map((c) => ({
      name: c.name,
      role: c.role,
      age: c.age,
      traits: contextBuilder.parseJSON<string[]>(c.traits),
      goals: c.goals,
      relationships: contextBuilder.parseJSON<Record<string, string>>(
        c.relationships,
      ),
      background: c.background?.substring(0, 200),
    }));

    const prompt = `Analyze the dynamics and relationships between these characters:

CHARACTERS:
${parsedCharacters
  .map(
    (c) => `
Name: ${c.name}
Role: ${c.role || "Unknown"}
Traits: ${c.traits?.join(", ") || "None"}
Goals: ${c.goals || "None"}
Current Relationships: ${JSON.stringify(c.relationships || {})}
`,
  )
  .join("\n---\n")}

TASK:
Provide comprehensive analysis of:
1. Potential conflicts and tensions between characters
2. Complementary traits that could lead to alliances
3. Opportunities for character growth through interactions
4. Suggested relationship developments (friendships, rivalries, mentorships)
5. Story arc possibilities based on character dynamics
6. How character goals might clash or align

Focus on dramatic potential and story opportunities.`;

    return await this.chat(prompt);
  }

  async suggestRelationships(
    projectId: string,
    characterId: string,
  ): Promise<string> {
    const contextBuilder = new ContextBuilder(projectId);

    const charResult = await dbTools.getCharacter(characterId);
    if (!charResult.success) {
      return "Character not found.";
    }

    const mainChar = {
      ...charResult.character,
      traits: contextBuilder.parseJSON<string[]>(charResult.character.traits),
      relationships: contextBuilder.parseJSON<Record<string, string>>(
        charResult.character.relationships,
      ),
    };

    const allCharsResult = await dbTools.getCharacters(projectId);
    const otherChars = allCharsResult.success
      ? allCharsResult.characters
          .filter((c) => c.id !== characterId)
          .map((c) => ({
            name: c.name,
            role: c.role,
            traits: contextBuilder.parseJSON<string[]>(c.traits),
          }))
      : [];

    const prompt = `Suggest meaningful relationships for this character with others in the story.

TARGET CHARACTER:
Name: ${mainChar.name}
Role: ${mainChar.role}
Traits: ${mainChar.traits?.join(", ")}
Goals: ${mainChar.goals}
Background: ${mainChar.background}
Existing Relationships: ${JSON.stringify(mainChar.relationships || {})}

OTHER CHARACTERS:
${otherChars.map((c) => `- ${c.name} (${c.role}): ${c.traits?.join(", ")}`).join("\n")}

TASK:
For 3-5 of the other characters, suggest:
1. Type of relationship (ally, rival, mentor, friend, enemy, etc.)
2. Why this relationship makes sense based on traits and roles
3. How this relationship could create dramatic tension or growth
4. Specific conflict or connection points

Format as JSON array:
[{
  "character": "character name",
  "relationshipType": "type",
  "description": "detailed description",
  "storyPotential": "how this serves the narrative"
}]`;

    return await this.chat(prompt);
  }
}

export class StoryPlannerAgent extends BaseAgent {
  constructor(apiKey?: string) {
    const systemPrompt = `You are a story architect specializing in creating engaging, well-structured stories.

IMPORTANT: Never use conversational phrases like "Okay", "Sure", "I will", "Here's". Output content directly.

Output story outlines in structured markdown format:
# Story Title

## ACT 1 - Setup
- Scene/beat descriptions

## ACT 2 - Confrontation
- Scene/beat descriptions

## ACT 3 - Resolution
- Scene/beat descriptions

Include character arcs, plot points, and pacing notes.`;

    super(apiKey, "story_planner", systemPrompt);
  }

  async createOutline(
    projectId: string,
    storyPrompt: string,
    structure = "three-act",
  ): Promise<string> {
    const contextBuilder = new ContextBuilder(projectId);
    const context = await contextBuilder.buildStoryContext(storyPrompt);

    const prompt = `Create a story outline using ${structure} structure.

STORY CONCEPT: ${storyPrompt}

AVAILABLE CHARACTERS:
${context.characterSummaries
  .map(
    (c) =>
      `- ${c.name} (${c.role}): Goals - ${c.goals || "None"}, Key Traits - ${c.traits?.join(", ") || "None"}`,
  )
  .join("\n")}

WORLD ELEMENTS:
${context.worldSummaries
  .map((w) => `- [${w.category}] ${w.key}: ${w.summary}`)
  .join("\n")}

TASK:
Create a detailed ${structure} story outline that:
1. Integrates the available characters naturally
2. Leverages the existing world elements
3. Creates clear character arcs for the main protagonists
4. Balances action, dialogue, and character development
5. Includes specific plot beats and turning points
6. Suggests chapter/scene breakdowns

${
  structure === "three-act"
    ? `
Structure Guidelines:
ACT 1 (Setup - 25%): Introduce characters, world, establish stakes
- Opening hook
- Introduce protagonist and world
- Inciting incident
- First plot point (point of no return)

ACT 2 (Confrontation - 50%): Rising action, complications, development
- Rising action and obstacles
- Midpoint twist or revelation
- Darkest moment / All is lost
- Second plot point (final push)

ACT 3 (Resolution - 25%): Climax and resolution
- Final confrontation / Climax
- Resolution of character arcs
- Denouement / New normal
`
    : ""
}

Format as a structured outline with clear sections and bullet points.`;

    return await this.chat(prompt);
  }

  async developPlotPoint(
    projectId: string,
    plotDescription: string,
    position = "middle",
  ): Promise<string> {
    const contextBuilder = new ContextBuilder(projectId);
    const context = await contextBuilder.buildStoryContext(plotDescription);

    const prompt = `Develop this plot point in detail.

PLOT POINT: ${plotDescription}
POSITION IN STORY: ${position}

AVAILABLE CHARACTERS:
${context.characterSummaries
  .map((c) => `- ${c.name} (${c.role}): ${c.goals || "No defined goals"}`)
  .join("\n")}

RELEVANT WORLD ELEMENTS:
${context.worldSummaries
  .slice(0, 5)
  .map((w) => `- [${w.category}] ${w.key}`)
  .join("\n")}

TASK:
Develop this plot point with:
1. Scene-by-scene breakdown (2-4 scenes)
2. Which characters are involved and their actions
3. Emotional beats and character development moments
4. World details to include (locations, rules, etc.)
5. Dialogue suggestions or key exchanges
6. How this advances the main narrative
7. Setup for future plot points or payoffs
8. Pacing considerations (fast/slow moments)

Provide a detailed scene breakdown with specific beats.`;

    return await this.chat(prompt);
  }

  async analyzePacing(_projectId: string, outline: string): Promise<string> {
    const prompt = `Analyze the pacing of this story outline:

OUTLINE:
${outline}

TASK:
Evaluate and provide feedback on:
1. Overall pacing rhythm (fast/medium/slow sections)
2. Balance of action, dialogue, and exposition
3. Tension and release patterns
4. Character development pacing
5. Potential slow spots that need tightening
6. Rushed sections that need expansion
7. Placement of major beats (are they well-spaced?)
8. Reader engagement throughout the narrative

Provide specific recommendations with:
- What's working well
- What needs adjustment
- Concrete suggestions for improvement
- Estimated reading time for each section`;

    return await this.chat(prompt);
  }

  async suggestScenes(
    projectId: string,
    chapterDescription: string,
  ): Promise<string> {
    const contextBuilder = new ContextBuilder(projectId);
    const context = await contextBuilder.buildStoryContext(chapterDescription);

    const prompt = `Suggest scenes for this chapter/section.

CHAPTER/SECTION DESCRIPTION: ${chapterDescription}

AVAILABLE CHARACTERS:
${context.characterSummaries.map((c) => `- ${c.name} (${c.role})`).join("\n")}

WORLD ELEMENTS:
${context.worldSummaries
  .slice(0, 8)
  .map((w) => `- [${w.category}] ${w.key}`)
  .join("\n")}

TASK:
Suggest 3-5 scenes for this chapter that:
1. Advance the plot effectively
2. Develop character relationships
3. Reveal world details naturally
4. Vary in pacing and tone
5. Build toward the chapter's climax

For each scene provide:
{
  "sceneTitle": "brief title",
  "location": "where it takes place",
  "characters": ["character1", "character2"],
  "purpose": "what this scene accomplishes",
  "mood": "emotional tone",
  "keyBeats": ["beat1", "beat2", "beat3"]
}

Format as JSON array of scenes.`;

    return await this.chat(prompt);
  }
}

export class EditingAgent extends BaseAgent {
  constructor(apiKey?: string) {
    const systemPrompt = `You are a prose editor specializing in improving creative writing while maintaining author voice.

IMPORTANT: Never use conversational phrases. Output ONLY the revised text, no explanations.

Rules:
- Follow user instructions precisely
- Maintain character voices and personalities
- Respect established world rules
- Keep similar length unless instructed otherwise`;

    super(apiKey, "editor", systemPrompt);
  }

  async editParagraph(
    projectId: string,
    selectedText: string,
    userInstruction: string,
  ): Promise<string> {
    const contextBuilder = new ContextBuilder(projectId);
    const context = await contextBuilder.buildEditContext(
      selectedText,
      userInstruction,
    );

    const prompt = `Edit the selected text according to the user's instruction.

SELECTED TEXT:
"""
${selectedText}
"""

USER INSTRUCTION: ${userInstruction}

${
  context.mentionedCharacters.length > 0
    ? `
CHARACTERS IN THIS SCENE:
${context.mentionedCharacters
  .map(
    (c) => `
- ${c.name} (${c.role})
  Traits: ${c.traits?.join(", ")}
  Goals: ${c.goals}
  Description: ${c.description}
`,
  )
  .join("\n")}
`
    : ""
}

${
  context.mentionedLore.length > 0
    ? `
RELEVANT WORLD ELEMENTS:
${context.mentionedLore.map((l) => `- [${l.category}] ${l.key}: ${l.value}`).join("\n")}
`
    : ""
}

TASK:
Edit the selected text to: ${userInstruction}

Requirements:
- Maintain character voices and personalities
- Respect established world rules
- Keep similar length unless instructed otherwise
- Focus only on what the user requested
- Output ONLY the revised text

REVISED TEXT:`;

    return await this.chat(prompt);
  }

  async improveDialogue(
    projectId: string,
    selectedText: string,
  ): Promise<string> {
    return await this.editParagraph(
      projectId,
      selectedText,
      "Improve the dialogue to make it more natural, distinctive, and character-appropriate. Add subtext and emotional depth.",
    );
  }

  async enhanceDescription(
    projectId: string,
    selectedText: string,
  ): Promise<string> {
    return await this.editParagraph(
      projectId,
      selectedText,
      "Enhance the descriptive elements with more vivid, sensory details while maintaining pacing. Show, don't tell.",
    );
  }

  async addTension(projectId: string, selectedText: string): Promise<string> {
    return await this.editParagraph(
      projectId,
      selectedText,
      "Increase dramatic tension and emotional stakes. Add urgency and conflict.",
    );
  }

  async condenseText(projectId: string, selectedText: string): Promise<string> {
    return await this.editParagraph(
      projectId,
      selectedText,
      "Condense this text to be more concise and punchy while keeping the essential meaning and impact.",
    );
  }

  async expandText(projectId: string, selectedText: string): Promise<string> {
    return await this.editParagraph(
      projectId,
      selectedText,
      "Expand this text with more detail, emotion, and depth. Add breathing room and development.",
    );
  }
}

export class AgentCoordinator {
  private _worldBuilder: WorldBuilderAgent | null = null;
  private _characterDev: CharacterDeveloperAgent | null = null;
  private _storyPlanner: StoryPlannerAgent | null = null;
  private _editor: EditingAgent | null = null;
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  // Lazy initialization getters
  get worldBuilder(): WorldBuilderAgent {
    if (!this._worldBuilder) {
      this._worldBuilder = new WorldBuilderAgent(this.apiKey);
    }
    return this._worldBuilder;
  }

  get characterDev(): CharacterDeveloperAgent {
    if (!this._characterDev) {
      this._characterDev = new CharacterDeveloperAgent(this.apiKey);
    }
    return this._characterDev;
  }

  get storyPlanner(): StoryPlannerAgent {
    if (!this._storyPlanner) {
      this._storyPlanner = new StoryPlannerAgent(this.apiKey);
    }
    return this._storyPlanner;
  }

  get editor(): EditingAgent {
    if (!this._editor) {
      this._editor = new EditingAgent(this.apiKey);
    }
    return this._editor;
  }

  async processTask(
    projectId: string,
    task: string,
    taskType: string,
    options: {
      category?: string;
      characterId?: string;
      structure?: string;
      selectedText?: string;
    } = {},
  ): Promise<
    | string
    | {
        worldBuilding: string | null;
        characters: string | null;
        storyOutline: string | null;
      }
  > {
    switch (taskType) {
      case "world_building":
        return await this.worldBuilder.buildWorld(
          projectId,
          task,
          options.category,
        );

      case "character_development":
        return await this.characterDev.developCharacter(
          projectId,
          task,
          options.characterId,
        );

      case "story_planning":
        return await this.storyPlanner.createOutline(
          projectId,
          task,
          options.structure,
        );

      case "editing":
        return await this.editor.editParagraph(
          projectId,
          options.selectedText || "",
          task,
        );

      case "full_project":
        return await this.coordinateFullProject(projectId, task);

      default:
        throw new Error(`Unknown task type: ${taskType}`);
    }
  }

  async coordinateFullProject(
    projectId: string,
    projectDescription: string,
  ): Promise<{
    worldBuilding: string | null;
    characters: string | null;
    storyOutline: string | null;
  }> {
    const results: {
      worldBuilding: string | null;
      characters: string | null;
      storyOutline: string | null;
    } = {
      worldBuilding: null,
      characters: null,
      storyOutline: null,
    };

    // Step 1: World Building
    console.log("Building world...");
    results.worldBuilding = await this.worldBuilder.buildWorld(
      projectId,
      `Create a comprehensive world for: ${projectDescription}`,
    );

    // Step 2: Character Development
    console.log("Developing characters...");
    results.characters = await this.characterDev.developCharacter(
      projectId,
      `Create main characters for: ${projectDescription}`,
    );

    // Step 3: Story Planning
    console.log("Planning story...");
    results.storyOutline = await this.storyPlanner.createOutline(
      projectId,
      projectDescription,
    );

    return results;
  }

  clearAllHistory(): void {
    this.worldBuilder.clearHistory();
    this.characterDev.clearHistory();
    this.storyPlanner.clearHistory();
    this.editor.clearHistory();
  }
}
