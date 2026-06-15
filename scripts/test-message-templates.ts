import assert from "assert";
import { getOtpMessage, getTimerMessage, getDeviceMessage, getTradeMessage } from "../src/lib/message-templates";

function testTemplates() {
  console.log("Testing message template formats...");
  
  // Test OTP Custom formats
  const otpMsg = getOtpMessage("nexus-border", "1234");
  assert.ok(otpMsg.includes("1234"), "OTP should contain the code");
  assert.ok(otpMsg.includes("┌───"), "Nexus border style should have top border");

  const otpMsgQuantum = getOtpMessage("quantum-terminal", "9999");
  assert.ok(otpMsgQuantum.includes("╚═══") || otpMsgQuantum.includes("⚙️") || otpMsgQuantum.includes("═"), "Quantum style should have double lines or blocks");

  // Test Trade formats
  const tradeMsg = getTradeMessage("neo-minimalist", "15.5", "8.0", "124.00", "0xabc123");
  assert.ok(tradeMsg.includes("15.5 kWh"), "Trade message should include amount");
  assert.ok(tradeMsg.includes("*"), "Monospace/markdown indicators should be preserved");

  console.log("Template Verification PASSED!");
}

try {
  testTemplates();
} catch (e) {
  console.error("Test failed:", e);
  process.exit(1);
}
