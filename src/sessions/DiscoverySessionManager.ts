import { createDiscoverySystem } from "../app/agents/discovery-factory";
import { createBrainstormSystem } from "../app/agents/discovery-factory";
import { prisma } from "../app/config/db";
import { env } from "../app/config/env";
import { z } from "zod";
import type { Prisma } from "../generated/prisma";
import { discoveryRunnerRegistry } from "../app/sessions/DiscoveryRunnerRegistry";

const SessionStartSchema = z.object({
  problemStatement: z.string().min(1).max(1000),
  title: z.string().optional(),
  userId: z.string().min(1)
});

export interface SimplifiedSessionResult {
  sessionId: string;
  agentSessionId: string;
  response: string;
  phase: string;
  nextSteps: string[];
}

export class DiscoverySessionManager {
  private readonly userId: string;

  constructor(userId: string) {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('Valid userId is required');
    }
    this.userId = userId.trim();
  }
  
  async startSessionWithCommand(command: string, args: string = "", title?: string): Promise<SimplifiedSessionResult> {
    switch (command.toLowerCase()) {
      case 'help':
        return {
          sessionId: '',
          agentSessionId: '',
          response: `Available Commands:

• @help - Show all available commands and how to use them
• @brainstorm - Start an interactive brainstorming session with guided techniques
• @analyst - Start a business analysis session for market research and competitive analysis
• @pm - Start a project management session for idea prioritization and planning
• @architect - Start a technical architecture session for system design
• @validator - Start a validation session for risk assessment and feasibility

To begin, type a command (e.g., @brainstorm)`,
          phase: "help",
          nextSteps: [
            "Type @brainstorm to start a brainstorming session",
            "Type @analyst to start a business analysis session",
            "Type @pm to start a project management session"
          ]
        };
        
      case 'brainstorm':
        const discoverySystem = await createBrainstormSystem(env.LLM_MODEL, this.userId);
        
        const initialMessage = `Hi! I'm your brainstorming facilitator. I'll guide the process and you generate the ideas.

What are we brainstorming about?`;
        const sessionTitle = title || `Brainstorming Session - ${new Date().toLocaleDateString()}`;
        
        const dbSession = await discoverySystem.saveSessionToDatabase(
          args || command, 
          sessionTitle
        );

        try {
          discoveryRunnerRegistry.set(dbSession.id, discoverySystem.runner);
        } catch {
        }

        const response = await discoverySystem.runner.ask(initialMessage);

        return {
          sessionId: dbSession.id,
          agentSessionId: discoverySystem.session.id,
          response: this.formatResponse(response),
          phase: "brainstorming",
          nextSteps: [
            "Share your brainstorming topic", 
            "Answer context questions", 
            "Choose your approach"
          ]
        };
        
      case 'analyst':
        const analystSystem = await createDiscoverySystem(env.LLM_MODEL, this.userId);
        
        const analystMessage = `Hi! I'm your business analyst. I'm here to help you with market research, competitive analysis, and strategic insights.

What would you like to analyze or research today?`;
        const analystTitle = title || `Analysis Session - ${new Date().toLocaleDateString()}`;
        
        const analystDbSession = await analystSystem.saveSessionToDatabase(
          args || command, 
          analystTitle
        );

        try {
          discoveryRunnerRegistry.set(analystDbSession.id, analystSystem.runner);
        } catch {
        }

        const analystResponse = await analystSystem.runner.ask(analystMessage);

        return {
          sessionId: analystDbSession.id,
          agentSessionId: analystSystem.session.id,
          response: this.formatResponse(analystResponse),
          phase: "analysis",
          nextSteps: [
            "Share your analysis topic", 
            "Define research objectives", 
            "Choose analysis approach"
          ]
        };
        
      case 'pm':
        const pmSystem = await createDiscoverySystem(env.LLM_MODEL, this.userId);
        
        const pmMessage = `Hi! I'm your project manager. I'm here to help you prioritize ideas, plan projects, and create actionable roadmaps.

What project or ideas would you like to prioritize and plan?`;
        const pmTitle = title || `Project Management Session - ${new Date().toLocaleDateString()}`;
        
        const pmDbSession = await pmSystem.saveSessionToDatabase(
          args || command, 
          pmTitle
        );

        try {
          discoveryRunnerRegistry.set(pmDbSession.id, pmSystem.runner);
        } catch {
        }

        const pmResponse = await pmSystem.runner.ask(pmMessage);

        return {
          sessionId: pmDbSession.id,
          agentSessionId: pmSystem.session.id,
          response: this.formatResponse(pmResponse),
          phase: "prioritization",
          nextSteps: [
            "Share your project ideas", 
            "Define success criteria", 
            "Create prioritization framework"
          ]
        };
        
      case 'architect':
        const architectSystem = await createDiscoverySystem(env.LLM_MODEL, this.userId);
        
        const architectMessage = `Hi! I'm your technical architect. I'm here to help you design systems, plan technical solutions, and create architecture blueprints.

What system or technical challenge would you like to architect?`;
        const architectTitle = title || `Architecture Session - ${new Date().toLocaleDateString()}`;
        
        const architectDbSession = await architectSystem.saveSessionToDatabase(
          args || command, 
          architectTitle
        );

        try {
          discoveryRunnerRegistry.set(architectDbSession.id, architectSystem.runner);
        } catch {
        }

        const architectResponse = await architectSystem.runner.ask(architectMessage);

        return {
          sessionId: architectDbSession.id,
          agentSessionId: architectSystem.session.id,
          response: this.formatResponse(architectResponse),
          phase: "architecture",
          nextSteps: [
            "Share your technical requirements", 
            "Define system constraints", 
            "Create architecture design"
          ]
        };
        
      case 'validator':
        const validatorSystem = await createDiscoverySystem(env.LLM_MODEL, this.userId);
        
        const validatorMessage = `Hi! I'm your validation specialist. I'm here to help you assess risks, validate feasibility, and ensure your ideas are sound.

What would you like to validate or assess for risks?`;
        const validatorTitle = title || `Validation Session - ${new Date().toLocaleDateString()}`;
        
        const validatorDbSession = await validatorSystem.saveSessionToDatabase(
          args || command, 
          validatorTitle
        );

        try {
          discoveryRunnerRegistry.set(validatorDbSession.id, validatorSystem.runner);
        } catch {
        }

        const validatorResponse = await validatorSystem.runner.ask(validatorMessage);

        return {
          sessionId: validatorDbSession.id,
          agentSessionId: validatorSystem.session.id,
          response: this.formatResponse(validatorResponse),
          phase: "validation",
          nextSteps: [
            "Share your idea or project", 
            "Identify potential risks", 
            "Create validation plan"
          ]
        };
        
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }

  async startSession(input: {
    problemStatement: string;
    title?: string;
  }): Promise<SimplifiedSessionResult> {
    const validatedInput = SessionStartSchema.parse({
      ...input,
      userId: this.userId
    });

    const discoverySystem = await createDiscoverySystem(env.LLM_MODEL, this.userId);
    
    const dbSession = await discoverySystem.saveSessionToDatabase(
      validatedInput.problemStatement, 
      validatedInput.title
    );

    try {
      discoveryRunnerRegistry.set(dbSession.id, discoverySystem.runner);
    } catch {
    }

    const response = await discoverySystem.runner.ask(
      `Welcome to your discovery session! I captured: "${validatedInput.problemStatement}".

What are we brainstorming about?`
    );

      return {
      sessionId: dbSession.id,
      agentSessionId: discoverySystem.session.id,
      response: this.formatResponse(response),
      phase: "brainstorming",
      nextSteps: [
        "Explore your idea creatively", 
        "Try brainstorming techniques like SCAMPER or Six Thinking Hats", 
        "Share what excites you most about this concept"
      ]
    };
  }

  async continueSession(sessionId: string, message: string): Promise<{
    response: string;
    phase: string;
    metadata?: Record<string, unknown>;
  }> {
    const cachedRunner = discoveryRunnerRegistry.get(sessionId);
    type DiscoveryRunner = { ask: (message: string) => Promise<string> };
    type DiscoverySystem = { runner: DiscoveryRunner; session: { id: string } };
    const discoverySystem: DiscoverySystem = cachedRunner
      ? { runner: cachedRunner as DiscoveryRunner, session: { id: sessionId } }
      : await createDiscoverySystem(env.LLM_MODEL, this.userId);
    
    const dbSession = await prisma.discoverySession.findUnique({
      where: { id: sessionId, userId: this.userId }
    });

    if (!dbSession) {
      throw new Error('Session not found or access denied');
    }

    if (dbSession.status === 'completed') {
      throw new Error('Session is already completed');
    }

    const response = await discoverySystem.runner.ask(message);

    if (!cachedRunner && discoverySystem.runner) {
      try {
        discoveryRunnerRegistry.set(sessionId, discoverySystem.runner);
      } catch {}
    }

    await prisma.discoverySession.update({
      where: { id: sessionId },
        data: {
        updatedAt: new Date(),
          metadata: {
          ...((dbSession.metadata as Prisma.InputJsonObject) || {}),
          lastActivity: new Date().toISOString()
          } as Prisma.InputJsonObject
        }
      });
    
    return {
      response: this.formatResponse(response),
      phase: dbSession.currentPhase,
      metadata: {
        sessionId,
        lastActivity: new Date()
      }
    };
  }

  async updatePhase(sessionId: string, phase: string): Promise<void> {
    await prisma.discoverySession.updateMany({
      where: { 
        id: sessionId, 
        userId: this.userId 
      },
      data: { 
        currentPhase: phase,
        updatedAt: new Date()
      }
    });
  }

  async closeSession(sessionId: string): Promise<void> {
    await prisma.discoverySession.updateMany({
      where: { 
        id: sessionId, 
        userId: this.userId 
      },
      data: { 
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  async getSessionStatus(sessionId: string): Promise<{
    id: string;
    title: string | null;
    problemStatement: string | null;
    currentPhase: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    ideasCount: number;
  }> {
    const session = await prisma.discoverySession.findUnique({
      where: { id: sessionId, userId: this.userId },
      include: {
        _count: {
          select: { ideas: true }
        }
      }
    });

    if (!session) {
      throw new Error('Session not found or access denied');
    }

    return {
      id: session.id,
      title: session.title,
      problemStatement: session.problemStatement,
      currentPhase: session.currentPhase,
      status: session.status,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      ideasCount: session._count.ideas
    };
  }

  async listSessions(): Promise<Array<{
    id: string;
    title: string | null;
    currentPhase: string;
    status: string;
    createdAt: Date;
    ideasCount: number;
  }>> {
    const sessions = await prisma.discoverySession.findMany({
      where: { userId: this.userId },
      include: {
        _count: {
          select: { ideas: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return sessions.map(session => ({
      id: session.id,
      title: session.title,
      currentPhase: session.currentPhase,
      status: session.status,
      createdAt: session.createdAt,
      ideasCount: session._count.ideas
    }));
  }

  private formatResponse(response: string): string {
    return response
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\n\n(\d+\.\s)/g, '\n$1')
      .trim();
  }
}