import { AgentBuilder, InMemorySessionService, InMemoryMemoryService, LlmAgent, createDatabaseSessionService, BuiltInPlanner, PlanReActPlanner, FileOperationsTool } from "@iqai/adk";
import { createAnalystAgent, createArchitectAgent, createPmAgent, createValidatorAgent, createBrainAgent } from ".";
import { coordinatorTools } from "../tools";
import { createSessionService, createArtifactService, createMemoryService } from "../config/adk";
import { prisma } from "../config/db";
import dedent from "dedent";

/**
 * Discovery Coordinator - Main orchestrator for the discovery process
 * Manages the flow between all specialized agents with database persistence
 */
export const createDiscoveryCoordinator = async (model: string, userId?: string) => {
  let persistedAgentSessionId: string | undefined;
  const brainAgent = createBrainAgent(model);
  const analystAgent = createAnalystAgent(model);
  const pmAgent = createPmAgent(model);
  const architectAgent = createArchitectAgent(model);
  const validatorAgent = createValidatorAgent(model);

  const coordinator = new LlmAgent({
    name: "discovery_coordinator",
    description: "Orchestrates the complete discovery process from idea to validated concept using strategic planning",
    instruction: dedent`
      You are the Discovery Coordinator, managing a team of specialized agents for product discovery.
      
      Your team includes:
      - Brain Agent: Creative facilitator and conversation starter (START HERE)
      - Analyst Agent: Defines problems and provides context
      - PM Agent: Prioritizes ideas and creates recommendations
      - Architect Agent: Provides technical architecture guidance
      - Validator Agent: Ensures quality and identifies risks
      
      PLANNING APPROACH:
      You have access to advanced planning capabilities that help you:
      - Break down complex discovery tasks into manageable steps
      - Coordinate multi-agent workflows strategically
      - Adapt plans based on user feedback and results
      - Ensure comprehensive coverage of all discovery phases
      
      CRITICAL RULES:
      1. ALWAYS start with the Brain Agent and stay with it for the entire brainstorming phase
      2. NEVER transfer to other agents during brainstorming unless user explicitly requests it
      3. Only transfer to other agents when user says things like "let's analyze this" or "what about the technical side"
      4. The Brain Agent handles all technique selection and execution
      5. Keep the conversation flowing naturally with the Brain Agent
      6. During brainstorming, do NOT generate content yourself. Do NOT plan or validate. Delegate all user-facing messages to the Brain Agent exclusively until the user explicitly asks to switch phases.
      
      Discovery Process Flow:
      1. Creative Brainstorming (Brain Agent) - START HERE - Generate ideas and explore concepts
      2. Problem Analysis (Analyst Agent) - Only when user requests analysis
      3. Idea Prioritization (PM Agent) - Only when user requests prioritization
      4. Technical Architecture (Architect Agent) - Only when user requests technical details
      5. Final Validation (Validator Agent) - Only when user requests validation
      
      Your role is to:
      - Use strategic planning to coordinate complex multi-step discovery processes
      - Transfer to Brain Agent immediately and let it handle the entire brainstorming flow
      - Only coordinate transfers when user explicitly requests other expertise
      - Maintain context and continuity throughout the session
      - Synthesize outputs from all agents into a cohesive discovery report
      - Use file operations to create comprehensive documentation
      
      IMPORTANT: 
      - Start with Brain Agent and stay with it for brainstorming
      - Let Brain Agent handle technique selection and execution
      - Only transfer when user explicitly asks for other expertise
      - Keep responses conversational and engaging
      - Use planning to ensure thorough coverage of all discovery aspects
    `,
    tools: [...coordinatorTools(), new FileOperationsTool()],
    model,
  });

  const sessionService = await createSessionService();
  const artifactService = await createArtifactService();
  const memoryService = await createMemoryService();

  const { runner, session } = await AgentBuilder.create("discovery_system")
    .withModel(model)
    .withDescription("Interactive multi-agent system for product discovery and ideation with advanced planning capabilities")
    .withInstruction("You coordinate a team of product discovery specialists using strategic planning")
    .withPlanner(new PlanReActPlanner())
    .withSubAgents([
      brainAgent,
      coordinator,
      analystAgent,
      pmAgent,
      architectAgent,
      validatorAgent,
    ])
    .withSessionService(sessionService, userId ? { userId, appName: 'discovery-workshop' } : undefined)
    .withArtifactService(artifactService)
    .withMemory(memoryService)
    .build();

  return {
    runner,
    session,
    coordinator,
    agents: {
        brain: brainAgent,
        analyst: analystAgent,
        pm: pmAgent,
        architect: architectAgent,
        validator: validatorAgent,
    },
    services:  {
        session: sessionService,
        artifact: artifactService,
        memory: memoryService,
    },
    async saveSessionToDatabase(problemStatement: string, title?: string) {
      if (!userId) throw new Error('UserId required for database operations');
      
      const agentSession = await prisma.agentSession.create({
        data: {
          userId,
          agentName: 'discovery_system',
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
          userId,
          agentSessionId: agentSession.id,
          title: title || `Discovery Session - ${new Date().toLocaleDateString()}`,
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
      if (!userId) return;
      
      await prisma.discoverySession.updateMany({
        where: { userId, agentSessionId: persistedAgentSessionId },
        data: { currentPhase: phase, updatedAt: new Date() }
      });
    },
    
    async closeSession() {
      if (!userId) return;
      
      await prisma.discoverySession.updateMany({
        where: { userId, agentSessionId: persistedAgentSessionId },
        data: { 
          status: 'completed', 
          completedAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
   };
};
