import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { DiscoverySessionManager } from "../../../../../sessions/DiscoverySessionManager";

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

    const { message } = await request.json();
    const { id: sessionId } = await params;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const sessionManager = new DiscoverySessionManager(session.user.id);
    const result = await sessionManager.continueSession(sessionId, message);

    return NextResponse.json({
      response: result.response,
      phase: result.phase,
      nextSteps: getNextStepsForPhase(result.phase)
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
