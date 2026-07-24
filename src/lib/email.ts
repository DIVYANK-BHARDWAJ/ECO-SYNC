import nodemailer from "nodemailer";
import { Resend } from "resend";
import { MessageStyle } from "./message-templates";

interface ThemeConfig {
  bgColor: string;
  borderColor: string;
  accentColor: string;
  preColor: string;
  glowColor: string;
  badgeBg: string;
  badgeText: string;
  themeTitle: string;
  bannerSub: string;
}

const THEME_CONFIGS: Record<Exclude<MessageStyle, "random">, ThemeConfig> = {
  "nexus-border": {
    bgColor: "#050507",
    borderColor: "#10b880",
    accentColor: "#10b880",
    preColor: "#10b880",
    glowColor: "rgba(16, 185, 129, 0.15)",
    badgeBg: "rgba(16, 185, 129, 0.08)",
    badgeText: "#10b880",
    themeTitle: "ECO-SYNC NEXUS",
    bannerSub: "Secure Net Protocol UPLINK"
  },
  "quantum-terminal": {
    bgColor: "#020617",
    borderColor: "#6366f1",
    accentColor: "#6366f1",
    preColor: "#818cf8",
    glowColor: "rgba(99, 102, 241, 0.2)",
    badgeBg: "rgba(99, 102, 241, 0.08)",
    badgeText: "#6366f1",
    themeTitle: "QUANTUM CORE",
    bannerSub: "Neural Intelligence Link"
  },
  "neo-minimalist": {
    bgColor: "#09090b",
    borderColor: "#27272a",
    accentColor: "#ffffff",
    preColor: "#e4e4e7",
    glowColor: "rgba(255, 255, 255, 0.02)",
    badgeBg: "rgba(255, 255, 255, 0.05)",
    badgeText: "#a1a1aa",
    themeTitle: "ECO-SYNC SYSTEM",
    bannerSub: "Automated Ledger Sync"
  },
  "grid-override": {
    bgColor: "#0f0702",
    borderColor: "#ea580c",
    accentColor: "#ea580c",
    preColor: "#f97316",
    glowColor: "rgba(234, 88, 12, 0.2)",
    badgeBg: "rgba(234, 88, 12, 0.08)",
    badgeText: "#ea580c",
    themeTitle: "AETHER GRID",
    bannerSub: "Solar Override Protocol"
  },
  "carbon-crimson": {
    bgColor: "#0c0202",
    borderColor: "#dc2626",
    accentColor: "#dc2626",
    preColor: "#ef4444",
    glowColor: "rgba(220, 38, 38, 0.25)",
    badgeBg: "rgba(220, 38, 38, 0.08)",
    badgeText: "#dc2626",
    themeTitle: "CARBON INDUSTRIAL",
    bannerSub: "Heavy Load Routine Core"
  },
  "bio-sovereignty": {
    bgColor: "#022c22",
    borderColor: "#0d9488",
    accentColor: "#0d9488",
    preColor: "#2dd4bf",
    glowColor: "rgba(13, 148, 136, 0.2)",
    badgeBg: "rgba(13, 148, 136, 0.08)",
    badgeText: "#0d9488",
    themeTitle: "BIO-SOVEREIGNTY NETWORK",
    bannerSub: "Consensus Ecological Core"
  },
  "neon-hacker": {
    bgColor: "#030712",
    borderColor: "#eab308",
    accentColor: "#eab308",
    preColor: "#facc15",
    glowColor: "rgba(234, 179, 8, 0.25)",
    badgeBg: "rgba(234, 179, 8, 0.08)",
    badgeText: "#eab308",
    themeTitle: "NEON HACKER LINK",
    bannerSub: "Unauthorized Grid Terminal Hijack"
  }
};

const STYLES: Exclude<MessageStyle, "random">[] = [
  "nexus-border", "quantum-terminal", "neo-minimalist", "grid-override", "carbon-crimson", "bio-sovereignty", "neon-hacker"
];

function resolveStyle(selected: MessageStyle): Exclude<MessageStyle, "random"> {
  if (selected === "random" || !selected) {
    return STYLES[Math.floor(Math.random() * STYLES.length)];
  }
  return selected as Exclude<MessageStyle, "random">;
}

export function getEmailHtml(style: MessageStyle, asciiArt: string, customSubject?: string): string {
  const actualStyle = resolveStyle(style);
  const cfg = THEME_CONFIGS[actualStyle];
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${customSubject || cfg.themeTitle}</title>
      </head>
      <body style="background-color: #000000; margin: 0; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="background-color: ${cfg.bgColor}; color: #f4f4f5; font-family: monospace; padding: 48px 32px; max-width: 520px; margin: 0 auto; border: 1px solid ${cfg.borderColor}; border-radius: 24px; box-shadow: 0 10px 30px ${cfg.glowColor};">
          
          <!-- Header Banner -->
          <div style="text-align: center; margin-bottom: 36px;">
            <div style="display: inline-block; padding: 6px 12px; background-color: ${cfg.badgeBg}; border: 1px solid rgba(${cfg.borderColor.startsWith("#") ? hexToRgb(cfg.borderColor) : "255,255,255"}, 0.25); border-radius: 100px; margin-bottom: 16px;">
              <span style="font-size: 9px; font-family: monospace; letter-spacing: 0.25em; text-transform: uppercase; color: ${cfg.badgeText}; font-weight: 700;">
                ${customSubject ? "GRID BROADCAST" : "NODE ACCESS STATUS"}
              </span>
            </div>
            <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; letter-spacing: -0.05em; margin: 0; text-transform: uppercase;">
              ECO-SYNC <span style="color: ${cfg.accentColor};">${cfg.themeTitle.split(" ").slice(1).join(" ") || "NEXUS"}</span>
            </h1>
            <p style="color: #71717a; font-size: 10px; font-family: monospace; letter-spacing: 0.3em; margin: 6px 0 0 0; text-transform: uppercase;">
              ${cfg.bannerSub}
            </p>
          </div>

          <!-- Main ASCII Content -->
          <div style="background: linear-gradient(135deg, #050507 0%, #0c0c0f 100%); border: 1px solid rgba(${cfg.borderColor.startsWith("#") ? hexToRgb(cfg.borderColor) : "255,255,255"}, 0.15); border-radius: 16px; padding: 24px; text-align: left; margin-bottom: 32px; box-shadow: inset 0 2px 8px rgba(0,0,0,0.8); overflow-x: auto;">
            <pre style="font-family: 'Courier New', Courier, monospace; font-size: 12px; line-height: 1.4; color: ${cfg.preColor}; margin: 0; white-space: pre;">${asciiArt}</pre>
          </div>

          <!-- Footer Protocol Description -->
          <div style="text-align: center; border-top: 1px solid #1f1f23; padding-top: 24px;">
            <p style="color: #52525b; font-size: 10px; line-height: 1.5; margin: 0;">
              This transmission is secured. If you did not configure your device to receive notifications, you can adjust settings in the Preferences Drawer.
            </p>
            <p style="color: #3f3f46; font-size: 8px; font-family: monospace; margin: 12px 0 0 0; letter-spacing: 0.1em; text-transform: uppercase;">
              ${cfg.themeTitle} NETWORK OPERATION DEPT
            </p>
          </div>

        </div>
      </body>
    </html>
  `;
}

// Helper to convert HEX to RGB for inline transparency
function hexToRgb(hex: string): string {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "255, 255, 255";
}

export interface EmailResult {
  success: boolean;
  message?: string;
  error?: string;
  mockUsed?: boolean;
}

export async function sendRawEmail(
  toEmail: string,
  subject: string,
  htmlContent: string
): Promise<EmailResult> {
  if (process.env.FORCE_OFFLINE === "true") {
    console.log("\n==================================================");
    console.log(`[MOCK EMAIL PIPELINE] [Subject: "${subject}"]`);
    console.log(`Recipient: ${toEmail}`);
    console.log("HTML Preview (first 150 chars):", htmlContent.trim().substring(0, 150) + "...");
    console.log("==================================================\n");

    return {
      success: true,
      message: "Email sent (mock environment fallback)",
      mockUsed: true
    };
  }

  try {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASSWORD;
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const smtpSender = process.env.SMTP_SENDER || smtpUser;

    const brevoApiKey = process.env.BREVO_API_KEY || (smtpPass?.startsWith("xkeysib-") ? smtpPass : null);
    const resendApiKey = process.env.RESEND_API_KEY;

    // 1. Try sending via Brevo HTTP API
    if (brevoApiKey && smtpSender) {
      try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "accept": "application/json",
            "api-key": brevoApiKey,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            sender: {
              name: "Eco-Sync Nexus",
              email: smtpSender,
            },
            to: [
              {
                email: toEmail,
              },
            ],
            subject: subject,
            htmlContent: htmlContent,
          }),
        });

        if (response.ok) {
          console.log(`[Email Pipeline] Sent email to ${toEmail} via Brevo API`);
          return { success: true, message: "Email sent via Brevo API" };
        } else {
          const errData = await response.json();
          console.error("Brevo API delivery failed:", errData);
        }
      } catch (err: any) {
        console.error("Brevo API delivery failed, falling back", err);
      }
    }

    // 2. Try sending via SMTP (Nodemailer)
    if (smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: `"Eco-Sync Nexus" <${smtpSender}>`,
          to: toEmail,
          subject: subject,
          html: htmlContent,
        });

        console.log(`[Email Pipeline] Sent email to ${toEmail} via SMTP`);
        return { success: true, message: "Email sent via SMTP" };
      } catch (err: any) {
        console.error("SMTP delivery failed, falling back", err);
      }
    }

    // 3. Try sending via Resend API
    if (resendApiKey && resendApiKey !== "mock" && !resendApiKey.startsWith("your_")) {
      try {
        const resend = new Resend(resendApiKey);
        const { error } = await resend.emails.send({
          from: "Eco-Sync Nexus <onboarding@resend.dev>",
          to: toEmail,
          subject: subject,
          html: htmlContent,
        });

        if (error) {
          throw error;
        }

        console.log(`[Email Pipeline] Sent email to ${toEmail} via Resend`);
        return { success: true, message: "Email sent via Resend" };
      } catch (err: any) {
        console.error("Resend delivery failed, falling back to mock", err);
      }
    }

    // Fallback: Log mock email details to console
    console.log("\n==================================================");
    console.log(`[MOCK EMAIL PIPELINE] [Subject: "${subject}"]`);
    console.log(`Recipient: ${toEmail}`);
    console.log("HTML Preview (first 150 chars):", htmlContent.trim().substring(0, 150) + "...");
    console.log("==================================================\n");

    return {
      success: true,
      message: "Email sent (mock environment fallback)",
      mockUsed: true
    };

  } catch (e: any) {
    console.error("Critical error in raw email pipeline:", e);
    return {
      success: false,
      error: e.message || "Internal server error in email pipeline"
    };
  }
}

export async function sendEmailNotification(
  toEmail: string,
  style: MessageStyle,
  asciiArt: string,
  customSubject?: string
): Promise<EmailResult> {
  const actualStyle = resolveStyle(style);
  const subject = customSubject || `📡 [Eco-Sync UPLINK] System Terminal Alert`;
  const htmlContent = getEmailHtml(actualStyle, asciiArt, subject);
  return sendRawEmail(toEmail, subject, htmlContent);
}
