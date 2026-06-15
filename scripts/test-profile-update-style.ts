import { db } from "../src/lib/db";
import assert from "assert";

async function run() {
  console.log("Verifying profile DB capability for messageStyle updates...");
  const email = `temp-profile-test-${Date.now()}@example.com`;
  const tempUser = await db.user.create({
    data: {
      email,
      name: "Temp User",
      messageStyle: "random"
    }
  });
  
  const updated = await db.user.update({
    where: { id: tempUser.id },
    data: { messageStyle: "quantum-terminal" }
  });
  
  assert.strictEqual(updated.messageStyle, "quantum-terminal");
  console.log("Profile DB update verified successfully!");
}

run().catch(e => {
  console.error("Test failed:", e);
  process.exit(1);
});
