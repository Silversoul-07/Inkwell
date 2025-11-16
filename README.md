# Inkwell

A minimal, open-source story writing application with AI assistance. Built with Next.js, this is a distraction-free creative writing tool inspired by OpenAI Canvas, designed for novelists, screenwriters, and creative writers.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)

## Features

### Phase 2: AI Enhancement ✨ NEW

**Advanced AI Features:**
- **Continue Writing** - AI generates the next paragraph naturally
- **Quick Actions** - Rephrase, Expand, Shorten, Fix Grammar for selected text
- **Alternative Generation** - Get 3 different variations to choose from
- **AI Chat Panel** - Side panel assistant for plot ideas, character development, and writing advice
- **Streaming Responses** - See AI text generate in real-time
- **AI-Generated Highlighting** - Visual indicators for AI-generated content with dismiss option

### Phase 1: Foundation (MVP)

### ✍️ Writing Environment
- **Tiptap Editor** - Rich text editor with ProseMirror foundation
- **Zen Mode** - Distraction-free fullscreen writing
- **Theme System** - Light, Dark, and Sepia themes for comfortable writing
- **Writer-Friendly Fonts** - Merriweather serif, Inter sans-serif, and more
- **Auto-save** - Configurable auto-save (default: every 30 seconds)
- **Live Word Count** - Real-time word count display

### 📚 Project Management
- **Multiple Projects** - Organize different stories and works
- **Chapter Structure** - Hierarchical organization with chapters and scenes
- **Scene Navigation** - Quick switching between scenes
- **Project Overview** - See total word count and chapter count

### 🤖 AI Integration
- **Flexible API Support** - Works with OpenAI, Anthropic, Groq, Ollama, or any OpenAI-compatible API
- **Bring Your Own Key** - Users provide their own API keys
- **Customizable Settings** - Configure model, temperature, max tokens
- **Test Connection** - Verify API settings before use

### 🔐 Authentication
- **Secure Login** - NextAuth.js with credentials provider
- **User Accounts** - Each user has their own private workspace
- **Password Protection** - Bcrypt-hashed passwords

### 🎨 Design
- **Clean UI** - Minimal, distraction-free interface
- **Responsive** - Works on desktop and tablet
- **Shadcn/ui Components** - Beautiful, accessible UI components
- **Smooth Animations** - Polished transitions and interactions

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/ui (Radix UI)
- **Database:** SQLite with Prisma ORM
- **Authentication:** NextAuth.js
- **Editor:** Tiptap (ProseMirror)
- **State Management:** React Context & Zustand

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/inkwell.git
   cd inkwell
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"

   # NextAuth
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"

   # Prisma (for development environments with network restrictions)
   PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
   ```

4. **Initialize the database**
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Create and seed the database
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### First Time Setup

1. Click "Sign up" on the login page
2. Create your account
3. Go to Settings (gear icon) to configure your AI provider
4. Add your API key and endpoint
5. Test the connection
6. Start writing!

## Usage

### Creating a Project

1. From the dashboard, click "New Project"
2. Enter a title and optional description
3. Click "Create Project"
4. You'll be taken to the editor with a default Chapter 1

### Writing

- Type directly in the editor
- Your work auto-saves every 30 seconds (configurable in settings)
- Word count updates in real-time
- Use Zen Mode for distraction-free writing (press Escape to exit)

### Organizing Your Story

- Use the sidebar to navigate between chapters and scenes
- Click chapter names to expand/collapse
- Click scenes to switch between them
- Create new chapters with the + button

### AI Settings

1. Go to Settings → AI Settings
2. Configure your provider (OpenAI, Anthropic, etc.)
3. Enter your API endpoint and key
4. Choose your model (gpt-4, claude-3-5-sonnet, etc.)
5. Adjust temperature and max tokens
6. Test the connection
7. Save settings

### Editor Preferences

1. Go to Settings → Editor Preferences
2. Choose your font (Serif, Sans-serif, or Monospace)
3. Adjust font size (12-32px)
4. Set line height (1.0-3.0)
5. Configure editor width (30-80rem)
6. Set auto-save interval (10-300 seconds)

### Using AI Features

**Continue Writing:**
1. Place your cursor where you want to continue
2. Click the "Continue" button in the AI toolbar
3. Watch as AI generates the next paragraph in real-time

**Quick Actions:**
1. Select the text you want to modify
2. Click "Quick Actions" dropdown
3. Choose: Rephrase, Expand, Shorten, or Fix Grammar
4. The AI will replace your selection with the improved version

**Generate Alternatives:**
1. Select any text
2. Click "Alternatives"
3. AI generates 3 different versions
4. Choose the one you like best

**AI Chat Assistant:**
1. Click "AI Chat" to open the side panel
2. Ask questions about your story, characters, plot, etc.
3. Get instant feedback and suggestions
4. Use it for brainstorming and overcoming writer's block

## Database Schema

The application uses the following main models:

- **User** - User accounts and authentication
- **Settings** - User preferences and AI configuration
- **Project** - Writing projects
- **Chapter** - Story chapters (ordered)
- **Scene** - Individual scenes within chapters
- **Version** - (Future) Version history and branching

## Roadmap

### Phase 2.5: Advanced Features (Coming Soon)
- Inline AI suggestions (GitHub Copilot style)
- Version branching and tree visualization
- Enhanced context management with pinning
- Context budget indicator
- Undo/redo history system
- Memory compaction and summarization

### Phase 3: World Building
- Character management system
- Lorebook/world info entries
- Character chat interface
- Relationship mapping
- Consistency checker

### Phase 4: Writing Tools
- Analytics dashboard
- Writing goals and streaks
- Story analysis
- Writing prompts
- AI-powered research

### Phase 5: Export & Polish
- Export to DOCX, EPUB, PDF
- Import from existing files
- Advanced UI polish
- Comprehensive keyboard shortcuts
- Onboarding tutorial

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Privacy & Security

- All data is stored locally in your SQLite database
- API keys are stored in your local database (consider encrypting in production)
- No data is sent to external services except your configured AI provider
- This is a self-hosted application - you control your data

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/inkwell/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Shadcn/ui](https://ui.shadcn.com/)
- Editor powered by [Tiptap](https://tiptap.dev/)
- Inspired by [OpenAI Canvas](https://openai.com/canvas/)

---

**Happy Writing! ✨**