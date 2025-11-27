# AGENTS.md - AI Coding Agent Instructions

**Repository**: Inkwell  
**Last Updated**: November 27, 2025  
**License**: MIT

---

## 📋 CRITICAL: Documentation Maintenance

**IMPORTANT**: When making ANY changes to the codebase, you MUST update the relevant documentation:

### Documentation Files to Maintain

1. **`AGENTS.md`** (this file) - Update when:
   - Adding/removing/modifying API routes
   - Changing database schema
   - Adding/removing dependencies
   - Modifying project structure
   - Changing tech stack versions
   - Adding new features or capabilities
   - Updating build/deployment processes

2. **`docs/API.md`** - Update when:
   - Adding new API endpoints
   - Modifying existing endpoint behavior
   - Changing request/response formats
   - Adding/removing query parameters
   - Changing authentication requirements
   - Deprecating endpoints

3. **`README.md`** - Update when:
   - Adding major new features
   - Changing setup instructions
   - Modifying environment variables
   - Updating tech stack
   - Adding new scripts or commands

### How to Update Documentation

- **After ANY code change**: Review if documentation needs updating
- **Use exact URLs/paths**: Ensure all file paths and API routes are correct
- **Include examples**: Add request/response examples for API changes
- **Update dates**: Change "Last Updated" date in AGENTS.md
- **Be thorough**: Better to over-document than under-document

---

## Project Overview

**Inkwell** is an AI-assisted creative writing application built with Next.js 16. It provides a distraction-free writing environment with advanced AI features for authors, including:

- **Rich Text Editor**: TipTap-based editor with NovelAI-inspired interface
- **Project Management**: Multi-project organization with chapters/scenes
- **AI Generation**: Context-aware text generation with multiple AI provider support (OpenAI, Anthropic, Google Gemini, DeepSeek, OpenRouter)
- **Character Management**: Detailed character profiles with avatars and relationships
- **Lorebook System**: Smart context injection with keyword matching and priority-based triggering
- **Story Agents**: Specialized AI agents for world-building, character development, and story planning
- **Analytics & Tracking**: Writing statistics, session tracking, Pomodoro timer, goal tracking
- **Prompt Templates**: Customizable templates for different writing actions
- **Writing Modes**: Context-aware writing styles and tones
- **Version Control**: Branching system for exploring alternative story paths
- **Import/Export**: Support for TXT, Markdown, and DOCX formats

---

## Tech Stack

### Core Framework

- **Next.js 16** (App Router, React Server Components, API Routes)
- **React 18.3** with TypeScript 5.9
- **Next-Auth 4.24** for authentication (JWT-based sessions with bcrypt)

### Database & ORM

- **Prisma 6.19** with SQLite (file-based: `prisma/dev.db`)
- Database schema includes: Users, Projects, Chapters, Characters, Lorebook, AI Models, Settings, Writing Sessions/Goals, Prompt Templates, Agent Conversations, etc.

### UI & Styling

- **Tailwind CSS 3.4** with custom theme system (7 themes: light, dark, sepia, novelai, midnight, nord, forest)
- **Radix UI** components (dialogs, dropdowns, tabs, etc.)
- **shadcn/ui** component library ("new-york" style)
- **Lucide React** for icons
- **TipTap** rich text editor with StarterKit

### AI Integration

- **OpenAI SDK** (GPT-4, GPT-4o, GPT-4-turbo)
- **Anthropic SDK** (Claude models)
- **Google Generative AI** (Gemini 2.0 Flash, Gemini 1.5)
- **Custom providers**: DeepSeek, OpenRouter
- Streaming responses via Server-Sent Events (SSE)

### Development Tools

- **pnpm** as package manager (required)
- **TypeScript** with strict mode enabled
- **ESLint** with Next.js config
- **Prettier** for code formatting
- **Husky** for Git hooks (pre-commit: lint-staged, type checking)
- **lint-staged** for auto-fixing staged files
- **tsx** for running TypeScript scripts

---

## Build / Setup Commands

### Prerequisites

- **Node.js**: Runtime (see `devEngines` in package.json)
- **pnpm**: Package manager (required)

### Installation

```bash
# Install dependencies
pnpm install

# This automatically runs:
# - prisma generate (creates Prisma Client)
# - prisma db push --accept-data-loss (creates/updates database schema)
```

### Development

```bash
# Start development server with Turbopack
pnpm dev

# Runs on http://localhost:3000
```

### Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Database Management

```bash
# Generate Prisma Client (after schema changes)
pnpm exec prisma generate

# Push schema changes to database
pnpm exec prisma db push

# Open Prisma Studio (database GUI)
pnpm exec prisma studio

# Create a migration (for production)
pnpm exec prisma migrate dev --name <migration_name>
```

### Agents CLI/Testing

```bash
# Interactive Story Agents CLI (uses in-memory database)
pnpm agents:cli

# Run Story Agents test script
pnpm agents:test
```

### Bundle Analysis

```bash
# Analyze bundle size
pnpm analyze
# or
ANALYZE=true pnpm build
```

---

## Testing / Validation Commands

### Linting

```bash
# Lint all files
pnpm lint

# Auto-fix linting issues (done automatically in pre-commit)
pnpm exec eslint --fix <path>
```

### Type Checking

```bash
# Type check (no emit)
pnpm exec tsc --noEmit
```

### Pre-commit Hook

The `.husky/pre-commit` hook automatically runs:

1. **lint-staged**: Auto-fixes and formats staged files (ESLint + Prettier)
2. **TypeScript type checking**: Ensures no type errors

**Note**: There are no formal unit/integration test suites (jest/vitest) in this project currently.

---

## Code Style & Conventions

### TypeScript

- **Strict mode enabled** (`strict: true`)
- **Target**: ES2017
- **Module resolution**: bundler
- **Path aliases**: `@/*` maps to project root
- Use **interfaces** for object shapes, **types** for unions/intersections
- Prefer **async/await** over promises

### React/Next.js

- **File naming**: kebab-case for files (`my-component.tsx`), PascalCase for components
- **Components**: Prefer functional components with hooks
- **Client components**: Use `'use client'` directive when needed (state, effects, browser APIs)
- **Server components**: Default in app directory (no `'use client'`)
- **API Routes**: Use Route Handlers in `app/api/*/route.ts` with named exports (`GET`, `POST`, etc.)
- **Authentication**: Check session via `getServerSession(authOptions)` on server, `useSession()` on client

### Styling

- **Tailwind utility-first approach**: Use Tailwind classes directly
- **Component variants**: Use `class-variance-authority` (CVA) for complex variants
- **Theme-aware**: Use CSS variables defined in `globals.css` for colors
- **Responsive design**: Mobile-first approach

### Code Formatting (Prettier)

- **No semicolons** (`semi: false`)
- **Single quotes** (`singleQuote: true`)
- **2-space indentation** (`tabWidth: 2`)
- **100 character line width** (`printWidth: 100`)
- **ES5 trailing commas** (`trailingComma: "es5"`)
- **Arrow function parens**: avoid (`arrowParens: "avoid"`)

### ESLint Config

- Extends `next/core-web-vitals`
- Ignores: `node_modules`, `.next`, `out`, `dist`, `build`, `.turbo`

### Naming Conventions

- **Components**: PascalCase (`TiptapEditorNovelAI`)
- **Files**: kebab-case (`tiptap-editor-novelai.tsx`)
- **Variables/Functions**: camelCase (`buildAIContext`)
- **Constants**: UPPER_SNAKE_CASE for true constants (`DEFAULT_THEME`)
- **Types/Interfaces**: PascalCase (`ContextOptions`)
- **Database models**: PascalCase singular (`User`, `Project`, `Character`)

### Comments

- Use JSDoc-style comments for functions/modules
- Inline comments for complex logic only
- Keep comments up-to-date with code changes

---

## Directory / Module Structure

```
Inkwell/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (login, signup)
│   ├── api/                      # API Route Handlers
│   │   ├── agents/               # Agent conversation APIs
│   │   ├── ai/                   # AI generation APIs (streaming)
│   │   ├── auth/                 # NextAuth routes
│   │   ├── chapters/             # Chapter CRUD
│   │   ├── characters/           # Character management
│   │   ├── lorebook/             # Lorebook CRUD + matching
│   │   ├── projects/             # Project management
│   │   ├── analytics/            # Writing analytics
│   │   ├── prompt-templates/     # Template management
│   │   ├── writing-modes/        # Writing mode management
│   │   ├── user-instructions/    # User instruction management
│   │   └── ...                   # Other API routes
│   ├── agents/                   # Agent UI pages
│   ├── analytics/                # Analytics UI pages
│   ├── characters/               # Character UI pages
│   ├── dashboard/                # Main dashboard
│   ├── editor/[projectId]/       # Main editor interface
│   ├── global/                   # Global character/lorebook views
│   ├── lorebook/                 # Lorebook UI pages
│   ├── globals.css               # Global styles + theme variables
│   ├── layout.tsx                # Root layout with providers
│   └── page.tsx                  # Home page (redirects)
│
├── components/                   # React components
│   ├── agents/                   # Agent UI components (chat, selector)
│   ├── ai/                       # AI-related UI (markdown renderer)
│   ├── analytics/                # Analytics dashboards
│   ├── characters/               # Character management UI
│   ├── dashboard/                # Dashboard components
│   ├── dialogs/                  # Modal dialogs (settings, etc.)
│   ├── editor/                   # Editor components (TipTap, toolbars, etc.)
│   ├── global/                   # Global character/lorebook components
│   ├── lorebook/                 # Lorebook manager
│   ├── providers/                # Context providers (auth, theme)
│   ├── settings/                 # Settings components
│   └── ui/                       # Reusable UI primitives (shadcn/ui)
│
├── lib/                          # Utility libraries
│   ├── agents/                   # Story Agent system
│   │   ├── agents.ts             # Agent implementations (WorldBuilder, CharacterDev, etc.)
│   │   ├── database.ts           # DB tools + context builder (Prisma/in-memory)
│   │   ├── providers.ts          # AI provider abstraction layer
│   │   ├── system-prompts.ts     # Agent system prompts
│   │   ├── executor.ts           # Agent execution logic
│   │   ├── flexible-agent.ts     # Generic agent implementation
│   │   └── README.md             # Agent documentation
│   ├── ai/
│   │   └── client.ts             # AI client utilities (multi-provider)
│   ├── auth/
│   │   └── config.ts             # NextAuth configuration
│   ├── context-builder.ts        # Build AI context from user instructions, lorebook, etc.
│   ├── init-user-defaults.ts     # Initialize default templates/modes for new users
│   ├── lorebook-matcher.ts       # Smart lorebook entry matching algorithm
│   ├── prisma.ts                 # Prisma client singleton
│   ├── story-analysis.ts         # Story analysis utilities (repetition, dialogue, pacing)
│   ├── template-processor.ts     # Process prompt templates with variables
│   └── utils.ts                  # General utilities (cn, etc.)
│
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema (SQLite)
│   ├── seed.ts                   # Seed data (built-in templates, modes, instructions)
│   ├── migrations/               # Migration history
│   ├── dev.db                    # SQLite database file (gitignored)
│   └── dev.db-journal            # SQLite journal (gitignored)
│
├── scripts/                      # Utility scripts
│   ├── agents-cli.ts             # Interactive CLI for testing Story Agents
│   └── agents-test.ts            # Test script for Story Agents
│
├── hooks/                        # Custom React hooks
│   ├── use-readonly-mode.ts      # Readonly mode hook
│   └── use-toast.ts              # Toast notification hook
│
├── types/                        # TypeScript type definitions
│   └── next-auth.d.ts            # NextAuth type extensions
│
├── docs/                         # Documentation
│   └── API.md                    # API endpoint documentation
│
├── sample/                       # Sample data files
│   ├── characters.json
│   ├── lorebook.json
│   └── full-storry.json
│
├── .husky/                       # Git hooks
│   └── pre-commit                # Pre-commit hook (lint-staged + tsc)
│
├── .github/                      # GitHub configuration
│   ├── dependabot.yml            # Dependabot config
│   └── workflows/                # GitHub Actions (if any)
│
├── .env.example                  # Environment variable template
├── .gitignore                    # Git ignore rules
├── .prettierrc.json              # Prettier configuration
├── .prettierignore               # Prettier ignore rules
├── components.json               # shadcn/ui configuration
├── eslint.config.mjs             # ESLint configuration
├── next.config.js                # Next.js configuration
├── next-env.d.ts                 # Next.js TypeScript declarations
├── package.json                  # Dependencies and scripts
├── pnpm-workspace.yaml           # pnpm workspace configuration
├── postcss.config.js             # PostCSS configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── LICENSE                       # MIT License
```

### Key Module Purposes

- **`app/api/*`**: All backend API endpoints (Next.js Route Handlers)
- **`components/*`**: All React components (client & server)
- **`lib/*`**: Business logic, utilities, and integrations
- **`lib/agents/*`**: AI agent system for story assistance
- **`prisma/*`**: Database schema and migrations
- **`scripts/*`**: Development/testing scripts

---

## Running / Deployment Notes

### Environment Variables

**Required** (copy from `.env.example` to `.env`):

```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth (REQUIRED)
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"
NEXTAUTH_URL="http://localhost:3000"  # Change in production

# AI Provider (at least one required)
AI_PROVIDER="gemini"  # Options: gemini | openai | anthropic | deepseek | openrouter
GEMINI_API_KEY="your-gemini-api-key"
# OPENAI_API_KEY="your-openai-api-key"
# ANTHROPIC_API_KEY="your-anthropic-api-key"
# DEEPSEEK_API_KEY="your-deepseek-api-key"
# OPENROUTER_API_KEY="your-openrouter-api-key"

# Optional: Prisma (only for restricted networks)
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
```

### Local Development

1. Clone repository
2. Copy `.env.example` to `.env` and fill in required values
3. Run `pnpm install` (auto-runs Prisma setup)
4. Run `pnpm dev`
5. Visit `http://localhost:3000`
6. Sign up for an account (creates local user in SQLite)

### Production Deployment

**Recommended Platforms**: Vercel, Netlify, Railway, Render

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

#### General Deployment Steps

1. Set all required environment variables
2. Use **PostgreSQL** instead of SQLite for production:
   - Update `DATABASE_URL` in `.env`
   - Change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma`
   - Run `pnpm exec prisma migrate dev` to create migrations
3. Run `pnpm build`
4. Run `pnpm start` (or deploy to platform)

#### Security Headers

Next.js config includes security headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## Special Instructions & Constraints

### 🚫 NEVER CHANGE

1. **Database schema** (`prisma/schema.prisma`) without creating migrations
2. **Authentication logic** in `lib/auth/config.ts` (security-sensitive)
3. **Environment variable names** (breaks deployments)
4. **shadcn/ui component structure** in `components/ui/` (externally managed)
5. **Prisma Client import path** (`@/lib/prisma`) - used everywhere
6. **Next.js App Router structure** (would break routing)

### ⚠️ HANDLE WITH CARE

1. **AI Provider logic** (`lib/ai/client.ts`, `lib/agents/providers.ts`):
   - Multi-provider support is critical
   - Always maintain backward compatibility
   - Test with all supported providers if changing

2. **Context building** (`lib/context-builder.ts`, `lib/lorebook-matcher.ts`):
   - Core feature for AI generation quality
   - Changes affect all AI interactions
   - Maintain token budget logic

3. **Editor components** (`components/editor/tiptap-editor-novelai.tsx`):
   - Complex state management
   - Auto-save logic is delicate
   - TipTap API changes carefully

4. **Database transactions**:
   - Always use Prisma transactions for multi-step operations
   - Handle errors gracefully (don't leave partial state)

5. **Type definitions** (`types/next-auth.d.ts`):
   - Must match actual session data structure

### ✅ BEST PRACTICES

1. **API Routes**:
   - Always check authentication: `const session = await getServerSession(authOptions)`
   - Return consistent error format: `{ error: "Message" }`
   - Use appropriate HTTP status codes (400, 401, 404, 500)
   - Stream AI responses using Server-Sent Events

2. **Database Queries**:
   - Always filter by `userId` to prevent data leaks
   - Use `onDelete: Cascade` for parent-child relationships
   - Index frequently queried fields

3. **AI Generation**:
   - Respect token budgets (context window limits)
   - Build context hierarchically: system prompt → user instructions → lorebook → scene
   - Use streaming for better UX
   - Handle API errors gracefully (fallback behavior)

4. **Component Design**:
   - Keep components small and focused
   - Extract repeated logic to hooks
   - Use TypeScript interfaces for props
   - Memoize expensive computations

5. **Error Handling**:
   - Log errors to console (no error tracking service currently)
   - Show user-friendly error messages
   - Don't expose sensitive information in error messages

### 🔒 SECURITY

1. **API Keys**:
   - Never commit to git (in `.gitignore`)
   - Store in environment variables only
   - Validate presence before use

2. **User Data**:
   - Always check ownership before CRUD operations
   - Use `userId` filter in all queries
   - Sanitize user input (especially AI prompts)

3. **Authentication**:
   - JWT tokens stored in httpOnly cookies (NextAuth handles this)
   - Passwords hashed with bcrypt (12 rounds)
   - No password reset flow implemented yet (TODO)

### 📦 DEPENDENCIES

- **Critical**: Next.js, React, Prisma, NextAuth, Tailwind
- **AI Providers**: OpenAI, Anthropic, Google Generative AI (SDKs)
- **Do not remove** without checking usage across codebase
- Keep dependencies updated via Dependabot (configured in `.github/dependabot.yml`)

### 🐛 KNOWN ISSUES / TODOs

1. **Character selection in editor** (`components/editor/tiptap-editor-novelai.tsx:229`):
   - TODO: Add character selection for context
   - Currently hardcoded to `false`

2. **No test suite**:
   - Jest/Vitest not configured
   - Only manual testing via `agents:test` script

3. **SQLite limitations**:
   - Single-user performance is fine
   - Use PostgreSQL for production multi-user scenarios

4. **No real-time collaboration**:
   - Single-user per project currently

5. **No password reset flow**:
   - Users must manage passwords carefully

### 📊 PERFORMANCE CONSIDERATIONS

1. **Database**:
   - SQLite is fast for single-user
   - Index heavy query fields (already done in schema)
   - Use `select` to limit returned fields

2. **AI Generation**:
   - Streaming prevents long waits
   - Context building can be expensive (cache where possible)
   - Token limits prevent runaway costs

3. **Client-side**:
   - Turbopack enabled for fast dev HMR
   - Next.js Image optimization configured
   - Code splitting via dynamic imports where needed

### 🧪 TESTING RECOMMENDATIONS

When making changes:

1. **Run type checking**: `pnpm exec tsc --noEmit`
2. **Test affected API routes** via:
   - Browser (manual testing)
   - Thunder Client / Postman
   - `curl` commands
3. **Test AI generation** with all providers you have keys for
4. **Test database changes** with Prisma Studio: `pnpm exec prisma studio`
5. **Check editor functionality** (save, generate, undo/redo)
6. **Verify authentication flow** (login, logout, session persistence)

### 📚 EXTERNAL RESOURCES

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **TipTap Docs**: https://tiptap.dev/docs
- **Radix UI Docs**: https://www.radix-ui.com/primitives/docs/overview/introduction
- **Tailwind Docs**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **AI Provider Docs**: OpenAI, Anthropic, Google AI docs

---

## Summary for AI Agents

**What this repo is**: Full-stack Next.js app for AI-assisted creative writing with rich features (editor, lorebook, agents, analytics).

**Key technologies**: Next.js 16, React, TypeScript, Prisma (SQLite), NextAuth, TipTap, Tailwind, Multiple AI providers.

**How to run**: `pnpm install` → `pnpm dev` → http://localhost:3000

**How to build**: `pnpm build` → `pnpm start`

**Code style**: TypeScript strict, no semicolons, single quotes, Prettier formatting, ESLint validation.

**Architecture**: Next.js App Router (Server/Client Components), API Routes, Prisma ORM, JWT auth, streaming AI responses.

**Be careful with**: Database schema, auth logic, AI provider code, editor state management.

**Testing**: Pre-commit hooks (lint + type check), manual testing, no formal test suite.

**Documentation**: See `docs/API.md` for API reference, `lib/agents/README.md` for agent system.

**🚨 REMEMBER**: Always update AGENTS.md, API.md, and README.md when making code changes. Documentation is as important as code!

---

**End of AGENTS.md**
