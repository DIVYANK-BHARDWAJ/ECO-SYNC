import assert from "assert";
import { db } from "../src/lib/db";

async function testTelegramField() {
  console.log("Verifying User telegramChatId field in database...");
  const email = `tg-test-${Date.now()}@example.com`;
  const user = await db.user.create({
    data: {
      email,
      name: "Telegram Tester",
      // @ts-ignore
      telegramChatId: "123456789"
    }
  });

  // @ts-ignore
  assert.strictEqual(user.telegramChatId, "123456789");
  console.log("Test PASSED!");
}

testTelegramField().catch(e => {
  console.error("Test failed:", e);
  process.exit(1);
});
