# Project Overview

Inkwell is a minimal, open-source AI-assisted story writing application inspired by OpenAI Canvas.
Built with Next.js 15, it provides novelists, screenwriters, and creative writers a distraction-free
environment with AI-powered assistance, version control, character management, lorebook/world-building,
and comprehensive writing analytics.

## Repository Structure

- `app/` — Next.js 15 App Router pages and API routes
  - `(auth)/` — Authentication pages (login, signup)
  - `api/` — Backend REST endpoints (ai, projects, chapters, scenes, characters, lorebook, etc.)
  - `editor/[projectId]/` — Main editor page with sidebars and AI canvas
  - `dashboard/` — Project listing and overview
- `components/` — React components organized by feature (editor, ai, characters, lorebook, ui)
- `lib/` — Utility libraries (Prisma client, AI agents, context builder, token counter)
- `hooks/` — Custom React hooks (use-mobile, use-toast)
- `prisma/` — Database schema, migrations, and SQLite database
- `types/` — TypeScript type definitions
- `public/` — Static assets

## Build & Development Commands

```bash
# Install dependencies (pnpm preferred)
pnpm install
# or
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Start development server (Turbopack enabled)
pnpm dev
# or
npm run dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Dead code detection
npx knip
```

**Required environment variables** (copy `.env.example` to `.env`):

```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## Code Style & Conventions

- **Language:** TypeScript with strict mode enabled
- **Formatting:** Prettier defaults (2-space indent, no semicolons in some files)
- **Naming:**
  - Components: PascalCase (`EditorToolbar.tsx`)
  - Utilities: camelCase (`contextBuilder.ts`)
  - API routes: kebab-case directories
- **Imports:** Path alias `@/*` maps to project root
- **Linting:** ESLint with `next/core-web-vitals` config
- **Components:** Prefer Shadcn/ui primitives from `components/ui/`
- **Commit messages:** Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`)

## Architecture Notes

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Next.js App Router                          │
├─────────────┬─────────────┬─────────────┬─────────────┬────────────┤
│  Dashboard  │   Editor    │  Characters │  Lorebook   │  Settings  │
└──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────┴─────┬──────┘
       │             │             │             │            │
       └─────────────┴─────────────┴─────────────┴────────────┘
                                   │
                          ┌────────┴────────┐
                          │   API Routes    │
                          │  /api/*         │
                          └────────┬────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
      ┌───────┴───────┐    ┌───────┴───────┐    ┌──────┴──────┐
      │  Prisma ORM   │    │  LlamaIndex   │    │   NextAuth  │
      │   (SQLite)    │    │   Agents      │    │   Sessions  │
      └───────────────┘    └───────────────┘    └─────────────┘
```

**Data Flow:**

1. User authenticates via NextAuth (credentials provider)
2. React components fetch data through API routes
3. Prisma ORM handles database operations (SQLite)
4. AI features use LlamaIndex agents with configurable providers (OpenAI, Anthropic, Groq, Ollama)
5. Editor uses Tiptap (ProseMirror) for rich text editing with custom extensions

**Key Models:** User → Projects → Chapters → Scenes (with Versions), Characters, LorebookEntries

## Testing Strategy

> TODO: No test framework currently configured.

**Recommended setup:**

- Unit tests: Jest + React Testing Library
- E2E tests: Playwright or Cypress
- API tests: Supertest

**Current quality tools:**

```bash
pnpm lint          # ESLint
npx knip           # Dead code detection
```

## Security & Compliance

- **Authentication:** NextAuth.js with bcrypt password hashing
- **Sessions:** HTTP-only cookies, server-side validation
- **Secrets:** Store in `.env` (never commit); see `.env.example`
- **Database:** SQLite file (`prisma/dev.db`) — exclude from version control
- **API:** All routes require session authentication except `/api/auth/*`
- **License:** > TODO: Add LICENSE file

**Guardrails:**

- Server actions limited to 2MB payload
- Prisma client singleton prevents connection exhaustion

## Agent Guardrails

When automated agents work on this repository:

1. **Never modify:**
   - `prisma/dev.db` — User data
   - `.env` — Contains secrets
   - `pnpm-lock.yaml` — Only update via `pnpm install`

2. **Require human review:**
   - Changes to `prisma/schema.prisma` (may require migrations)
   - Changes to `lib/auth/config.ts` (security-critical)
   - New dependencies in `package.json`

3. **Safe operations:**
   - Editing components in `components/`
   - Adding/modifying API routes in `app/api/`
   - Updating styles in `tailwind.config.ts`

4. **Before committing:**
   - Run `pnpm lint` and fix errors
   - Run `npx prisma generate` if schema changed
   - Test affected features manually

## Extensibility Hooks

- **AI Providers:** Configure via Settings page or `AIModel` database entries
  - Supports: OpenAI, Anthropic, Groq, Ollama, custom endpoints
- **Writing Modes:** Create custom modes via `/api/writing-modes`
- **Prompt Templates:** User-defined templates with variable substitution
- **Lorebook Injection:** Smart context injection based on content matching
- **Tiptap Extensions:** Add custom editor extensions in `lib/tiptap/`
- **Theme:** CSS variables in `tailwind.config.ts` (light, dark, sepia)

**Environment variables:**

- `DATABASE_URL` — Database connection string
- `NEXTAUTH_SECRET` — Session encryption key
- `NEXTAUTH_URL` — Application URL

## Further Reading

- [README.md](./README.md) — Project overview, features, and quick start
- [TODO.md](./TODO.md) — Current development tasks
- [prisma/schema.prisma](./prisma/schema.prisma) — Database schema reference
- [.env.example](./.env.example) — Environment variable documentation
