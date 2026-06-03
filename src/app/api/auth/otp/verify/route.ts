import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    const targetEmail = email.toLowerCase().trim();
    const verificationCode = code.trim();

    // 1. Find valid OTP
    const validOtp = await db.otpVerification.findFirst({
      where: {
        email: targetEmail,
        code: verificationCode,
      },
    });

    if (!validOtp) {
      return NextResponse.json(
        { message: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // 2. Consume OTP
    await db.otpVerification.deleteMany({
      where: { email: targetEmail },
    });

    // 3. Find or create user
    let user = await db.user.findUnique({
      where: { email: targetEmail },
    });

    if (!user) {
      // Create profile since it is a first-time sign up
      user = await db.user.create({
        data: {
          email: targetEmail,
          name: targetEmail.split("@")[0],
          bio: "",
          avatarUrl: "/avatars/nexus-default.png",
          themeMode: "system",
          costFactor: 8.0,
          batteryCap: 13.5,
        },
      });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (e: any) {
    console.error("Error in OTP verification route:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
