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
    estimatedMonthlyBill: 154.20,
    estimatedMonthlyCarbon: 126.444,
    activeDevices: "Refrigerator, Smart Router",
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
  assert.strictEqual(payload.estimatedMonthlyBill, "₹154.20");
  assert.strictEqual(payload.estimatedMonthlyCarbon, "126.44 kg CO2");
  assert.strictEqual(payload.activeDevices, "Refrigerator, Smart Router");

  console.log("Test PASSED!");
}

try {
  runTest();
} catch (error) {
  console.error("Test FAILED:", error);
  process.exit(1);
}
