# Carbon-Intensity Forecaster & Smart-Appliance Scheduler Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Build a carbon-intensity forecasting chart and scheduling system that schedules simulated appliances to run during the cleanest hours of the grid, saving carbon and balancing energy.

**Architecture:** We will update the Prisma schema and the JSON-fallback `db` wrapper to support schedule persistence. Next, we will implement the forecast and scheduler API routes, followed by building the `CarbonSchedulerSection` UI component and integrating the automated scheduler event-trigger loop inside the main simulated time tick of the dashboard.

**Tech Stack:** Next.js, Prisma ORM, Neon PostgreSQL (or Mock JSON DB fallback), Lucide React, Framer Motion, TypeScript, TailwindCSS.

---

### Task 1: Update Database Schema

**Files:**
- Modify: `prisma/schema.prisma:10-48`
- Create: `scripts/test-prisma-schema.ts`

**Step 1: Write the failing test**
Create `scripts/test-prisma-schema.ts` to assert that the `applianceSchedule` relation and properties exist on the database client wrapper.
```typescript
import assert from "assert";
import { db } from "../src/lib/db";

async function testSchema() {
  console.log("Verifying ApplianceSchedule schema fields...");
  try {
    const mockUser = await db.user.create({
      data: { email: "schema-test@example.com" }
    });
    
    // Attempt to access schedule proxy which is currently undefined
    // @ts-ignore
    assert.ok(db.applianceSchedule);
    console.log("Test PASSED!");
  } catch (error: any) {
    console.error("Test failed as expected:", error.message);
    process.exit(1);
  }
}

testSchema();
```

**Step 2: Run test to verify it fails**
Run: `npx tsx scripts/test-prisma-schema.ts` (or `npx ts-node scripts/test-prisma-schema.ts`)
Expected: FAIL with `AssertionError: undefined == true` or similar db accessor error.

**Step 3: Write minimal implementation**
1. Add the `ApplianceSchedule` model and update `User` in `prisma/schema.prisma`:
```prisma
model User {
  id          String   @id @default(uuid())
  email       String   @unique
  name        String?  @default("Nexus Explorer")
  bio         String?  @default("")
  avatarUrl   String?  @default("/avatars/nexus-default.png")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  themeMode   String   @default("system")
  costFactor  Float    @default(8.0)
  batteryCap  Float    @default(13.5)
  
  otps         OtpVerification[]
  transactions Transaction[]
  schedules    ApplianceSchedule[]
}

model ApplianceSchedule {
  id         String   @id @default(uuid())
  deviceName String
  powerDraw  Float
  startTime  String   // format "HH:MM" (simulated time)
  duration   Float    // duration in hours
  status     String   @default("pending") // "pending" | "running" | "completed" | "cancelled"
  createdAt  DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId     String
}
```

2. Run client generation commands (optional/if needed for prisma):
`npx prisma generate`

**Step 4: Run test to verify it passes**
Run: `npx tsx scripts/test-prisma-schema.ts`
Expected: PASS (once the db wrapper in Task 2 is also implemented to supply this relation).

**Step 5: Commit**
```bash
git add prisma/schema.prisma scripts/test-prisma-schema.ts
git commit -m "db: add ApplianceSchedule model to prisma schema"
```

---

### Task 2: Extend Local DB Proxy Wrapper

**Files:**
- Modify: `src/lib/db.ts:1-294`
- Create: `scripts/test-db-wrapper.ts`

**Step 1: Write the failing test**
Create `scripts/test-db-wrapper.ts` to assert that scheduling operations (create, findMany, delete) work through the proxy.
```typescript
import assert from "assert";
import { db } from "../src/lib/db";

async function testDbWrapper() {
  console.log("Testing db.applianceSchedule proxy wrapper...");
  
  const user = await db.user.findUnique({ where: { email: "schema-test@example.com" } }) 
    || await db.user.create({ data: { email: "schema-test@example.com" } });
    
  // @ts-ignore
  const newSchedule = await db.applianceSchedule.create({
    data: {
      deviceName: "Dishwasher",
      powerDraw: 1.5,
      startTime: "14:00",
      duration: 2.0,
      userId: user.id
    }
  });
  
  assert.strictEqual(newSchedule.deviceName, "Dishwasher");
  assert.strictEqual(newSchedule.status, "pending");
  
  // @ts-ignore
  const list = await db.applianceSchedule.findMany({
    where: { userId: user.id }
  });
  assert.ok(list.length > 0);
  
  console.log("DB Wrapper Test PASSED!");
}

testDbWrapper().catch(e => {
  console.error("Test failed:", e);
  process.exit(1);
});
```

**Step 2: Run test to verify it fails**
Run: `npx tsx scripts/test-db-wrapper.ts`
Expected: FAIL with `TypeError: Cannot read properties of undefined (reading 'create')`.

**Step 3: Write minimal implementation**
Modify `src/lib/db.ts`:
1. Define interfaces `ApplianceScheduleData`.
2. Update `readMockDb` and `writeMockDb` to serialize and store `schedules`.
3. Add `applianceSchedule` service proxy to the export proxy `db`.
```typescript
interface ApplianceScheduleData {
  id: string;
  deviceName: string;
  powerDraw: number;
  startTime: string;
  duration: number;
  status: string;
  createdAt: Date;
  userId: string;
}

// In readMockDb:
// schedules: (data.schedules || []).map((s: any) => ({ ...s, createdAt: new Date(s.createdAt) }))

// Under export const db = {
//   ...
//   applianceSchedule: {
//     findMany: async (args: { where: { userId: string } }) => { ... },
//     create: async (args: { data: Omit<ApplianceScheduleData, "id" | "createdAt" | "status"> & { userId: string } }) => { ... },
//     update: async (args: { where: { id: string }; data: Partial<ApplianceScheduleData> }) => { ... },
//     delete: async (args: { where: { id: string } }) => { ... }
//   }
// }
```

**Step 4: Run test to verify it passes**
Run: `npx tsx scripts/test-db-wrapper.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/lib/db.ts scripts/test-db-wrapper.ts
git commit -m "db: extend local database proxy for appliance schedules"
```

---

### Task 3: Implement Grid Carbon Intensity Forecast API Endpoint

**Files:**
- Create: `src/app/api/forecaster/grid/route.ts`
- Create: `scripts/test-grid-api.ts`

**Step 1: Write the failing test**
Create `scripts/test-grid-api.ts` to call the `/api/forecaster/grid` route and verify structured output.
```typescript
import assert from "assert";

async function testGridApi() {
  console.log("Verifying /api/forecaster/grid endpoint...");
  const res = await fetch("http://localhost:3000/api/forecaster/grid", {
    headers: { "Cookie": "session=mock-cookie-placeholder" }
  });
  const data = await res.json();
  
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(data.forecast));
  assert.strictEqual(data.forecast.length, 24);
  assert.ok("bestHour" in data);
  console.log("Grid API Test PASSED!");
}

testGridApi().catch(e => {
  console.error("Test failed:", e);
  process.exit(1);
});
```

**Step 2: Run test to verify it fails**
Run: `npx tsx scripts/test-grid-api.ts`
Expected: FAIL (404 Not Found or connection refused if dev server is not running, but once running, returns 404).

**Step 3: Write minimal implementation**
Create `src/app/api/forecaster/grid/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/session";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = cookies().get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decoded = verifyToken(sessionCookie);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Double sinusoidal wave: morning peak (8 AM), evening peak (8 PM), clean troughs (3 AM, 1 PM)
    const forecast = Array.from({ length: 24 }, (_, hour) => {
      const t1 = (hour - 3) * (2 * Math.PI / 24);
      const t2 = (hour - 13) * (2 * Math.PI / 24);
      // Base intensity around 220 gCO2/kWh, scaling from 50 to 520
      const sinVal = Math.sin(t1) * 0.4 + Math.sin(t2 * 2) * 0.6;
      let intensity = Math.round(250 + sinVal * 200);
      intensity = Math.max(50, Math.min(550, intensity));

      let status: "clean" | "moderate" | "peak" = "moderate";
      if (intensity < 150) status = "clean";
      else if (intensity > 350) status = "peak";

      return { hour, intensity, status };
    });

    const intensities = forecast.map(f => f.intensity);
    const minIntensity = Math.min(...intensities);
    const bestHour = forecast.find(f => f.intensity === minIntensity)?.hour ?? 3;
    const averageIntensity = Math.round(intensities.reduce((a, b) => a + b, 0) / 24);

    return NextResponse.json({ forecast, bestHour, averageIntensity });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

**Step 4: Run test to verify it passes**
1. Start dev server: `npm run dev`
2. Run test: `npx tsx scripts/test-grid-api.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/app/api/forecaster/grid/route.ts scripts/test-grid-api.ts
git commit -m "api: implement carbon intensity grid forecast route"
```

---

### Task 4: Implement Schedule Management APIs

**Files:**
- Create: `src/app/api/forecaster/schedule/route.ts`
- Create: `scripts/test-schedule-api.ts`

**Step 1: Write the failing test**
Create `scripts/test-schedule-api.ts` to test GET, POST, and DELETE on the schedule route.
```typescript
import assert from "assert";

async function testScheduleApi() {
  console.log("Verifying /api/forecaster/schedule API operations...");
  // Test POST
  const postRes = await fetch("http://localhost:3000/api/forecaster/schedule", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": "session=mock-cookie-placeholder"
    },
    body: JSON.stringify({
      deviceName: "EV Charger",
      powerDraw: 7.2,
      startTime: "02:00",
      duration: 3.5
    })
  });
  assert.strictEqual(postRes.status, 200);
  const postData = await postRes.json();
  assert.ok(postData.schedule.id);
  
  // Test GET
  const getRes = await fetch("http://localhost:3000/api/forecaster/schedule", {
    headers: { "Cookie": "session=mock-cookie-placeholder" }
  });
  const getData = await getRes.json();
  assert.ok(getData.schedules.length > 0);
  
  // Test DELETE
  const delRes = await fetch(`http://localhost:3000/api/forecaster/schedule?id=${postData.schedule.id}`, {
    method: "DELETE",
    headers: { "Cookie": "session=mock-cookie-placeholder" }
  });
  assert.strictEqual(delRes.status, 200);
  
  console.log("Schedule API test PASSED!");
}

testScheduleApi().catch(e => {
  console.error("Test failed:", e);
  process.exit(1);
});
```

**Step 2: Run test to verify it fails**
Run: `npx tsx scripts/test-schedule-api.ts`
Expected: FAIL with 404.

**Step 3: Write minimal implementation**
Create `src/app/api/forecaster/schedule/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/session";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = cookies().get("session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = verifyToken(sessionCookie);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { email: decoded.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // @ts-ignore
    const schedules = await db.applianceSchedule.findMany({
      where: { userId: user.id }
    });

    return NextResponse.json({ schedules });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = cookies().get("session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = verifyToken(sessionCookie);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { email: decoded.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { deviceName, powerDraw, startTime, duration } = body;

    // @ts-ignore
    const schedule = await db.applianceSchedule.create({
      data: {
        deviceName,
        powerDraw: Number(powerDraw),
        startTime,
        duration: Number(duration),
        userId: user.id
      }
    });

    return NextResponse.json({ success: true, schedule });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionCookie = cookies().get("session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = verifyToken(sessionCookie);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing schedule ID" }, { status: 400 });

    // @ts-ignore
    await db.applianceSchedule.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

**Step 4: Run test to verify it passes**
Run: `npx tsx scripts/test-schedule-api.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/app/api/forecaster/schedule/route.ts scripts/test-schedule-api.ts
git commit -m "api: implement schedule management endpoints"
```

---

### Task 5: Create CarbonSchedulerSection UI Component

**Files:**
- Create: `src/components/CarbonSchedulerSection.tsx`

**Step 1: Write mock tests or implement UI structure**
Create `src/components/CarbonSchedulerSection.tsx` as a beautiful interactive React component styled with high-fidelity glassmorphism, sliders, custom inputs, and dynamic carbon savings outputs:
- A custom SVG line-graph representing the carbon forecast.
- A visual slider select element for hours 0-23.
- Integrated schedule submissions and queue list display.

**Step 2: Verify component renders without compile errors**
Create a test component rendering it, or run `npm run build` once mounted.

**Step 3: Implement minimal code**
Complete the `CarbonSchedulerSection` UI component code with clean visual styling matching the dark slate theme of Eco-Sync.

**Step 4: Verify design**
Compile project via `npm run build` or check standard console errors.

**Step 5: Commit**
```bash
git add src/components/CarbonSchedulerSection.tsx
git commit -m "fe: build CarbonSchedulerSection visual dashboard UI"
```

---

### Task 6: Integrate with Main Page & Active Simulation Loop

**Files:**
- Modify: `src/app/page.tsx:1-809`

**Step 1: Mount the Scheduler component**
Mount `<CarbonSchedulerSection />` between the appliance control hub (`UHDSection`) and the Power Horizon Telemetry chart (`SavingsGraph`).

**Step 2: Hook up scheduled triggers to simulation loop**
Update the simulation loop:
1. Maintain simulated time state, ticking 15 minutes of simulated time every 3-second tick.
2. Cross-reference pending schedules with current simulated hour.
3. Automatically toggle scheduled appliance state, fire alerts/notifications, write events to history logs, and update status to `running`.
4. Shut off device and mark schedule `completed` when duration runs out.

**Step 3: Run dev verification**
Run the Next.js dev server, test scheduling an appliance at a low-carbon simulated hour, and check if it runs automatically when the clock matches.

**Step 4: Verify build succeeds**
Run `npm run build` to confirm everything is typed and bundled correctly.

**Step 5: Commit**
```bash
git add src/app/page.tsx
git commit -m "fe: integrate simulated time loop and automated appliance triggers"
```
