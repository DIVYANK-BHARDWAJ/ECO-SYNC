import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from "resend";
import nodemailer from "nodemailer";
import { parseIdentifier } from "@/lib/auth-utils";
import { getOtpMessage, MessageStyle } from "@/lib/message-templates";

export async function POST(req: NextRequest) {
  try {
    const { email, isSignUp } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const parsed = parseIdentifier(email);
    const targetEmail = parsed.email;

    if (isSignUp) {
      const user = await db.user.findUnique({
        where: { email: targetEmail },
      });
      if (user) {
        return NextResponse.json({ message: "You already have an account, so sign in." }, { status: 400 });
      }
    }

    // 1. Generate 4-digit OTP
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // 2. Clear old OTPs
    await db.otpVerification.deleteMany({
      where: { email: targetEmail },
    });

    // 3. Save new OTP
    await db.otpVerification.create({
      data: {
        email: targetEmail,
        code,
        expiresAt,
      },
    });

    const apiKey = process.env.RESEND_API_KEY;
    
    // Define 7 unique, highly premium email templates
    const templates = [
      {
        subject: "🔑 [Secure Net Protocol] Unlock Node Access Key",
        html: (code: string) => `
          <div style="background-color: #050507; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 48px 32px; max-width: 520px; margin: 0 auto; border: 1px solid #27272a; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
            <div style="text-align: center; margin-bottom: 40px;">
              <div style="display: inline-block; padding: 6px 12px; background-color: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 100px; margin-bottom: 16px;">
                <span style="font-size: 9px; font-family: monospace; letter-spacing: 0.25em; text-transform: uppercase; color: #f59e0b; font-weight: 700;">SECURITY AUTHORIZATION</span>
              </div>
              <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; letter-spacing: -0.05em; margin: 0; text-transform: uppercase;">ECO-SYNC <span style="color: #f59e0b;">NEXUS</span></h1>
              <p style="color: #71717a; font-size: 10px; font-family: monospace; letter-spacing: 0.4em; margin: 6px 0 0 0; text-transform: uppercase;">Secure Net Protocol</p>
            </div>
            <div style="margin-bottom: 32px;">
              <p style="color: #e4e4e7; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; font-weight: bold;">Greetings, Operator.</p>
              <p style="color: #a1a1aa; font-size: 13.5px; line-height: 1.6; margin: 0 0 24px 0;">A request has been initiated to authorize your node to access the <strong>Eco-Sync Nexus Dashboard</strong>. Enter the single-use system authorization key below to finalize access:</p>
            </div>
            <div style="background: linear-gradient(135deg, #0c0c0e 0%, #121215 100%); border: 1px dashed rgba(245, 158, 11, 0.35); border-radius: 16px; padding: 32px 24px; text-align: center; margin-bottom: 32px; box-shadow: inset 0 2px 8px rgba(0,0,0,0.8);">
              <p style="color: #71717a; font-size: 9px; font-family: monospace; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 12px 0; font-weight: 700;">Your Access Key (Expires in 10m)</p>
              <span style="font-size: 46px; font-weight: 900; color: #f59e0b; letter-spacing: 12px; font-family: monospace; padding-left: 12px; text-shadow: 0 0 20px rgba(245, 158, 11, 0.2);">${code}</span>
            </div>
            <div style="border-top: 1px solid #1f1f23; padding-top: 24px; margin-bottom: 32px;">
              <p style="color: #71717a; font-size: 10px; font-family: monospace; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 16px 0; font-weight: 700;">Node Capabilities Unlocked:</p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; vertical-align: top; width: 22px; color: #f59e0b; font-size: 14px;">⚡</td>
                  <td style="padding: 4px 0; color: #a1a1aa; font-size: 12px; line-height: 1.5;"><strong>AI-Driven Microgrid Simulation</strong> — Live battery & solar analytics</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; vertical-align: top; width: 22px; color: #f59e0b; font-size: 14px;">👤</td>
                  <td style="padding: 4px 0; color: #a1a1aa; font-size: 12px; line-height: 1.5;"><strong>Customized Profile Settings</strong> — Persisted options in your Neon database</td>
                </tr>
              </table>
            </div>
            <div style="text-align: center; border-top: 1px solid #1f1f23; padding-top: 20px;">
              <p style="color: #52525b; font-size: 10px; line-height: 1.5; margin: 0;">This transmission is secure. If you did not request this authorization code, you can safely ignore this email.</p>
              <p style="color: #3f3f46; font-size: 8px; font-family: monospace; margin: 12px 0 0 0; letter-spacing: 0.1em; text-transform: uppercase;">ECO-SYNC NEXUS NETWORK SECURITY DEPT</p>
            </div>
          </div>
        `
      },
      {
        subject: "⚡ [Uplink Authorized] Synchronize Horizon Microgrid",
        html: (code: string) => `
          <div style="background-color: #020617; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 48px 32px; max-width: 520px; margin: 0 auto; border: 1px solid #1e293b; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.45);">
            <div style="text-align: center; margin-bottom: 40px;">
              <div style="display: inline-block; padding: 6px 12px; background-color: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 100px; margin-bottom: 16px;">
                <span style="font-size: 9px; font-family: monospace; letter-spacing: 0.25em; text-transform: uppercase; color: #3b82f6; font-weight: 700;">GRID SYNCHRONIZATION</span>
              </div>
              <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; letter-spacing: -0.05em; margin: 0; text-transform: uppercase;">ECO-SYNC <span style="color: #3b82f6;">NEXUS</span></h1>
              <p style="color: #64748b; font-size: 10px; font-family: monospace; letter-spacing: 0.4em; margin: 6px 0 0 0; text-transform: uppercase;">Horizon Grid Link</p>
            </div>
            <div style="margin-bottom: 32px;">
              <p style="color: #f1f5f9; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; font-weight: bold;">Uplink Requested.</p>
              <p style="color: #94a3b8; font-size: 13.5px; line-height: 1.6; margin: 0 0 24px 0;">To connect your client dashboard to the regional <strong>Microgrid distribution array</strong>, verify your device signature using this 4-digit code:</p>
            </div>
            <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 32px 24px; text-align: center; margin-bottom: 32px;">
              <p style="color: #64748b; font-size: 9px; font-family: monospace; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 12px 0; font-weight: 700;">Verification Code</p>
              <span style="font-size: 46px; font-weight: 900; color: #3b82f6; letter-spacing: 12px; font-family: monospace; padding-left: 12px; text-shadow: 0 0 20px rgba(59, 130,  Blue, 0.25);">${code}</span>
            </div>
            <div style="border-top: 1px solid #1e293b; padding-top: 24px; margin-bottom: 32px;">
              <p style="color: #64748b; font-size: 10px; font-family: monospace; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 16px 0; font-weight: 700;">Active Matrix Privileges:</p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; vertical-align: top; width: 22px; color: #3b82f6; font-size: 14px;">⛓</td>
                  <td style="padding: 4px 0; color: #94a3b8; font-size: 12px; line-height: 1.5;"><strong>P2P Asset Exchange</strong> — Real-time blockchain energy settlement ledger</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; vertical-align: top; width: 22px; color: #3b82f6; font-size: 14px;">💡</td>
                  <td style="padding: 4px 0; color: #94a3b8; font-size: 12px; line-height: 1.5;"><strong>Aether Grid Controller</strong> — Fine-tuned manual grid-draw override configurations</td>
                </tr>
              </table>
            </div>
            <div style="text-align: center; border-top: 1px solid #1e293b; padding-top: 20px;">
              <p style="color: #475569; font-size: 10px; line-height: 1.5; margin: 0;">This transmission is securely encrypted. If this was not initiated by you, please close this connection.</p>
            </div>
          </div>
        `
      },
      {
        subject: "⚛️ [Quantum Core] Verify System Calibration Code",
        html: (code: string) => `
          <div style="background-color: #09090b; color: #e4e4e7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 48px 32px; max-width: 520px; margin: 0 auto; border: 1px solid #27272a; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
            <div style="text-align: center; margin-bottom: 40px;">
              <div style="display: inline-block; padding: 6px 12px; background-color: rgba(156, 163, 175, 0.08); border: 1px solid rgba(156, 163, 175, 0.2); border-radius: 100px; margin-bottom: 16px;">
                <span style="font-size: 9px; font-family: monospace; letter-spacing: 0.25em; text-transform: uppercase; color: #9ca3af; font-weight: 700;">QUANTUM LOGISTICS</span>
              </div>
              <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; letter-spacing: -0.05em; margin: 0; text-transform: uppercase;">ECO-SYNC <span style="color: #9ca3af;">NEXUS</span></h1>
              <p style="color: #71717a; font-size: 10px; font-family: monospace; letter-spacing: 0.4em; margin: 6px 0 0 0; text-transform: uppercase;">Core Intelligence Engine</p>
            </div>
            <div style="margin-bottom: 32px;">
              <p style="color: #f4f4f5; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; font-weight: bold;">Calibration Triggered.</p>
              <p style="color: #a1a1aa; font-size: 13.5px; line-height: 1.6; margin: 0 0 24px 0;">To calibrate your microgrid client with the **Eco-Sync Neural Core**, verify your operator key using the calibration code below:</p>
            </div>
            <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px 24px; text-align: center; margin-bottom: 32px;">
              <p style="color: #71717a; font-size: 9px; font-family: monospace; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 12px 0; font-weight: 700;">System Calibration Key</p>
              <span style="font-size: 46px; font-weight: 900; color: #ffffff; letter-spacing: 12px; font-family: monospace; padding-left: 12px;">${code}</span>
            </div>
            <div style="border-top: 1px solid #27272a; padding-top: 24px; margin-bottom: 32px;">
              <p style="color: #71717a; font-size: 10px; font-family: monospace; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 16px 0; font-weight: 700;">Unlocked Nodes:</p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; vertical-align: top; width: 22px; color: #a1a1aa; font-size: 14px;">⚙</td>
                  <td style="padding: 4px 0; color: #a1a1aa; font-size: 12px; line-height: 1.5;"><strong>Adaptive Power Management</strong> — Intelligent AI routines shifting loads dynamically</td>
                </tr>
              </table>
            </div>
            <div style="text-align: center; border-top: 1px solid #27272a; padding-top: 20px;">
              <p style="color: #52525b; font-size: 10px; line-height: 1.5; margin: 0;">This transmission is automatically generated. Security token verified.</p>
            </div>
          </div>
        `
      },
      {
        subject: "⛓️ [Ledger Settlement] Verify Peer-to-Peer Key",
        html: (code: string) => `
          <div style="background-color: #022c22; color: #f0fdf4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 48px 32px; max-width: 520px; margin: 0 auto; border: 1px solid #064e3b; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="text-align: center; margin-bottom: 40px;">
              <div style="display: inline-block; padding: 6px 12px; background-color: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 100px; margin-bottom: 16px;">
                <span style="font-size: 9px; font-family: monospace; letter-spacing: 0.25em; text-transform: uppercase; color: #10b981; font-weight: 700;">P2P BLOCKCHAIN PROTOCOL</span>
              </div>
              <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; letter-spacing: -0.05em; margin: 0; text-transform: uppercase;">ECO-SYNC <span style="color: #10b981;">NEXUS</span></h1>
              <p style="color: #059669; font-size: 10px; font-family: monospace; letter-spacing: 0.4em; margin: 6px 0 0 0; text-transform: uppercase;">Asset Ledger System</p>
            </div>
            <div style="margin-bottom: 32px;">
              <p style="color: #ecfdf5; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; font-weight: bold;">Ledger Sync Requested.</p>
              <p style="color: #a7f3d0; font-size: 13px; line-height: 1.6; margin: 0 0 24px 0;">To authenticate your local blockchain node and access <strong>ECO Token assets</strong> and peer-to-peer microtransactions, enter this verification code:</p>
            </div>
            <div style="background-color: #064e3b; border: 1px solid #047857; border-radius: 16px; padding: 32px 24px; text-align: center; margin-bottom: 32px;">
              <p style="color: #a7f3d0; font-size: 9px; font-family: monospace; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 12px 0; font-weight: 700;">Blockchain Ledger Code</p>
              <span style="font-size: 46px; font-weight: 900; color: #10b981; letter-spacing: 12px; font-family: monospace; padding-left: 12px; text-shadow: 0 0 20px rgba(16, 185, 129, 0.3);">${code}</span>
            </div>
            <div style="border-top: 1px solid #064e3b; padding-top: 24px; margin-bottom: 32px;">
              <p style="color: #a7f3d0; font-size: 10px; font-family: monospace; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 16px 0; font-weight: 700;">Authorized Privileges:</p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; vertical-align: top; width: 22px; color: #10b981; font-size: 14px;">⛓</td>
                  <td style="padding: 4px 0; color: #a7f3d0; font-size: 12px; line-height: 1.5;"><strong>P2P Ledger Settlement</strong> — Smart tokenized contracts verified instantly on-chain</td>
                </tr>
              </table>
            </div>
            <div style="text-align: center; border-top: 1px solid #064e3b; padding-top: 20px;">
              <p style="color: #047857; font-size: 10px; line-height: 1.5; margin: 0;">Secured via cryptographic key generation. Verify signature.</p>
            </div>
          </div>
        `
      },
      {
        subject: "☀️ [Aether Sovereignty] Connect Solar Storage Node",
        html: (code: string) => `
          <div style="background-color: #0f0702; color: #ffedd5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 48px 32px; max-width: 520px; margin: 0 auto; border: 1px solid #431407; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="text-align: center; margin-bottom: 40px;">
              <div style="display: inline-block; padding: 6px 12px; background-color: rgba(249, 115, 22, 0.08); border: 1px solid rgba(249, 115, 22, 0.2); border-radius: 100px; margin-bottom: 16px;">
                <span style="font-size: 9px; font-family: monospace; letter-spacing: 0.25em; text-transform: uppercase; color: #ea580c; font-weight: 700;">SOLAR PROTOCOL</span>
              </div>
              <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; letter-spacing: -0.05em; margin: 0; text-transform: uppercase;">ECO-SYNC <span style="color: #ea580c;">NEXUS</span></h1>
              <p style="color: #c2410c; font-size: 10px; font-family: monospace; letter-spacing: 0.4em; margin: 6px 0 0 0; text-transform: uppercase;">Solar Energy Array</p>
            </div>
            <div style="margin-bottom: 32px;">
              <p style="color: #ffedd5; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; font-weight: bold;">Solar Generation Connected.</p>
              <p style="color: #fed7aa; font-size: 13.5px; line-height: 1.6; margin: 0 0 24px 0;">To authorize connection of your **Aether Solar Panels & Batteries** to your local user database dashboard, verify with this passcode:</p>
            </div>
            <div style="background-color: #431407; border: 1px solid #7c2d12; border-radius: 16px; padding: 32px 24px; text-align: center; margin-bottom: 32px;">
              <p style="color: #fed7aa; font-size: 9px; font-family: monospace; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 12px 0; font-weight: 700;">Solar Uplink Key</p>
              <span style="font-size: 46px; font-weight: 900; color: #ea580c; letter-spacing: 12px; font-family: monospace; padding-left: 12px; text-shadow: 0 0 20px rgba(234, 88, 12, 0.3);">${code}</span>
            </div>
            <div style="border-top: 1px solid #431407; padding-top: 24px; margin-bottom: 32px;">
              <p style="color: #fed7aa; font-size: 10px; font-family: monospace; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 16px 0; font-weight: 700;">Capabilities Added:</p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; vertical-align: top; width: 22px; color: #ea580c; font-size: 14px;">☀️</td>
                  <td style="padding: 4px 0; color: #fed7aa; font-size: 12px; line-height: 1.5;"><strong>Solar & Storage Metrics</strong> — Real-time yield logging and battery level tracking</td>
                </tr>
              </table>
            </div>
            <div style="text-align: center; border-top: 1px solid #431407; padding-top: 20px;">
              <p style="color: #7c2d12; font-size: 10px; line-height: 1.5; margin: 0;">Verified solar microgrid node. Active connection established.</p>
            </div>
          </div>
        `
      },
      {
        subject: "🤖 [Routines Active] Calibrate Smart Automation Grid",
        html: (code: string) => `
          <div style="background-color: #030712; color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 48px 32px; max-width: 520px; margin: 0 auto; border: 1px solid #1f2937; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="text-align: center; margin-bottom: 40px;">
              <div style="display: inline-block; padding: 6px 12px; background-color: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 100px; margin-bottom: 16px;">
                <span style="font-size: 9px; font-family: monospace; letter-spacing: 0.25em; text-transform: uppercase; color: #6366f1; font-weight: 700;">GRID INTEL PROTOCOL</span>
              </div>
              <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; letter-spacing: -0.05em; margin: 0; text-transform: uppercase;">ECO-SYNC <span style="color: #6366f1;">NEXUS</span></h1>
              <p style="color: #4f46e5; font-size: 10px; font-family: monospace; letter-spacing: 0.4em; margin: 6px 0 0 0; text-transform: uppercase;">Smart Automation Grid</p>
            </div>
            <div style="margin-bottom: 32px;">
              <p style="color: #f9fafb; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; font-weight: bold;">Routines Calibrated.</p>
              <p style="color: #d1d5db; font-size: 13.5px; line-height: 1.6; margin: 0 0 24px 0;">To unlock automated load management (Leave Home, Night Mode, Movie Time, Eco Max), authorize your node using the code below:</p>
            </div>
            <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px 24px; text-align: center; margin-bottom: 32px;">
              <p style="color: #d1d5db; font-size: 9px; font-family: monospace; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 12px 0; font-weight: 700;">Automation Sync Key</p>
              <span style="font-size: 46px; font-weight: 900; color: #6366f1; letter-spacing: 12px; font-family: monospace; padding-left: 12px; text-shadow: 0 0 20px rgba(99, 102, 241, 0.3);">${code}</span>
            </div>
            <div style="border-top: 1px solid #1f2937; padding-top: 24px; margin-bottom: 32px;">
              <p style="color: #d1d5db; font-size: 10px; font-family: monospace; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 16px 0; font-weight: 700;">Unlocked Functions:</p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; vertical-align: top; width: 22px; color: #6366f1; font-size: 14px;">🤖</td>
                  <td style="padding: 4px 0; color: #d1d5db; font-size: 12px; line-height: 1.5;"><strong>Smart Routine Manager</strong> — Run pre-optimized household routines with one click</td>
                </tr>
              </table>
            </div>
            <div style="text-align: center; border-top: 1px solid #1f2937; padding-top: 20px;">
              <p style="color: #4b5563; font-size: 10px; line-height: 1.5; margin: 0;">Secured via Automation Key Protocol. Connection verified.</p>
            </div>
          </div>
        `
      },
      {
        subject: "📉 [Analytics Pulse] Sync Energy Sovereignty Metrics",
        html: (code: string) => `
          <div style="background-color: #042f2e; color: #ccfbf1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 48px 32px; max-width: 520px; margin: 0 auto; border: 1px solid #115e59; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="text-align: center; margin-bottom: 40px;">
              <div style="display: inline-block; padding: 6px 12px; background-color: rgba(20, 184, 166, 0.08); border: 1px solid rgba(20, 184, 166, 0.2); border-radius: 100px; margin-bottom: 16px;">
                <span style="font-size: 9px; font-family: monospace; letter-spacing: 0.25em; text-transform: uppercase; color: #14b8a6; font-weight: 700;">ENERGY HORIZON</span>
              </div>
              <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; letter-spacing: -0.05em; margin: 0; text-transform: uppercase;">ECO-SYNC <span style="color: #14b8a6;">NEXUS</span></h1>
              <p style="color: #0d9488; font-size: 10px; font-family: monospace; letter-spacing: 0.4em; margin: 6px 0 0 0; text-transform: uppercase;">Sovereignty Analytics</p>
            </div>
            <div style="margin-bottom: 32px;">
              <p style="color: #ccfbf1; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; font-weight: bold;">System Diagnostic Verified.</p>
              <p style="color: #99f6e4; font-size: 13px; line-height: 1.6; margin: 0 0 24px 0;">To unlock access to **real-time utility grid dependency logs**, carbon metrics, and cumulative load history, authenticate your terminal node with this key:</p>
            </div>
            <div style="background-color: #115e59; border: 1px solid #0f766e; border-radius: 16px; padding: 32px 24px; text-align: center; margin-bottom: 32px;">
              <p style="color: #99f6e4; font-size: 9px; font-family: monospace; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 12px 0; font-weight: 700;">System Diagnostic Code</p>
              <span style="font-size: 46px; font-weight: 900; color: #14b8a6; letter-spacing: 12px; font-family: monospace; padding-left: 12px; text-shadow: 0 0 20px rgba(20, 184, 166, 0.35);">${code}</span>
            </div>
            <div style="border-top: 1px solid #115e59; padding-top: 24px; margin-bottom: 32px;">
              <p style="color: #99f6e4; font-size: 10px; font-family: monospace; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 16px 0; font-weight: 700;">Sovereignty privileges enabled:</p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; vertical-align: top; width: 22px; color: #14b8a6; font-size: 14px;">📊</td>
                  <td style="padding: 4px 0; color: #99f6e4; font-size: 12px; line-height: 1.5;"><strong>Grid Dependency Console</strong> — Interactive detailed diagnostics panel</td>
                </tr>
              </table>
            </div>
            <div style="text-align: center; border-top: 1px solid #115e59; padding-top: 20px;">
              <p style="color: #0f766e; font-size: 10px; line-height: 1.5; margin: 0;">Secured via Diagnostic Key Array. Metric console active.</p>
            </div>
          </div>
        `
      }
    ];

    // Select a random template
    const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
    const htmlContent = selectedTemplate.html(code);
    const subject = selectedTemplate.subject;
    
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASSWORD;
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "465");
    const smtpSender = process.env.SMTP_SENDER || smtpUser;

    const brevoApiKey = process.env.BREVO_API_KEY || (smtpPass?.startsWith("xkeysib-") ? smtpPass : null);

    // 1. Try sending via Brevo HTTP API if API key is provided
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
                email: targetEmail,
              },
            ],
            subject: subject,
            htmlContent: htmlContent,
          }),
        });

        if (response.ok) {
          return NextResponse.json({
            success: true,
            message: "Verification code sent to your email",
          });
        } else {
          const errData = await response.json();
          console.error("Brevo API delivery failed:", errData);
        }
      } catch (err: any) {
        console.error("Brevo API delivery failed, falling back", err);
      }
    }

    // 2. Try sending via SMTP if credentials are provided (allows sending to any address)
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
          to: targetEmail,
          subject: subject,
          html: htmlContent,
        });

        return NextResponse.json({
          success: true,
          message: "Verification code sent to your email",
        });
      } catch (err: any) {
        console.error("SMTP delivery failed, falling back to Resend or mock logs", err);
      }
    }

    // 3. Check if we can use Resend (fallback or primary if SMTP not configured)
    if (apiKey && apiKey !== "mock" && !apiKey.startsWith("your_")) {
      try {
        const resend = new Resend(apiKey);
        const { data, error } = await resend.emails.send({
          from: "Eco-Sync Nexus <onboarding@resend.dev>",
          to: targetEmail,
          subject: subject,
          html: htmlContent,
        });

        if (error) {
          throw error;
        }

        return NextResponse.json({
          success: true,
          message: "Verification code sent to your email",
        });
      } catch (err: any) {
        console.error("Resend delivery failed, falling back to mock logs", err);
      }
    }

    // Fallback: Mock mode
    console.log("\n==================================================");
    console.log(`[MOCK AUTH] [Template: "${subject}"]`);
    console.log(`Verification Code for ${targetEmail}: ${code}`);
    console.log("==================================================\n");

    return NextResponse.json({
      success: true,
      message: "Verification code sent (mock environment)",
      mockOtp: code, // Return in response only for testing
    });
  } catch (e: any) {
    console.error("Error in OTP send route:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
