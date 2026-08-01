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
      orderBy: { score: "desc" }
    });

    return NextResponse.json({
      ideas: ideas.map(idea => ({
        id: idea.id,
        title: idea.title,
        description: idea.description,
        rationale: idea.rationale,
        category: (idea.metadata as any)?.category,
        tags: (idea.metadata as any)?.tags || [],
        impact: idea.impact || undefined,
        feasibility: idea.feasibility || undefined,
        effort: idea.effort || undefined,
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

export async function PATCH(
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
    const body = await request.json();
    const { ideaId, feasibility, impact, effort } = body;

    if (!ideaId) {
      return NextResponse.json(
        { error: "Idea ID is required" },
        { status: 400 }
      );
    }

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

    const existingIdea = await prisma.idea.findUnique({
      where: { id: ideaId }
    });

    if (!existingIdea || existingIdea.discoverySessionId !== sessionId) {
      return NextResponse.json(
        { error: "Idea not found in this session" },
        { status: 404 }
      );
    }

    const nextFeasibility = feasibility !== undefined ? feasibility : existingIdea.feasibility;
    const nextImpact = impact !== undefined ? impact : existingIdea.impact;
    const nextEffort = effort !== undefined ? effort : existingIdea.effort;

    const scoresMap = {
      High: 3,
      Strong: 3,
      Medium: 2,
      Low: 1,
      Weak: 1,
    };

    const fScore = scoresMap[nextFeasibility as keyof typeof scoresMap] || 0;
    const iScore = scoresMap[nextImpact as keyof typeof scoresMap] || 0;
    const eScore = scoresMap[nextEffort as keyof typeof scoresMap] || 0;
    const computedScore = (fScore + iScore + (4 - eScore)) / 3;

    const updatedIdea = await prisma.idea.update({
      where: { id: ideaId },
      data: {
        feasibility: nextFeasibility,
        impact: nextImpact,
        effort: nextEffort,
        score: computedScore,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      idea: {
        id: updatedIdea.id,
        title: updatedIdea.title,
        description: updatedIdea.description,
        rationale: updatedIdea.rationale,
        category: (updatedIdea.metadata as any)?.category,
        tags: (updatedIdea.metadata as any)?.tags || [],
        impact: updatedIdea.impact || undefined,
        feasibility: updatedIdea.feasibility || undefined,
        effort: updatedIdea.effort || undefined,
        score: updatedIdea.score || undefined,
        createdAt: updatedIdea.createdAt
      }
    });

  } catch (error) {
    console.error("Failed to update idea:", error);
    return NextResponse.json(
      { error: "Failed to update idea" },
      { status: 500 }
    );
  }
}
