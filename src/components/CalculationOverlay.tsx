"use client";

import { motion } from "framer-motion";
import { X, Calculator, Info, Zap, TrendingDown, Leaf, AlertTriangle, ShieldCheck, Sun } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Device, SolarBatteryState } from "@/types/device";

export type MetricType = "COST" | "CARBON" | "EFFICIENCY" | "MAX_EFFICIENCY" | null;

interface CalculationOverlayProps {
  type: MetricType;
  onClose: () => void;
  devices: Device[];
  activePlanId: string | null;
  solarState: SolarBatteryState;
  gridSellback: boolean;
  deviceActiveSeconds?: Record<string, number>;
  accumulatedSessionKwh?: number;
}

// Plan configurations
const PLAN_MULTIPLIERS: Record<string, number> = {
  "Eco-Baseline": 0.85,
  "Aether Pro": 0.60,
  "Carbon Zero": 0.25,
};

export default function CalculationOverlay({ 
  type, 
  onClose, 
  devices = [], 
  activePlanId = null, 
  solarState, 
  gridSellback,
  deviceActiveSeconds = {},
  accumulatedSessionKwh = 0
}: CalculationOverlayProps) {
  const { user } = useAuth();
  const costFactor = user?.costFactor ?? 8.0;
  const carbonFactor = 0.82; // India standard

  if (!type) return null;

  // Filter devices that have been active in this session
  const sessionDevices = devices.filter(d => d.isOn || (deviceActiveSeconds[d.id] || 0) > 0);
  const hasActiveDevices = sessionDevices.length > 0;
  
  let grossSessionKwh = 0;
  const deviceBreakdown = sessionDevices.map(d => {
    const seconds = deviceActiveSeconds[d.id] || 0;
    const hours = seconds / 3600;
    const deviceKwh = d.power * hours;
    grossSessionKwh += deviceKwh;

    // Format seconds into a friendly duration string
    let durationStr = "0s";
    if (seconds > 0) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      if (h > 0) durationStr = `${h}h ${m}m ${s}s`;
      else if (m > 0) durationStr = `${m}m ${s}s`;
      else durationStr = `${s}s`;
    }
    
    return {
      label: d.label,
      power: d.power,
      durationStr,
      kwh: deviceKwh,
      isOn: d.isOn
    };
  });

  let planMultiplier = 1.0;
  let planReductionPct = 0;
  if (activePlanId && PLAN_MULTIPLIERS[activePlanId]) {
    planMultiplier = PLAN_MULTIPLIERS[activePlanId];
    planReductionPct = Math.round((1 - planMultiplier) * 100);
  }
  
  const optimizedSessionKwh = grossSessionKwh * planMultiplier;

  const estimatedMonthlyBill = optimizedSessionKwh * costFactor;
  const estimatedMonthlyCarbon = optimizedSessionKwh * carbonFactor;

  // Efficiency Calculation
  const totalPowerCapacity = devices.reduce((sum, d) => sum + d.power, 0);
  const activeLoad = devices.filter(d => d.isOn).reduce((sum, d) => sum + d.power, 0);
  const totalLoad = activeLoad * planMultiplier;
  const loadIntensity = totalLoad / (totalPowerCapacity || 1);
  const usagePenalty = loadIntensity * 50;
  const planBonus = activePlanId === "Carbon Zero" ? 40 : activePlanId === "Aether Pro" ? 25 : activePlanId === "Eco-Baseline" ? 15 : 0;
  
  const efficiency = Math.max(5, Math.min(100, 
    85 - usagePenalty + planBonus
  ));

  const netGridLoad = Math.max(0, solarState.gridDependency);
  const selfConsumption = totalLoad - netGridLoad;
  const selfConsumptionPercent = totalLoad > 0 ? (selfConsumption / totalLoad) * 100 : 0;

  // Custom colors and header details per metric type
  const themeStyles = {
    COST: {
      color: "text-amber-500",
      accentBg: "bg-amber-500/10",
      accentBorder: "border-amber-500/30",
      accentGlow: "rgba(245,158,11,0.05)",
      title: "How is my Session Cost calculated?",
      subtitle: "Plain English breakdown of your live cost incurred",
      icon: <Calculator className="w-10 h-10 text-amber-500" />
    },
    CARBON: {
      color: "text-emerald-400",
      accentBg: "bg-emerald-500/10",
      accentBorder: "border-emerald-500/30",
      accentGlow: "rgba(16,185,129,0.05)",
      title: "How is my Session Carbon calculated?",
      subtitle: "Simple breakdown of your live CO₂ emissions",
      icon: <Leaf className="w-10 h-10 text-emerald-400" />
    },
    EFFICIENCY: {
      color: "text-blue-400",
      accentBg: "bg-blue-500/10",
      accentBorder: "border-blue-500/30",
      accentGlow: "rgba(59,130,246,0.05)",
      title: "How is my Efficiency Score calculated?",
      subtitle: "Simple explanation of your energy efficiency rating",
      icon: <Zap className="w-10 h-10 text-blue-400" />
    },
    MAX_EFFICIENCY: {
      color: "text-teal-400",
      accentBg: "bg-teal-500/10",
      accentBorder: "border-teal-500/30",
      accentGlow: "rgba(20,184,166,0.05)",
      title: "How is Grid Dependency calculated?",
      subtitle: "Simple breakdown of your microgrid energy balance",
      icon: <TrendingDown className="w-10 h-10 text-teal-400" />
    }
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] overflow-y-auto flex items-start justify-center p-4 md:p-10 bg-black/85 backdrop-blur-md"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.95, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 30, opacity: 0 }}
        className="relative z-10 w-full max-w-4xl my-auto overflow-hidden rounded-2xl bg-[#0a0a0c] border border-white/10 shadow-2xl text-left font-sans"
        style={{
          boxShadow: `0 30px 60px -15px ${themeStyles.accentGlow}`
        }}
      >
        {/* Top Glow Strip */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl transition-all border border-white/5 bg-white/2 hover:bg-white/10 text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 md:p-10">
          {/* Header */}
          <div className="flex items-center gap-5 border-b border-white/5 pb-8 mb-8">
            <div className={`p-4 rounded-xl border ${themeStyles.accentBorder} ${themeStyles.accentBg}`}>
              {themeStyles.icon}
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight font-heading">
                {themeStyles.title}
              </h2>
              <p className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 mt-1">
                {themeStyles.subtitle}
              </p>
            </div>
          </div>

          {/* Core Content */}
          {type === "COST" && (
            <div className="space-y-6">
              {/* Formula Panel */}
              <div className="p-5 bg-white/2 border border-white/5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-mono text-zinc-500 tracking-wider">Formula in Plain English</span>
                  <p className="text-sm font-bold text-white leading-relaxed">
                    [ Live Electricity Units Used ] × ₹{costFactor.toFixed(2)} cost per Unit
                  </p>
                </div>
                <div className="md:text-right">
                  <span className="text-[9px] uppercase font-mono text-zinc-500 tracking-wider">Live Session Cost</span>
                  <p className="text-3xl font-mono font-black text-amber-500">
                    ₹{estimatedMonthlyBill.toFixed(3)}
                  </p>
                </div>
              </div>

              {!hasActiveDevices ? (
                <div className="py-12 border border-dashed border-white/5 rounded-xl text-center font-mono text-xs text-zinc-500 uppercase">
                  <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-zinc-600" />
                  Your house is currently idle. Switch on appliances to start the live cost calculation.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  {/* Left: Device Breakdown Table */}
                  <div className="space-y-4">
                    <span className="text-[9px] uppercase font-mono text-zinc-500 tracking-wider font-bold">1. Active Devices & Real-Time Consumption</span>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      We track the exact number of seconds each appliance runs since it is turned on. We multiply its power draw (kW) by hours active to find exact consumed units.
                    </p>
                    <div className="border border-white/5 bg-white/2 rounded-xl divide-y divide-white/5 overflow-hidden">
                      {deviceBreakdown.map((item, idx) => (
                        <div key={idx} className="p-3.5 flex justify-between items-center text-xs">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <p className="text-white font-bold">{item.label}</p>
                              {item.isOn ? (
                                <span className="text-[7px] font-mono text-emerald-400 bg-emerald-950/20 px-1 py-0.5 rounded border border-emerald-900/30 animate-pulse">LIVE</span>
                              ) : (
                                <span className="text-[7px] font-mono text-zinc-500 bg-zinc-900/40 px-1 py-0.5 rounded border border-zinc-800">OFF</span>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-500">Uses {item.power.toFixed(2)} kW of power</p>
                          </div>
                          <div className="text-right space-y-0.5 font-mono">
                            <p className="text-zinc-300 font-bold">{item.kwh.toFixed(5)} units</p>
                            <p className="text-[10px] text-zinc-500">active for {item.durationStr}</p>
                          </div>
                        </div>
                      ))}
                      <div className="p-4 bg-white/2 flex justify-between items-center text-xs font-bold">
                        <span className="text-white">Gross Session Energy Consumption:</span>
                        <span className="text-white font-mono">{grossSessionKwh.toFixed(5)} units</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Net Math Steps */}
                  <div className="space-y-6">
                    <span className="text-[9px] uppercase font-mono text-zinc-500 tracking-wider font-bold">2. Here&apos;s the simple math behind it</span>
                    
                    <div className="space-y-4 text-xs">
                      {/* Step A: Savings Plan */}
                      <div className="p-3.5 rounded-xl border border-white/5 bg-white/2 flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-white font-bold">Step A: Savings Plan Discount</p>
                          <p className="text-[10px] text-zinc-400">
                            Active Plan: <span className="text-white font-bold">{activePlanId || "None (No discount)"}</span>
                          </p>
                        </div>
                        <div className="text-right space-y-0.5 font-mono">
                          <p className="text-emerald-400 font-bold">-{planReductionPct}% load reduction</p>
                          <p className="text-[10px] text-zinc-500">Yields {optimizedSessionKwh.toFixed(5)} units</p>
                        </div>
                      </div>

                      {/* Step B: Live Session Cost */}
                      <div className="p-4 rounded-xl border-amber-500/20 bg-amber-500/5 flex justify-between items-center font-bold">
                        <div className="space-y-1">
                          <p className="text-white">Step B: Final Live Session Cost</p>
                          <p className="text-[10px] text-zinc-400 font-normal">
                            {optimizedSessionKwh.toFixed(5)} units × ₹{costFactor.toFixed(2)} per unit
                          </p>
                        </div>
                        <p className="text-2xl font-black text-amber-500 font-mono">
                          ₹{estimatedMonthlyBill.toFixed(3)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {type === "CARBON" && (
            <div className="space-y-6">
              {/* Formula Panel */}
              <div className="p-5 bg-white/2 border border-white/5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-mono text-zinc-500 tracking-wider">Formula in Plain English</span>
                  <p className="text-sm font-bold text-white leading-relaxed">
                    [ Live Energy Used (Units) ] × 0.82 kg CO₂ released per Unit
                  </p>
                </div>
                <div className="md:text-right">
                  <span className="text-[9px] uppercase font-mono text-zinc-500 tracking-wider">Live Session Carbon</span>
                  <p className="text-3xl font-mono font-black text-emerald-400">
                    {estimatedMonthlyCarbon.toFixed(3)} <span className="text-xs font-normal text-zinc-500">kg</span>
                  </p>
                </div>
              </div>

              {!hasActiveDevices ? (
                <div className="py-12 border border-dashed border-white/5 rounded-xl text-center font-mono text-xs text-zinc-500 uppercase">
                  <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-zinc-600" />
                  Your house is currently idle. Switch on appliances to start the carbon calculation.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  {/* Left: Device Breakdown Table */}
                  <div className="space-y-4">
                    <span className="text-[9px] uppercase font-mono text-zinc-500 tracking-wider font-bold">1. Active Devices & Real-Time Carbon</span>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      We track the exact active time to compute the energy consumed, and convert that directly to carbon footprint output.
                    </p>
                    <div className="border border-white/5 bg-white/2 rounded-xl divide-y divide-white/5 overflow-hidden">
                      {deviceBreakdown.map((item, idx) => (
                        <div key={idx} className="p-3.5 flex justify-between items-center text-xs">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <p className="text-white font-bold">{item.label}</p>
                              {item.isOn ? (
                                <span className="text-[7px] font-mono text-emerald-400 bg-emerald-950/20 px-1 py-0.5 rounded border border-emerald-900/30 animate-pulse">LIVE</span>
                              ) : (
                                <span className="text-[7px] font-mono text-zinc-500 bg-zinc-900/40 px-1 py-0.5 rounded border border-zinc-800">OFF</span>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-500">Rating: {item.power.toFixed(2)} kW</p>
                          </div>
                          <div className="text-right space-y-0.5 font-mono">
                            <p className="text-zinc-300 font-bold">{(item.kwh * carbonFactor).toFixed(5)} kg CO₂</p>
                            <p className="text-[10px] text-zinc-500">active for {item.durationStr}</p>
                          </div>
                        </div>
                      ))}
                      <div className="p-4 bg-white/2 flex justify-between items-center text-xs font-bold font-mono">
                        <span className="text-white font-sans">Total Session Energy Consumption:</span>
                        <span className="text-white">{grossSessionKwh.toFixed(5)} units</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Net Math Steps */}
                  <div className="space-y-6">
                    <span className="text-[9px] uppercase font-mono text-zinc-500 tracking-wider font-bold">2. Here&apos;s the simple math behind it</span>
                    
                    <div className="space-y-4 text-xs">
                      {/* Step A: Savings Plan */}
                      <div className="p-3.5 rounded-xl border border-white/5 bg-white/2 flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-white font-bold">Step A: Plan Discount Applied</p>
                          <p className="text-[10px] text-zinc-400">
                            Active Plan: <span className="text-white font-bold">{activePlanId || "None"} (-{planReductionPct}%)</span>
                          </p>
                        </div>
                        <div className="text-right font-mono">
                          <p className="text-emerald-400 font-bold">{optimizedSessionKwh.toFixed(5)} units</p>
                        </div>
                      </div>

                      {/* Step B: Carbon Footprint */}
                      <div className="p-4 rounded-xl border-emerald-500/20 bg-emerald-500/5 flex justify-between items-center font-bold">
                        <div className="space-y-1">
                          <p className="text-white">Step B: Convert Units to Carbon Footprint</p>
                          <p className="text-[10px] text-zinc-400 font-normal">
                            {optimizedSessionKwh.toFixed(5)} units × 0.82 kg of CO₂ per unit (India Standard)
                          </p>
                        </div>
                        <p className="text-2xl font-black text-emerald-400 font-mono">
                          {estimatedMonthlyCarbon.toFixed(3)} kg
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {type === "EFFICIENCY" && (
            <div className="space-y-6">
              {/* Info Header */}
              <div className="p-5 bg-white/2 border border-white/5 rounded-xl flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-mono text-zinc-500 tracking-wider">Formula in Plain English</span>
                  <p className="text-sm font-bold text-white">
                    85% Baseline Score - Usage Penalty (Stressing the Grid) + Savings Plan Reward
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-mono text-zinc-500 tracking-wider">Efficiency Score</span>
                  <p className="text-3xl font-mono font-black text-blue-400">
                    {efficiency.toFixed(0)}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                {/* Score Breakdown List */}
                <div className="space-y-4 text-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-[9px] uppercase font-mono text-zinc-500 tracking-wider font-bold">Score Breakdown Audit</span>
                    
                    {/* Base */}
                    <div className="p-3.5 rounded-xl border border-white/5 bg-white/2 flex justify-between items-center">
                      <div className="space-y-0.5">
                        <p className="text-white font-bold">1. Home Baseline Score</p>
                        <p className="text-[10px] text-zinc-400">Every home starts with a strong rating</p>
                      </div>
                      <p className="text-zinc-300 font-bold font-mono">+85%</p>
                    </div>

                    {/* Load Penalty */}
                    <div className="p-3.5 rounded-xl border border-white/5 bg-white/2 flex justify-between items-center">
                      <div className="space-y-0.5">
                        <p className="text-white font-bold">2. High Usage Penalty</p>
                        <p className="text-[10px] text-zinc-400">Stressing the grid by running too many heavy devices at once</p>
                      </div>
                      <p className="text-red-400 font-bold font-mono">-{usagePenalty.toFixed(1)}%</p>
                    </div>

                    {/* Plan Bonus */}
                    <div className="p-3.5 rounded-xl border border-white/5 bg-white/2 flex justify-between items-center">
                      <div className="space-y-0.5">
                        <p className="text-white font-bold">3. Optimization Bonus</p>
                        <p className="text-[10px] text-zinc-400">Reward points for using a smart saving plan</p>
                      </div>
                      <p className="text-emerald-400 font-bold font-mono">+{planBonus}%</p>
                    </div>
                  </div>

                  {/* Final Calculation */}
                  <div className="p-4 rounded-xl border-blue-500/20 bg-blue-500/5 flex justify-between items-center font-bold mt-4">
                    <span className="text-white">Final System Efficiency Rating:</span>
                    <span className="text-blue-400 text-xl font-black font-mono">{efficiency.toFixed(0)}%</span>
                  </div>
                </div>

                {/* Additional Guidance Panel */}
                <div className="p-6 rounded-xl border border-white/5 bg-white/2 flex flex-col justify-between gap-6">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2 mb-3">
                      <Info className="w-4 h-4 text-blue-400" /> How to Improve Your Score
                    </p>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                      Our system calculates efficiency based on your real-time electricity draw compared to your total maximum capacity. 
                    </p>
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-[11px] font-bold text-zinc-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                        <span>Commit to higher plans (Carbon Zero yields a +40% bonus)</span>
                      </div>
                      <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-[11px] font-bold text-zinc-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                        <span>Stagger heavy appliances (avoid running EV Charger and AC together)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {type === "MAX_EFFICIENCY" && (
            <div className="space-y-6">
              {/* Info Header */}
              <div className="p-5 bg-white/2 border border-white/5 rounded-xl flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-mono text-zinc-500 tracking-wider">Formula in Plain English</span>
                  <p className="text-sm font-bold text-white">
                    Total Appliance Load - Solar Panel Power - Stored Battery Backup
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-mono text-zinc-500 tracking-wider">Current Grid Dependency</span>
                  <p className="text-3xl font-mono font-black text-teal-400">
                    {netGridLoad.toFixed(2)} <span className="text-xs font-normal text-zinc-500">kW</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Stats list */}
                <div className="space-y-4 text-xs font-mono">
                  <span className="text-[9px] uppercase font-mono text-zinc-500 tracking-wider font-bold font-sans">Microgrid Flow Metrics</span>
                  
                  {/* Total load */}
                  <div className="p-3.5 rounded-xl border border-white/5 bg-white/2 flex justify-between items-center">
                    <p className="text-white font-bold font-sans">Total Power Needed</p>
                    <p className="text-zinc-300 font-bold">{totalLoad.toFixed(2)} kW</p>
                  </div>

                  {/* Grid draw */}
                  <div className="p-3.5 rounded-xl border border-white/5 bg-white/2 flex justify-between items-center">
                    <p className="text-white font-bold font-sans">Net Grid Draw (Utility)</p>
                    <p className="text-zinc-300 font-bold">{netGridLoad.toFixed(2)} kW</p>
                  </div>

                  {/* Clean self-consumption */}
                  <div className="p-3.5 rounded-xl border border-white/5 bg-white/2 flex justify-between items-center">
                    <p className="text-white font-bold font-sans">Clean Energy Consumption</p>
                    <p className="text-emerald-400 font-bold">{(totalLoad - netGridLoad).toFixed(2)} kW</p>
                  </div>

                  {/* Clean Percentage */}
                  <div className="p-4 rounded-xl border-teal-500/20 bg-teal-500/5 flex justify-between items-center font-bold">
                    <span className="text-white font-sans">Microgrid Autonomy Status:</span>
                    <span className="text-teal-400 text-lg font-black">{selfConsumptionPercent.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Info Text */}
                <div className="p-6 rounded-xl border border-white/5 bg-white/2 space-y-4">
                  <p className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-400" /> Understanding Grid Autonomy
                  </p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Grid dependency shows how much electricity your home pulls from external, fossil-fuel power grids.
                  </p>
                  <div className="space-y-3 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-zinc-300">
                      <span className="font-sans">☀️ Clean Solar Generation:</span>
                      <span className="text-amber-500 font-bold">{solarState.solarGeneration.toFixed(1)} kW</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-300">
                      <span className="font-sans">🔋 Stored Battery Charge:</span>
                      <span className="text-emerald-400 font-bold">{solarState.batteryLevel.toFixed(1)} kWh</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-300">
                      <span className="font-sans">🔌 Export Mode:</span>
                      <span className="text-white font-bold font-sans text-[10px]">{gridSellback ? "P2P Smart Sellback Active" : "Disabled"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Return Button */}
          <div className="mt-12 pt-8 border-t border-white/5 flex justify-center">
            <button
              onClick={onClose}
              className={`px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all hover:scale-[1.01] hover:brightness-110 cursor-pointer ${
                type === "CARBON" ? "bg-emerald-500 text-black" : "bg-white text-black"
              }`}
            >
              Return to Console
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
