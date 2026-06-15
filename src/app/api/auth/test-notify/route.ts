import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/session";
import { cookies } from "next/headers";
import { sendTwilioMessage } from "@/lib/twilio";
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

    if (!user.phoneNumber) {
      return NextResponse.json({
        error: "No phone number saved on your profile. Please add your mobile number in Settings first.",
        phoneNumber: null,
      }, { status: 400 });
    }

    const style = (user.messageStyle || "random") as MessageStyle;
    const testMessage = getTestMessage(style);

    const smsResult = await sendTwilioMessage(user.phoneNumber, "sms", testMessage);

    const whatsappResult = await sendTwilioMessage(
      user.phoneNumber,
      "whatsapp",
      testMessage
    );

    return NextResponse.json({
      success: true,
      phoneNumber: user.phoneNumber,
      sms: {
        success: smsResult.success,
        messageId: smsResult.messageId,
        error: smsResult.error,
        fallback: smsResult.fallback,
      },
      whatsapp: {
        success: whatsappResult.success,
        messageId: whatsappResult.messageId,
        error: whatsappResult.error,
        fallback: whatsappResult.fallback,
      },
    });
  } catch (e: any) {
    console.error("Test notification error:", e);
    return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
  }
}
