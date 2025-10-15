# Project Assist

> An AI-powered project assistance platform that helps users explore ideas through structured brainstorming techniques, multi-agent coordination, and intelligent analysis.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.17.1-2D3748)](https://prisma.io/)
[![ADK-TS](https://img.shields.io/badge/ADK--TS-0.4.0-green)](https://github.com/iqai/adk-ts)

## 🚀 Overview

Project Assist is a sophisticated AI-powered platform that revolutionizes how teams approach project ideation and planning. By leveraging a coordinated team of specialized AI agents, it provides structured brainstorming, intelligent analysis, and comprehensive project guidance.

### Key Capabilities

- **🧠 Multi-Agent Intelligence**: Coordinated team of 6 specialized AI agents working together
- **🎯 Structured Brainstorming**: SCAMPER, Six Thinking Hats, Mind Mapping, and Rolestorming techniques
- **📊 Intelligent Analysis**: LLM-based idea clustering, scoring, and prioritization
- **💾 Session Management**: Persistent discovery sessions with full progress tracking
- **📋 Report Generation**: Comprehensive project reports with actionable insights
- **🔐 Secure Authentication**: OAuth integration with Google and GitHub
- **🎨 Modern UI**: Responsive, accessible interface with dark/light themes

## 🏗️ Architecture

### Multi-Agent System

The platform uses a sophisticated multi-agent architecture where specialized AI agents collaborate:

```mermaid
graph TD
    A[User Input] --> B[Discovery Coordinator]
    B --> C[Analyst Agent]
    B --> D[Brain Agent]
    B --> E[PM Agent]
    B --> F[Architect Agent]
    B --> G[Validator Agent]
    
    C --> H[Problem Analysis]
    D --> I[Creative Brainstorming]
    E --> J[Idea Prioritization]
    F --> K[Technical Architecture]
    G --> L[Risk Assessment]
    
    H --> M[Session Storage]
    I --> M
    J --> M
    K --> M
    L --> M
    
    M --> N[Report Generation]
```

### Agent Specializations

| Agent | Role | Responsibilities |
|-------|------|------------------|
| **Discovery Coordinator** | Orchestrator | Manages the entire discovery process and agent coordination |
| **Analyst Agent** | Problem Solver | Analyzes problems, provides context, and identifies key challenges |
| **Brain Agent** | Creative Facilitator | Facilitates brainstorming using various creative techniques |
| **PM Agent** | Project Manager | Prioritizes ideas and creates actionable project recommendations |
| **Architect Agent** | Technical Lead | Provides technical architecture guidance and system design |
| **Validator Agent** | Quality Assurance | Ensures quality, identifies risks, and validates feasibility |

### System Architecture

```mermaid
graph LR
    A[Next.js Frontend] --> B[API Routes]
    B --> C[ADK-TS Framework]
    C --> D[AI Agents]
    C --> E[Session Management]
    C --> F[Memory Service]
    
    E --> G[PostgreSQL]
    F --> H[Redis]
    
    I[OAuth Providers] --> B
    J[LLM APIs] --> D
    
    K[Google Cloud Storage] --> L[Artifacts]
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **NextAuth.js v5** - Authentication framework

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **ADK-TS** - Agent Development Kit for TypeScript
- **Prisma ORM** - Database toolkit and query builder
- **PostgreSQL** - Primary database
- **Redis** - Session and memory storage

### AI & LLM Integration
- **OpenAI GPT** - Primary language model
- **Google Gemini** - Alternative language model
- **Anthropic Claude** - Additional language model support

### Infrastructure
- **Docker** - Containerization
- **Vercel** - Deployment platform
- **Google Cloud Storage** - File and artifact storage

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API endpoints
│   │   ├── auth/                 # Authentication routes
│   │   ├── session/              # Session management
│   │   ├── report/               # Report generation
│   │   └── health/               # Health checks
│   ├── agents/                   # AI agent definitions
│   │   ├── discovery-coordinator.ts
│   │   ├── analyst-agent.ts
│   │   ├── brain-agent.ts
│   │   ├── pm-agent.ts
│   │   ├── architect-agent.ts
│   │   └── validator-agent.ts
│   ├── components/               # React components
│   │   ├── Navigation.tsx
│   │   ├── Providers.tsx
│   │   └── ui/                   # Reusable UI components
│   ├── config/                   # Configuration files
│   │   ├── adk.ts               # ADK-TS configuration
│   │   ├── auth.ts              # Authentication config
│   │   ├── db.ts                # Database configuration
│   │   └── llm.ts               # LLM configuration
│   ├── discovery/                # Main discovery interface
│   ├── dashboard/                # User dashboard
│   ├── auth/                     # Authentication pages
│   └── tools/                    # Agent tools and techniques
│       ├── analysis/             # Analysis tools
│       ├── brainstorming/        # Brainstorming techniques
│       ├── architecture/         # Architecture tools
│       ├── validation/           # Validation tools
│       └── output/               # Report generation
├── sessions/                     # Session management logic
├── types/                        # TypeScript definitions
└── generated/                    # Generated Prisma client
```

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** - JavaScript runtime
- **PostgreSQL** - Database server
- **Redis** (optional) - For production memory storage
- **API Keys** - At least one LLM provider (OpenAI, Gemini, or Anthropic)
- **OAuth Apps** - Google and/or GitHub OAuth applications

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project_assist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your `.env.local`:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/project_assist"
   
   # Authentication
   NEXTAUTH_SECRET="your-secret-key-min-32-chars"
   NEXTAUTH_URL="http://localhost:3000"
   
   # OAuth Providers
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   
   # LLM APIs (at least one required)
   OPENAI_API_KEY="your-openai-api-key"
   GEMINI_API_KEY="your-gemini-api-key"
   ANTHROPIC_API_KEY="your-anthropic-api-key"
   
   # Optional: Redis for production
   REDIS_URL="redis://localhost:6379"
   ```

4. **Set up the database**
   ```bash
   npm run db:migrate
   npm run db:generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ | - |
| `NEXTAUTH_SECRET` | NextAuth.js secret (min 32 chars) | ✅ | - |
| `NEXTAUTH_URL` | Base URL of your application | ✅ | - |
| `OPENAI_API_KEY` | OpenAI API key | ⚠️* | - |
| `GEMINI_API_KEY` | Google Gemini API key | ⚠️* | - |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | ⚠️* | - |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ✅ | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | ✅ | - |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | ✅ | - |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | ✅ | - |
| `REDIS_URL` | Redis connection string | ❌ | - |
| `GCS_BUCKET_NAME` | Google Cloud Storage bucket | ❌ | - |
| `GOOGLE_APPLICATION_CREDENTIALS` | GCS service account JSON | ❌ | - |

*At least one LLM API key is required.

## 💡 Usage

### Starting a Discovery Session

1. **Sign in** using Google or GitHub OAuth
2. **Navigate to Discovery** from the dashboard
3. **Enter your problem statement** or challenge you want to explore
4. **Follow the guided process** through each discovery phase:
   - **Problem Analysis** - Understanding the challenge
   - **Brainstorming** - Generating creative ideas using selected techniques
   - **Idea Prioritization** - Scoring and ranking ideas
   - **Architecture Planning** - Technical design and planning
   - **Validation** - Risk assessment and feasibility analysis
5. **Generate and download** your comprehensive discovery report

### Available Brainstorming Techniques

#### SCAMPER
Systematic creative thinking framework:
- **S**ubstitute - What can be replaced?
- **C**ombine - What can be merged?
- **A**dapt - What can be adjusted?
- **M**odify - What can be changed?
- **P**ut to other use - Alternative applications?
- **E**liminate - What can be removed?
- **R**everse - What can be inverted?

#### Six Thinking Hats
Multi-perspective analysis:
- **White Hat** - Facts and information
- **Red Hat** - Emotions and feelings
- **Black Hat** - Critical thinking and risks
- **Yellow Hat** - Optimism and benefits
- **Green Hat** - Creativity and alternatives
- **Blue Hat** - Process control and organization

#### Mind Mapping
Visual idea organization and exploration of connections between concepts.

#### Rolestorming
Perspective-taking from different stakeholder roles (customer, developer, manager, etc.).

### Session Management

- **Dashboard** - View all your discovery sessions with status and progress
- **Resume Sessions** - Continue where you left off with full context preservation
- **Export Reports** - Download comprehensive discovery reports in multiple formats
- **Progress Tracking** - Visual phase progression and completion status

## 🔧 Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production with Prisma generation |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint for code quality |
| `npm run db:migrate` | Run database migrations |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:studio` | Open Prisma Studio for database management |

### Testing

Test the session lifecycle without the UI:

```bash
npm run test:session
```

This comprehensive test will:
- Test database connection
- Create a sample discovery session
- Run through all phases with mock data
- Generate a complete report
- Clean up test data

### Database Schema

The system uses PostgreSQL with the following main entities:

#### Core Entities
- **Users** - OAuth-authenticated users with profile information
- **DiscoverySessions** - Individual discovery sessions with metadata
- **AgentSessions** - ADK-TS agent session management
- **Messages** - Chat history and agent communications

#### Discovery Data
- **Ideas** - Generated ideas with scoring and metadata
- **IdeaClusters** - Thematic groupings of related ideas
- **IdeaClusterMemberships** - Many-to-many relationships between ideas and clusters
- **Recommendations** - Actionable next steps and project guidance

#### System Data
- **Artifacts** - Generated reports, files, and documents
- **AgentMemory** - Persistent memory for AI agents
- **Tools** - Available agent tools and their configurations
- **ToolUsage** - Usage tracking and analytics

### API Endpoints

#### Authentication
- `POST /api/auth/signin` - OAuth sign-in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get current session

#### Sessions
- `POST /api/session/start` - Start new discovery session
- `POST /api/session/continue` - Continue existing session
- `GET /api/session/[id]/messages` - Get session messages
- `POST /api/session/[id]/message` - Send message to session

#### Data Management
- `GET /api/session/[id]/ideas` - Get session ideas
- `GET /api/session/[id]/clusters` - Get idea clusters
- `GET /api/sessions` - Get user's sessions

#### Reports
- `GET /api/report/[sessionId]` - Get session report
- `GET /api/report/[sessionId]/download` - Download report file

#### Health
- `GET /api/health` - System health check

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Docker Deployment

```bash
# Build the image
docker build -t project-assist .

# Run with environment variables
docker run -p 3000:3000 --env-file .env project-assist
```

### Production Environment Setup

#### Database
- Use a production PostgreSQL database (Vercel Postgres, Neon, Supabase)
- Set up connection pooling for better performance
- Configure automated backups

#### Authentication
- Set secure `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
- Configure OAuth redirect URLs for your production domain
- Set `NEXTAUTH_URL` to your production URL

#### Performance
- Enable Redis for session and memory storage
- Configure Google Cloud Storage for artifact storage
- Set up monitoring and logging

#### Security
- Use HTTPS in production
- Configure CORS properly
- Set up rate limiting
- Regular security updates

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** following our coding standards
4. **Test your changes** thoroughly
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request** with a clear description

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Follow the existing code style and patterns
- Ensure all linting checks pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **GitHub Issues** - Create an issue in the repository
- **Documentation** - Check the `/docs` folder for detailed guides
- **Examples** - Review example configurations in `/examples`
- **Community** - Join our Discord server for discussions

## 🗺️ Roadmap

### Short Term (Q1 2024)
- [ ] Advanced visualization tools for idea mapping
- [ ] Real-time collaboration features
- [ ] Enhanced report templates
- [ ] Mobile-responsive improvements

### Medium Term (Q2-Q3 2024)
- [ ] Team collaboration and sharing
- [ ] Integration with external tools (Slack, Notion, Jira)
- [ ] Advanced analytics and insights dashboard
- [ ] Custom technique creation and sharing

### Long Term (Q4 2024+)
- [ ] Mobile app development
- [ ] API for third-party integrations
- [ ] Advanced AI model fine-tuning
- [ ] Enterprise features and SSO
- [ ] Multi-language support

---

**Built with ❤️ using Next.js, ADK-TS, and the latest AI technologies.**