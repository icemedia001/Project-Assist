import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { createDiscoverySystem } from "../../../../agents/discovery-factory";
import { discoveryRunnerRegistry } from "../../../../sessions/DiscoveryRunnerRegistry";
import { prisma } from "../../../../config/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { message, phase } = await request.json();
    const { id: sessionId } = await params;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const dbSession = await prisma.discoverySession.findUnique({
      where: { id: sessionId },
      include: { agentSession: true }
    });

    if (!dbSession || dbSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const cachedRunner = discoveryRunnerRegistry.get(sessionId);
    
    const discoverySystem = cachedRunner
      ? { runner: cachedRunner, updateSessionPhase: async (p: string) => {}, session: { id: dbSession.agentSessionId } as any }
      : await createDiscoverySystem(undefined, session.user.id);
    
    if (phase && phase !== dbSession.currentPhase) {
      await discoverySystem.updateSessionPhase(phase);
    }

    await prisma.message.create({
      data: {
        discoverySessionId: sessionId,
        type: "user",
        content: message,
        phase: dbSession.currentPhase
      }
    });

    const response = await discoverySystem.runner.ask(message);

    if (!cachedRunner) {
      discoveryRunnerRegistry.set(sessionId, discoverySystem.runner);
    }

    let newPhase = phase || dbSession.currentPhase;

    if (newPhase !== dbSession.currentPhase) {
      await discoverySystem.updateSessionPhase(newPhase);
    }

    const formattedResponse = formatResponse(response);

    await prisma.message.create({
      data: {
        discoverySessionId: sessionId,
        type: "agent",
        content: formattedResponse,
        phase: newPhase
      }
    });

    return NextResponse.json({
      response: formattedResponse,
      phase: newPhase,
      nextSteps: getNextStepsForPhase(newPhase)
    });

  } catch (error) {
    console.error("Failed to process message:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}

function formatResponse(response: string): string {
  return response
    .replace(/\n\n/g, '\n\n')
    .replace(/([.!?])\s+([A-Z])/g, '$1\n\n$2')
    .replace(/(\d+\.\s)/g, '\n$1')
    .replace(/([a-z])([A-Z])/g, '$1\n$2')
    .trim();
}

function getNextStepsForPhase(phase: string): string[] {
  switch (phase) {
    case "problem_analysis":
      return ["Continue with brainstorming", "Select a technique like SCAMPER or Six Thinking Hats"];
    case "brainstorming":
      return ["Try SCAMPER technique", "Use Six Thinking Hats", "Create a mind map", "Move to prioritization"];
    case "prioritization":
      return ["Score and rank ideas", "Group ideas into clusters", "Move to technical architecture"];
    case "architecture":
      return ["Define technical stack", "Plan implementation", "Move to validation"];
    case "validation":
      return ["Review risks and feasibility", "Generate final report", "Complete discovery"];
    default:
      return ["Continue the discovery process"];
  }
}
