import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { createDiscoverySystem } from "@/app/agents/discovery-factory";
import { prisma } from "@/app/config/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { sessionId } = await params;

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

    const discoverySystem = await createDiscoverySystem(undefined, session.user.id);

    const report = {
      title: dbSession.title,
      problemStatement: dbSession.problemStatement,
      currentPhase: dbSession.currentPhase,
      status: dbSession.status,
      createdAt: dbSession.createdAt,
      updatedAt: dbSession.updatedAt,
      metadata: dbSession.metadata
    };

    return NextResponse.json({
      report: report,
      sessionData: dbSession,
      downloadUrl: `/api/report/${sessionId}/download`
    });

  } catch (error) {
    console.error("Failed to generate report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { sessionId } = await params;
    const { format = "markdown" } = await request.json();

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

    const report = {
      title: dbSession.title,
      problemStatement: dbSession.problemStatement,
      currentPhase: dbSession.currentPhase,
      status: dbSession.status,
      createdAt: dbSession.createdAt,
      updatedAt: dbSession.updatedAt,
      metadata: dbSession.metadata,
      format
    };

    return NextResponse.json({
      report: report,
      format,
      sessionData: dbSession,
      downloadUrl: `/api/report/${sessionId}/download`
    });

  } catch (error) {
    console.error("Failed to regenerate report:", error);
    return NextResponse.json(
      { error: "Failed to regenerate report" },
      { status: 500 }
    );
  }
}
