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

**Body:**

```json
{
  "email": "string (required)",
  "password": "string (required)",
  "name": "string (optional)"
}
```

**Response:** `201` - `{ "user": { "id": "string", "email": "string" } }`

### NextAuth Routes

```
GET/POST /api/auth/[...nextauth]
```

Handles sign in, sign out, and session management.

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
**Note:** Automatically creates a "Chapter 1" with the project.

### Get Project

```
GET /api/projects/{id}
```

**Response:** `200` - Project with chapters (no scenes, chapters contain content directly)

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "userId": "string",
  "genre": "string",
  "subgenre": "string",
  "targetAudience": "string",
  "pov": "string",
  "tense": "string",
  "targetWordCount": "number",
  "chapters": [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "wordCount": "number",
      "order": "number"
    }
  ]
}
```

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

**Response:** `200` - Updated project object

### Delete Project

```
DELETE /api/projects/{id}
```

**Response:** `200` - `{ "success": true }`
**Note:** Cascades to delete all chapters, characters, lorebook entries, etc.

---

## Chapters

**Note:** Scenes have been removed from the architecture. Chapters now contain content directly.

### Create Chapter

```
POST /api/chapters
```

**Body:**

```json
{
  "projectId": "string (required)",
  "title": "string (optional, default: 'Untitled Chapter')"
}
```

**Response:** `201` - Chapter object

### Update Chapter

```
PATCH /api/chapters/{id}
```

**Body:**

```json
{
  "title": "string",
  "content": "string",
  "wordCount": "number",
  "order": "number"
}
```

**Response:** `200` - Updated chapter object

### Delete Chapter

```
DELETE /api/chapters/{id}
```

**Response:** `200` - `{ "success": true }`

---

## Characters

### List Characters

```
GET /api/characters?projectId={projectId}&scope={scope}
```

**Query Params:**

- `projectId`: Filter by project (optional for global characters)
- `scope`: `project` | `global` (optional)

**Response:** `200` - Array of character objects

### Create Character

```
POST /api/characters
```

**Body:**

```json
{
  "projectId": "string (optional, null for global)",
  "name": "string (required)",
  "age": "string",
  "role": "string",
  "description": "string",
  "traits": "string",
  "background": "string",
  "relationships": "string",
  "goals": "string",
  "avatar": "string (base64 or URL)",
  "personality": "string",
  "appearance": "string",
  "motivations": "string",
  "fears": "string",
  "arc": "string"
}
```

**Response:** `201` - Character object

### Get Character

```
GET /api/characters/{id}
```

**Response:** `200` - Character object

### Update Character

```
PATCH /api/characters/{id}
```

**Body:** Same as Create (all fields optional)
**Response:** `200` - Updated character object

### Delete Character

```
DELETE /api/characters/{id}
```

**Response:** `200` - `{ "success": true }`

---

## Lorebook

### List Entries

```
GET /api/lorebook?projectId={projectId}&sortBy={sortBy}&category={category}&scope={scope}
```

**Query Params:**

- `projectId`: Filter by project (optional for global entries)
- `sortBy`: `createdAt` | `priority` | `useCount` | `lastUsed` (default: `createdAt`)
- `category`: Filter by category
- `scope`: `project` | `global` (optional)

**Response:** `200` - Array of lorebook entries

### Create Entry

```
POST /api/lorebook
```

**Body:**

```json
{
  "projectId": "string (optional, null for global)",
  "key": "string (required)",
  "value": "string (required)",
  "category": "string (optional)",
  "keys": "string (comma-separated additional keywords)",
  "triggerMode": "auto | manual (default: auto)",
  "priority": "number (default: 0)",
  "searchable": "boolean (default: true)",
  "regexPattern": "string (optional)",
  "contextStrategy": "full | summary | keywords (default: full)"
}
```

**Response:** `201` - Lorebook entry object

### Match Lorebook Entries

```
POST /api/lorebook/match
```

**Body:**

```json
{
  "projectId": "string (required)",
  "context": "string (required)",
  "limit": "number (optional, default: 10)"
}
```

**Response:** `200` - Array of matched lorebook entries with scores

### Get Entry

```
GET /api/lorebook/{id}
```

**Response:** `200` - Lorebook entry object

### Update Entry

```
PATCH /api/lorebook/{id}
```

**Body:** Same as Create (all fields optional)
**Response:** `200` - Updated lorebook entry object

### Delete Entry

```
DELETE /api/lorebook/{id}
```

**Response:** `200` - `{ "success": true }`

---

## Versions (Chapter Versioning)

**Note:** Version system now works with chapters directly (not scenes).

### List Versions

```
GET /api/versions?chapterId={chapterId}
```

**Response:** `200` - Array of version objects

### Create Version

```
POST /api/versions
```

**Body:**

```json
{
  "chapterId": "string (required)",
  "content": "string (required)",
  "branchName": "string (optional)",
  "parentId": "string (optional)"
}
```

**Response:** `201` - Version object

### Get Version

```
GET /api/versions/{id}
```

**Response:** `200` - Version object with full content

### Update Version

```
PATCH /api/versions/{id}
```

**Body:**

```json
{
  "branchName": "string",
  "content": "string"
}
```

**Response:** `200` - Updated version object

### Delete Version

```
DELETE /api/versions/{id}
```

**Response:** `200` - `{ "success": true }`

### Restore Version

```
POST /api/versions/{id}/restore
```

**Response:** `400` - Not supported (manual chapter update required)
**Note:** Version restoration through this endpoint is deprecated. Update the chapter directly instead.

---

## AI Models

### List AI Models

```
GET /api/ai-models
```

**Response:** `200` - User's configured AI models, or default fallback models if none configured

```json
[
  {
    "id": "string",
    "name": "string",
    "provider": "openai | anthropic | groq | ollama | custom",
    "model": "string",
    "apiKey": "string (only returned for user's own models)",
    "baseUrl": "string (for custom endpoints)",
    "isDefault": "boolean",
    "isEnabled": "boolean"
  }
]
```

### Create AI Model

```
POST /api/ai-models
```

**Body:**

```json
{
  "name": "string (required)",
  "provider": "string (required, e.g., 'openai', 'anthropic')",
  "apiKey": "string (optional, not needed for Ollama)",
  "baseUrl": "string (optional, for custom endpoints)",
  "model": "string (required, e.g., 'gpt-4', 'claude-3-5-sonnet-20241022')",
  "isDefault": "boolean (optional)"
}
```

**Response:** `201` - Created AI model object
**Note:** Setting `isDefault: true` will unset other models as default.

### Update AI Model

```
PATCH /api/ai-models/{id}
```

**Body:** Same as Create (all fields optional)
**Response:** `200` - Updated AI model object

### Delete AI Model

```
DELETE /api/ai-models/{id}
```

**Response:** `200` - `{ "success": true }`

---

## Settings

### Get Settings

```
GET /api/settings
```

**Response:** `200` - User settings object

### Update Settings

```
PATCH /api/settings
```

**Body:**

```json
{
  "aiProvider": "string (openai, anthropic, groq, ollama)",
  "aiEndpoint": "string",
  "aiApiKey": "string",
  "aiModel": "string",
  "aiTemperature": "number (0-2)",
  "aiMaxTokens": "number",
  "aiSystemPrompt": "string",
  "editorFont": "string",
  "editorFontSize": "number",
  "editorLineHeight": "number",
  "editorWidth": "number",
  "editorTheme": "string",
  "autoSaveInterval": "number (seconds)",
  "contextStrategy": "recent | smart | manual | summarized",
  "contextWindowSize": "number (tokens)",
  "includeChapters": "boolean",
  "includeCharacters": "boolean",
  "includeLorebook": "boolean",
  "summarizeOldContent": "boolean",
  "alwaysIncludePinned": "boolean"
}
```

**Response:** `200` - Updated settings object

---

## Writing Goals

### List Goals

```
GET /api/writing-goals?projectId={projectId}&isActive={boolean}
```

**Query Params:**

- `projectId`: Filter by project (optional)
- `isActive`: Filter by active status (optional)

**Response:** `200` - Array of goals with calculated progress

```json
[
  {
    "id": "string",
    "type": "daily | weekly | project",
    "targetWords": "number",
    "projectId": "string",
    "endDate": "string (ISO date)",
    "isActive": "boolean",
    "wordsWritten": "number",
    "progress": "number (percentage)"
  }
]
```

### Create Goal

```
POST /api/writing-goals
```

**Body:**

```json
{
  "type": "daily | weekly | project (required)",
  "targetWords": "number (required)",
  "projectId": "string (optional)",
  "endDate": "string (ISO date, optional)"
}
```

**Response:** `201` - Goal object

---

## Writing Modes

### List Modes

```
GET /api/writing-modes
```

**Response:** `200` - Array of writing mode objects

### Get Mode

```
GET /api/writing-modes/{id}
```

**Response:** `200` - Writing mode object

### Create Mode

```
POST /api/writing-modes
```

**Body:**

```json
{
  "name": "string (required)",
  "description": "string",
  "temperature": "number (0-2)",
  "maxTokens": "number",
  "systemPrompt": "string",
  "continuePrompt": "string",
  "preferredActions": "array of strings"
}
```

**Response:** `201` - Writing mode object

### Update Mode

```
PATCH /api/writing-modes/{id}
```

**Body:** Same as Create (all fields optional)
**Response:** `200` - Updated writing mode object

### Delete Mode

```
DELETE /api/writing-modes/{id}
```

**Response:** `200` - `{ "success": true }`

---

## Prompt Templates

### List Templates

```
GET /api/prompt-templates?action={action}&category={category}
```

**Query Params:**

- `action`: Filter by action type (e.g., 'continue', 'describe', 'dialogue')
- `category`: Filter by category

**Response:** `200` - Array of prompt template objects

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
  "category": "string",
  "variables": "array of strings (template variable names)"
}
```

**Response:** `201` - Template object

### Test Template

```
POST /api/prompt-templates/test
```

**Body:**

```json
{
  "template": "string (required)",
  "variables": "object (key-value pairs)"
}
```

**Response:** `200` - `{ "result": "string (processed template)" }`

### Import Templates

```
POST /api/prompt-templates/import
```

**Body:** `multipart/form-data` or JSON array of templates
**Response:** `201` - `{ "imported": number }`

### Export Templates

```
GET /api/prompt-templates/export
```

**Response:** `200` - JSON array of all user templates

### Update Template

```
PATCH /api/prompt-templates/{id}
```

**Body:** Same as Create (all fields optional)
**Response:** `200` - Updated template object

### Delete Template

```
DELETE /api/prompt-templates/{id}
```

**Response:** `200` - `{ "success": true }`

---

## User Instructions

Custom instructions that are injected into AI context based on scope (global, project, or character).

### List Instructions

```
GET /api/user-instructions?scope={scope}&projectId={projectId}&characterId={characterId}
```

**Query Params:**

- `scope`: `global` | `project` | `character` (optional)
- `projectId`: Filter by project (optional)
- `characterId`: Filter by character (optional)

**Response:** `200` - Array of user instruction objects

### Create Instruction

```
POST /api/user-instructions
```

**Body:**

```json
{
  "scope": "global | project | character (required)",
  "instructions": "string (required)",
  "projectId": "string (required for project scope)",
  "characterId": "string (required for character scope)",
  "isEnabled": "boolean (default: true)",
  "priority": "number (default: 0, higher = more important)"
}
```

**Response:** `201` - User instruction object

### Update Instruction

```
PATCH /api/user-instructions/{id}
```

**Body:** Same as Create (all fields optional)
**Response:** `200` - Updated instruction object

### Delete Instruction

```
DELETE /api/user-instructions/{id}
```

**Response:** `200` - `{ "success": true }`

---

## Analytics

### Get Project Analytics

```
GET /api/analytics?projectId={projectId}
```

**Response:** `200` - Comprehensive analytics

```json
{
  "totalWords": "number",
  "totalSessions": "number",
  "totalDuration": "number (minutes)",
  "totalWordsWritten": "number (cumulative from sessions)",
  "currentStreak": "number (days)",
  "longestStreak": "number (days)",
  "avgWordsPerSession": "number",
  "avgSessionDuration": "number (minutes)",
  "chapterPacing": [
    {
      "id": "string",
      "title": "string",
      "wordCount": "number"
    }
  ],
  "recentSessions": [
    {
      "id": "string",
      "date": "string (ISO date)",
      "wordsWritten": "number",
      "duration": "number"
    }
  ]
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
  "wordsWritten": "number (default: 0)",
  "duration": "number (default: 0, in minutes)"
}
```

**Response:** `201` - Writing session object
**Note:** Automatically records current date/time.

### Get Writing Stats

```
GET /api/analytics/stats?projectId={projectId}&period={days}
```

**Query Params:**

- `projectId`: Required
- `period`: Number of days to include (default: 30)

**Response:** `200` - Detailed statistics for the period

### Analyze Content

```
POST /api/analytics/analyze
```

**Body:**

```json
{
  "projectId": "string (required)",
  "chapterId": "string (optional)",
  "content": "string (required if no chapterId)"
}
```

**Response:** `200` - Analysis results (repetition detection, dialogue balance, pacing insights)

---

## Pomodoro Sessions

### List Sessions

```
GET /api/pomodoro?projectId={projectId}&limit={number}
```

**Query Params:**

- `projectId`: Required
- `limit`: Max number of sessions to return (default: 20)

**Response:** `200` - Array of Pomodoro session objects

### Create Session

```
POST /api/pomodoro
```

**Body:**

```json
{
  "projectId": "string (required)",
  "duration": "number (required, in minutes)",
  "type": "work | break (default: work)",
  "completed": "boolean (default: true)"
}
```

**Response:** `201` - Pomodoro session object

### Update Session

```
PATCH /api/pomodoro/{id}
```

**Body:**

```json
{
  "duration": "number",
  "completed": "boolean"
}
```

**Response:** `200` - Updated session object

### Delete Session

```
DELETE /api/pomodoro/{id}
```

**Response:** `200` - `{ "success": true }`

---

## Import/Export

### Export Project

```
GET /api/export?projectId={projectId}&format={format}
```

**Query Params:**

- `projectId`: Required
- `format`: `txt` | `md` | `markdown` | `docx` (default: `txt`)

**Response:** `200` - File download with appropriate Content-Type
**Note:** `docx` format returns RTF content due to limitations.

### Import Content

```
POST /api/import
```

**Body:** `multipart/form-data`

- `file`: File (TXT or Markdown)
- `projectId`: string (required)
- `format`: `txt` | `md` (optional, auto-detected)

**Response:** `201`

```json
{
  "success": true,
  "chaptersImported": "number",
  "message": "string"
}
```

**Note:** Automatically splits content into chapters based on headings (for Markdown) or "Chapter X" markers.

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
  "context": "string (optional, scene context)",
  "temperature": "number (0-2, optional)",
  "maxTokens": "number (optional)",
  "systemPrompt": "string (optional)",
  "projectId": "string (optional)",
  "characterId": "string (optional)",
  "includeUserInstructions": "boolean (default: true)",
  "includeLorebook": "boolean (default: true)",
  "includeCharacters": "boolean (default: true)"
}
```

**Response:** Server-Sent Events (SSE) stream

```
data: {"type": "token", "content": "Generated text chunk"}
data: {"type": "done"}
```

**Note:** Automatically builds context from user instructions, lorebook, and characters if `projectId` is provided.

### Character Chat (Streaming)

```
POST /api/ai/character-chat
```

**Body:**

```json
{
  "characterId": "string (required)",
  "message": "string (required)",
  "conversationHistory": "array of {role: string, content: string} (optional)"
}
```

**Response:** Server-Sent Events (SSE) stream (same format as generate)

### Test AI Connection

```
POST /api/ai/test
```

**Body:**

```json
{
  "provider": "string (optional, uses default if not provided)",
  "apiKey": "string (optional, uses configured key if not provided)"
}
```

**Response:** `200` - `{ "success": true, "message": "string" }` or `400` with error

---

## Story Agents

AI agents specialized for story assistance (world-building, character development, plot planning, etc.).

### List Conversations

```
GET /api/agents/conversations?projectId={projectId}
```

**Query Params:**

- `projectId`: Filter by project (optional)

**Response:** `200` - Array of agent conversation objects

```json
[
  {
    "id": "string",
    "agentType": "string",
    "title": "string",
    "projectId": "string",
    "status": "active | archived",
    "createdAt": "string (ISO date)",
    "messages": "array (if included)"
  }
]
```

### Create Conversation

```
POST /api/agents/conversations
```

**Body:**

```json
{
  "agentType": "string (required, e.g., 'world-builder', 'character-dev', 'plot-planner')",
  "projectId": "string (optional)",
  "title": "string (optional)"
}
```

**Response:** `201` - Conversation object

### Get Conversation

```
GET /api/agents/conversations/{id}
```

**Response:** `200` - Conversation object with full message history

```json
{
  "conversation": {
    "id": "string",
    "agentType": "string",
    "title": "string",
    "messages": [
      {
        "role": "user | assistant",
        "content": "string",
        "toolCalls": "array (optional)",
        "createdAt": "string (ISO date)"
      }
    ],
    "project": {
      "id": "string",
      "title": "string"
    }
  }
}
```

### Update Conversation

```
PATCH /api/agents/conversations/{id}
```

**Body:**

```json
{
  "title": "string",
  "status": "active | archived"
}
```

**Response:** `200` - `{ "success": true }`

### Delete Conversation

```
DELETE /api/agents/conversations/{id}
```

**Response:** `200` - `{ "success": true }`
**Note:** Cascades to delete all messages in the conversation.

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
  "projectId": "string (optional)",
  "modelId": "string (optional, uses default AI model if not provided)",
  "sceneContext": "string (optional, current scene content for context)"
}
```

**Response:** `200`

```json
{
  "message": {
    "content": "string",
    "toolCalls": [
      {
        "name": "string",
        "arguments": "object"
      }
    ]
  }
}
```

**Note:** Agent responses may include tool calls for database operations (e.g., creating characters, lorebook entries).

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

**Common Status Codes:**

- `400` - Bad Request (validation error, missing required fields)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (authenticated but not authorized)
- `404` - Not Found (resource doesn't exist or doesn't belong to user)
- `500` - Internal Server Error (server-side error)

---

## Authentication & Authorization

All API routes (except `/api/auth/*`) require a valid NextAuth session. The session is verified using:

```typescript
const session = await getServerSession(authOptions)
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

All data queries are filtered by `userId` to ensure users can only access their own data:

```typescript
where: {
  id: resourceId,
  userId: session.user.id  // Ensures ownership
}
```

---

## Rate Limiting & Quotas

Currently, there are no rate limits implemented. AI provider rate limits apply based on your API keys.

---

## Versioning

This API is currently **v1** (implicit). Breaking changes will be communicated through documentation updates.
