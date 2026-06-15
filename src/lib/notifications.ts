import { db } from "./db";

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

    return { success: true, notificationId: notif.id };
  } catch (error: any) {
    console.error("[Eco-Sync Notification] Failed to create system alert:", error);
    return {
      success: false,
      error: error.message || "Failed to save notification",
    };
  }
}
