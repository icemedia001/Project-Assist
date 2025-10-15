import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { DiscoverySessionManager } from "../../../../sessions/DiscoverySessionManager";
import { prisma } from "@/app/config/db";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { command, args, title } = await request.json();

    if (!command) {
      return NextResponse.json(
        { error: "Command is required" },
        { status: 400 }
      );
    }

    const sessionManager = new DiscoverySessionManager(session.user.id);
    const result = await sessionManager.startSessionWithCommand(command, args, title);

    if (result.sessionId) {
      await prisma.message.create({
        data: {
          discoverySessionId: result.sessionId,
          type: "user",
          content: `@${command}${args ? ' ' + args : ''}`,
          phase: "setup"
        }
      });

      await prisma.message.create({
        data: {
          discoverySessionId: result.sessionId,
          type: "agent",
          content: result.response,
          phase: result.phase
        }
      });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("Failed to start session:", error);
    return NextResponse.json(
      { error: "Failed to start session" },
      { status: 500 }
    );
  }
}
