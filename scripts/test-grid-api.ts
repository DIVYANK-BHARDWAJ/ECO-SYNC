import assert from "assert";
import fs from "fs";
import path from "path";
// Load environment variables for SESSION_SECRET
const envPath = fs.existsSync(".env.local") ? ".env.local" : ".env";
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach(line => {
    const parts = line.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim().replace(/^["']|["']$/g, '');
      process.env[key] = val;
    }
  });
}

async function testGridApi() {
  console.log("Verifying /api/forecaster/grid endpoint...");
  
  // Dynamically import signToken after env vars are populated
  const { signToken } = await import("../src/lib/session");
  
  // Generate a valid session cookie token for test user
  const token = signToken({ email: "wrapper-test@example.com" });
  
  const res = await fetch("http://localhost:3000/api/forecaster/grid", {
    headers: {
      "Cookie": `session=${token}`
    }
  });
  
  const data = await res.json();
  
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(data.forecast));
  assert.strictEqual(data.forecast.length, 24);
  assert.ok("bestHour" in data);
  assert.ok("averageIntensity" in data);
  console.log("Grid API Test PASSED!");
}

testGridApi().catch(e => {
  console.error("Test failed:", e);
  process.exit(1);
});
