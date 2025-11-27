# Inkwell ✍️

An AI-assisted creative writing application built with Next.js 16, designed to help authors craft compelling stories with intelligent AI support.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748)

## ✨ Features

### 📝 Writing Experience

- **Rich Text Editor**: TipTap-based editor with NovelAI-inspired interface
- **Distraction-Free Mode**: Clean, focused writing environment
- **Auto-Save**: Never lose your work with automatic saving
- **Multiple Themes**: 7 beautiful themes (light, dark, sepia, novelai, midnight, nord, forest)

### 🤖 AI-Powered Tools

- **Multi-Provider Support**: OpenAI, Anthropic (Claude), Google Gemini, DeepSeek, OpenRouter
- **Context-Aware Generation**: Smart context building from your story elements
- **Story Agents**: Specialized AI assistants for:
  - World-building
  - Character development
  - Plot planning
  - Scene crafting
  - Dialogue enhancement
- **Character Chat**: Have conversations with your characters
- **Prompt Templates**: Customizable templates for different writing actions

### 📚 Story Management

- **Project Organization**: Multi-project support with chapters
- **Character Profiles**: Detailed character management with avatars, traits, relationships, and arcs
- **Lorebook System**: Smart context injection with keyword matching and priority-based triggering
- **Global Characters & Lorebook**: Share elements across multiple projects
- **Version Control**: Branch and explore alternative story paths

### 📊 Analytics & Tracking

- **Writing Statistics**: Track words written, sessions, and streaks
- **Chapter Pacing Analysis**: Visualize your story's structure
- **Story Analysis**: Detect repetition, dialogue balance, and pacing issues
- **Pomodoro Timer**: Stay focused with built-in time management
- **Writing Goals**: Set daily, weekly, or project-based goals

### 🎨 Customization

- **Writing Modes**: Context-aware styles and tones
- **User Instructions**: Custom AI behavior at global, project, or character level
- **Configurable AI Models**: Use your own API keys and custom endpoints

### 📤 Import/Export

- **Export Formats**: TXT, Markdown, DOCX (RTF)
- **Import Support**: TXT and Markdown files with automatic chapter detection

## 🚀 Quick Start

### Prerequisites

- **Node.js** (see `package.json` for version)
- **pnpm** (required package manager)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Silversoul-07/Inkwell.git
   cd Inkwell
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

   This automatically sets up Prisma and creates the database.

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your configuration:

   ```bash
   # Required
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"
   NEXTAUTH_URL="http://localhost:3000"

   # AI Provider (at least one required)
   AI_PROVIDER="gemini"  # or openai, anthropic, deepseek, openrouter
   GEMINI_API_KEY="your-api-key-here"
   ```

4. **Run development server**

   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, React Server Components)
- **Language**: TypeScript 5.9
- **Database**: Prisma ORM with SQLite (PostgreSQL recommended for production)
- **Authentication**: NextAuth.js with JWT sessions
- **Styling**: Tailwind CSS 3.4 with custom theme system
- **UI Components**: Radix UI + shadcn/ui
- **Editor**: TipTap rich text editor
- **AI Integration**: OpenAI, Anthropic, Google Generative AI SDKs

## 📖 Documentation

- **[API Documentation](docs/API.md)**: Complete API reference
- **[Agents Documentation](lib/agents/README.md)**: Story agents system guide
- **[AGENTS.md](AGENTS.md)**: Comprehensive AI agent instructions

## 🎯 Usage

### Creating Your First Project

1. **Sign up** for an account
2. **Create a new project** from the dashboard
3. **Start writing** in the editor
4. **Use AI features** to enhance your writing:
   - Select text and use quick actions (continue, describe, dialogue)
   - Chat with story agents for brainstorming
   - Add characters and lorebook entries for context

### Working with Story Agents

Story agents are specialized AI assistants that help with different aspects of writing:

```bash
# Try the interactive CLI
pnpm agents:cli

# Run agent tests
pnpm agents:test
```

Available agents:

- **World Builder**: Develop settings, cultures, and magic systems
- **Character Developer**: Create rich, complex characters
- **Plot Planner**: Structure your narrative and plot points
- **Scene Crafter**: Craft engaging scenes with proper pacing
- **Dialogue Master**: Write natural, character-specific dialogue

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server with Turbopack
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm prisma generate  # Generate Prisma Client
pnpm prisma studio    # Open database GUI
pnpm prisma db push   # Push schema changes

# Agents
pnpm agents:cli       # Interactive agent CLI
pnpm agents:test      # Test agent functionality

# Code Quality
pnpm lint             # Lint code
pnpm exec tsc --noEmit  # Type check

# Bundle Analysis
pnpm analyze          # Analyze bundle size
```

### Project Structure

```
Inkwell/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── editor/            # Editor interface
│   ├── agents/            # Agent UI
│   └── ...
├── components/            # React components
│   ├── editor/           # Editor components
│   ├── agents/           # Agent components
│   └── ui/               # UI primitives
├── lib/                   # Utilities & business logic
│   ├── agents/           # Story agent system
│   ├── ai/               # AI client utilities
│   └── auth/             # Authentication config
├── prisma/                # Database schema & migrations
├── docs/                  # Documentation
└── scripts/               # Utility scripts
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
2. **Import project** in Vercel
3. **Add environment variables** in Vercel dashboard
4. **Deploy**

### Production Considerations

- **Use PostgreSQL** instead of SQLite for production
- **Set all environment variables** (especially `NEXTAUTH_SECRET`)
- **Enable security headers** (already configured in `next.config.js`)
- **Use a CDN** for static assets

Update `prisma/schema.prisma` for PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then run migrations:

```bash
pnpm prisma migrate dev
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

### Code Style

- **TypeScript strict mode** enabled
- **No semicolons** (Prettier configured)
- **Single quotes** for strings
- **2-space indentation**
- Run `pnpm lint` before committing

Pre-commit hooks automatically:

- Format code with Prettier
- Lint with ESLint
- Type check with TypeScript

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Made with ❤️ for writers by writers**
