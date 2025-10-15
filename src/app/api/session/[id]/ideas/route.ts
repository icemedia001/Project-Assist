import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "../../../../../app/config/db";

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

    const discoverySession = await prisma.discoverySession.findUnique({
      where: { id: sessionId },
      select: { userId: true }
    });

    if (!discoverySession || discoverySession.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Session not found or unauthorized" },
        { status: 404 }
      );
    }
    
    const ideas = await prisma.idea.findMany({
      where: { discoverySessionId: sessionId },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json({
      ideas: ideas.map(idea => ({
        id: idea.id,
        title: idea.title,
        description: idea.description,
        rationale: idea.rationale,
        category: (idea.metadata as any)?.category,
        tags: (idea.metadata as any)?.tags || [],
        impact: idea.impact ? parseFloat(idea.impact) : undefined,
        feasibility: idea.feasibility ? parseFloat(idea.feasibility) : undefined,
        effort: idea.effort ? parseFloat(idea.effort) : undefined,
        score: idea.score || undefined,
        createdAt: idea.createdAt
      }))
    });

  } catch (error) {
    console.error("Failed to fetch ideas:", error);
    return NextResponse.json(
      { error: "Failed to fetch ideas" },
      { status: 500 }
    );
  }
}
