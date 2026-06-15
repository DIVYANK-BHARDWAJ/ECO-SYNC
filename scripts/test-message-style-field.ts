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
  
  // Verification complete
  console.log("Test PASSED!");
}

testMessageStyleField().catch(e => {
  console.error("Test failed:", e);
  process.exit(1);
});
