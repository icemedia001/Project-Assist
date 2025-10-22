import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { DiscoverySessionManager } from "@/sessions/DiscoverySessionManager";
import { prisma } from "@/app/config/db";

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

    const { id: sessionId } = await params;

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

    if (dbSession.status === 'completed') {
      return NextResponse.json(
        { error: "Session already ended" },
        { status: 400 }
      );
    }

    const sessionManager = new DiscoverySessionManager(session.user.id);
    await sessionManager.closeSession(sessionId);

    return NextResponse.json({
      success: true,
      message: "Session ended successfully",
      sessionId: sessionId
    });

  } catch (error) {
    console.error("Failed to end session:", error);
    return NextResponse.json(
      { error: "Failed to end session" },
      { status: 500 }
    );
  }
}