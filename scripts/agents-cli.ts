#!/usr/bin/env npx tsx
/**
 * Story Agents CLI - Interactive testing tool
 * Uses in-memory database (not Prisma)
 */
import "dotenv/config";
import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import { AgentCoordinator } from "../lib/agents/agents";
import { dbTools } from "../lib/agents/database";

class StoryCLI {
  private coordinator: AgentCoordinator;
  private currentProjectId: string | null = null;

  constructor() {
    this.coordinator = new AgentCoordinator();
  }

  async start() {
    console.log(chalk.cyan.bold("\n Story Agent CLI\n"));
    console.log(chalk.gray("Using in-memory database for testing\n"));

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.log(
        chalk.red(
          "No API key found. Set GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY in .env",
        ),
      );
      process.exit(1);
    }

    await this.mainMenu();
  }

  async mainMenu(): Promise<void> {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          { name: "World Building", value: "world" },
          { name: "Character Development", value: "character" },
          { name: "Story Planning", value: "story" },
          { name: "View Data", value: "view" },
          { name: "Set Project ID", value: "project" },
          { name: "Exit", value: "exit" },
        ],
      },
    ]);

    switch (action) {
      case "world":
        await this.worldBuilding();
        break;
      case "character":
        await this.characterDev();
        break;
      case "story":
        await this.storyPlanning();
        break;
      case "view":
        await this.viewData();
        break;
      case "project":
        await this.setProject();
        break;
      case "exit":
        process.exit(0);
    }
    await this.mainMenu();
  }

  async setProject() {
    const { id } = await inquirer.prompt([
      {
        type: "input",
        name: "id",
        message: "Project ID:",
        default: this.currentProjectId || "test-project",
      },
    ]);
    this.currentProjectId = id;
    console.log(chalk.green(`Project: ${id}\n`));
  }

  async ensureProject(): Promise<string> {
    if (!this.currentProjectId) await this.setProject();
    return this.currentProjectId!;
  }

  async worldBuilding() {
    const projectId = await this.ensureProject();
    const { prompt } = await inquirer.prompt([
      {
        type: "input",
        name: "prompt",
        message: "Describe the world element:",
        default: "A floating city powered by crystal magic",
      },
    ]);

    const spinner = ora("Building world...").start();
    try {
      const result = await this.coordinator.worldBuilder.buildWorld(
        projectId,
        prompt,
      );
      spinner.succeed("Done!");
      console.log(chalk.cyan("\nResult:\n"), result, "\n");
    } catch (e) {
      spinner.fail((e as Error).message);
    }
  }

  async characterDev() {
    const projectId = await this.ensureProject();
    const { prompt } = await inquirer.prompt([
      {
        type: "input",
        name: "prompt",
        message: "Describe the character:",
        default: "A rebellious young mage",
      },
    ]);

    const spinner = ora("Creating character...").start();
    try {
      const result = await this.coordinator.characterDev.developCharacter(
        projectId,
        prompt,
      );
      spinner.succeed("Done!");
      console.log(chalk.cyan("\nResult:\n"), result, "\n");
    } catch (e) {
      spinner.fail((e as Error).message);
    }
  }

  async storyPlanning() {
    const projectId = await this.ensureProject();
    const { prompt } = await inquirer.prompt([
      {
        type: "input",
        name: "prompt",
        message: "Describe your story:",
        default: "A coming-of-age tale about discovering a conspiracy",
      },
    ]);

    const spinner = ora("Planning story...").start();
    try {
      const result = await this.coordinator.storyPlanner.createOutline(
        projectId,
        prompt,
      );
      spinner.succeed("Done!");
      console.log(chalk.cyan("\nResult:\n"), result, "\n");
    } catch (e) {
      spinner.fail((e as Error).message);
    }
  }

  async viewData() {
    const projectId = await this.ensureProject();
    const chars = await dbTools.getCharacters(projectId);
    const lore = await dbTools.getLoreEntries(projectId);

    console.log(chalk.cyan(`\nProject: ${projectId}`));
    console.log(`Characters: ${chars.success ? chars.characters.length : 0}`);
    console.log(`Lore entries: ${lore.success ? lore.entries.length : 0}\n`);

    if (chars.success && chars.characters.length > 0) {
      console.log(chalk.yellow("Characters:"));
      chars.characters.forEach((c) =>
        console.log(`  - ${c.name} (${c.role || "no role"})`),
      );
    }
    if (lore.success && lore.entries.length > 0) {
      console.log(chalk.yellow("\nLorebook:"));
      lore.entries.forEach((e) => console.log(`  - [${e.category}] ${e.key}`));
    }
    console.log();
  }
}

new StoryCLI().start().catch(console.error);
