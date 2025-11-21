"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Loader2,
  Wand2,
  Edit3,
  Sparkles,
  RotateCcw,
  Globe,
  Users,
  BookOpen,
  HelpCircle,
  Trash2,
  Bot,
  Save,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { MarkdownRenderer } from "@/components/ai/markdown-renderer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  toolCalls?: any[];
  isCommand?: boolean;
  agentType?: string;
  status?: "generating" | "error" | "success";
  errorMessage?: string;
}

interface AICanvasProps {
  sceneContext: string;
  selectedText: string;
  projectId?: string;
  onReplaceSelection?: (text: string) => void;
  onInsertText?: (text: string) => void;
}

// Slash commands definition
const SLASH_COMMANDS = [
  {
    command: "/help",
    description: "Show all available commands",
    icon: HelpCircle,
  },
  {
    command: "/character",
    description: "Create a new character (usage: /character <name>)",
    icon: Users,
  },
  {
    command: "/lorebook",
    description: "Create a lorebook entry (usage: /lorebook <entry>)",
    icon: BookOpen,
  },
  {
    command: "/world",
    description: "Start world-building conversation",
    icon: Globe,
  },
  {
    command: "/plan",
    description: "Start story planning conversation",
    icon: Bot,
  },
  {
    command: "/analyze",
    description: "Analyze the current scene",
    icon: Sparkles,
  },
  { command: "/clear", description: "Clear chat history", icon: Trash2 },
];

export function AICanvas({
  sceneContext,
  selectedText,
  projectId,
  onReplaceSelection,
  onInsertText,
}: AICanvasProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingText, setEditingText] = useState("");
  const [selectedModel, setSelectedModel] = useState("claude-sonnet");
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState(SLASH_COMMANDS);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load available AI models from settings
  useEffect(() => {
    const loadModels = async () => {
      try {
        const response = await fetch("/api/ai-models");
        if (response.ok) {
          const models = await response.json();
          setAvailableModels(models.filter((m: any) => m.isEnabled));
          if (models.length > 0) {
            const defaultModel =
              models.find((m: any) => m.isDefault) || models[0];
            setSelectedModel(defaultModel.id);
          }
        }
      } catch (error) {
        console.error("Failed to load models:", error);
        // Fallback to default models
        setAvailableModels([
          { id: "claude-sonnet", name: "Claude Sonnet", provider: "anthropic" },
          { id: "gpt-4", name: "GPT-4", provider: "openai" },
        ]);
      }
    };
    loadModels();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // When selected text changes, update editing text
  useEffect(() => {
    if (selectedText) {
      setEditingText(selectedText);
    }
  }, [selectedText]);

  const sendMessage = async (customPrompt?: string, customContext?: string) => {
    const promptToSend = customPrompt || input;
    if (!promptToSend.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: promptToSend };
    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptToSend,
          context: customContext || sceneContext.slice(-4000),
          systemPrompt:
            "You are an expert creative writing assistant. Provide clear, actionable feedback and suggestions. When editing text, return ONLY the edited version without explanations unless asked.",
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      if (!reader) return;

      // Add an empty assistant message that we'll update
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.chunk) {
                assistantMessage += parsed.chunk;
                // Update the last message
                setMessages((prev) => [
                  ...prev.slice(0, -1),
                  { role: "assistant", content: assistantMessage },
                ]);
              }
            } catch (e) {
              // Skip parsing errors
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    // Check if input is a slash command
    if (input.trim().startsWith("/")) {
      const handled = await handleSlashCommand(input);
      if (handled) {
        setInput("");
        setShowCommandMenu(false);
        return;
      }
    }

    // If we have an active agent, route to agent
    if (activeAgent && conversationId) {
      const userMessage: Message = { role: "user", content: input };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      await sendAgentMessage(input, activeAgent);
      return;
    }

    sendMessage();
  };

  const handleImprove = () => {
    if (!editingText.trim()) return;
    sendMessage(
      `Improve this text by making it more engaging and polished. Return ONLY the improved version:\n\n${editingText}`,
      editingText,
    );
  };

  const handleRewrite = () => {
    if (!editingText.trim()) return;
    sendMessage(
      `Rewrite this text in a different way while keeping the same meaning. Return ONLY the rewritten version:\n\n${editingText}`,
      editingText,
    );
  };

  const handleMakeEdits = () => {
    if (!editingText.trim() || !input.trim()) return;
    sendMessage(`${input}\n\nText to edit:\n${editingText}`, editingText);
  };

  const handleApplyToEditor = (content: string) => {
    if (selectedText && onReplaceSelection) {
      onReplaceSelection(content);
    } else if (onInsertText) {
      onInsertText(content);
    }
  };

  // Save agent content to database (character or lorebook)
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    Record<number, "saving" | "saved" | "error">
  >({});

  const handleSaveToDatabase = async (
    content: string,
    agentType: string,
    index: number,
  ) => {
    if (!projectId) return;

    setSavingIndex(index);
    setSaveStatus((prev) => ({ ...prev, [index]: "saving" }));

    try {
      // Try to parse JSON from the content
      let data;
      const jsonMatch =
        content.match(/```json\n?([\s\S]*?)\n?```/) ||
        content.match(/\[[\s\S]*\]/) ||
        content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          data = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } catch {
          // Not valid JSON, use content as-is
        }
      }

      if (agentType === "character-development") {
        // Save as character
        const characterData = Array.isArray(data) ? data[0] : data;
        const response = await fetch("/api/characters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            name: characterData?.name || "New Character",
            role: characterData?.role || null,
            description: characterData?.description || content,
            traits: characterData?.traits || null,
            background: characterData?.background || null,
            relationships: characterData?.relationships || null,
            goals: characterData?.goals || null,
          }),
        });
        if (!response.ok) throw new Error("Failed to save character");
      } else if (agentType === "world-building") {
        // Save as lorebook entry
        const entries = Array.isArray(data)
          ? data
          : [data || { key: "New Entry", value: content }];
        for (const entry of entries) {
          const response = await fetch("/api/lorebook", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId,
              key: entry.key || "New Entry",
              value: entry.value || content,
              category: entry.category || "General",
              keys: entry.keys || [],
            }),
          });
          if (!response.ok) throw new Error("Failed to save lorebook entry");
        }
      }

      setSaveStatus((prev) => ({ ...prev, [index]: "saved" }));
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus((prev) => ({ ...prev, [index]: "error" }));
    } finally {
      setSavingIndex(null);
    }
  };

  const handleResetEdit = () => {
    setEditingText(selectedText || "");
  };

  // Handle input changes for command menu
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    // Show command menu when typing /
    if (value.startsWith("/")) {
      setShowCommandMenu(true);
      const search = value.slice(1).toLowerCase();
      setFilteredCommands(
        SLASH_COMMANDS.filter(
          (cmd) =>
            cmd.command.slice(1).toLowerCase().includes(search) ||
            cmd.description.toLowerCase().includes(search),
        ),
      );
    } else {
      setShowCommandMenu(false);
    }
  };

  // Select a command from menu
  const selectCommand = (command: string) => {
    setInput(command + " ");
    setShowCommandMenu(false);
    inputRef.current?.focus();
  };

  // Start an agent conversation
  const startAgentConversation = async (agentType: string) => {
    if (!projectId) {
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content:
            "Agent features require an active project. Please open a project first.",
          isCommand: true,
        },
      ]);
      return null;
    }

    try {
      const response = await fetch("/api/agents/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType, projectId }),
      });

      if (!response.ok) throw new Error("Failed to start conversation");

      const data = await response.json();
      const conversation = data.conversation || data;
      setConversationId(conversation.id);
      setActiveAgent(agentType);
      return conversation.id;
    } catch (error) {
      console.error("Failed to start agent:", error);
      return null;
    }
  };

  // Send message to agent
  const sendAgentMessage = async (
    message: string,
    agentType: string,
    convId?: string,
  ) => {
    const targetConvId = convId || conversationId;
    if (!targetConvId) return;

    setIsLoading(true);

    // Add generating message
    const generatingIndex = messages.length;
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
        agentType,
        status: "generating",
      },
    ]);

    try {
      const response = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: targetConvId,
          agentType,
          message,
          projectId,
          modelId: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Agent request failed");
      }

      const result = await response.json();
      const content = result.message?.content || result.content;
      const toolCalls = result.message?.toolCalls || result.toolCalls;

      // Update the generating message with actual content
      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === generatingIndex
            ? { ...msg, content, toolCalls, status: "success" }
            : msg,
        ),
      );
    } catch (error: any) {
      console.error("Agent error:", error);
      // Update the generating message to show error
      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === generatingIndex
            ? {
                ...msg,
                content: "Failed to generate response.",
                status: "error",
                errorMessage: error.message || "Unknown error",
              }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle slash commands
  const handleSlashCommand = async (command: string): Promise<boolean> => {
    const trimmed = command.trim().toLowerCase();
    const parts = command.trim().split(" ");
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(" ");

    switch (cmd) {
      case "/help":
        const helpText = SLASH_COMMANDS.map(
          (c) => `**${c.command}** - ${c.description}`,
        ).join("\n");
        setMessages((prev) => [
          ...prev,
          { role: "user", content: "/help", isCommand: true },
          {
            role: "assistant",
            content: `## Available Commands\n\n${helpText}\n\n### Agent Modes\nUse **/world** or **/plan** to start specialized AI agent conversations that can access your project data.`,
            isCommand: true,
          },
        ]);
        return true;

      case "/character":
        if (!args) {
          setMessages((prev) => [
            ...prev,
            { role: "user", content: "/character", isCommand: true },
            {
              role: "assistant",
              content:
                "Usage: `/character <name>`\n\nExample: `/character Elena Blackwood`",
              isCommand: true,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "user", content: `/character ${args}`, isCommand: true },
          ]);
          // Use character development agent
          const convId = await startAgentConversation("character-development");
          if (convId) {
            await sendAgentMessage(
              `Help me create a character named "${args}". Generate a detailed character profile including background, personality traits, motivations, and potential story arcs.`,
              "character-development",
              convId,
            );
          }
        }
        return true;

      case "/lorebook":
        if (!args) {
          setMessages((prev) => [
            ...prev,
            { role: "user", content: "/lorebook", isCommand: true },
            {
              role: "assistant",
              content:
                "Usage: `/lorebook <entry name>`\n\nExample: `/lorebook The Crystal Kingdom`",
              isCommand: true,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "user", content: `/lorebook ${args}`, isCommand: true },
          ]);
          // Use world-building agent
          const convId = await startAgentConversation("world-building");
          if (convId) {
            await sendAgentMessage(
              `Create a lorebook entry for "${args}". Include detailed information, context, and how it fits into the world.`,
              "world-building",
              convId,
            );
          }
        }
        return true;

      case "/world":
        setMessages((prev) => [
          ...prev,
          { role: "user", content: "/world", isCommand: true },
          {
            role: "assistant",
            content:
              "**World-Building Agent activated.** I can help you develop your story world, create locations, magic systems, cultures, and more. What would you like to explore?",
            agentType: "world-building",
            isCommand: true,
          },
        ]);
        await startAgentConversation("world-building");
        return true;

      case "/plan":
        setMessages((prev) => [
          ...prev,
          { role: "user", content: "/plan", isCommand: true },
          {
            role: "assistant",
            content:
              "**Story Planning Agent activated.** I can help you plan your narrative, develop plot arcs, and structure your story. What aspect of your story would you like to work on?",
            agentType: "story-planning",
            isCommand: true,
          },
        ]);
        await startAgentConversation("story-planning");
        return true;

      case "/analyze":
        if (!sceneContext.trim()) {
          setMessages((prev) => [
            ...prev,
            { role: "user", content: "/analyze", isCommand: true },
            {
              role: "assistant",
              content:
                "No scene content to analyze. Please write some content in the editor first.",
              isCommand: true,
            },
          ]);
        } else {
          sendMessage(
            "Analyze this scene for plot, pacing, character development, and provide specific suggestions for improvement.",
            sceneContext.slice(-4000),
          );
        }
        return true;

      case "/clear":
        setMessages([]);
        setActiveAgent(null);
        setConversationId(null);
        return true;

      default:
        return false;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Edit Mode */}
      {editMode && (
        <div className="flex-1 flex flex-col p-4 space-y-4 overflow-auto">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Editing Text</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetEdit}
                disabled={editingText === selectedText}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>
            <Textarea
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              className="min-h-[200px] font-mono text-sm resize-none"
              placeholder="Select text in the editor to edit it here..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Instructions (Optional)
            </label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleMakeEdits();
                }
              }}
              placeholder="e.g., Make it more dramatic, Add more dialogue, etc."
              className="resize-none"
              rows={2}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleImprove}
              disabled={!editingText.trim() || isLoading}
              className="flex-1"
              variant="outline"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Improve
            </Button>
            <Button
              onClick={handleRewrite}
              disabled={!editingText.trim() || isLoading}
              className="flex-1"
              variant="outline"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Rewrite
            </Button>
            {input.trim() && (
              <Button
                onClick={handleMakeEdits}
                disabled={!editingText.trim() || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Apply
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Results in edit mode */}
          {messages.length > 0 && (
            <div className="flex-1 space-y-4 overflow-auto border-t pt-4">
              <label className="text-sm font-medium">Results</label>
              {messages
                .slice()
                .reverse()
                .map(
                  (message, index) =>
                    message.role === "assistant" && (
                      <div
                        key={index}
                        className="rounded-lg p-3 bg-muted relative group"
                      >
                        <MarkdownRenderer content={message.content} />
                        <Button
                          variant="default"
                          size="sm"
                          className="mt-2 w-full"
                          onClick={() => handleApplyToEditor(message.content)}
                        >
                          Apply to Editor
                        </Button>
                      </div>
                    ),
                )}
            </div>
          )}
        </div>
      )}

      {/* Chat Mode */}
      {!editMode && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-semibold">AI Writing Canvas</p>
                <p className="mt-2 text-xs max-w-xs mx-auto">
                  Ask questions, get suggestions, or switch to Edit mode to work
                  on selected text.
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex flex-col ${
                  message.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {/* Agent/System badge */}
                {message.agentType && message.role === "assistant" && (
                  <Badge variant="outline" className="mb-1 text-xs capitalize">
                    {message.agentType.replace("-", " ")}
                  </Badge>
                )}
                {message.role === "system" && (
                  <Badge variant="secondary" className="mb-1 text-xs">
                    System
                  </Badge>
                )}
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : message.role === "system"
                        ? "bg-yellow-500/10 border border-yellow-500/20"
                        : message.status === "error"
                          ? "bg-red-500/10 border border-red-500/20"
                          : "bg-muted"
                  }`}
                >
                  {/* Generating indicator */}
                  {message.status === "generating" && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Generating...</span>
                    </div>
                  )}
                  {/* Error indicator */}
                  {message.status === "error" && (
                    <div className="flex items-center gap-2 text-red-500 mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Error: {message.errorMessage}
                      </span>
                    </div>
                  )}
                  {message.role === "user" ? (
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  ) : message.status !== "generating" ? (
                    <MarkdownRenderer content={message.content} />
                  ) : null}
                  {/* Tool calls display */}
                  {message.toolCalls && message.toolCalls.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1">
                        Tools used:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {message.toolCalls.map((tool: any, i: number) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tool.name || tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {message.role === "assistant" &&
                  message.content &&
                  !isLoading &&
                  !message.isCommand &&
                  message.status !== "generating" &&
                  message.status !== "error" && (
                    <div className="flex gap-2 mt-1">
                      {/* Save to database button for agent content */}
                      {message.agentType &&
                        (message.agentType === "character-development" ||
                          message.agentType === "world-building") && (
                          <Button
                            variant={
                              saveStatus[index] === "saved"
                                ? "outline"
                                : "default"
                            }
                            size="sm"
                            onClick={() =>
                              handleSaveToDatabase(
                                message.content,
                                message.agentType!,
                                index,
                              )
                            }
                            disabled={
                              savingIndex === index ||
                              saveStatus[index] === "saved"
                            }
                          >
                            {savingIndex === index ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Saving...
                              </>
                            ) : saveStatus[index] === "saved" ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Saved
                              </>
                            ) : saveStatus[index] === "error" ? (
                              <>
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Retry
                              </>
                            ) : (
                              <>
                                <Save className="h-3 w-3 mr-1" />
                                {message.agentType === "character-development"
                                  ? "Save Character"
                                  : "Save to Lorebook"}
                              </>
                            )}
                          </Button>
                        )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleApplyToEditor(message.content)}
                      >
                        Apply to Editor
                      </Button>
                    </div>
                  )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="bg-muted rounded-lg px-3 py-2 max-w-[85%]">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border space-y-3">
            {/* Active agent indicator */}
            {activeAgent && (
              <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium capitalize">
                    {activeAgent.replace("-", " ")} Agent
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setActiveAgent(null);
                    setConversationId(null);
                  }}
                  className="h-6 text-xs"
                >
                  Exit Agent
                </Button>
              </div>
            )}

            {/* Model selector and Ask/Edit toggle */}
            <div className="flex items-center gap-2">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="h-8 text-xs w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem
                      key={model.id}
                      value={model.id}
                      className="text-xs"
                    >
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1 border border-border rounded-lg p-0.5">
                <Button
                  variant={editMode ? "ghost" : "secondary"}
                  size="sm"
                  onClick={() => setEditMode(false)}
                  className="h-7 px-3"
                >
                  <Sparkles className="h-3 w-3 mr-1.5" />
                  Ask
                </Button>
                <Button
                  variant={editMode ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setEditMode(true)}
                  disabled={!selectedText}
                  className="h-7 px-3"
                >
                  <Edit3 className="h-3 w-3 mr-1.5" />
                  Edit
                </Button>
              </div>
            </div>

            {/* Command menu */}
            {showCommandMenu && filteredCommands.length > 0 && (
              <div className="border border-border rounded-lg bg-popover p-1 max-h-48 overflow-auto">
                {filteredCommands.map((cmd) => (
                  <button
                    key={cmd.command}
                    onClick={() => selectCommand(cmd.command)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md text-left"
                  >
                    <cmd.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{cmd.command}</span>
                    <span className="text-muted-foreground text-xs ml-auto">
                      {cmd.description}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2 relative">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                  if (e.key === "Escape") {
                    setShowCommandMenu(false);
                  }
                }}
                placeholder={
                  activeAgent
                    ? `Chat with ${activeAgent} agent...`
                    : "Ask for help... (Type / for commands)"
                }
                className="resize-none"
                rows={3}
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="self-end"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send • Type / for commands • /help for all commands
            </p>
          </div>
        </>
      )}
    </div>
  );
}
