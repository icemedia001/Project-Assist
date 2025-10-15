import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "../../../app/config/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const sessions = await prisma.discoverySession.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: {
            ideas: true,
            clusters: true
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    const formattedSessions = sessions.map(session => ({
      id: session.id,
      title: session.title,
      problemStatement: session.problemStatement,
      status: session.status,
      currentPhase: session.currentPhase,
      techniquesUsed: session.techniquesUsed,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      ideasCount: session._count.ideas,
      clustersCount: session._count.clusters
    }));

    return NextResponse.json({
      sessions: formattedSessions
    });

  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
