"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Loader2,
  Sparkles,
  Trash2,
  Save,
  CheckCircle,
  User,
  BookOpen,
  X,
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  status?: "generating" | "error" | "success";
  errorMessage?: string;
  detectedEntities?: DetectedEntity[];
}

interface DetectedEntity {
  type: "character" | "lorebook";
  data: any;
  saved?: boolean;
}

interface AICanvasProps {
  sceneContext: string;
  selectedText: string;
  projectId?: string;
  onReplaceSelection?: (text: string) => void;
  onInsertText?: (text: string) => void;
}

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
  const [selectedModel, setSelectedModel] = useState("claude-sonnet");
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

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
      }
    };
    loadModels();
  }, []);

  // Load chat history from localStorage on mount
  useEffect(() => {
    if (!projectId || isInitialized) return;

    const storageKey = `inkwell_ai_chat_${projectId}`;
    try {
      const savedMessagesData = localStorage.getItem(storageKey);
      if (savedMessagesData) {
        const parsed = JSON.parse(savedMessagesData);
        setMessages(parsed);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
    setIsInitialized(true);
  }, [projectId, isInitialized]);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (!projectId || !isInitialized) return;

    const storageKey = `inkwell_ai_chat_${projectId}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  }, [messages, projectId, isInitialized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-start conversation on first message
  const ensureConversation = async () => {
    if (conversationId) return conversationId;

    if (!projectId) {
      toast({
        title: "No Project",
        description: "Please open a project to use AI features.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const response = await fetch("/api/agents/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentType: "flexible",
          projectId,
        }),
      });

      if (!response.ok) throw new Error("Failed to start conversation");

      const data = await response.json();
      const conversation = data.conversation || data;
      setConversationId(conversation.id);
      return conversation.id;
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const detectEntities = (response: string): DetectedEntity[] => {
    const entities: DetectedEntity[] = [];

    // Look for JSON code blocks with type markers
    const jsonBlockRegex = /```json\s*\n([\s\S]*?)\n```/g;
    let match;

    while ((match = jsonBlockRegex.exec(response)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);

        if (parsed.type === "character" || parsed.type === "lorebook") {
          entities.push({
            type: parsed.type,
            data: parsed.data,
            saved: false,
          });
        }
      } catch (e) {
        // Not valid JSON, skip
      }
    }

    return entities;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setInput("");
    setIsLoading(true);

    // Ensure we have a conversation
    const convId = await ensureConversation();
    if (!convId) {
      setIsLoading(false);
      return;
    }

    // Add user message and empty assistant message together
    setMessages((prev) => [
      ...prev,
      userMessage,
      { role: "assistant", content: "", status: "generating" as const },
    ]);

    try {
      const response = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: convId,
          agentType: "flexible",
          message: input,
          projectId,
          modelId: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate response");
      }

      const result = await response.json();
      const content = result.message?.content || result.content || "";

      // Detect entities in the response
      const detectedEntities = detectEntities(content);

      // Update the last message (assistant message) with actual content
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content,
          status: "success" as const,
          detectedEntities,
        },
      ]);
    } catch (error: any) {
      console.error("Chat error:", error);
      // Update the last message to show error
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          status: "error" as const,
          errorMessage: error.message || "Unknown error",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEntity = async (
    entity: DetectedEntity,
    messageIndex: number,
    entityIndex: number,
  ) => {
    if (!projectId) {
      toast({
        title: "No Project",
        description: "Please open a project to save entities.",
        variant: "destructive",
      });
      return;
    }

    try {
      const dataArray = Array.isArray(entity.data)
        ? entity.data
        : [entity.data];

      for (const item of dataArray) {
        if (entity.type === "character") {
          // Save character
          const stringifyField = (field: any) => {
            if (!field) return undefined;
            if (typeof field === "string") return field;
            return JSON.stringify(field);
          };

          const response = await fetch("/api/characters", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId,
              name: item.name || "New Character",
              age: item.age,
              role: stringifyField(item.role),
              description: stringifyField(item.description),
              traits: stringifyField(item.traits),
              background: stringifyField(item.background),
              relationships: stringifyField(item.relationships),
              goals: stringifyField(item.goals),
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to save character");
          }
        } else if (entity.type === "lorebook") {
          // Save lorebook entry
          let keysString = undefined;
          if (item.keys) {
            if (Array.isArray(item.keys)) {
              keysString = JSON.stringify(item.keys);
            } else if (typeof item.keys === "string") {
              keysString = item.keys;
            }
          }

          const response = await fetch("/api/lorebook", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId,
              key: item.key || "New Entry",
              value: item.value || "",
              category: item.category || "General",
              keys: keysString,
              priority: item.priority || 5,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to save lorebook entry");
          }
        }
      }

      // Mark entity as saved
      setMessages((prev) =>
        prev.map((msg, idx) => {
          if (idx === messageIndex && msg.detectedEntities) {
            const updatedEntities = [...msg.detectedEntities];
            updatedEntities[entityIndex] = { ...entity, saved: true };
            return { ...msg, detectedEntities: updatedEntities };
          }
          return msg;
        }),
      );

      const entityCount = dataArray.length;
      const entityName =
        entity.type === "character" ? "character" : "lorebook entry";
      const pluralSuffix = entityCount > 1 ? "s" : "";

      toast({
        title: "Saved Successfully",
        description: `${entityCount} ${entityName}${pluralSuffix} saved to your project!`,
      });
    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save entity",
        variant: "destructive",
      });
    }
  };

  const handleApplyToEditor = (content: string) => {
    if (selectedText && onReplaceSelection) {
      onReplaceSelection(content);
    } else if (onInsertText) {
      onInsertText(content);
    }
    toast({
      title: "Applied",
      description: "Content applied to editor.",
    });
  };

  const handleClearConversation = () => {
    setMessages([]);
    setConversationId(null);
    if (projectId) {
      const storageKey = `inkwell_ai_chat_${projectId}`;
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.error("Failed to clear chat history:", error);
      }
    }
    toast({
      title: "Chat Cleared",
      description: "Conversation history has been cleared.",
    });
  };

  const renderEntityCard = (
    entity: DetectedEntity,
    messageIndex: number,
    entityIndex: number,
  ) => {
    const dataArray = Array.isArray(entity.data) ? entity.data : [entity.data];

    return (
      <Card key={entityIndex} className="mt-3 border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {entity.type === "character" ? (
                <User className="h-4 w-4 text-primary" />
              ) : (
                <BookOpen className="h-4 w-4 text-primary" />
              )}
              <CardTitle className="text-sm">
                {entity.type === "character" ? "Character" : "Lorebook Entry"}
                {dataArray.length > 1 && ` (${dataArray.length})`}
              </CardTitle>
            </div>
            {!entity.saved && (
              <Button
                size="sm"
                variant="default"
                onClick={() =>
                  handleSaveEntity(entity, messageIndex, entityIndex)
                }
                className="h-7 text-xs"
              >
                <Save className="h-3 w-3 mr-1" />
                Save to Project
              </Button>
            )}
            {entity.saved && (
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Saved
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {dataArray.map((item: any, idx: number) => (
            <div
              key={idx}
              className={`${idx > 0 ? "pt-3 border-t border-border/50" : ""}`}
            >
              {entity.type === "character" ? (
                <div className="space-y-1.5 text-sm">
                  <div className="font-semibold text-foreground">
                    {item.name || "Unnamed"}
                  </div>
                  {item.role && (
                    <div className="text-muted-foreground">
                      <span className="font-medium">Role:</span> {item.role}
                    </div>
                  )}
                  {item.age && (
                    <div className="text-muted-foreground">
                      <span className="font-medium">Age:</span> {item.age}
                    </div>
                  )}
                  {item.traits && (
                    <div className="text-muted-foreground">
                      <span className="font-medium">Traits:</span>{" "}
                      {Array.isArray(item.traits)
                        ? item.traits.join(", ")
                        : item.traits}
                    </div>
                  )}
                  {item.description && (
                    <div className="text-muted-foreground text-xs mt-2">
                      {item.description}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5 text-sm">
                  <div className="font-semibold text-foreground">
                    {item.key || "Unnamed"}
                  </div>
                  {item.category && (
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  )}
                  {item.value && (
                    <div className="text-muted-foreground text-xs mt-2">
                      {item.value}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Header with clear button */}
      {messages.length > 0 && (
        <div className="border-b border-border px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI Storm</span>
            <Badge variant="secondary" className="text-xs">
              Flexible Mode
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearConversation}
            className="h-8 text-xs"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear Chat
          </Button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-20">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-10 w-10 text-primary opacity-70" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Welcome to AI Storm
              </h3>
              <p className="text-sm max-w-md mx-auto mb-6">
                Your intelligent creative writing assistant. Have natural
                conversations about your story, characters, and world. I&apos;ll
                help you create and organize everything.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                <Card className="text-left">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Characters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs">
                      &quot;Help me create characters for my fantasy
                      project&quot;
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card className="text-left">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Lore
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs">
                      &quot;Create lorebook entries for my magic system&quot;
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card className="text-left">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Anything
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs">
                      &quot;Read my character Hasan and fill in the
                      description&quot;
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                message.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : message.status === "error"
                      ? "bg-red-500/10 border border-red-500/20"
                      : "bg-muted/80 border border-border/50"
                }`}
              >
                {/* Generating indicator */}
                {message.status === "generating" && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                )}
                {message.role === "user" ? (
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                ) : message.status !== "generating" ? (
                  <MarkdownRenderer content={message.content} />
                ) : null}
              </div>

              {/* Detected entities */}
              {message.detectedEntities &&
                message.detectedEntities.length > 0 &&
                message.status !== "generating" && (
                  <div className="max-w-[75%] w-full space-y-2">
                    {message.detectedEntities.map((entity, entityIdx) =>
                      renderEntityCard(entity, index, entityIdx),
                    )}
                  </div>
                )}

              {/* Action buttons */}
              {message.role === "assistant" &&
                message.content &&
                !isLoading &&
                message.status !== "generating" &&
                message.status !== "error" && (
                  <div className="flex gap-2 mt-1">
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

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="">
        <div className="max-w-4xl mx-auto p-6 space-y-3">
          {/* Model selector */}
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
          </div>

          <div className="flex gap-2 relative">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Chat with AI about your story, characters, world..."
              className="resize-none"
              rows={3}
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
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
          <p className="text-xs text-muted-foreground">
            Press Enter to send • Shift+Enter for new line • Natural
            conversation supported
          </p>
        </div>
      </div>
    </div>
  );
}
