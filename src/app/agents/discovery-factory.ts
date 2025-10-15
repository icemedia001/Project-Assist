import { createDiscoveryCoordinator } from "./discovery-coordinator";
import { createBrainAgent } from ".";
import { env } from "../config/env";
import { AgentBuilder } from "@iqai/adk";
import { createArtifactService, createMemoryService, createSessionService } from "../config/adk";
import { prisma } from "../config/db";

/**
 * Factory function to create a complete discovery system using ADK-TS
 * This is the main entry point for initializing the multi-agent discovery system
 */
export const createDiscoverySystem = async (model: string = env.LLM_MODEL, userId?: string) => {
  if (!userId) {
    throw new Error('UserId is required for discovery system initialization');
  }

  const discoverySystem = await createDiscoveryCoordinator(model, userId);
  
  return discoverySystem;
};

/**
 * Brainstorm-only system.
 */
export const createBrainstormSystem = async (model: string = env.LLM_MODEL, userId?: string) => {
  if (!userId) {
    throw new Error('UserId is required for discovery system initialization');
  }

  const brainAgent = createBrainAgent(model);
  const sessionService = await createSessionService();
  const artifactService = await createArtifactService();
  const memoryService = await createMemoryService();

  const { runner, session } = await AgentBuilder.create("brainstorm_system")
    .withModel(model)
    .withDescription("Brainstorming facilitator (brain agent only)")
    .withInstruction("You are the Brain Agent exclusively handling brainstorming.")
    .withSubAgents([brainAgent])
    .withSessionService(sessionService, userId ? { userId, appName: 'discovery-workshop' } : undefined)
    .withArtifactService(artifactService)
    .withMemory(memoryService)
    .build();

  let persistedAgentSessionId: string | undefined;

  return { 
    runner, 
    session,
    async saveSessionToDatabase(problemStatement: string, title?: string) {
      const agentSession = await prisma.agentSession.create({
        data: {
          userId,
          agentName: 'brainstorm_system',
          sessionId: session.id,
          status: 'active',
          metadata: {
            startTime: new Date().toISOString(),
            inMemorySessionId: session.id
          }
        }
      });
      persistedAgentSessionId = agentSession.id;

      const dbSession = await prisma.discoverySession.create({
        data: {
          userId: userId!,
          agentSessionId: agentSession.id,
          title: title || `Brainstorming Session - ${new Date().toLocaleDateString()}`,
          problemStatement,
          currentPhase: 'brainstorming',
          status: 'active',
          metadata: {
            startTime: new Date().toISOString(),
            techniquesUsed: [],
            phaseHistory: [],
            inMemorySessionId: session.id
          } as any
        }
      });

      return dbSession;
    },
    async updateSessionPhase(phase: string) {
      if (!persistedAgentSessionId) return;
      await prisma.discoverySession.updateMany({
        where: { userId, agentSessionId: persistedAgentSessionId },
        data: { currentPhase: phase, updatedAt: new Date() }
      });
    },
    async closeSession() {
      if (!persistedAgentSessionId) return;
      await prisma.discoverySession.updateMany({
        where: { userId, agentSessionId: persistedAgentSessionId },
        data: { status: 'completed', completedAt: new Date(), updatedAt: new Date() }
      });
    }
  };
};
