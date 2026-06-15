export type MessageStyle = "random" | "nexus-border" | "quantum-terminal" | "neo-minimalist" | "grid-override";

const STYLES: Exclude<MessageStyle, "random">[] = ["nexus-border", "quantum-terminal", "neo-minimalist", "grid-override"];

function resolveStyle(selected: MessageStyle): Exclude<MessageStyle, "random"> {
  if (selected === "random" || !selected) {
    return STYLES[Math.floor(Math.random() * STYLES.length)];
  }
  return selected as Exclude<MessageStyle, "random">;
}

export function getOtpMessage(style: MessageStyle, code: string): string {
  const actualStyle = resolveStyle(style);
  switch (actualStyle) {
    case "nexus-border":
      return `┌─── ECO-SYNC NEXUS ───┐\n│   SECURITY ACCESS    │\n├──────────────────────┤\n│ AUT_KEY:  ${code}         │\n│ EXPIRY:   10 MIN     │\n├──────────────────────┤\n│ AUTHORIZING UPLINK   │\n└──────────────────────┘`;
    case "quantum-terminal":
      return `╔═══ ECO-SYNC: LINK ═══╗\n║  Verification Token  ║\n╠══════════════════════╣\n║ TOKEN:  [  ${code}  ]   ║\n╠══════════════════════╣\n║ Keep signature safe  ║\n╚══════════════════════╝`;
    case "neo-minimalist":
      return `/// LEDGER SYNC ///\n[NODE AUTHORIZATION]\n───────────────────────\nPASSCODE:   ${code}\nEXPIRY:     600 SEC\n───────────────────────\nP2P LEDGER PROTOCOL`;
    case "grid-override":
      return `⚡ AETHER ENERGY UPLINK ⚡\n=========================\nNODE CONN AUTHENTICATION\nAUTH KEY:   ${code}\n=========================\nSOLAR ARRAY OVERRIDE`;
  }
}

export function getTimerMessage(style: MessageStyle, device: string, kw: string, startTime: string, hrs: string): string {
  const actualStyle = resolveStyle(style);
  switch (actualStyle) {
    case "nexus-border":
      return `┌─── ECO-SYNC NEXUS ───┐\n│   TIMER SCHEDULED    │\n├──────────────────────┤\n│ 🤖 DEVICE: ${device.padEnd(10)}│\n│ ⚡ LOAD:   ${kw.padEnd(6)} kW │\n│ 📅 START:  ${startTime.padEnd(5)}     │\n│ ⏱️ RUNS:   ${hrs.padEnd(4)} hrs │\n├──────────────────────┤\n│ STATUS: PENDING      │\n└──────────────────────┘`;
    case "quantum-terminal":
      return `⚙️ QUANTUM SCHEDULE LOCKED\n══════════════════════════\nNode:     ${device}\nDraw:     ${kw} kW\nAt:       ${startTime}\nRuns for: ${hrs} hrs\n══════════════════════════\nAWAITING GREEN WINDOW`;
    case "neo-minimalist":
      return `🌐 [ECO-SYNC AUTOMATION]\n==============================\nTimer Set for ${device}\nPower Draw: ${kw} kW\nScheduled:  ${startTime}\nDuration:   ${hrs} hrs\n==============================\nSTATUS: ARMED & PENDING`;
    case "grid-override":
      return `[⚔️ NEXUS LOAD PERMIT ISSUED]\n══════════════════════════════\n🔹 Target: ${device}\n🔹 Load:   ${kw} kW\n🔹 At:     ${startTime}\n🔹 For:    ${hrs} hrs\n══════════════════════════════\nSCHEDULER: ARMED`;
  }
}

export function getDeviceMessage(style: MessageStyle, device: string, kw: string): string {
  const actualStyle = resolveStyle(style);
  switch (actualStyle) {
    case "nexus-border":
      return `┌─── ECO-SYNC NEXUS ───┐\n│   DEVICE ACTIVATED   │\n├──────────────────────┤\n│ 🤖 DEVICE: ${device.padEnd(10)}│\n│ ⚡ LOAD:   ${kw.padEnd(6)} kW │\n│ 🟢 STATE:  RUNNING   │\n├──────────────────────┤\n│ STATUS: ECO-OPTIMIZED│\n└──────────────────────┘`;
    case "quantum-terminal":
      return `╔═══ ECO-SYNC: AUTOMATION ═══╗\n║ Routine Event Triggered    ║\n╠════════════════════════════╣\n║ - Target:   ${device.padEnd(15)}║\n║ - Power:    ${kw.padEnd(11)} kW ║\n║ - Protocol: GREEN SYNCED   ║\n╚════════════════════════════╝`;
    case "neo-minimalist":
      return `/// ECO-SYNC ROUTINE ONLINE ///\n───────────────────────────────────\nAppliance:     ${device}\nExpected Load: ${kw} kW\nOptimizer:     Carbon Intensity Forecaster\n───────────────────────────────────\nGrid status: green power preferred`;
    case "grid-override":
      return `[🛡️ NEXUS SECURITY LOAD PERMIT]\n───────────────────────────────\n• Node Target: ${device}\n• Load draw:   ${kw} kW\n• Authorization: GRANTED\n• System State: RUNNING\n───────────────────────────────\nSYSTEM LOAD OPTIMIZED & SECURED`;
  }
}

export function getTradeMessage(style: MessageStyle, kwh: string, rate: string, totalEarned: string, txHash: string): string {
  const actualStyle = resolveStyle(style);
  switch (actualStyle) {
    case "nexus-border":
      return `⚡ *ECO-SYNC NEXUS // TRADE CONFIRMED* ⚡\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n🔋 *ENERGY SOLD:*    \`${kwh} kWh\`\n🪙 *RATE MULTIPLIER:* \`${rate} ECO\`\n💎 *TOTAL PAYOUT:*   \`*+${totalEarned} ECO*\`\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n📡 *TX SIG:*         \`${txHash}\`\n🟢 *LEDGER:*         _SETTLED (SEPOLIA)_`;
    case "quantum-terminal":
      return `🟢 *ECO-SYNC UPLINK // TRANSACTION SETTLED*\n◢◢◢◢◢◢◢◢◢◢◢◢◢◢◢◢◢◢◢◢\n☀️ *SOLAR DISCHARGE:* \`${kwh} kWh\`\n💳 *ENERGY CREDITS:*  \`+${totalEarned} ECO\`\n🔒 *BLOCKCHAIN SIG:*  \`${txHash}\`\n◢◢◢◢◢◢◢◢◢◢◢◢◢◢◢◢◢◢◢◢\n_Microgrid transaction successfully synchronized_`;
    case "neo-minimalist":
      return `⚙️ *NEXUS ASSET EXCHANGE // SUCCESS*\n════════════════════════\n🔋 *YIELD TRANSFERRED:* \`${kwh} kWh\`\n💎 *VALUE RECEIVED:*    \`+${totalEarned} ECO\`\n🔗 *CHAIN SIGNATURE:*   \`${txHash}\`\n════════════════════════\n*STATUS:* _VERIFIED SECURE_`;
    case "grid-override":
      return `📡 [LEDGER BROADCAST CONFIRMED]\n================================\n⚡ SOLD:  ${kwh} kWh\n🪙 VALUE: ${totalEarned} ECO\n🔗 HASH:  ${txHash}\n================================\nTRANSACTION SYNCHRONIZED SECURE`;
  }
}

export function getTestMessage(style: MessageStyle): string {
  const actualStyle = resolveStyle(style);
  switch (actualStyle) {
    case "nexus-border":
      return `┌─── ECO-SYNC NEXUS ───┐\n│   TEST NOTIFICATION  │\n├──────────────────────┤\n│ ✅ UPLINK: ACTIVE    │\n│ 📟 CONSOLE: ONLINE   │\n│ 📢 CHANNELS: OK      │\n├──────────────────────┤\n│ YOUR NEXUS IS LIVE!  │\n└──────────────────────┘`;
    case "quantum-terminal":
      return `╔═══ ECO-SYNC: TEST ═══╗\n║  Alerts Connection   ║\n╠══════════════════════╣\n║ ✅ ALERTS: ACTIVE    ║\n║ 📟 CONSOLE: ONLINE   ║\n║ 🛡️ SECURITY: VERIFIED ║\n╠══════════════════════╣\n║ YOUR NEXUS IS ONLINE ║\n╚══════════════════════╝`;
    case "neo-minimalist":
      return `/// UPLINK TEST SYSTEM ///\n───────────────────────────\nAlert Channels: CONNECTED\nConsole Logs:   ACTIVE\nTerminal Link:  ONLINE\n───────────────────────────\nSTATUS: ONLINE & VERIFIED`;
    case "grid-override":
      return `⚠️ NEXUS BROADCAST SYSTEM ⚠️\n===========================\nTEST NOTIFICATION SUCCESS\nALERTS STATE: ACTIVE\nCONSOLE:      ONLINE\n===========================\nGRID UPLINK LIVE`;
  }
}
