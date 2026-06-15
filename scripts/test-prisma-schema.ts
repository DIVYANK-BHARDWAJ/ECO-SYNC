import assert from "assert";
import { db } from "../src/lib/db";

async function testSchema() {
  console.log("Verifying ApplianceSchedule schema fields exists on the db object...");
  try {
    // Check if the applianceSchedule service exists on the db wrapper (will fail initially until db.ts is modified in Task 2)
    const dbAny = db as any;
    assert.ok(dbAny.applianceSchedule, "db.applianceSchedule should be defined");
    console.log("Test PASSED!");
  } catch (error: any) {
    console.error("Test failed as expected:", error.message);
    process.exit(1);
  }
}

testSchema();
