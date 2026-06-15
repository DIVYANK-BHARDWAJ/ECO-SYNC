import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/session";
import { cookies } from "next/headers";
import { sendSystemNotification } from "@/lib/notifications";
import { getTestMessage, MessageStyle } from "@/lib/message-templates";

export async function POST(req: NextRequest) {
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

    const style = (user.messageStyle || "random") as MessageStyle;
    const testMessage = getTestMessage(style);

    const result = await sendSystemNotification(user.id, testMessage);

    return NextResponse.json({
      success: result.success,
      error: result.error,
    });
  } catch (e: any) {
    console.error("Test notification error:", e);
    return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
  }
}
