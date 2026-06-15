import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/session";
import { cookies } from "next/headers";
import { sendSystemNotification } from "@/lib/notifications";
import { getTimerMessage, getDeviceMessage, MessageStyle } from "@/lib/message-templates";

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

    // @ts-ignore
    const schedules = await db.applianceSchedule.findMany({
      where: { userId: user.id },
    });

    return NextResponse.json({ schedules });
  } catch (error: any) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
    const { deviceName, powerDraw, startTime, duration } = body;

    if (!deviceName || powerDraw === undefined || !startTime || duration === undefined) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // @ts-ignore
    const schedule = await db.applianceSchedule.create({
      data: {
        deviceName,
        powerDraw: Number(powerDraw),
        startTime,
        duration: Number(duration),
        userId: user.id,
      },
    });

    // Send in-app Cyberpunk notification immediately when timer is SET (PENDING)
    const device = deviceName;
    const kw = Number(powerDraw).toFixed(2);
    const hrs = Number(duration).toFixed(1);

    const style = (user.messageStyle || "random") as MessageStyle;
    const alertBody = getTimerMessage(style, device, kw, startTime, hrs);

    await sendSystemNotification(user.id, alertBody);

    return NextResponse.json({ success: true, schedule });
  } catch (error: any) {
    console.error("Error creating schedule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionCookie = cookies().get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decoded = verifyToken(sessionCookie);
    if (!decoded || !decoded.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing schedule ID" }, { status: 400 });
    }

    // @ts-ignore
    await db.applianceSchedule.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: decoded.email },
    });

    // @ts-ignore
    const updated = await db.applianceSchedule.update({
      where: { id },
      data: { status },
    });

    if (status === "running" && user) {
      const device = updated.deviceName;
      const kw = Number(updated.powerDraw).toFixed(1);

      const style = (user.messageStyle || "random") as MessageStyle;
      const alertBody = getDeviceMessage(style, device, kw);

      await sendSystemNotification(user.id, alertBody);
    }

    return NextResponse.json({ success: true, schedule: updated });
  } catch (error: any) {
    console.error("Error updating schedule status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

