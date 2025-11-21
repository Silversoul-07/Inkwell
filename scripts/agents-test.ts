#!/usr/bin/env npx tsx
/**
 * Story Agents Test Script
 * Uses in-memory database (not Prisma)
 */
import "dotenv/config";
import { AgentCoordinator } from "../lib/agents/agents";
import { dbTools } from "../lib/agents/database";

const log = (msg: string) => console.log(`\n${msg}`);
const success = (msg: string) => console.log(`✓ ${msg}`);
const error = (msg: string) => console.error(`✗ ${msg}`);

async function runTests() {
  log("Story Agent Tests (in-memory DB)\n");

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    error(
      "No API key found. Set GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY",
    );
    process.exit(1);
  }

  const projectId = "test-" + Date.now();
  const coordinator = new AgentCoordinator();

  try {
    // Test 1: World Building
    log("Test 1: World Building");
    const worldResult = await coordinator.worldBuilder.buildWorld(
      projectId,
      "A magical floating city powered by crystals",
    );
    success("World building complete");
    console.log("\n" + worldResult + "\n");

    // Add test lore
    await dbTools.createLoreEntry(projectId, {
      key: "Crystal City",
      value: "A floating metropolis above the clouds",
      category: "Locations",
      priority: 10,
    });
    success("Created lore entry");

    // Test 2: Character Development
    log("Test 2: Character Development");
    const charResult = await coordinator.characterDev.developCharacter(
      projectId,
      "A rebellious mage who questions authority",
    );
    success("Character development complete");
    console.log("\n" + charResult + "\n");

    // Add test character
    await dbTools.createCharacter(projectId, {
      name: "Aria",
      role: "Apprentice Mage",
      traits: ["curious", "rebellious"],
      goals: "Uncover the truth",
    });
    success("Created character");

    // Test 3: Story Planning
    log("Test 3: Story Planning");
    const storyResult = await coordinator.storyPlanner.createOutline(
      projectId,
      "Aria discovers the city has a dark secret",
    );
    success("Story outline complete");
    console.log("\n" + storyResult + "\n");

    // Test 4: Database Operations
    log("Test 4: Database Operations");
    const chars = await dbTools.getCharacters(projectId);
    const lore = await dbTools.getLoreEntries(projectId);
    success(`Characters: ${chars.success ? chars.characters.length : 0}`);
    success(`Lore entries: ${lore.success ? lore.entries.length : 0}`);

    log("\nAll tests passed!\n");
  } catch (e) {
    error((e as Error).message);
    console.error((e as Error).stack);
    process.exit(1);
  }
}

runTests();
