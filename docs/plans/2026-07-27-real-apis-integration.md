# Real APIs Integration Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Connect live real-world public APIs across weather/solar irradiance (Open-Meteo), grid carbon intensity (CarbonIntensity API / Open-Meteo Air Quality), real Enphase/Tuya hardware API connectors, live AI Assistant tool execution, and Sepolia RPC blockchain attestation.

**Architecture:** Integrate Open-Meteo for real-time solar irradiance, National Grid / Open-Meteo for live carbon intensity gCO2/kWh telemetry, build live REST/WebSocket client adapters for Enphase and Tuya IoT platforms, implement full tool execution in AI Co-Pilot, and connect Ethers.js to Sepolia RPC to post real Merkle root attestation hashes.

**Tech Stack:** Next.js 14, TypeScript, Open-Meteo API, National Grid Carbon Intensity API, Ethers.js v6, Sepolia Public RPC, Fetch API.

---

### Task 1: Real-Time Live Grid Carbon Intensity API Integrator

**Files:**
- Create: `src/lib/forecaster/carbon-api.ts`
- Modify: `src/app/api/forecaster/grid/route.ts`
- Test: `scripts/test-live-carbon-api.ts`

**Step 1: Write failing test for Live Carbon API**

```typescript
import { CarbonApiService } from '../src/lib/forecaster/carbon-api';

async function runTest() {
  const service = new CarbonApiService();
  const intensity = await service.getLiveCarbonIntensity();
  if (typeof intensity.currentGco2 !== 'number' || intensity.currentGco2 <= 0) {
    throw new Error('Failed to retrieve positive numeric carbon intensity');
  }
  console.log('Live Carbon API Test PASSED! Current gCO2/kWh:', intensity.currentGco2);
}
runTest().catch((e) => { console.error(e); process.exit(1); });
```

**Step 2: Run test to verify it fails**

Run: `npx tsx scripts/test-live-carbon-api.ts`  
Expected: FAIL with "Cannot find module"

**Step 3: Implement `src/lib/forecaster/carbon-api.ts`**

Fetch live carbon intensity from National Grid API (`https://api.carbonintensity.org.uk/intensity`) with regional fallback to diurnal peaker grid model. Update `/api/forecaster/grid/route.ts` to consume live data.

**Step 4: Run test to verify it passes**

Run: `npx tsx scripts/test-live-carbon-api.ts`  
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/forecaster/carbon-api.ts src/app/api/forecaster/grid/route.ts scripts/test-live-carbon-api.ts
git commit -m "feat: add real-time carbon intensity API integration"
```

---

### Task 2: Real Enphase Cloud & Tuya Smart Home IoT API Connectors

**Files:**
- Modify: `src/lib/adapters/enphase-adapter.ts`
- Create: `src/lib/adapters/tuya-adapter.ts`
- Test: `scripts/test-real-hardware-apis.ts`

**Step 1: Write test for Tuya and Enphase real API connectors**

Verify `TuyaAdapter` and `EnphaseAdapter` build valid REST request signatures and return Level 2 normalized telemetry.

**Step 2: Run test to verify it fails**

Run: `npx tsx scripts/test-real-hardware-apis.ts`  
Expected: FAIL

**Step 3: Implement Tuya & Enphase real API client logic**

Add HMAC-SHA256 request signing for Tuya IoT OpenAPI and OAuth bearer token management for Enphase Enlighten API v4.

**Step 4: Run test to verify it passes**

Run: `npx tsx scripts/test-real-hardware-apis.ts`  
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/adapters/ scripts/test-real-hardware-apis.ts
git commit -m "feat: add real Enphase and Tuya IoT API client adapters"
```

---

### Task 3: Live Sepolia Blockchain RPC & Merkle Attestation Broadcaster

**Files:**
- Modify: `src/lib/blockchain/attestation-service.ts`
- Create: `src/app/api/blockchain/attestation/route.ts`
- Test: `scripts/test-live-blockchain-attestation.ts`

**Step 1: Write test for Sepolia Merkle attestation generator**

Verify `AttestationService.broadcastMerkleRootToSepolia()` generates valid Merkle roots and signs attestation payload using public RPC provider.

**Step 2: Run test to verify it fails**

Run: `npx tsx scripts/test-live-blockchain-attestation.ts`  
Expected: FAIL

**Step 3: Implement live Sepolia RPC provider and attestation endpoint**

Connect Ethers.js `JsonRpcProvider` to Sepolia RPC endpoint (`https://ethereum-sepolia-rpc.publicnode.com`) and build `/api/blockchain/attestation` route.

**Step 4: Run test to verify it passes**

Run: `npx tsx scripts/test-live-blockchain-attestation.ts`  
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/blockchain/ src/app/api/blockchain/ scripts/test-live-blockchain-attestation.ts
git commit -m "feat: add live Sepolia RPC and Merkle attestation broadcaster"
```
