# Discovery System

An AI-powered discovery and ideation platform that helps users explore ideas through structured brainstorming techniques, multi-agent coordination, and intelligent analysis.

## Features

- **Multi-Agent Discovery Process**: Coordinated team of specialized AI agents for comprehensive idea exploration
- **Creative Brainstorming Techniques**: SCAMPER, Six Thinking Hats, Mind Mapping, and Rolestorming
- **Intelligent Analysis**: LLM-based idea clustering, scoring, and prioritization
- **Session Management**: Persistent discovery sessions with progress tracking
- **Report Generation**: Comprehensive discovery reports with insights and recommendations
- **Authentication**: Secure OAuth integration with Google and GitHub
- **Modern UI**: Responsive, accessible interface built with Next.js and Tailwind CSS

## Architecture

The system uses a multi-agent architecture with specialized agents:

- **Discovery Coordinator**: Orchestrates the entire discovery process
- **Analyst Agent**: Analyzes problems and provides context
- **Brain Agent**: Facilitates creative brainstorming using various techniques
- **PM Agent**: Prioritizes ideas and creates actionable recommendations
- **Architect Agent**: Provides technical architecture guidance
- **Validator Agent**: Ensures quality and identifies risks

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, ADK-TS (Agent Development Kit)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 with OAuth providers
- **AI/LLM**: OpenAI, Google Gemini, Anthropic Claude
- **Deployment**: Vercel-ready with Docker support

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- API keys for at least one LLM provider (OpenAI, Gemini, or Anthropic)
- OAuth app credentials for Google and/or GitHub

### Installation

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
   
   Edit `.env.local` with your configuration:
   - Database URL
   - NextAuth secret and URL
   - LLM API keys
   - OAuth provider credentials

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

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js (min 32 chars) | Yes |
| `NEXTAUTH_URL` | Base URL of your application | Yes |
| `OPENAI_API_KEY` | OpenAI API key | No* |
| `GEMINI_API_KEY` | Google Gemini API key | No* |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | No* |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | Yes |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | Yes |

*At least one LLM API key is required.

## Usage

### Starting a Discovery Session

1. **Sign in** using Google or GitHub OAuth
2. **Navigate to Discovery** from the dashboard
3. **Enter your problem statement** or challenge you want to explore
4. **Follow the guided process** through each discovery phase:
   - Problem Analysis
   - Brainstorming (select techniques)
   - Idea Prioritization
   - Architecture Planning
   - Validation
5. **Generate and download** your discovery report

### Available Techniques

- **SCAMPER**: Systematic creative thinking (Substitute, Combine, Adapt, Modify, Put to other use, Eliminate, Reverse)
- **Six Thinking Hats**: Multi-perspective analysis (Facts, Emotions, Critical, Optimistic, Creative, Process)
- **Mind Mapping**: Visual idea organization and exploration
- **Rolestorming**: Perspective-taking from different stakeholder roles

### Session Management

- **Dashboard**: View all your discovery sessions
- **Resume Sessions**: Continue where you left off
- **Export Reports**: Download comprehensive discovery reports
- **Progress Tracking**: Visual phase progression and completion status

## Development

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Session management
│   ├── discovery/         # Main discovery interface
│   ├── agents/            # AI agent definitions
│   ├── config/            # Configuration files
│   └── tools/             # Agent tools and techniques
├── sessions/              # Session management logic
├── types/                 # TypeScript type definitions
└── scripts/               # Development and testing scripts
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test:session` - Test session lifecycle
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio

### Testing

Test the session lifecycle without the UI:

```bash
npm run test:session
```

This will:
- Test database connection
- Create a sample discovery session
- Run through all phases
- Generate a report
- Clean up test data

### Database Schema

The system uses PostgreSQL with the following main entities:

- **Users**: OAuth-authenticated users
- **DiscoverySessions**: Individual discovery sessions
- **Ideas**: Generated ideas with metadata
- **IdeaClusters**: Thematic groupings of ideas
- **Recommendations**: Actionable next steps
- **Artifacts**: Generated reports and files

## Deployment

### Vercel Deployment

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Docker Deployment

```bash
# Build the image
docker build -t discovery-system .

# Run with environment variables
docker run -p 3000:3000 --env-file .env discovery-system
```

### Environment Setup for Production

- Use a production PostgreSQL database (e.g., Vercel Postgres, Neon, Supabase)
- Set secure `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
- Configure OAuth redirect URLs for your production domain
- Set `NEXTAUTH_URL` to your production URL

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the example configurations in `/examples`

## Roadmap

- [ ] Advanced visualization tools
- [ ] Team collaboration features
- [ ] Integration with external tools (Slack, Notion, etc.)
- [ ] Mobile app development
- [ ] Advanced analytics and insights
- [ ] Custom technique creation
- [ ] API for third-party integrations
