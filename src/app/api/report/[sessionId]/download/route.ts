import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
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
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get("format") || "markdown";

    const discoverySession = await prisma.discoverySession.findUnique({
      where: { id: sessionId },
      select: { userId: true, title: true }
    });

    if (!discoverySession || discoverySession.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Session not found or unauthorized" },
        { status: 404 }
      );
    }

    const artifact = await prisma.artifact.findFirst({
      where: {
        userId: session.user.id,
        sessionId: sessionId,
        name: "discovery-report.md",
        type: "text"
      },
      orderBy: { createdAt: "desc" }
    });

    if (!artifact) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

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

    return new NextResponse(artifact.content, {
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
