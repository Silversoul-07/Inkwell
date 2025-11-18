-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AIModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "apiKey" TEXT,
    "baseUrl" TEXT,
    "model" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AIModel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "aiProvider" TEXT NOT NULL DEFAULT 'openai',
    "aiEndpoint" TEXT NOT NULL DEFAULT 'https://api.openai.com/v1',
    "aiApiKey" TEXT,
    "aiModel" TEXT NOT NULL DEFAULT 'gpt-4',
    "aiTemperature" REAL NOT NULL DEFAULT 0.7,
    "aiMaxTokens" INTEGER NOT NULL DEFAULT 2000,
    "aiSystemPrompt" TEXT,
    "editorFont" TEXT NOT NULL DEFAULT 'serif',
    "editorFontSize" INTEGER NOT NULL DEFAULT 18,
    "editorLineHeight" REAL NOT NULL DEFAULT 1.8,
    "editorWidth" INTEGER NOT NULL DEFAULT 42,
    "editorTheme" TEXT NOT NULL DEFAULT 'light',
    "autoSaveInterval" INTEGER NOT NULL DEFAULT 30,
    "contextStrategy" TEXT NOT NULL DEFAULT 'smart',
    "contextWindowSize" INTEGER NOT NULL DEFAULT 8000,
    "includeChapters" BOOLEAN NOT NULL DEFAULT true,
    "includeCharacters" BOOLEAN NOT NULL DEFAULT true,
    "includeLorebook" BOOLEAN NOT NULL DEFAULT true,
    "summarizeOldContent" BOOLEAN NOT NULL DEFAULT false,
    "alwaysIncludePinned" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "settings" TEXT,
    "genre" TEXT,
    "subgenre" TEXT,
    "targetAudience" TEXT,
    "pov" TEXT,
    "tense" TEXT,
    "targetWordCount" INTEGER,
    "tags" TEXT,
    "notes" TEXT,
    "coverImage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "defaultTemperature" REAL,
    "defaultMaxTokens" INTEGER,
    "contextWindowSize" INTEGER NOT NULL DEFAULT 8000,
    "activeWritingMode" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Chapter_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Scene" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chapterId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL DEFAULT '',
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Scene_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Version" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sceneId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "branchName" TEXT,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Version_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" TEXT,
    "role" TEXT,
    "description" TEXT,
    "traits" TEXT,
    "background" TEXT,
    "relationships" TEXT,
    "goals" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Character_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LorebookEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT,
    "keys" TEXT,
    "triggerMode" TEXT NOT NULL DEFAULT 'auto',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "searchable" BOOLEAN NOT NULL DEFAULT true,
    "lastUsed" DATETIME,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "regexPattern" TEXT,
    "contextStrategy" TEXT NOT NULL DEFAULT 'full',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LorebookEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WritingSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wordsWritten" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "WritingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WritingSession_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WritingGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "type" TEXT NOT NULL,
    "targetWords" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WritingGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WritingGoal_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PromptTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "action" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "variables" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isBuiltin" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PromptTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserInstructions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "projectId" TEXT,
    "characterId" TEXT,
    "scope" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserInstructions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserInstructions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserInstructions_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WritingMode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isBuiltin" BOOLEAN NOT NULL DEFAULT false,
    "temperature" REAL NOT NULL DEFAULT 0.7,
    "maxTokens" INTEGER NOT NULL DEFAULT 500,
    "systemPrompt" TEXT,
    "continuePrompt" TEXT,
    "preferredActions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WritingMode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PomodoroSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "duration" INTEGER NOT NULL,
    "wordsWritten" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "PomodoroSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PomodoroSession_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sceneId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "startPos" INTEGER NOT NULL,
    "endPos" INTEGER NOT NULL,
    "highlightedText" TEXT,
    "type" TEXT NOT NULL DEFAULT 'note',
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "color" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Comment_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommentReply" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommentReply_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommentReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AgentConversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "agentType" TEXT NOT NULL,
    "title" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "temperature" REAL NOT NULL DEFAULT 0.7,
    "systemPrompt" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AgentConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AgentConversation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AgentMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "toolCalls" TEXT,
    "toolResults" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgentMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AgentConversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AgentMemory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "characterId" TEXT,
    "lorebookId" TEXT,
    "importance" INTEGER NOT NULL DEFAULT 5,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "lastUsed" DATETIME,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AgentMemory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AgentMemory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "AIModel_userId_idx" ON "AIModel"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_userId_key" ON "Settings"("userId");

-- CreateIndex
CREATE INDEX "Chapter_projectId_order_idx" ON "Chapter"("projectId", "order");

-- CreateIndex
CREATE INDEX "Scene_chapterId_order_idx" ON "Scene"("chapterId", "order");

-- CreateIndex
CREATE INDEX "Version_sceneId_idx" ON "Version"("sceneId");

-- CreateIndex
CREATE INDEX "Version_parentId_idx" ON "Version"("parentId");

-- CreateIndex
CREATE INDEX "Character_projectId_idx" ON "Character"("projectId");

-- CreateIndex
CREATE INDEX "LorebookEntry_projectId_category_idx" ON "LorebookEntry"("projectId", "category");

-- CreateIndex
CREATE INDEX "WritingSession_userId_date_idx" ON "WritingSession"("userId", "date");

-- CreateIndex
CREATE INDEX "WritingSession_projectId_date_idx" ON "WritingSession"("projectId", "date");

-- CreateIndex
CREATE INDEX "WritingGoal_userId_isActive_idx" ON "WritingGoal"("userId", "isActive");

-- CreateIndex
CREATE INDEX "WritingGoal_projectId_idx" ON "WritingGoal"("projectId");

-- CreateIndex
CREATE INDEX "PromptTemplate_userId_action_idx" ON "PromptTemplate"("userId", "action");

-- CreateIndex
CREATE INDEX "UserInstructions_userId_idx" ON "UserInstructions"("userId");

-- CreateIndex
CREATE INDEX "UserInstructions_projectId_idx" ON "UserInstructions"("projectId");

-- CreateIndex
CREATE INDEX "UserInstructions_characterId_idx" ON "UserInstructions"("characterId");

-- CreateIndex
CREATE INDEX "WritingMode_userId_idx" ON "WritingMode"("userId");

-- CreateIndex
CREATE INDEX "PomodoroSession_userId_idx" ON "PomodoroSession"("userId");

-- CreateIndex
CREATE INDEX "Comment_sceneId_idx" ON "Comment"("sceneId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "CommentReply_commentId_idx" ON "CommentReply"("commentId");

-- CreateIndex
CREATE INDEX "AgentConversation_userId_idx" ON "AgentConversation"("userId");

-- CreateIndex
CREATE INDEX "AgentConversation_projectId_idx" ON "AgentConversation"("projectId");

-- CreateIndex
CREATE INDEX "AgentConversation_agentType_idx" ON "AgentConversation"("agentType");

-- CreateIndex
CREATE INDEX "AgentMessage_conversationId_idx" ON "AgentMessage"("conversationId");

-- CreateIndex
CREATE INDEX "AgentMemory_userId_projectId_agentType_idx" ON "AgentMemory"("userId", "projectId", "agentType");

-- CreateIndex
CREATE INDEX "AgentMemory_category_idx" ON "AgentMemory"("category");

-- CreateIndex
CREATE INDEX "AgentMemory_key_idx" ON "AgentMemory"("key");
