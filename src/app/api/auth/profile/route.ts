import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Fetch user profile
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
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
    const body = await req.json();
    const { email, ...updates } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const targetEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email: targetEmail },
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
      where: { email: targetEmail },
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
