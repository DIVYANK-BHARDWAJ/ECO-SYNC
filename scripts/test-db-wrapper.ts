import assert from "assert";
import { db } from "../src/lib/db";

async function testDbWrapper() {
  console.log("Testing db.applianceSchedule proxy wrapper...");
  
  // Clear any existing test user if needed, or get/create one
  const email = "wrapper-test@example.com";
  let user = await db.user.findUnique({ where: { email } });
  if (!user) {
    user = await db.user.create({ data: { email } });
  }
  
  const dbAny = db as any;
  
  // Create a schedule
  const newSchedule = await dbAny.applianceSchedule.create({
    data: {
      deviceName: "Dishwasher",
      powerDraw: 1.5,
      startTime: "14:00",
      duration: 2.0,
      userId: user.id
    }
  });
  
  assert.strictEqual(newSchedule.deviceName, "Dishwasher");
  assert.strictEqual(newSchedule.powerDraw, 1.5);
  assert.strictEqual(newSchedule.startTime, "14:00");
  assert.strictEqual(newSchedule.duration, 2.0);
  assert.strictEqual(newSchedule.status, "pending");
  assert.ok(newSchedule.id);
  
  // List schedules
  const list = await dbAny.applianceSchedule.findMany({
    where: { userId: user.id }
  });
  assert.ok(list.length > 0);
  assert.ok(list.some((s: any) => s.id === newSchedule.id));
  
  // Delete the schedule
  await dbAny.applianceSchedule.delete({
    where: { id: newSchedule.id }
  });
  
  const listAfterDelete = await dbAny.applianceSchedule.findMany({
    where: { userId: user.id }
  });
  assert.ok(!listAfterDelete.some((s: any) => s.id === newSchedule.id));
  
  console.log("DB Wrapper Test PASSED!");
}

testDbWrapper().catch(e => {
  console.error("Test failed:", e);
  process.exit(1);
});
