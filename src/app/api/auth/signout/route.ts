import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    cookies().delete("session");
    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (e: any) {
    console.error("Error signing out:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
