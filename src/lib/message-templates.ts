export type MessageStyle = "random" | "nexus-border" | "quantum-terminal" | "neo-minimalist" | "grid-override" | "carbon-crimson" | "bio-sovereignty" | "neon-hacker";

const STYLES: Exclude<MessageStyle, "random">[] = ["nexus-border", "quantum-terminal", "neo-minimalist", "grid-override", "carbon-crimson", "bio-sovereignty", "neon-hacker"];

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
    case "carbon-crimson":
      return `[☣️ CARBON CORE CRITICAL]\n=========================\nAUTHORIZATION REQ KEY\nTOKEN CODE:  ${code}\n=========================\nSECURE TRANS LINK ARMED`;
    case "bio-sovereignty":
      return `🌿 [BIO-SOVEREIGNTY NETWORK] 🌿\n├─────────────────────────────┤\n│ Node Authentication Key     │\n│                             │\n│ AUTH_KEY:    ${code}           │\n│ LIFESPAN:    10 MINUTES     │\n└─────────────────────────────┘`;
    case "neon-hacker":
      return `/* NEON_HACKER PROTOCOL_INIT */\n>>> [GET_KEY] = ${code}\n>>> [EXPIRE]  = 600s\n>>> [NODE_ID] = SECURE_UPLINK`;
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
    case "carbon-crimson":
      return `[☣️ INDUSTRIAL LOAD ROUTINE]\n===========================\n⚙️ DEVICE:    ${device}\n⚡ CAPACITY:  ${kw} kW\n⏱️ CALIBRATE: ${startTime}\n⏳ RUNTIME:   ${hrs} hrs\n===========================\nCORE READY TO LOAD SHIFT`;
    case "bio-sovereignty":
      return `🌿 [ECO-AUTOMATION CAPTURE] 🌿\n├─────────────────────────────┤\n│ Appliance scheduled:        │\n│ 🟢 Node:     ${device.padEnd(14)} │\n│ ⚡ Load:     ${kw.padEnd(8)} kW │\n│ 📅 Time:     ${startTime.padEnd(10)} │\n│ ⏱️ Duration: ${hrs.padEnd(6)} hrs │\n└─────────────────────────────┘`;
    case "neon-hacker":
      return `/* NEON_HACKER CRON_SCHEDULE */\n>>> TARGET   = ${device}\n>>> POWER    = ${kw}kW\n>>> START    = ${startTime}\n>>> RUNS_FOR = ${hrs}h\n>>> STATUS   = SHADOW_ARMED`;
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
    case "carbon-crimson":
      return `[☣️ DESTRUCTIVE LOAD RUNNING]\n===========================\n⚙️ ENGINE:    ${device}\n⚡ LOAD:      ${kw} kW\n🟢 EMISSION:  MINIMIZED\n===========================\nGRID SOVEREIGNTY INTACT`;
    case "bio-sovereignty":
      return `🌿 [ECO-AUTOMATION TRIGGERED] 🌿\n├─────────────────────────────┤\n│ Node online & operational   │\n│ 🟢 Target:   ${device.padEnd(14)} │\n│ ⚡ Draw:     ${kw.padEnd(8)} kW │\n│ 🌱 State:    OPTIMIZED      │\n└─────────────────────────────┘`;
    case "neon-hacker":
      return `/* NEON_HACKER APPLIANCE_HIJACK */\n>>> NODE_TARGET = ${device}\n>>> CURRENT_DRAW = ${kw}kW\n>>> STATE       = REDIRECTING_SOLAR`;
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
    case "carbon-crimson":
      return `[☣️ ASSET LIQUIDATION SETTLED]\n===========================\n🔋 DISCHARGE:  ${kwh} kWh\n🪙 REVENUE:    +${totalEarned} ECO\n🔗 HASH:       ${txHash}\n===========================\nSEPOLIA LEDGER COMMITTED`;
    case "bio-sovereignty":
      return `🌿 [BIO-SOVEREIGNTY SETTLED] 🌿\n├─────────────────────────────┤\n│ Energy Harvest Traded       │\n│ 🔋 Harvest:   ${kwh.padEnd(8)} kWh │\n│ 🪙 Payout:    +${totalEarned.padEnd(6)} ECO │\n│ 🔗 Signature: ${txHash}       │\n└─────────────────────────────┘`;
    case "neon-hacker":
      return `/* NEON_HACKER LEDGER_SETTLEMENT */\n>>> FLUID_OFFLOAD  = ${kwh}kWh\n>>> CREDIT_MINT    = +${totalEarned}ECO\n>>> BLOCKCHAIN_SIG = ${txHash}\n>>> STATUS         = SEPOLIA_BYPASSED`;
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
    case "carbon-crimson":
      return `[☣️ SYSTEM TEST PROTOCOL]\n===========================\n✅ SYSTEM STATE: ONLINE\n📟 CONSOLE:      CONNECTED\n⚙️ CORE THERMALS: OK\n===========================\nCRIMSON NODE CONNECTED`;
    case "bio-sovereignty":
      return `🌿 [BIO-SOVEREIGNTY TEST] 🌿\n├─────────────────────────────┤\n│ ✅ Network status: ONLINE   │\n│ 📟 Terminal link:  ONLINE   │\n│ 🌱 Green consensus: OK      │\n└─────────────────────────────┘`;
    case "neon-hacker":
      return `/* NEON_HACKER PING_SUCCESS */\n>>> GRID_UPLINK = ACTIVE\n>>> CONSOLE_LOG = REDIRECTED\n>>> FIREWALL    = PENETRATED`;
  }
}

