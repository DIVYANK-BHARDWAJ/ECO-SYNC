export interface ProsumerContext {
  name: string;
  email: string;
  batteryLevel: number;
  batteryCapacity: number;
  solarGeneration: number;
  gridDependency: number;
  walletBalance: number;
  estimatedMonthlyBill: number;
  estimatedMonthlyCarbon: number;
  activeDevices?: string; // e.g. "Refrigerator, Home Lighting"
}

export function formatBotpressPayload(context: ProsumerContext) {
  const percentage = context.batteryCapacity > 0
    ? Math.round((context.batteryLevel / context.batteryCapacity) * 100)
    : 0;

  return {
    type: "session_context",
    name: context.name || "Nexus Explorer",
    email: context.email,
    batteryLevel: `${context.batteryLevel.toFixed(1)} kWh`,
    batteryPct: `${percentage}%`,
    solarGeneration: `${context.solarGeneration.toFixed(1)} kW`,
    gridDependency: `${context.gridDependency.toFixed(1)} kW`,
    walletBalance: `${context.walletBalance.toFixed(2)} ECO`,
    estimatedMonthlyBill: `₹${context.estimatedMonthlyBill.toFixed(2)}`,
    estimatedMonthlyCarbon: `${context.estimatedMonthlyCarbon.toFixed(2)} kg CO2`,
    activeDevices: context.activeDevices || "None",
  };
}
