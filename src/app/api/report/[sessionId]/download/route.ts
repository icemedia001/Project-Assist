import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/config/db";
import { generateDiscoveryReport } from "@/app/tools/output/report-generation";

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
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get("format") || "markdown";

    const discoverySession = await prisma.discoverySession.findUnique({
      where: { id: sessionId },
      include: { 
        agentSession: true,
        ideas: true,
        clusters: true,
        recommendations: true
      }
    });

    if (!discoverySession || discoverySession.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Session not found or unauthorized" },
        { status: 404 }
      );
    }

    const sessionData = {
      problemStatement: discoverySession.problemStatement || "Discovery Session",
      techniquesUsed: discoverySession.techniquesUsed || [],
      ideas: discoverySession.ideas.map(idea => ({
        id: idea.id,
        title: idea.title,
        description: idea.description,
        rationale: idea.rationale,
        category: (idea.metadata as any)?.category,
        tags: (idea.metadata as any)?.tags || []
      })),
      clusters: discoverySession.clusters.map(cluster => ({
        id: cluster.id,
        name: cluster.name,
        description: cluster.description,
        ideas: [],
        theme: cluster.color,
        priority: "medium"
      })),
      context: (discoverySession.metadata as any)?.context || ""
    };


    const reportContent = generateDiscoveryReport(sessionData, format);

    const headers = new Headers();
    const filename = `discovery-report-${sessionId.slice(0, 8)}.${format}`;
    
    if (format === "markdown") {
      headers.set("Content-Type", "text/markdown");
      headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    } else if (format === "json") {
      headers.set("Content-Type", "application/json");
      headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    } else if (format === "txt") {
      headers.set("Content-Type", "text/plain");
      headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    } else {
      headers.set("Content-Type", "text/markdown");
      headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    }

    return new NextResponse(reportContent, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error("Failed to download report:", error);
    return NextResponse.json(
      { error: "Failed to download report" },
      { status: 500 }
    );
  }
}
