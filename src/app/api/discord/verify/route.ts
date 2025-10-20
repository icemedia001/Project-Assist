import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/config/db";

export async function POST(request: NextRequest) {
  try {
    const { discordUserId, verificationCode } = await request.json();

    if (!discordUserId || !verificationCode) {
      return NextResponse.json(
        { error: "Discord user ID and verification code are required" },
        { status: 400 }
      );
    }

    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token: verificationCode,
        expires: {
          gt: new Date()
        }
      }
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    const userId = verificationToken.identifier.replace('discord_link_', '');
    
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const existingDiscordAccount = await prisma.account.findFirst({
      where: {
        provider: "discord",
        providerAccountId: discordUserId
      }
    });

    if (existingDiscordAccount) {
      return NextResponse.json(
        { error: "This Discord account is already linked to another user" },
        { status: 409 }
      );
    }

    await prisma.account.create({
      data: {
        userId: userId,
        type: "oauth",
        provider: "discord",
        providerAccountId: discordUserId,
        access_token: null,
        refresh_token: null,
        expires_at: null,
        token_type: null,
        scope: null,
        id_token: null,
        session_state: null
      }
    });

    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token
        }
      }
    });

    console.log(`Successfully linked Discord account ${discordUserId} to user ${userId}`);

    return NextResponse.json({
      success: true,
      userId: userId,
      message: "Discord account linked successfully"
    });

  } catch (error) {
    console.error("Failed to verify Discord account:", error);
    return NextResponse.json(
      { error: "Failed to verify Discord account" },
      { status: 500 }
    );
  }
}

