# Project Assist

An AI-powered project assistance platform that helps users explore ideas through structured brainstorming techniques, multi-agent coordination, and intelligent analysis.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.17.1-2D3748)](https://prisma.io/)
[![ADK-TS](https://img.shields.io/badge/ADK--TS-0.4.0-green)](https://github.com/iqai/adk-ts)

## Overview

Project Assist is a sophisticated AI-powered platform that revolutionizes how teams approach project ideation and planning. By leveraging a coordinated team of specialized AI agents, it provides structured brainstorming, intelligent analysis, and comprehensive project guidance.

### Key Features

- **Multi-Agent Intelligence**: Coordinated team of 6 specialized AI agents working together
- **Structured Brainstorming**: SCAMPER, Six Thinking Hats, Mind Mapping, and Rolestorming techniques
- **Intelligent Analysis**: LLM-based idea clustering, scoring, and prioritization
- **Session Management**: Persistent discovery sessions with full progress tracking
- **Report Generation**: Comprehensive project reports with actionable insights
- **Secure Authentication**: OAuth integration with Google and GitHub
- **Modern UI**: Responsive, accessible interface with dark/light themes
- **Discord Integration**: Bot interface for seamless team collaboration

## Architecture

Project Assist uses a multi-agent architecture with 6 specialized AI agents working together:

- **Discovery Coordinator** - Orchestrates the entire discovery process
- **Analyst Agent** - Analyzes problems and identifies key challenges  
- **Brain Agent** - Facilitates brainstorming using creative techniques
- **PM Agent** - Prioritizes ideas and creates project recommendations
- **Architect Agent** - Provides technical architecture guidance
- **Validator Agent** - Ensures quality and validates feasibility

The system includes Discord bot integration for team collaboration, with account linking via verification codes and shared session persistence.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API Routes, ADK-TS, Prisma ORM, PostgreSQL
- **AI**: OpenAI GPT, Google Gemini, Anthropic Claude
- **Auth**: NextAuth.js v5 with Google/GitHub OAuth
- **Deployment**: Vercel with Google Cloud Storage

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your `.env.local` with database URL, OAuth credentials, and LLM API keys.

3. **Set up the database**
   ```bash
   npm run db:migrate
   npm run db:generate
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser** at [http://localhost:3000](http://localhost:3000)

## Discord Bot Setup (Optional)

1. **Create Discord Application** at [Discord Developer Portal](https://discord.com/developers/applications)
2. **Add `DISCORD_TOKEN`** to your `.env.local` file
3. **Start the bot**: `npm run bot:dev`
4. **Link your account**: Visit `/discord/link` and use `@link` command in Discord

### Bot Commands
- `@help` - Show available commands
- `@brainstorm` - Start brainstorming session
- `@analyst` - Start business analysis
- `@pm` - Start project management
- `@architect` - Start technical architecture
- `@validator` - Start validation session



## Usage

1. **Sign in** using Google or GitHub OAuth
2. **Navigate to Discovery** from the dashboard
3. **Enter your problem statement** or challenge you want to explore
4. **Follow the guided process** through discovery phases:
   - Problem Analysis - Understanding the challenge
   - Brainstorming - Generating creative ideas using SCAMPER, Six Thinking Hats, Mind Mapping, and Rolestorming
   - Idea Prioritization - Scoring and ranking ideas
   - Architecture Planning - Technical design and planning
   - Validation - Risk assessment and feasibility analysis
5. **Generate and download** your comprehensive discovery report

### Session Management
- **Dashboard** - View all discovery sessions with status and progress
- **Resume Sessions** - Continue where you left off with full context preservation
- **Export Reports** - Download reports in multiple formats
- **Session History** - Access and manage previous sessions
- **Team Collaboration** - Share sessions via Discord integration

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run bot:dev` - Start Discord bot in development mode

### Testing
```bash
npm run test:session
```
Tests the complete session lifecycle including database connection, session creation, and report generation.

## Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically

### Production Setup
- Use production PostgreSQL database (Vercel Postgres, Neon, Supabase)
- Set secure `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
- Configure OAuth redirect URLs for your production domain
- Enable Redis for session storage
- Use HTTPS and configure CORS properly

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following TypeScript best practices
4. Test your changes thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request with a clear description

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

