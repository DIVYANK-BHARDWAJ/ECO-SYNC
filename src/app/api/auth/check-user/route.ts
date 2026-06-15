import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseIdentifier } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const parsed = parseIdentifier(email);
    const user = await db.user.findUnique({
      where: { email: parsed.email },
    });

    if (!user) {
      return NextResponse.json({
        exists: false,
        message: "Your account is not created",
      });
    }

    return NextResponse.json({ exists: true });
  } catch (e: any) {
    console.error("Error in check-user route:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
