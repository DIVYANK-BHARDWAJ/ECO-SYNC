# Botpress Chatbot Integration Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Integrate a third-party Botpress chatbot into the Eco-Sync Nexus application, replacing the default launcher with a custom glassmorphic bubble and synchronizing user profiles and live grid metrics (solar, battery, wallet balance) with the chat context in real-time.

**Architecture:** Create a frontend React component `BotpressChatbot.tsx` that loads the Botpress Webchat JavaScript client, initializes it programmatically to hide the default UI widget, and binds a custom-animated launcher button. A utility module `botpress.ts` formats the user profile and simulation metrics before pushing them to the chatbot API.

**Tech Stack:** Next.js (App Router), TypeScript, Framer Motion, Lucide React, Botpress Webchat API

---

### Task 1: Environment Variables Configuration

**Files:**
- Modify: `c:/Users/DIVYANK BHARDWAJ/Desktop/Projects/eco sync updated/eco-sync/.env.local`

**Step 1: Write placeholder variables**
Open `.env.local` and add the config placeholders at the end of the file.

```bash
# Botpress Webchat Configurations
NEXT_PUBLIC_BOTPRESS_BOT_ID="0d0e145b-7c8a-40a2-9f3b-5d9c1234abcd"
NEXT_PUBLIC_BOTPRESS_CLIENT_ID="5e6f7a8b-9c0d-4e1f-2a3b-4c5d6e7f8a9b"
```

**Step 2: Commit**

```bash
git add .env.local
git commit -m "config: add botpress credentials placeholders to environment variables"
```

---

### Task 2: Create Context Formatting Utility and Write Tests

**Files:**
- Create: `c:/Users/DIVYANK BHARDWAJ/Desktop/Projects/eco sync updated/eco-sync/src/lib/botpress.ts`
- Create: `c:/Users/DIVYANK BHARDWAJ/Desktop/Projects/eco sync updated/eco-sync/scripts/test-botpress.ts`

**Step 1: Write the failing test**
Create `scripts/test-botpress.ts` and verify that the format output structure is validated.

```typescript
import assert from "assert";
import { formatBotpressPayload } from "../src/lib/botpress";

function runTest() {
  console.log("Running Botpress payload formatter test...");
  
  const mockContext = {
    name: "Jane Prosumer",
    email: "jane@example.com",
    batteryLevel: 10.53,
    batteryCapacity: 13.5,
    solarGeneration: 4.21,
    gridDependency: 1.84,
    walletBalance: 120.456,
  };

  const payload = formatBotpressPayload(mockContext);

  assert.strictEqual(payload.type, "session_context");
  assert.strictEqual(payload.name, "Jane Prosumer");
  assert.strictEqual(payload.email, "jane@example.com");
  assert.strictEqual(payload.batteryLevel, "10.5 kWh");
  assert.strictEqual(payload.batteryPct, "78%");
  assert.strictEqual(payload.solarGeneration, "4.2 kW");
  assert.strictEqual(payload.gridDependency, "1.8 kW");
  assert.strictEqual(payload.walletBalance, "120.46 ECO");

  console.log("Test PASSED!");
}

try {
  runTest();
} catch (error) {
  console.error("Test FAILED:", error);
  process.exit(1);
}
```

**Step 2: Run test to verify it fails**
Run: `npx tsx scripts/test-botpress.ts`
Expected: FAIL (Cannot find module '../src/lib/botpress' or function undefined)

**Step 3: Write minimal implementation**
Create `src/lib/botpress.ts` to implement the logic.

```typescript
export interface ProsumerContext {
  name: string;
  email: string;
  batteryLevel: number;
  batteryCapacity: number;
  solarGeneration: number;
  gridDependency: number;
  walletBalance: number;
}

export function formatBotpressPayload(context: ProsumerContext) {
  const percentage = context.batteryCapacity > 0
    ? Math.round((context.batteryLevel / context.batteryCapacity) * 100)
    : 0;

  return {
    type: "session_context",
    name: context.name || "Nexus Explorer",
    email: context.email,
    batteryLevel: `${context.batteryLevel.toFixed(1)} kWh`,
    batteryPct: `${percentage}%`,
    solarGeneration: `${context.solarGeneration.toFixed(1)} kW`,
    gridDependency: `${context.gridDependency.toFixed(1)} kW`,
    walletBalance: `${context.walletBalance.toFixed(2)} ECO`,
  };
}
```

**Step 4: Run test to verify it passes**
Run: `npx tsx scripts/test-botpress.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/botpress.ts scripts/test-botpress.ts
git commit -m "feat: add botpress context payload formatting helper and verify via tests"
```

---

### Task 3: Implement the Custom React Chatbot Component

**Files:**
- Create: `c:/Users/DIVYANK BHARDWAJ/Desktop/Projects/eco sync updated/eco-sync/src/components/BotpressChatbot.tsx`

**Step 1: Write the chatbot component**
Create `src/components/BotpressChatbot.tsx` containing the dynamic script injection, custom window object typings, initialization override parameters, and custom Framer Motion styled floating launcher.

```tsx
"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareCode, X } from "lucide-react";
import { formatBotpressPayload, ProsumerContext } from "@/lib/botpress";

interface BotpressChatbotProps {
  context: ProsumerContext;
}

declare global {
  interface Window {
    botpressWebChat: any;
  }
}

export default function BotpressChatbot({ context }: BotpressChatbotProps) {
  const [isBotpressLoaded, setIsBotpressLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Initialize botpress options
  const handleScriptLoad = () => {
    if (window.botpressWebChat) {
      window.botpressWebChat.init({
        composerPlaceholder: "Talk to Aetheria Assistant...",
        botConversationDescription: "Decentralized Energy Sovereignty AI",
        botId: process.env.NEXT_PUBLIC_BOTPRESS_BOT_ID || "0d0e145b-7c8a-40a2-9f3b-5d9c1234abcd",
        hostUrl: "https://cdn.botpress.cloud/webchat/v1",
        messagingUrl: "https://messaging.botpress.cloud",
        clientId: process.env.NEXT_PUBLIC_BOTPRESS_CLIENT_ID || "5e6f7a8b-9c0d-4e1f-2a3b-4c5d6e7f8a9b",
        showWidget: false,
        hideWidget: true,
        themeName: "custom",
        theme: {
          "color-brand": "#10b981",          // Emerald Green
          "color-background": "#09090b",     // slate-950/zinc-950
          "color-composer": "#18181b",       // zinc-900
          "color-bubble": "#10b981",         // Bot chat bubble
          "color-text-bubble": "#ffffff",
        }
      });
      setIsBotpressLoaded(true);
    }
  };

  // Synchronize state contexts
  useEffect(() => {
    if (isBotpressLoaded && window.botpressWebChat) {
      const payload = formatBotpressPayload(context);
      try {
        window.botpressWebChat.sendPayload(payload);
        console.log("[Aetheria Chatbot] Synced real-time state:", payload);
      } catch (e) {
        console.error("[Aetheria Chatbot] Failed to sync state payload:", e);
      }
    }
  }, [context, isBotpressLoaded]);

  const toggleChat = () => {
    if (!window.botpressWebChat) return;
    if (isOpen) {
      window.botpressWebChat.sendEvent({ type: "hide" });
    } else {
      window.botpressWebChat.sendEvent({ type: "show" });
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Script
        src="https://cdn.botpress.cloud/webchat/v1/inject.js"
        onLoad={handleScriptLoad}
        strategy="lazyOnload"
      />

      <div className="fixed bottom-6 right-6 z-[140]">
        <motion.button
          onClick={toggleChat}
          whileHover={{ scale: 1.1, translateY: -2 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-zinc-900/80 backdrop-blur-xl border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:border-emerald-400/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.35)] transition-all cursor-pointer"
          title="Talk to Grid Assistant"
        >
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping opacity-75 pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageSquareCode className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/BotpressChatbot.tsx
git commit -m "feat: implement customized BotpressChatbot React Component"
```

---

### Task 4: Mount Component on Homepage and Trading page

**Files:**
- Modify: `c:/Users/DIVYANK BHARDWAJ/Desktop/Projects/eco sync updated/eco-sync/src/app/page.tsx:596-602`
- Modify: `c:/Users/DIVYANK BHARDWAJ/Desktop/Projects/eco sync updated/eco-sync/src/app/trading/page.tsx:618-626`

**Step 1: Mount BotpressChatbot on Homepage**
Open `src/app/page.tsx`. Import the component at the top:
```typescript
import BotpressChatbot from "@/components/BotpressChatbot";
```
Locate the main layout section around line 604 where active modals are placed, and insert the `BotpressChatbot` component:
```tsx
      <AnimatePresence>
        {/* ... existing modals ... */}
      </AnimatePresence>

      <BotpressChatbot
        context={{
          name: user.name || "Nexus Explorer",
          email: user.email,
          batteryLevel: solarState.batteryLevel,
          batteryCapacity: solarState.batteryCapacity,
          solarGeneration: solarState.solarGeneration,
          gridDependency: solarState.gridDependency,
          walletBalance: 0.00, // Sync with actual wallet token state if available
        }}
      />
```

**Step 2: Mount BotpressChatbot on Trading Page**
Open `src/app/trading/page.tsx`. Import the component at the top:
```typescript
import BotpressChatbot from "@/components/BotpressChatbot";
```
Locate the render tree, and place it at the root container level inside `user` checks:
```tsx
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* ... existing header and grid ... */}
      </div>

      <BotpressChatbot
        context={{
          name: user.name || "Nexus Explorer",
          email: user.email,
          batteryLevel: solarState.batteryLevel,
          batteryCapacity: solarState.batteryCapacity,
          solarGeneration: solarState.solarGeneration,
          gridDependency: solarState.gridDependency,
          walletBalance: walletBalance,
        }}
      />
```

**Step 3: Commit**

```bash
git add src/app/page.tsx src/app/trading/page.tsx
git commit -m "feat: mount BotpressChatbot component in dashboard and trading views"
```
