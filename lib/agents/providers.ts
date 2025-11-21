/**
 * AI Provider Abstraction Layer
 * Supports: OpenAI, Anthropic (Claude), DeepSeek, OpenRouter, Google Gemini
 */

import { GoogleGenerativeAI, Content } from "@google/generative-ai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

export type ProviderName =
  | "gemini"
  | "openai"
  | "anthropic"
  | "deepseek"
  | "openrouter";

interface ProviderConfig {
  name: string;
  models: string[];
  defaultModel: string;
}

export const PROVIDERS: Record<ProviderName, ProviderConfig> = {
  gemini: {
    name: "Google Gemini",
    models: ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"],
    defaultModel: "gemini-2.0-flash",
  },
  openai: {
    name: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    defaultModel: "gpt-4o-mini",
  },
  anthropic: {
    name: "Anthropic (Claude)",
    models: [
      "claude-sonnet-4-20250514",
      "claude-3-5-haiku-20241022",
      "claude-3-opus-20240229",
    ],
    defaultModel: "claude-sonnet-4-20250514",
  },
  deepseek: {
    name: "DeepSeek",
    models: ["deepseek-chat", "deepseek-reasoner"],
    defaultModel: "deepseek-chat",
  },
  openrouter: {
    name: "OpenRouter",
    models: [
      "openai/gpt-4o",
      "anthropic/claude-3.5-sonnet",
      "google/gemini-pro",
      "meta-llama/llama-3-70b",
    ],
    defaultModel: "openai/gpt-4o-mini",
  },
};

export interface AIProvider {
  chat(message: string): Promise<string>;
  clearHistory(): void;
}

abstract class BaseProvider implements AIProvider {
  protected apiKey: string;
  protected model: string;
  protected systemPrompt: string;
  protected conversationHistory: Array<{ role: string; content: string }> = [];

  constructor(apiKey: string, model: string, systemPrompt: string) {
    this.apiKey = apiKey;
    this.model = model;
    this.systemPrompt = systemPrompt;
  }

  abstract chat(message: string): Promise<string>;

  clearHistory(): void {
    this.conversationHistory = [];
  }
}

class GeminiProvider extends BaseProvider {
  private genAI: GoogleGenerativeAI;
  private genModel: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>;
  private geminiHistory: Content[] = [];

  constructor(apiKey: string, model: string, systemPrompt: string) {
    super(apiKey, model, systemPrompt);
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.genModel = this.genAI.getGenerativeModel({
      model: model || PROVIDERS.gemini.defaultModel,
      systemInstruction: systemPrompt,
    });
  }

  async chat(message: string): Promise<string> {
    const chat = this.genModel.startChat({
      history: this.geminiHistory,
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    this.geminiHistory.push(
      { role: "user", parts: [{ text: message }] },
      { role: "model", parts: [{ text: response }] },
    );

    return response;
  }

  clearHistory(): void {
    super.clearHistory();
    this.geminiHistory = [];
  }
}

class OpenAIProvider extends BaseProvider {
  private client: OpenAI;

  constructor(
    apiKey: string,
    model: string,
    systemPrompt: string,
    baseURL?: string,
  ) {
    super(apiKey, model, systemPrompt);
    this.client = new OpenAI({
      apiKey,
      ...(baseURL && { baseURL }),
    });
  }

  async chat(message: string): Promise<string> {
    this.conversationHistory.push({ role: "user", content: message });

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: this.systemPrompt },
        ...this.conversationHistory.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      temperature: 0.9,
      max_tokens: 8192,
    });

    const assistantMessage = response.choices[0].message.content || "";
    this.conversationHistory.push({
      role: "assistant",
      content: assistantMessage,
    });

    return assistantMessage;
  }
}

class AnthropicProvider extends BaseProvider {
  private client: Anthropic;

  constructor(apiKey: string, model: string, systemPrompt: string) {
    super(apiKey, model, systemPrompt);
    this.client = new Anthropic({ apiKey });
  }

  async chat(message: string): Promise<string> {
    this.conversationHistory.push({ role: "user", content: message });

    const response = await this.client.messages.create({
      model: this.model || PROVIDERS.anthropic.defaultModel,
      max_tokens: 8192,
      system: this.systemPrompt,
      messages: this.conversationHistory.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const assistantMessage =
      response.content[0].type === "text" ? response.content[0].text : "";
    this.conversationHistory.push({
      role: "assistant",
      content: assistantMessage,
    });

    return assistantMessage;
  }
}

export function createProvider(
  providerName: ProviderName,
  apiKey: string,
  model: string | null,
  systemPrompt: string,
): AIProvider {
  const config = PROVIDERS[providerName];
  if (!config) {
    throw new Error(
      `Unknown provider: ${providerName}. Available: ${Object.keys(PROVIDERS).join(", ")}`,
    );
  }

  const selectedModel = model || config.defaultModel;

  switch (providerName) {
    case "gemini":
      return new GeminiProvider(apiKey, selectedModel, systemPrompt);
    case "openai":
      return new OpenAIProvider(apiKey, selectedModel, systemPrompt);
    case "deepseek":
      return new OpenAIProvider(
        apiKey,
        selectedModel,
        systemPrompt,
        "https://api.deepseek.com",
      );
    case "openrouter":
      return new OpenAIProvider(
        apiKey,
        selectedModel,
        systemPrompt,
        "https://openrouter.ai/api/v1",
      );
    case "anthropic":
      return new AnthropicProvider(apiKey, selectedModel, systemPrompt);
    default:
      throw new Error(`Provider ${providerName} not implemented`);
  }
}

import { prisma } from "@/lib/prisma";

export interface ProviderConfigResult {
  provider: ProviderName;
  apiKey: string;
  model: string | null;
  baseUrl?: string;
}

/**
 * Get provider config from user's AI model settings (GUI-only, no env variables)
 * @param userId - The user ID to fetch settings for
 * @param modelId - Optional specific model ID to use
 */
export async function getProviderConfigFromDB(
  userId: string,
  modelId?: string
): Promise<ProviderConfigResult> {
  let aiModel;

  if (modelId) {
    // Get specific model
    aiModel = await prisma.aIModel.findFirst({
      where: { id: modelId, userId },
    });
  } else {
    // Get default model
    aiModel = await prisma.aIModel.findFirst({
      where: { userId, isDefault: true },
    });

    // Fallback to any model if no default
    if (!aiModel) {
      aiModel = await prisma.aIModel.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    }
  }

  if (!aiModel) {
    throw new Error(
      "No AI model configured. Please add an API key in Settings > AI Models."
    );
  }

  if (!aiModel.apiKey) {
    throw new Error(
      `API key not configured for model: ${aiModel.name}. Please update in Settings > AI Models.`
    );
  }

  return {
    provider: aiModel.provider as ProviderName,
    apiKey: aiModel.apiKey,
    model: aiModel.model,
    baseUrl: aiModel.baseUrl || undefined,
  };
}

/**
 * @deprecated Use getProviderConfigFromDB instead. This function uses env variables.
 */
export function getProviderConfig(): {
  provider: ProviderName;
  apiKey: string;
  model: string | null;
} {
  console.warn(
    "getProviderConfig() is deprecated. Use getProviderConfigFromDB() for GUI-based API key management."
  );

  const provider = (process.env.AI_PROVIDER || "gemini") as ProviderName;
  const model = process.env.AI_MODEL || null;

  let apiKey: string | undefined;
  switch (provider) {
    case "gemini":
      apiKey = process.env.GEMINI_API_KEY;
      break;
    case "openai":
      apiKey = process.env.OPENAI_API_KEY;
      break;
    case "anthropic":
      apiKey = process.env.ANTHROPIC_API_KEY;
      break;
    case "deepseek":
      apiKey = process.env.DEEPSEEK_API_KEY;
      break;
    case "openrouter":
      apiKey = process.env.OPENROUTER_API_KEY;
      break;
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }

  if (!apiKey) {
    throw new Error(
      `API key not found for provider: ${provider}. Please configure in Settings > AI Models.`
    );
  }

  return { provider, apiKey, model };
}
