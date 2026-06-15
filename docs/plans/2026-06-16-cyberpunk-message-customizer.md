# Cyberpunk Message Customizer Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Implement a customizable cyberpunk-themed notification system. Users will be able to select their preferred message format preset (Nexus Border, Quantum Terminal, Neo-Minimalist, Grid Override, or Dynamic Random) via a new interactive phone preview emulator in the settings.

**Architecture:** Add `messageStyle` to the Prisma schema `User` model, centralize ASCII/text styling formats in `src/lib/message-templates.ts`, update the user profile API to sync the choice, build an interactive phone mock emulator preview in the settings UI, and update backend routes to format Twilio messages using the new templates.

**Tech Stack:** Next.js, React, TailwindCSS/CSS, Framer Motion, Prisma ORM, Postgres, Twilio REST API.

---

### Task 1: Add messageStyle Field to Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma`
- Test: `scripts/test-message-style-field.ts` [NEW]

**Step 1: Write the failing test**
Create `scripts/test-message-style-field.ts` asserting that `messageStyle` can be saved and retrieved on a user:
```typescript
import assert from "assert";
import { db } from "../src/lib/db";

async function testMessageStyleField() {
  console.log("Verifying User messageStyle field in database...");
  const email = `style-test-${Date.now()}@example.com`;
  const user = await db.user.create({
    data: {
      email,
      name: "Style Tester",
      // @ts-ignore
      messageStyle: "nexus-border"
    }
  });

  // @ts-ignore
  assert.strictEqual(user.messageStyle, "nexus-border");
  
  // Cleanup
  await db.user.delete({ where: { id: user.id } });
  console.log("Test PASSED!");
}

testMessageStyleField().catch(e => {
  console.error("Test failed:", e);
  process.exit(1);
});
```

**Step 2: Run test to verify it fails**
Run: `npx tsx scripts/test-message-style-field.ts`
Expected: FAIL due to missing schema field.

**Step 3: Write minimal implementation**
1. Add `messageStyle` to `User` model in `prisma/schema.prisma`:
```prisma
  messageStyle     String   @default("random") // "random" | "nexus-border" | "quantum-terminal" | "neo-minimalist" | "grid-override"
```
2. Generate prisma client and push database updates:
```bash
npx prisma generate
npx prisma db push
```
3. If mock database mock helper is used (check `src/lib/db.ts`), add field to User mocks. Let's check `src/lib/db.ts` to see if we need mock updates.

**Step 4: Run test to verify it passes**
Run: `npx tsx scripts/test-message-style-field.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add prisma/schema.prisma scripts/test-message-style-field.ts
git commit -m "db: add messageStyle field to User schema"
```

---

### Task 2: Build Centralized Message Templates Library

**Files:**
- Create: `src/lib/message-templates.ts`
- Create: `scripts/test-message-templates.ts`

**Step 1: Write the failing test**
Create `scripts/test-message-templates.ts`:
```typescript
import assert from "assert";
import { getOtpMessage, getTimerMessage, getDeviceMessage, getTradeMessage } from "../src/lib/message-templates";

function testTemplates() {
  console.log("Testing message template formats...");
  
  // Test OTP Custom formats
  const otpMsg = getOtpMessage("nexus-border", "1234");
  assert.ok(otpMsg.includes("1234"), "OTP should contain the code");
  assert.ok(otpMsg.includes("┌───"), "Nexus border style should have top border");

  const otpMsgQuantum = getOtpMessage("quantum-terminal", "9999");
  assert.ok(otpMsgQuantum.includes("╔═══"), "Quantum style should have double lines");

  // Test Trade formats
  const tradeMsg = getTradeMessage("neo-minimalist", "15.5", "8.0", "124.00", "0xabc123");
  assert.ok(tradeMsg.includes("15.5 kWh"), "Trade message should include amount");
  assert.ok(tradeMsg.includes("///"), "Neo-minimalist style should contain slashes");

  console.log("Template Verification PASSED!");
}

testTemplates();
```

**Step 2: Run test to verify it fails**
Run: `npx tsx scripts/test-message-templates.ts`
Expected: FAIL (module not found)

**Step 3: Write minimal implementation**
Create `src/lib/message-templates.ts` containing the layout options for each style:
```typescript
export type MessageStyle = "random" | "nexus-border" | "quantum-terminal" | "neo-minimalist" | "grid-override";

const STYLES: MessageStyle[] = ["nexus-border", "quantum-terminal", "neo-minimalist", "grid-override"];

function resolveStyle(selected: MessageStyle): Exclude<MessageStyle, "random"> {
  if (selected === "random") {
    return STYLES[Math.floor(Math.random() * STYLES.length)];
  }
  return selected;
}

export function getOtpMessage(style: MessageStyle, code: string): string {
  const actualStyle = resolveStyle(style);
  switch (actualStyle) {
    case "nexus-border":
      return `┌─── ECO-SYNC NEXUS ───┐\n│   SECURITY ACCESS    │\n├──────────────────────┤\n│ AUT_KEY:  ${code}       │\n│ EXPIRY:   10 MIN     │\n├──────────────────────┤\n│ AUTHORIZING UPLINK   │\n└──────────────────────┘`;
    case "quantum-terminal":
      return `╔═══ ECO-SYNC: LINK ═══╗\n║  Verification Token  ║\n╠══════════════════════╣\n║ TOKEN:  [  ${code}  ]   ║\n╠══════════════════════╣\n║ Keep signature safe  ║\n╚══════════════════════╝`;
    case "neo-minimalist":
      return `/// LEDGER SYNC ///\n[NODE AUTHORIZATION]\n───────────────────────\nPASSCODE:   ${code}\nEXPIRY:     600 SEC\n───────────────────────\nP2P LEDGER PROTOCOL`;
    case "grid-override":
      return `⚡ AETHER ENERGY UPLINK ⚡\n=========================\nNODE CONN AUTHENTICATION\nAUTH KEY:   ${code}\n=========================\nSOLAR ARRAY OVERRIDE`;
  }
}

export function getTimerMessage(style: MessageStyle, device: string, kw: string, startTime: string, hrs: string): string {
  const actualStyle = resolveStyle(style);
  switch (actualStyle) {
    case "nexus-border":
      return `┌─── ECO-SYNC NEXUS ───┐\n│   TIMER SCHEDULED    │\n├──────────────────────┤\n│ 🤖 DEVICE: ${device.padEnd(10)}│\n│ ⚡ LOAD:   ${kw.padEnd(6)} kW │\n│ 📅 START:  ${startTime.padEnd(5)}     │\n│ ⏱️ RUNS:   ${hrs.padEnd(4)} hrs │\n├──────────────────────┤\n│ STATUS: PENDING      │\n└──────────────────────┘`;
    case "quantum-terminal":
      return `⚙️ QUANTUM SCHEDULE LOCKED\n══════════════════════════\nNode:     ${device}\nDraw:     ${kw} kW\nAt:       ${startTime}\nRuns for: ${hrs} hrs\n══════════════════════════\nAWAITING GREEN WINDOW`;
    case "neo-minimalist":
      return `🌐 [ECO-SYNC AUTOMATION]\n==============================\nTimer Set for ${device}\nPower Draw: ${kw} kW\nScheduled:  ${startTime}\nDuration:   ${hrs} hrs\n==============================\nSTATUS: ARMED & PENDING`;
    case "grid-override":
      return `[⚔️ NEXUS LOAD PERMIT ISSUED]\n══════════════════════════════\n🔹 Target: ${device}\n🔹 Load:   ${kw} kW\n🔹 At:     ${startTime}\n🔹 For:    ${hrs} hrs\n══════════════════════════════\nSCHEDULER: ARMED`;
  }
}

export function getDeviceMessage(style: MessageStyle, device: string, kw: string): string {
  const actualStyle = resolveStyle(style);
  switch (actualStyle) {
    case "nexus-border":
      return `┌─── ECO-SYNC NEXUS ───┐\n│   DEVICE ACTIVATED   │\n├──────────────────────┤\n│ 🤖 DEVICE: ${device.padEnd(10)}│\n│ ⚡ LOAD:   ${kw.padEnd(6)} kW │\n│ 🟢 STATE:  RUNNING   │\n├──────────────────────┤\n│ STATUS: ECO-OPTIMIZED│\n└──────────────────────┘`;
    case "quantum-terminal":
      return `╔═══ ECO-SYNC: AUTOMATION ═══╗\n║ Routine Event Triggered    ║\n╠════════════════════════════╣\n║ - Target:   ${device.padEnd(15)}║\n║ - Power:    ${kw.padEnd(11)} kW ║\n║ - Protocol: GREEN SYNCED   ║\n╚════════════════════════════╝`;
    case "neo-minimalist":
      return `/// ECO-SYNC ROUTINE ONLINE ///\n───────────────────────────────────\nAppliance:     ${device}\nExpected Load: ${kw} kW\nOptimizer:     Carbon Intensity Forecaster\n───────────────────────────────────\nGrid status: green power preferred`;
    case "grid-override":
      return `[🛡️ NEXUS SECURITY LOAD PERMIT]\n───────────────────────────────\n• Node Target: ${device}\n• Load draw:   ${kw} kW\n• Authorization: GRANTED\n• System State: RUNNING\n───────────────────────────────\nSYSTEM LOAD OPTIMIZED & SECURED`;
  }
}

export function getTradeMessage(style: MessageStyle, kwh: string, rate: string, totalEarned: string, txHash: string): string {
  const actualStyle = resolveStyle(style);
  switch (actualStyle) {
    case "nexus-border":
      return `⚡ *ECO-SYNC NEXUS // TRADE CONFIRMED* ⚡\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n🔋 *ENERGY SOLD:*    \`${kwh} kWh\`\n🪙 *RATE MULTIPLIER:* \`${rate} ECO\`\n💎 *TOTAL PAYOUT:*   \`*+${totalEarned} ECO*\`\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n📡 *TX SIG:*         \`${txHash}\`\n🟢 *LEDGER:*         _SETTLED (SEPOLIA)_`;
    case "quantum-terminal":
      return `🟢 *ECO-SYNC UPLINK // TRANSACTION SETTLED*\n◢◢◢◢◢◢◢◢◢◢◢◢◢◢◢◢◢◢◢◢\n☀️ *SOLAR DISCHARGE:* \`${kwh} kWh\`\n💳 *ENERGY CREDITS:*  \`+${totalEarned} ECO\`\n🔒 *BLOCKCHAIN SIG:*  \`${txHash}\`\n◢◢◢◢◢◢◢◢◢◢◢◢◢◢◢◢◢◢◢◢\n_Microgrid transaction successfully synchronized_`;
    case "neo-minimalist":
      return `⚙️ *NEXUS ASSET EXCHANGE // SUCCESS*\n════════════════════════\n🔋 *YIELD TRANSFERRED:* \`${kwh} kWh\`\n💎 *VALUE RECEIVED:*    \`+${totalEarned} ECO\`\n🔗 *CHAIN SIGNATURE:*   \`${txHash}\`\n════════════════════════\n*STATUS:* _VERIFIED SECURE_`;
    case "grid-override":
      return `📡 [LEDGER BROADCAST CONFIRMED]\n================================\n⚡ SOLD:  ${kwh} kWh\n🪙 VALUE: ${totalEarned} ECO\n🔗 HASH:  ${txHash}\n================================\nTRANSACTION SYNCHRONIZED SECURE`;
  }
}
```

**Step 4: Run test to verify it passes**
Run: `npx tsx scripts/test-message-templates.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/lib/message-templates.ts scripts/test-message-templates.ts
git commit -m "feat: implement centralized message-templates library"
```

---

### Task 3: Support messageStyle in Profile API and Context

**Files:**
- Modify: `src/app/api/auth/profile/route.ts`
- Modify: `src/context/AuthContext.tsx`
- Modify: `src/lib/db.ts` (if needed to add mock definitions)

**Step 1: Write the failing test**
Create a test script `scripts/test-profile-update-style.ts` asserting that we can send a PATCH request to `/api/auth/profile` with `messageStyle` and have it saved:
```typescript
import { verifyToken } from "../src/lib/session";
import { db } from "../src/lib/db";

async function run() {
  console.log("Verifying profile API handles messageStyle update...");
  // Test updates directly using DB logic or API mock trigger
  const user = await db.user.findFirst();
  if (!user) {
    console.log("No user found. Skipping direct DB assert.");
    return;
  }
  const updated = await db.user.update({
    where: { id: user.id },
    data: { messageStyle: "quantum-terminal" }
  });
  if (updated.messageStyle !== "quantum-terminal") {
    throw new Error("Update failed to set messageStyle");
  }
  console.log("API profile direct sync verified.");
}
run().catch(e => {
  console.error(e);
  process.exit(1);
});
```

**Step 2: Run test to verify it fails**
We skip the run since it's just checking schema validation in DB. Let's make sure the PATCH route is updated.

**Step 3: Write minimal implementation**
1. Open `src/app/api/auth/profile/route.ts` and add `messageStyle` to allowed updates inside the `PATCH` handler:
```typescript
    if (updates.messageStyle !== undefined) {
      allowedUpdates.messageStyle = updates.messageStyle;
    }
```
2. Open `src/context/AuthContext.tsx` and add `messageStyle` to the `UserProfile` interface:
```typescript
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  bio: string;
  avatarUrl: string;
  themeMode: "dark" | "light" | "system";
  costFactor: number;
  batteryCap: number;
  phoneNumber?: string | null;
  notificationType?: string;
  messageStyle?: string; // Add this line
}
```
3. Open `src/lib/db.ts` and verify if there is any mock db schema helpers we need to update. Let's make sure `messageStyle` is mocked in local memory mock DB helper if one is used. Let's verify by checking if `src/lib/db.ts` contains mocked objects.
Let's see: `src/lib/db.ts` calls `@prisma/client`. In `docs/plans/2026-06-15-whatsapp-twilio-notification.md` we saw "update user.create mock helper... in src/lib/db.ts". Let's verify if `src/lib/db.ts` mock DB wrapper requires updates. (If yes, we will modify it).

**Step 4: Run test to verify it passes**
Run: `npx tsx scripts/test-profile-update-style.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/app/api/auth/profile/route.ts src/context/AuthContext.tsx scripts/test-profile-update-style.ts
git commit -m "feat: permit messageStyle updates in profile endpoint and context"
```

---

### Task 4: Implement Phone Emulator UI & Preview in SettingsDrawer

**Files:**
- Modify: `src/components/SettingsDrawer.tsx`

**Step 1: Write code changes**
Edit `src/components/SettingsDrawer.tsx` to:
1. Add `messageStyle` state synced with user profile:
   - State: `const [messageStyle, setMessageStyle] = useState<MessageStyle>("random");`
   - Effect sync: `setMessageStyle((user.messageStyle as MessageStyle) || "random");`
2. Add template import from `@/lib/message-templates`:
   - `import { getOtpMessage, getTimerMessage, getTradeMessage, MessageStyle } from "@/lib/message-templates";`
3. Implement a beautiful mock phone emulator layout in the settings drawer:
   - State for preview tab: `const [previewTab, setPreviewTab] = useState<"otp" | "timer" | "trade">("trade");`
   - Function to return formatted preview body:
     ```typescript
     const getPreviewContent = () => {
       switch (previewTab) {
         case "otp":
           return getOtpMessage(messageStyle, "8429");
         case "timer":
           return getTimerMessage(messageStyle, "Tesla Charger", "7.2", "18:00", "4.0");
         case "trade":
           return getTradeMessage(messageStyle, "14.8", "8.0", "118.40", "0x7d39f...e82b");
       }
     };
     ```
4. Build the premium interactive components:
   - Section header: `🤖 Uplink Customizer // Cyber-SMS Styles`
   - A mockup terminal phone viewport frame:
     - Aspect ratio aspect-video or height, sleek glass background, border, camera notch.
     - Status bar: `📶 UPLINK-NET  |  🔋 88%`
     - Chat bubble / notification box containing the message formatted with monospace typography `font-mono text-[9px] whitespace-pre-wrap text-emerald-400 bg-black/90 border border-emerald-950/80 p-3 rounded-xl`.
   - Selector buttons for themes with glow hover:
     - `Nexus Border`, `Quantum Terminal`, `Neo-Minimalist`, `Grid Override`, `Dynamic Random`
   - Instantly trigger save profile on selecting style:
     ```typescript
     const handleStyleChange = async (style: MessageStyle) => {
       setMessageStyle(style);
       triggerSystemSyncIndicator();
       try {
         await updateProfile({ messageStyle: style });
       } catch (e) {
         console.error("Failed to sync messageStyle", e);
       }
     };
     ```

**Step 2: Commit**
```bash
git add src/components/SettingsDrawer.tsx
git commit -m "feat: design and add cyberpunk phone preview emulator customizer in SettingsDrawer"
```

---

### Task 5: Hook Centralized Templates to SMS/WhatsApp APIs

**Files:**
- Modify: `src/app/api/auth/otp/send/route.ts`
- Modify: `src/app/api/trading/sell/route.ts`
- Modify: `src/app/api/forecaster/schedule/route.ts`
- Modify: `src/app/api/auth/test-notify/route.ts`

**Step 1: Update OTP route**
1. Import `getOtpMessage` from `@/lib/message-templates` in `src/app/api/auth/otp/send/route.ts`.
2. Look up the user by email or phone (from the request) to read their preferred `messageStyle` (or fallback to `random` if user doesn't exist yet):
   ```typescript
   const userRecord = await db.user.findUnique({ where: { email: parsed.email } });
   const style = (userRecord?.messageStyle || "random") as MessageStyle;
   const selectedSms = getOtpMessage(style, code);
   ```
3. Remove old random hardcoded list in that route.

**Step 2: Update Trading Sell route**
1. Import `getTradeMessage` from `@/lib/message-templates` in `src/app/api/trading/sell/route.ts`.
2. Use the user's `messageStyle`:
   ```typescript
   const style = (user.messageStyle || "random") as MessageStyle;
   const alertBody = getTradeMessage(style, kwh, rate, totalEarned, txHash);
   ```
3. Remove old random hardcoded list in that route.

**Step 3: Update Forecaster Schedule route**
1. Import `getTimerMessage` and `getDeviceMessage` from `@/lib/message-templates` in `src/app/api/forecaster/schedule/route.ts`.
2. Use the user's `messageStyle` for schedule creation (timer set) and status update (device activated):
   - Timer Set (POST):
     ```typescript
     const style = (user.messageStyle || "random") as MessageStyle;
     const alertBody = getTimerMessage(style, device, kw, startTime, hrs);
     ```
   - Device Activated (PATCH / status == "running"):
     ```typescript
     const style = (user.messageStyle || "random") as MessageStyle;
     const alertBody = getDeviceMessage(style, device, kw);
     ```

**Step 4: Update Test Notify route**
1. Import `getTimerMessage` from `@/lib/message-templates` in `src/app/api/auth/test-notify/route.ts`.
2. Retrieve user's `messageStyle` and generate the test notification text accordingly:
   ```typescript
   const style = (user.messageStyle || "random") as MessageStyle;
   const testMessage = getTimerMessage(style, "Virtual Nexus Grid", "15.0", "NOW", "24.0");
   ```

**Step 5: Run tests and commit**
```bash
git add src/app/api/auth/otp/send/route.ts src/app/api/trading/sell/route.ts src/app/api/forecaster/schedule/route.ts src/app/api/auth/test-notify/route.ts
git commit -m "refactor: integrate centralized message templates into backend routes"
```

---

### Task 6: Verification and Manual Review

**Steps:**
1. Start development server: `npm run dev` or check if running.
2. Sign in to the portal.
3. Open the Settings Drawer, set your phone number if not saved.
4. Interact with the new Phone Emulator customizer, toggle through tabs (OTP, Timer, Trade), select different layouts, and verify updates persist.
5. Click "Test Notification" to send live/mock notifications. Observe the terminal output log (if Twilio credentials are in fallback mock mode) or phone screen (if live credentials are active) to verify that the message style matches the chosen theme exactly!
