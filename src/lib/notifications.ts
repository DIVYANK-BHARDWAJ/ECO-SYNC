import { db } from "./db";
import { sendEmailNotification } from "./email";
import { MessageStyle } from "./message-templates";

export interface NotificationResult {
  success: boolean;
  notificationId?: string;
  error?: string;
}

export async function sendSystemNotification(
  userId: string,
  body: string
): Promise<NotificationResult> {
  try {
    // Log to terminal console in cyberpunk theme
    console.log(`\n[ECO-SYNC UPLINK ALERT] User ID: ${userId}\n${body}\n`);

    // Write notification directly to DB/mock-db
    const notif = await db.notification.create({
      data: {
        userId,
        message: body,
      },
    });

    // Fetch user details for email pipeline connection
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (user && user.email) {
      // Determine dynamic subject line based on the notification body message
      let subject = "📡 [Eco-Sync UPLINK] System Terminal Alert";
      if (body.includes("TRADE CONFIRMED") || body.includes("TRANSACTION SETTLED") || body.includes("ASSET EXCHANGE") || body.includes("LEDGER BROADCAST")) {
        subject = "⚡ [Eco-Sync Nexus] Energy Trade Settled";
      } else if (body.includes("TIMER SCHEDULED") || body.includes("QUANTUM SCHEDULE") || body.includes("AUTOMATION") || body.includes("LOAD PERMIT ISSUED")) {
        subject = "📅 [Eco-Sync Nexus] Appliance Run Scheduled";
      } else if (body.includes("DEVICE ACTIVATED") || body.includes("Routine Event Triggered") || body.includes("ROUTINE ONLINE") || body.includes("SECURITY LOAD PERMIT")) {
        subject = "🟢 [Eco-Sync Nexus] Appliance Activation Online";
      }

      // Fire email asynchronously in background so it doesn't block server response
      sendEmailNotification(
        user.email,
        (user.messageStyle || "random") as MessageStyle,
        body,
        subject
      ).catch(err => {
        console.error("[Eco-Sync Notification] Failed to deliver background email notification:", err);
      });
    }

    return { success: true, notificationId: notif.id };
  } catch (error: any) {
    console.error("[Eco-Sync Notification] Failed to create system alert:", error);
    return {
      success: false,
      error: error.message || "Failed to save notification",
    };
  }
}

