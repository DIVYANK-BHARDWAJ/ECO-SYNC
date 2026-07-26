# EcoSync Commercial Startup Transformation Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Transform EcoSync into a hardware-agnostic, consumer-first smart energy management and fiat-first P2P marketplace startup platform with verification level gates, MPC battery optimization, real ML forecasting, and LLM co-pilot tool integration.

**Architecture:** Implement a Universal Energy Data Model and hardware adapter pipeline (Enphase, Home Assistant MQTT, Simulator) with Verification Levels (0-4). Build a double-entry internal P2P trade ledger, payment provider abstraction layer, real weather/carbon forecaster with Model Predictive Control (MPC) optimization, and OpenAI Function Calling LLM Co-Pilot agent.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL, Open-Meteo API, Ethers.js, OpenAI API, Vitest/Jest for unit tests.

---

### Task 1: Create Universal Energy Data Model & Telemetry Types

**Files:**
- Create: `src/types/telemetry.ts`
- Test: `scripts/test-telemetry-types.ts`

**Step 1: Write the test script for telemetry normalization**

```typescript
import { EcoSyncTelemetry, VerificationLevel } from '../src/types/telemetry';

const mockTelemetry: EcoSyncTelemetry = {
  homeId: 'home_001',
  deviceId: 'inv_01',
  deviceType: 'solar_inverter',
  timestamp: new Date().toISOString(),
  powerKw: 4.5,
  energyKwh: 12.0,
  direction: 'generation',
  sourceAdapter: 'enphase',
  verificationLevel: VerificationLevel.LEVEL_2_VENDOR_VERIFIED
};

if (mockTelemetry.verificationLevel !== 2) {
  throw new Error('Verification level mismatch');
}
console.log('Telemetry types test PASSED');
```

**Step 2: Run test to verify it fails initially**

Run: `npx tsx scripts/test-telemetry-types.ts`  
Expected: FAIL with "Cannot find module ../src/types/telemetry"

**Step 3: Implement `src/types/telemetry.ts`**

```typescript
export enum VerificationLevel {
  LEVEL_0_SIMULATED = 0,
  LEVEL_1_LOCAL_REPORTED = 1,
  LEVEL_2_VENDOR_VERIFIED = 2,
  LEVEL_3_METER_VERIFIED = 3,
  LEVEL_4_GATEWAY_SIGNED = 4,
}

export type DeviceType = 
  | 'solar_inverter' 
  | 'battery' 
  | 'ev_charger' 
  | 'smart_plug' 
  | 'smart_meter' 
  | 'grid_connection';

export type EnergyDirection = 
  | 'generation' 
  | 'consumption' 
  | 'storage_charge' 
  | 'storage_discharge' 
  | 'grid_import' 
  | 'grid_export';

export interface EcoSyncTelemetry {
  homeId: string;
  deviceId: string;
  deviceType: DeviceType;
  timestamp: string;
  powerKw: number;
  energyKwh: number;
  direction: EnergyDirection;
  sourceAdapter: string;
  verificationLevel: VerificationLevel;
}
```

**Step 4: Run test to verify it passes**

Run: `npx tsx scripts/test-telemetry-types.ts`  
Expected: PASS with output "Telemetry types test PASSED"

**Step 5: Commit**

```bash
git add src/types/telemetry.ts scripts/test-telemetry-types.ts
git commit -m "feat: add Universal Energy Data Model and verification levels"
```

---

### Task 2: Implement Hardware Adapter Pipeline & Simulator Adapter

**Files:**
- Create: `src/lib/adapters/base-adapter.ts`
- Create: `src/lib/adapters/simulator-adapter.ts`
- Create: `src/lib/adapters/enphase-adapter.ts`
- Test: `scripts/test-hardware-adapters.ts`

**Step 1: Write failing test for hardware adapters**

```typescript
import { SimulatorAdapter } from '../src/lib/adapters/simulator-adapter';
import { VerificationLevel } from '../src/types/telemetry';

const sim = new SimulatorAdapter('home_test_1');
const telemetry = sim.readTelemetry();

if (telemetry.verificationLevel !== VerificationLevel.LEVEL_0_SIMULATED) {
  throw new Error('Simulator must assign LEVEL_0_SIMULATED');
}
console.log('Adapter test PASSED');
```

**Step 2: Run test to verify it fails**

Run: `npx tsx scripts/test-hardware-adapters.ts`  
Expected: FAIL with "Cannot find module"

**Step 3: Implement Adapter Classes**

Create `src/lib/adapters/base-adapter.ts` with abstract class `BaseHardwareAdapter`, and implement `SimulatorAdapter` in `src/lib/adapters/simulator-adapter.ts` returning normalized `EcoSyncTelemetry` with `LEVEL_0_SIMULATED`, and `EnphaseAdapter` returning `LEVEL_2_VENDOR_VERIFIED`.

**Step 4: Run test to verify it passes**

Run: `npx tsx scripts/test-hardware-adapters.ts`  
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/adapters/
git commit -m "feat: add hardware adapter pipeline and verification levels"
```

---

### Task 3: Build Double-Entry Internal P2P Trade Ledger & Payment Abstraction

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/lib/payments/payment-provider.ts`
- Create: `src/lib/payments/stripe-provider.ts`
- Create: `src/lib/ledger/p2p-ledger.ts`
- Test: `scripts/test-p2p-ledger.ts`

**Step 1: Write test for verification level checking in P2P ledger**

Verify that `P2PLedger.createTradeOffer()` rejects Level 0 (simulated) telemetry for real monetary settlement and accepts Level 2+ telemetry.

**Step 2: Run test to verify failure**

Run: `npx tsx scripts/test-p2p-ledger.ts`  
Expected: FAIL

**Step 3: Implement Ledger & Payment Provider**

Add `TradeLedger` model to Prisma schema, implement `PaymentProvider` interface with `StripePaymentProvider` mock, and enforce verification level checks in `P2PLedger`.

**Step 4: Run test to verify it passes**

Run: `npx tsx scripts/test-p2p-ledger.ts`  
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/payments/ src/lib/ledger/ prisma/schema.prisma
git commit -m "feat: add double-entry P2P trade ledger and payment provider abstraction"
```

---

### Task 4: Build Real Weather & Carbon Forecaster with MPC Optimization Loop

**Files:**
- Create: `src/lib/forecaster/weather-service.ts`
- Create: `src/lib/optimization/mpc-optimizer.ts`
- Create: `src/app/api/forecaster/mpc/route.ts`
- Test: `scripts/test-mpc-optimizer.ts`

**Step 1: Write failing test for MPC battery optimization**

Verify that `MPCOptimizer.calculateSchedule()` shifts battery discharge to high-tariff/high-carbon hours and charging to low-tariff windows.

**Step 2: Run test to verify failure**

Run: `npx tsx scripts/test-mpc-optimizer.ts`  
Expected: FAIL

**Step 3: Implement Weather Service & MPC Optimizer**

Fetch solar irradiance from Open-Meteo API, calculate 24-hour cost minimization schedule, and expose `/api/forecaster/mpc` Next.js API route.

**Step 4: Run test to verify it passes**

Run: `npx tsx scripts/test-mpc-optimizer.ts`  
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/forecaster/ src/lib/optimization/ src/app/api/forecaster/mpc/
git commit -m "feat: add real weather forecasting and MPC battery optimization engine"
```

---

### Task 5: Build OpenAI Function Calling LLM Co-Pilot & Web3 Attestation Rail

**Files:**
- Create: `src/lib/ai/copilot-tools.ts`
- Create: `src/app/api/copilot/chat/route.ts`
- Create: `src/lib/blockchain/attestation-service.ts`
- Test: `scripts/test-copilot-tools.ts`

**Step 1: Write failing test for AI Co-Pilot function execution**

Verify tool function invocation (`getHomeEnergyStats`, `setOptimizationStrategy`) returns valid JSON context.

**Step 2: Run test to verify failure**

Run: `npx tsx scripts/test-copilot-tools.ts`  
Expected: FAIL

**Step 3: Implement AI Tools & Attestation Rail**

Define tools array for OpenAI API function calling, handle tool responses in `/api/copilot/chat`, and create off-chain Merkle tree generator in `attestation-service.ts`.

**Step 4: Run test to verify it passes**

Run: `npx tsx scripts/test-copilot-tools.ts`  
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/ai/ src/app/api/copilot/ src/lib/blockchain/
git commit -m "feat: add LLM Co-Pilot tool integration and off-chain EVM attestation rail"
```
