import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/config/db";

export async function DELETE(
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

    // Verify the session belongs to the user
    const dbSession = await prisma.discoverySession.findUnique({
      where: { id: sessionId },
      select: { userId: true, status: true }
    });

    if (!dbSession || dbSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Session not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete the session and all related data
    // Get the agent session ID first, then delete the agent session
    // This will cascade delete the discovery session and all related data
    const discoverySession = await prisma.discoverySession.findUnique({
      where: { id: sessionId },
      select: { agentSessionId: true }
    });

    if (!discoverySession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Delete the agent session - this will cascade delete the discovery session and all related data
    await prisma.agentSession.delete({
      where: { id: discoverySession.agentSessionId }
    });

    return NextResponse.json({
      success: true,
      message: "Session deleted successfully"
    });

  } catch (error) {
    console.error("Failed to delete session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}