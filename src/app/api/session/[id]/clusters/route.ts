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

    const clusters = await prisma.ideaCluster.findMany({
      where: { discoverySessionId: sessionId },
      include: {
        memberships: {
          include: {
            idea: true
          }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json({
      clusters: clusters.map(cluster => ({
        id: cluster.id,
        name: cluster.name,
        description: cluster.description,
        color: cluster.color || "#3B82F6",
        ideas: cluster.memberships.map(membership => membership.idea.id),
        createdAt: cluster.createdAt
      }))
    });

  } catch (error) {
    console.error("Failed to fetch clusters:", error);
    return NextResponse.json(
      { error: "Failed to fetch clusters" },
      { status: 500 }
    );
  }
}
