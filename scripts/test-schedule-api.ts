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

async function testScheduleApi() {
  console.log("Verifying /api/forecaster/schedule API operations...");
  
  // Dynamically import signToken after env vars are loaded
  const { signToken } = await import("../src/lib/session");
  
  // Generate a valid session cookie token for test user
  const token = signToken({ email: "wrapper-test@example.com" });

  // Test POST to create schedule
  const postRes = await fetch("http://localhost:3000/api/forecaster/schedule", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `session=${token}`
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
  assert.ok(postData.success);
  assert.ok(postData.schedule.id);
  assert.strictEqual(postData.schedule.deviceName, "EV Charger");
  assert.strictEqual(postData.schedule.powerDraw, 7.2);
  assert.strictEqual(postData.schedule.startTime, "02:00");
  assert.strictEqual(postData.schedule.duration, 3.5);
  assert.strictEqual(postData.schedule.status, "pending");

  // Test GET to retrieve list of schedules
  const getRes = await fetch("http://localhost:3000/api/forecaster/schedule", {
    headers: {
      "Cookie": `session=${token}`
    }
  });
  assert.strictEqual(getRes.status, 200);
  const getData = await getRes.json();
  assert.ok(Array.isArray(getData.schedules));
  assert.ok(getData.schedules.length > 0);
  assert.ok(getData.schedules.some((s: any) => s.id === postData.schedule.id));

  // Test DELETE to delete the schedule
  const delRes = await fetch(`http://localhost:3000/api/forecaster/schedule?id=${postData.schedule.id}`, {
    method: "DELETE",
    headers: {
      "Cookie": `session=${token}`
    }
  });
  assert.strictEqual(delRes.status, 200);
  const delData = await delRes.json();
  assert.ok(delData.success);

  // Test GET again to verify deletion
  const getRes2 = await fetch("http://localhost:3000/api/forecaster/schedule", {
    headers: {
      "Cookie": `session=${token}`
    }
  });
  const getData2 = await getRes2.json();
  assert.ok(!getData2.schedules.some((s: any) => s.id === postData.schedule.id));

  console.log("Schedule API test PASSED!");
}

testScheduleApi().catch(e => {
  console.error("Test failed:", e);
  process.exit(1);
});
