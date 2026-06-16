import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/session";
import { cookies } from "next/headers";
import { sendSystemNotification } from "@/lib/notifications";

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

    const body = await req.json();
    const spent = Number(body.spent || 0);
    const target = Number(body.target || 3000);

    const alertBody = `==================================================
        [BUDGET SHUTDOWN OVERRIDE PROTOCOL]
==================================================
ATTENTION NODAL CONTROLLER:
A live consumption budget override was triggered on your Eco-Sync network.

[ALERT PARAMETERS]
* Budget Target  : ₹${target.toFixed(2)}
* Live Session   : ₹${spent.toFixed(3)}
* Action Taken   : AUTOMATIC HARD DISCONNECT

All active hardware (HVAC, EV Chargers, and non-essential smart grids) has been deactivated automatically by Nexus Core to prevent budget overrun.

SYSTEM METRICS PERSISTED TO SECURE LEDGER.
==================================================`;

    const result = await sendSystemNotification(user.id, alertBody);

    return NextResponse.json({
      success: result.success,
      error: result.error,
    });
  } catch (e: any) {
    console.error("Budget notification error:", e);
    return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
  }
}
