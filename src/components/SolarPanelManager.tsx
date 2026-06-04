"use client";

import { motion } from "framer-motion";
import { 
  Sun, Battery, Zap, AlertTriangle, ArrowRight, 
  ArrowUpRight, ArrowDownRight, BatteryCharging,
  Cloud, CloudRain, Moon
} from "lucide-react";
import Link from "next/link";
import { SolarBatteryState } from "@/types/device";

interface SolarPanelManagerProps {
  solarState: SolarBatteryState;
  onUpdateSolarState: (updates: Partial<SolarBatteryState>) => void;
  totalLoad: number;
  lowBatteryThreshold?: number;
  refreshRateMs?: number;
}

export default function SolarPanelManager({ 
  solarState, 
  onUpdateSolarState, 
  totalLoad, 
  lowBatteryThreshold = 15,
  refreshRateMs = 3000,
}: SolarPanelManagerProps) {
  
  const batteryPct = Math.round((solarState.batteryLevel / solarState.batteryCapacity) * 100);
  const isLowBattery = batteryPct <= lowBatteryThreshold;

  const weatherPresets = [
    { label: "Sunny", icon: <Sun className="w-3.5 h-3.5" />, val: 8.0, desc: "Clear sky peak solar output" },
    { label: "Cloudy", icon: <Cloud className="w-3.5 h-3.5" />, val: 2.5, desc: "Diffused light overcast yield" },
    { label: "Stormy", icon: <CloudRain className="w-3.5 h-3.5" />, val: 0.5, desc: "Rainy minimal solar yield" },
    { label: "Night", icon: <Moon className="w-3.5 h-3.5" />, val: 0.0, desc: "Zero generator output" },
  ];

  // Calculate current battery state
  const netPower = solarState.solarGeneration - totalLoad;
  const isCharging = netPower > 0 && solarState.batteryLevel < solarState.batteryCapacity;
  const isDischarging = netPower < 0 && solarState.batteryLevel > 0;

  // Determine current charging/discharging rate capped by batteryChargeRate
  const activeRate = Math.min(Math.abs(netPower), solarState.batteryChargeRate);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdateSolarState({ solarGeneration: val });
  };

  const handleSimulateSun = () => {
    // Quick toggle between 0 and 5.0 kW
    const newGen = solarState.solarGeneration === 0 ? 5.0 : 0;
    onUpdateSolarState({ solarGeneration: newGen });
  };

  // SVG Circular Gauge calculations
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (batteryPct / 100) * circumference;

  // Define battery indicator colors
  const batteryColorClass = isLowBattery
    ? "text-red-500 stroke-red-500"
    : batteryPct > 80
    ? "text-emerald-500 stroke-emerald-500"
    : "text-amber-500 stroke-amber-500";

  return (
    <div className={`bg-[#121214] border rounded-2xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden group transition-all duration-300 ${
      isLowBattery ? "border-red-900/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]" : "border-white/5"
    }`}>
      {/* Dynamic Background Light Glow */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-accent-solar/5 to-transparent opacity-50 transition-opacity duration-500"
        style={{
          opacity: solarState.solarGeneration > 0 ? 0.6 : 0.2
        }}
      />
      
      <div className="relative z-10 flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-500 ${
              isLowBattery 
                ? "bg-red-950/20 border-red-500/30 text-red-500" 
                : solarState.solarGeneration > 0
                ? "bg-accent-solar/20 border-accent-solar/40 text-accent-solar shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                : "bg-white/5 border-white/10 text-white/40"
            }`}>
              <Sun className={`w-5 h-5 ${solarState.solarGeneration > 0 ? "animate-[spin_10s_linear_infinite]" : ""}`} />
            </div>
            <div>
              <h3 className="text-white font-black uppercase tracking-widest text-xs font-heading">Microgrid Control</h3>
              <p className="text-white/40 text-[9px] uppercase font-mono tracking-widest">
                {isLowBattery ? "Battery Critical Alert" : "Autonomous Power Node"}
              </p>
            </div>
          </div>
          <button 
            onClick={handleSimulateSun}
            className="px-4 py-2 bg-accent-solar/10 hover:bg-accent-solar/20 text-accent-solar rounded-xl text-[9px] font-black uppercase tracking-widest border border-accent-solar/20 transition-all font-heading cursor-pointer"
          >
            {solarState.solarGeneration > 0 ? "Eclipse" : "Simulate Sun"}
          </button>
        </div>

        {/* PV Generator Slide Controls */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sun className={`w-4 h-4 ${solarState.solarGeneration > 0 ? "text-accent-solar animate-pulse" : "text-white/40"}`} />
              <span className="text-[10px] text-white/60 uppercase font-black tracking-widest">PV Generation</span>
            </div>
            <div className="text-lg font-black text-accent-solar font-mono tracking-tighter">
              {solarState.solarGeneration.toFixed(1)} <span className="text-[10px] text-white/40 font-sans font-bold">kW</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <input 
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={solarState.solarGeneration}
              onChange={handleSliderChange}
              className="flex-1 accent-accent-solar bg-white/5 rounded-lg cursor-pointer h-1.5"
            />
          </div>

          {/* Weather Presets Quick Grid */}
          <div className="flex flex-col gap-2 border-t border-white/5 pt-3 mt-1">
            <span className="text-[8px] text-white/30 uppercase font-black tracking-widest">Simulate Weather</span>
            <div className="grid grid-cols-4 gap-2">
              {weatherPresets.map((preset) => {
                const isActive = Math.abs(solarState.solarGeneration - preset.val) < 0.15;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      const newGen = preset.val;
                      // Immediately compute one simulation step so charging starts right away
                      const SIMULATION_SPEED_MULTIPLIER = 300;
                      const intervalHours = (refreshRateMs * SIMULATION_SPEED_MULTIPLIER) / 3600000;
                      const dependency = totalLoad - newGen;
                      const updates: Partial<SolarBatteryState> = { solarGeneration: newGen };

                      if (dependency < 0 && solarState.batteryLevel < solarState.batteryCapacity) {
                        // Solar surplus — charge immediately
                        const chargeKw = Math.min(-dependency, solarState.batteryChargeRate);
                        const chargeKwh = chargeKw * intervalHours * 0.95;
                        updates.batteryLevel = Math.min(
                          solarState.batteryCapacity,
                          solarState.batteryLevel + chargeKwh
                        );
                        updates.gridDependency = 0;
                      } else {
                        updates.gridDependency = Math.max(0, dependency);
                      }

                      onUpdateSolarState(updates);
                    }}
                    className={`py-2 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isActive
                        ? "bg-accent-solar/20 text-accent-solar border-accent-solar/30 shadow-[0_0_10px_rgba(245,158,11,0.1)] font-bold"
                        : "bg-white/[0.02] text-white/40 border-white/5 hover:text-white/60 hover:bg-white/[0.04]"
                    }`}
                    title={preset.desc}
                  >
                    {preset.icon}
                    <span className="font-mono text-[8px] uppercase tracking-wider">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Circular Battery gauge & Power stats */}
        <div className="grid grid-cols-2 gap-4">
          {/* Battery Circle Ring */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                <circle 
                  cx="40" cy="40" r={radius} 
                  className="stroke-white/5 fill-none" 
                  strokeWidth="5" 
                />
                <motion.circle 
                  cx="40" cy="40" r={radius} 
                  className={`fill-none ${batteryColorClass}`}
                  strokeWidth="5" 
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center mt-1">
                <span className={`text-base font-black font-mono tracking-tighter ${isLowBattery ? "text-red-500 animate-pulse" : "text-white"}`}>
                  {batteryPct}%
                </span>
                <span className="text-[7px] text-white/30 uppercase font-mono tracking-widest leading-none">Storage</span>
              </div>
            </div>
          </div>

          {/* Battery detail states */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-white/40">
                {isCharging ? (
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Battery className={`w-3.5 h-3.5 ${isLowBattery ? "text-red-500" : ""}`} />
                )}
                <span className="text-[8px] uppercase tracking-widest font-black">Storage Status</span>
              </div>
              <p className={`text-xs font-black uppercase tracking-wider ${
                isCharging ? "text-emerald-500" : isDischarging ? "text-amber-500" : "text-white/60"
              }`}>
                {isCharging ? "Charging" : isDischarging ? "Discharging" : "Idle"}
              </p>
            </div>

            <div className="border-t border-white/5 pt-2 mt-2">
              <p className="text-white/30 text-[8px] uppercase font-mono tracking-widest leading-none mb-1">Active Flow</p>
              <p className={`text-sm font-black font-mono tracking-tighter flex items-center gap-1 ${
                isCharging ? "text-emerald-500" : isDischarging ? "text-amber-500" : "text-white/50"
              }`}>
                {isCharging && <ArrowUpRight className="w-3.5 h-3.5" />}
                {isDischarging && <ArrowDownRight className="w-3.5 h-3.5" />}
                {isCharging || isDischarging ? `${activeRate.toFixed(1)} kW` : "0.0 kW"}
              </p>
            </div>
          </div>
        </div>

        {/* Grid draw state and details */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center">
          <div>
            <p className="text-[9px] uppercase font-bold tracking-widest text-white/40 mb-1">Local Net Grid Draw</p>
            <p className="text-lg font-black text-white font-mono tracking-tighter">
              {solarState.gridDependency.toFixed(1)} <span className="font-sans text-[10px] text-white/40 font-bold ml-1">kW</span>
            </p>
          </div>
          {solarState.gridDependency <= 0 ? (
            <div className="flex items-center gap-1.5 text-emerald-500 text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]">
              <Zap className="w-3.5 h-3.5 animate-pulse" /> Off-Grid
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-500 text-[9px] font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
              <AlertTriangle className="w-3.5 h-3.5" /> Grid Bound
            </div>
          )}
        </div>

        {/* Link to exchange */}
        <Link 
          href="/trading"
          className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-2 text-white transition-all group cursor-pointer"
        >
          <span className="font-mono text-[9px] uppercase tracking-widest font-black text-accent-solar">Open Energy Exchange</span>
          <ArrowRight className="w-4 h-4 text-accent-solar group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
