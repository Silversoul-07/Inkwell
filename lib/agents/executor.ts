// Agent executor for web API routes
import { prisma } from "@/lib/prisma";
import {
  WorldBuilderAgent,
  CharacterDeveloperAgent,
  StoryPlannerAgent,
} from "./agents";
import { FlexibleAgent } from "./flexible-agent";
import { getProviderConfigFromDB } from "./providers";
import type { AgentType } from "./system-prompts";

interface ExecuteAgentParams {
  conversationId: string;
  userId: string;
  projectId?: string;
  userMessage: string;
  agentType: AgentType | "flexible";
  modelId?: string;
}

interface AgentResponse {
  content: string;
  role: "assistant";
  toolCalls?: any[];
  toolResults?: any[];
}

// In-memory conversation history cache (for session continuity)
const conversationCache = new Map<
  string,
  Array<{ role: string; content: string }>
>();

export async function executeAgent(
  params: ExecuteAgentParams,
): Promise<AgentResponse> {
  const { conversationId, userId, projectId, userMessage, agentType, modelId } =
    params;

  // Get API config from database (throws if not configured)
  const config = await getProviderConfigFromDB(userId, modelId);

  // Create the appropriate agent
  const agent = createAgentByType(agentType, config.apiKey);

  // Get conversation history from cache or initialize
  let history = conversationCache.get(conversationId) || [];

  // Load previous messages from DB if cache is empty
  if (history.length === 0) {
    const messages = await prisma.agentMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: 20, // Limit context
    });
    history = messages.map((m) => ({ role: m.role, content: m.content }));
  }

  // Build context string from history
  const contextStr =
    history.length > 0
      ? history.map((h) => `${h.role}: ${h.content}`).join("\n\n")
      : "";

  // Execute the agent based on type
  let response: string;
  const effectiveProjectId = projectId || "default";

  try {
    if (agentType === "flexible") {
      // Use the new flexible agent with conversation history
      response = await (agent as FlexibleAgent).chat(
        effectiveProjectId,
        userMessage,
        history,
      );
    } else {
      // Legacy agents with old behavior
      switch (agentType) {
        case "world-building":
          response = await (agent as WorldBuilderAgent).buildWorld(
            effectiveProjectId,
            contextStr
              ? `Previous conversation:\n${contextStr}\n\nUser: ${userMessage}`
              : userMessage,
          );
          break;
        case "character-development":
          response = await (agent as CharacterDeveloperAgent).developCharacter(
            effectiveProjectId,
            contextStr
              ? `Previous conversation:\n${contextStr}\n\nUser: ${userMessage}`
              : userMessage,
          );
          break;
        case "story-planning":
          response = await (agent as StoryPlannerAgent).createOutline(
            effectiveProjectId,
            contextStr
              ? `Previous conversation:\n${contextStr}\n\nUser: ${userMessage}`
              : userMessage,
          );
          break;
        default:
          throw new Error(`Unknown agent type: ${agentType}`);
      }
    }
  } catch (error: any) {
    console.error("Agent execution error:", error);
    throw new Error(`Agent failed: ${error.message}`);
  }

  // Save messages to database
  await prisma.agentMessage.createMany({
    data: [
      {
        conversationId,
        role: "user",
        content: userMessage,
      },
      {
        conversationId,
        role: "assistant",
        content: response,
      },
    ],
  });

  // Update conversation timestamp
  await prisma.agentConversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  // Update cache
  history.push({ role: "user", content: userMessage });
  history.push({ role: "assistant", content: response });
  conversationCache.set(conversationId, history.slice(-20)); // Keep last 20

  return {
    content: response,
    role: "assistant",
  };
}

function createAgentByType(agentType: AgentType | "flexible", apiKey: string) {
  if (agentType === "flexible") {
    return new FlexibleAgent(apiKey);
  }

  switch (agentType) {
    case "world-building":
      return new WorldBuilderAgent(apiKey);
    case "character-development":
      return new CharacterDeveloperAgent(apiKey);
    case "story-planning":
      return new StoryPlannerAgent(apiKey);
    default:
      throw new Error(`Unknown agent type: ${agentType}`);
  }
}

export async function createAgentConversation(
  userId: string,
  agentType: AgentType | "flexible",
  projectId?: string,
  title?: string,
) {
  const conversation = await prisma.agentConversation.create({
    data: {
      userId,
      agentType: agentType === "flexible" ? "story-planning" : agentType, // Store as story-planning for DB compatibility
      projectId: projectId && projectId !== "none" ? projectId : null,
      title:
        title ||
        (agentType === "flexible" ? "AI Chat" : `${agentType} conversation`),
    },
    include: {
      project: {
        select: { id: true, title: true },
      },
    },
  });

  return { conversation };
}

export async function getAgentConversations(
  userId: string,
  projectId?: string,
) {
  const where: any = { userId };
  if (projectId) {
    where.projectId = projectId;
  }

  const conversations = await prisma.agentConversation.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      project: {
        select: { id: true, title: true },
      },
      _count: {
        select: { messages: true },
      },
    },
    take: 20,
  });

  return conversations;
}
