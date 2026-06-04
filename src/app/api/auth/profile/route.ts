import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/session";
import { cookies } from "next/headers";

// Fetch user profile
export async function GET(req: NextRequest) {
  try {
    const sessionCookie = cookies().get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(sessionCookie);
    if (!decoded || !decoded.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (e: any) {
    console.error("Error fetching user profile:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Update user profile
export async function PATCH(req: NextRequest) {
  try {
    const sessionCookie = cookies().get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(sessionCookie);
    if (!decoded || !decoded.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { ...updates } = body;

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Clean up updates object to match schema fields
    const allowedUpdates: any = {};
    if (updates.name !== undefined) allowedUpdates.name = updates.name;
    if (updates.bio !== undefined) allowedUpdates.bio = updates.bio;
    if (updates.avatarUrl !== undefined) allowedUpdates.avatarUrl = updates.avatarUrl;
    if (updates.themeMode !== undefined) allowedUpdates.themeMode = updates.themeMode;
    if (updates.costFactor !== undefined) allowedUpdates.costFactor = Number(updates.costFactor);
    if (updates.batteryCap !== undefined) allowedUpdates.batteryCap = Number(updates.batteryCap);

    const updatedUser = await db.user.update({
      where: { email: decoded.email },
      data: allowedUpdates,
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (e: any) {
    console.error("Error updating user profile:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
