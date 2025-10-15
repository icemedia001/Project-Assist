import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/config/db";

export async function GET(
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
      where: { id: sessionId, userId: session.user.id }
    });

    if (!dbSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const messages = await prisma.message.findMany({
      where: { discoverySessionId: sessionId },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json({
      messages: messages.map(msg => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        phase: msg.phase,
        technique: msg.technique,
        timestamp: msg.createdAt,
        metadata: msg.metadata
      }))
    });

  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
