import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { DiscoverySessionManager } from "../../../../sessions/DiscoverySessionManager";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { sessionId, message } = await request.json();

    if (!sessionId || !message) {
      return NextResponse.json(
        { error: "Session ID and message are required" },
        { status: 400 }
      );
    }

    const sessionManager = new DiscoverySessionManager(session.user.id);
    const result = await sessionManager.continueSession(sessionId, message);

    return NextResponse.json(result);

  } catch (error) {
    console.error("Failed to continue session:", error);
    return NextResponse.json(
      { error: "Failed to continue session" },
      { status: 500 }
    );
  }
}
