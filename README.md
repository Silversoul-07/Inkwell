# Inkwell

A minimal, open-source AI-assisted story writing application inspired by OpenAI Canvas.

Built for novelists, screenwriters, and creative writers who need a distraction-free environment
with intelligent writing assistance.

## Features

**Writing & Editing**
- Rich text editor powered by Tiptap
- Chapter and scene organization
- Version branching and history
- Zen mode for distraction-free writing
- Auto-save with configurable intervals

**AI Assistance**
- Multi-provider support (OpenAI, Anthropic, Groq, Ollama)
- Context-aware text generation
- Character conversations
- Agentic AI with specialized agents (world-building, character development, story planning)

**World Building**
- Character profiles with personality and relationships
- Lorebook entries with smart context injection
- Custom writing modes and prompt templates

**Analytics**
- Writing session tracking
- Word count goals (daily, weekly, project)
- Pomodoro timer integration
- Story analysis tools

## Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Language:** TypeScript
- **Database:** SQLite with Prisma ORM
- **Editor:** Tiptap (ProseMirror)
- **AI:** LlamaIndex agents
- **Auth:** NextAuth.js
- **Styling:** Tailwind CSS + Shadcn/ui

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/inkwell.git
cd inkwell

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your NEXTAUTH_SECRET

# Initialize database
npx prisma generate
npx prisma db push

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | SQLite database path | Yes |
| `NEXTAUTH_SECRET` | Session encryption key | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |

## Project Structure

```
app/
├── (auth)/          # Login and signup pages
├── api/             # REST API endpoints
├── dashboard/       # Project listing
├── editor/          # Main writing interface
├── characters/      # Character management
├── lorebook/        # World-building entries
└── settings/        # User preferences

components/          # React components
lib/                 # Utilities and business logic
prisma/              # Database schema and migrations
```

## Scripts

```bash
pnpm dev       # Start dev server with Turbopack
pnpm build     # Build for production
pnpm start     # Start production server
pnpm lint      # Run ESLint
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
