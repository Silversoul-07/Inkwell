# Inkwell API Documentation

All API endpoints require authentication via NextAuth session. Unauthorized requests return `401`.

## Base URL
```
/api
```

---

## Authentication

### Sign Up
```
POST /api/auth/signup
```

### NextAuth Routes
```
GET/POST /api/auth/[...nextauth]
```

---

## Projects

### Create Project
```
POST /api/projects
```
**Body:**
```json
{
  "title": "string (required)",
  "description": "string (optional)"
}
```
**Response:** `201` - `{ "id": "string" }`

### Get Project
```
GET /api/projects/{id}
```
**Response:** `200` - Project with chapters and scenes

### Update Project
```
PATCH /api/projects/{id}
```
**Body:**
```json
{
  "title": "string",
  "description": "string",
  "genre": "string",
  "subgenre": "string",
  "targetAudience": "string",
  "pov": "string",
  "tense": "string",
  "targetWordCount": "number",
  "tags": "string (JSON array)",
  "notes": "string",
  "coverImage": "string",
  "status": "string",
  "defaultTemperature": "number",
  "defaultMaxTokens": "number",
  "contextWindowSize": "number",
  "activeWritingMode": "string",
  "metadata": "string (JSON)"
}
```

### Delete Project
```
DELETE /api/projects/{id}
```
**Response:** `200` - `{ "success": true }`

---

## Chapters

### Create Chapter
```
POST /api/chapters
```
**Body:**
```json
{
  "projectId": "string (required)",
  "title": "string (optional)"
}
```

### Update Chapter
```
PATCH /api/chapters/{id}
```
**Body:**
```json
{
  "title": "string",
  "content": "string",
  "wordCount": "number"
}
```

### Delete Chapter
```
DELETE /api/chapters/{id}
```

---

## Scenes

### Create Scene
```
POST /api/scenes
```
**Body:**
```json
{
  "chapterId": "string (required)",
  "title": "string (optional)"
}
```

### Update Scene
```
PATCH /api/scenes/{id}
```
**Body:**
```json
{
  "content": "string",
  "wordCount": "number"
}
```

### Delete Scene
```
DELETE /api/scenes/{id}
```

---

## Characters

### List Characters
```
GET /api/characters?projectId={projectId}
```

### Create Character
```
POST /api/characters
```
**Body:**
```json
{
  "projectId": "string (required)",
  "name": "string (required)",
  "age": "string",
  "role": "string",
  "description": "string",
  "traits": "string",
  "background": "string",
  "relationships": "string",
  "goals": "string"
}
```

### Update/Delete Character
```
PATCH/DELETE /api/characters/{id}
```

---

## Lorebook

### List Entries
```
GET /api/lorebook?projectId={projectId}&sortBy={sortBy}&category={category}
```
**Query Params:**
- `sortBy`: `createdAt` | `priority` | `useCount` | `lastUsed`

### Create Entry
```
POST /api/lorebook
```
**Body:**
```json
{
  "projectId": "string (required)",
  "key": "string (required)",
  "value": "string",
  "category": "string",
  "keys": "string",
  "triggerMode": "auto | manual",
  "priority": "number",
  "searchable": "boolean",
  "regexPattern": "string",
  "contextStrategy": "full | summary | keywords"
}
```

### Match Lorebook Entries
```
POST /api/lorebook/match
```

### Update/Delete Entry
```
PATCH/DELETE /api/lorebook/{id}
```

---

## Versions (Branching)

### List Versions
```
GET /api/versions?sceneId={sceneId}
```

### Create Version Branch
```
POST /api/versions
```
**Body:**
```json
{
  "sceneId": "string (required)",
  "content": "string (required)",
  "branchName": "string",
  "parentId": "string"
}
```

### Update/Delete Version
```
PATCH/DELETE /api/versions/{id}
```

---

## Comments

### List Comments
```
GET /api/comments?sceneId={sceneId}
```
**Response:** Comments with user info and replies

### Create Comment
```
POST /api/comments
```
**Body:**
```json
{
  "sceneId": "string (required)",
  "content": "string (required)",
  "startPos": "number",
  "endPos": "number"
}
```

### Update/Delete Comment
```
PATCH/DELETE /api/comments/{id}
```

---

## AI Models

### List AI Models
```
GET /api/ai-models
```
**Response:** User's configured AI models (or defaults)

### Create AI Model
```
POST /api/ai-models
```
**Body:**
```json
{
  "name": "string (required)",
  "provider": "string (required)",
  "apiKey": "string",
  "baseUrl": "string",
  "model": "string",
  "isDefault": "boolean"
}
```

### Update/Delete AI Model
```
PATCH/DELETE /api/ai-models/{id}
```

---

## Settings

### Update Settings
```
PATCH /api/settings
```
**Body:**
```json
{
  "aiProvider": "string",
  "aiEndpoint": "string",
  "aiApiKey": "string",
  "aiModel": "string",
  "aiTemperature": "number",
  "aiMaxTokens": "number",
  "editorFont": "string",
  "editorFontSize": "number",
  "editorLineHeight": "number",
  "editorWidth": "string",
  "autoSaveInterval": "number"
}
```

---

## Writing Goals

### List Goals
```
GET /api/writing-goals?projectId={projectId}&isActive={boolean}
```
**Response:** Goals with calculated progress

### Create Goal
```
POST /api/writing-goals
```
**Body:**
```json
{
  "type": "daily | weekly | project (required)",
  "targetWords": "number (required)",
  "projectId": "string",
  "endDate": "string (ISO date)"
}
```

### Update/Delete Goal
```
PATCH/DELETE /api/writing-goals/{id}
```

---

## Writing Modes

### List Modes
```
GET /api/writing-modes
```

### Create Mode
```
POST /api/writing-modes
```
**Body:**
```json
{
  "name": "string (required)",
  "description": "string",
  "temperature": "number",
  "maxTokens": "number",
  "systemPrompt": "string",
  "continuePrompt": "string",
  "preferredActions": "array"
}
```

### Activate Mode
```
POST /api/writing-modes/activate
```

### Update/Delete Mode
```
PATCH/DELETE /api/writing-modes/{id}
```

---

## Prompt Templates

### List Templates
```
GET /api/prompt-templates?action={action}&category={category}
```

### Create Template
```
POST /api/prompt-templates
```
**Body:**
```json
{
  "name": "string (required)",
  "action": "string (required)",
  "template": "string (required)",
  "description": "string",
  "isDefault": "boolean",
  "category": "string"
}
```

### Test Template
```
POST /api/prompt-templates/test
```

### Import/Export Templates
```
POST /api/prompt-templates/import
GET /api/prompt-templates/export
```

### Update/Delete Template
```
PATCH/DELETE /api/prompt-templates/{id}
```

---

## User Instructions

### List Instructions
```
GET /api/user-instructions?scope={scope}&projectId={projectId}&characterId={characterId}
```

### Create Instruction
```
POST /api/user-instructions
```
**Body:**
```json
{
  "scope": "global | project | character (required)",
  "instructions": "string (required)",
  "projectId": "string (for project scope)",
  "characterId": "string (for character scope)",
  "isEnabled": "boolean",
  "priority": "number"
}
```

### Update/Delete Instruction
```
PATCH/DELETE /api/user-instructions/{id}
```

---

## Analytics

### Get Project Analytics
```
GET /api/analytics?projectId={projectId}
```
**Response:**
```json
{
  "totalWords": "number",
  "totalSessions": "number",
  "totalDuration": "number",
  "currentStreak": "number",
  "longestStreak": "number",
  "avgWordsPerSession": "number",
  "avgSessionDuration": "number",
  "chapterPacing": "array",
  "recentSessions": "array"
}
```

### Log Writing Session
```
POST /api/analytics
```
**Body:**
```json
{
  "projectId": "string (required)",
  "wordsWritten": "number",
  "duration": "number"
}
```

### Get Writing Stats
```
GET /api/analytics/stats?projectId={projectId}&period={days}
```

### Analyze Content
```
POST /api/analytics/analyze
```

---

## Pomodoro Sessions

### List Sessions
```
GET /api/pomodoro?projectId={projectId}&limit={number}
```

### Create Session
```
POST /api/pomodoro
```
**Body:**
```json
{
  "projectId": "string (required)",
  "duration": "number (required)"
}
```

### Update/Delete Session
```
PATCH/DELETE /api/pomodoro/{id}
```

---

## Import/Export

### Export Project
```
GET /api/export?projectId={projectId}&format={format}
```
**Formats:** `txt` | `md` | `markdown` | `docx` (returns RTF)

### Import Content
```
POST /api/import
```
**Body:** `multipart/form-data`
- `file`: File
- `projectId`: string
- `format`: `txt` | `md`

**Response:**
```json
{
  "success": true,
  "chaptersImported": "number",
  "scenesImported": "number"
}
```

---

## AI Generation

### Generate Text (Streaming)
```
POST /api/ai/generate
```
**Body:**
```json
{
  "prompt": "string (required)",
  "context": "string",
  "temperature": "number",
  "maxTokens": "number",
  "systemPrompt": "string",
  "projectId": "string",
  "characterId": "string",
  "includeUserInstructions": "boolean",
  "includeLorebook": "boolean",
  "includeCharacters": "boolean"
}
```
**Response:** Server-Sent Events stream

### Character Chat (Streaming)
```
POST /api/ai/character-chat
```
**Body:**
```json
{
  "characterId": "string (required)",
  "message": "string (required)",
  "conversationHistory": "array"
}
```

### AI Agent
```
POST /api/ai/agent
```

### Test AI Connection
```
POST /api/ai/test
```

---

## Agent Conversations

### List Conversations
```
GET /api/agents/conversations?projectId={projectId}
```

### Create Conversation
```
POST /api/agents/conversations
```
**Body:**
```json
{
  "agentType": "string (required)",
  "projectId": "string",
  "title": "string"
}
```

### Get/Delete Conversation
```
GET/DELETE /api/agents/conversations/{id}
```

### Agent Chat
```
POST /api/agents/chat
```
**Body:**
```json
{
  "conversationId": "string (required)",
  "message": "string (required)",
  "agentType": "string (required)",
  "projectId": "string",
  "modelId": "string"
}
```

---

## Error Responses

```json
{
  "error": "Error message"
}
```

**Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error
