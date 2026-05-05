"use client";

import { motion } from "framer-motion";
import { Info, Calculator } from "lucide-react";
import { MetricType } from "./CalculationOverlay";
import { Device, SolarBatteryState } from "@/types/device";

interface TotalizerProps {
  totalLoad: number;
  accumulatedKwh: number;
  devices: Device[];
  onOpenMetric: (type: MetricType) => void;
  activePlanId: string | null;
  solarState: SolarBatteryState;
}

export default function Totalizer({ totalLoad, accumulatedKwh, devices, onOpenMetric, activePlanId, solarState }: TotalizerProps) {
  const carbonFactor = 0.82; // India Standard (0.82kg/unit)
  const costFactor = 8; // ₹8 per unit (Standard Indian Rate)
  
  const currentCost = accumulatedKwh * costFactor;
  const currentCarbon = accumulatedKwh * carbonFactor;

  const BASELINE_LOAD = 0.2; 
  const totalPowerCapacity = devices.reduce((sum, d) => sum + d.power, 0);
  const maxPotentialLoad = totalPowerCapacity + BASELINE_LOAD;
  
  // Calculate a smarter optimization score:
  // 1. Base score of 85 (nominal efficiency)
  // 2. Penalty based on load intensity (max 50% penalty)
  // 3. Bonus for active savings plans (up to 40% bonus)
  const loadIntensity = (totalLoad - BASELINE_LOAD) / (totalPowerCapacity || 1);
  const usagePenalty = loadIntensity * 50;
  const planBonus = activePlanId === "Carbon Zero" ? 40 : activePlanId === "Aether Pro" ? 25 : activePlanId === "Eco-Baseline" ? 15 : 0;
  
  const efficiency = Math.max(5, Math.min(100, 
    85 - usagePenalty + planBonus
  ));

  const netGridLoad = Math.max(0, solarState.gridDependency);
  const selfConsumption = totalLoad - netGridLoad;
  const selfConsumptionPercent = totalLoad > 0 ? (selfConsumption / totalLoad) * 100 : 0;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
        <SummaryCard 
          title="Monthly Estimate"
          value={`₹${(currentCost * 720 / 24).toFixed(0)}`}
          label="Estimated Bill"
          suffix="/mo"
          accent="cyber"
          onClick={() => onOpenMetric("COST")}
        />
        <SummaryCard 
          title="Carbon Footprint"
          value={currentCarbon.toFixed(3)}
          label="kg CO2 Output"
          suffix=" kg"
          accent="emerald"
          onClick={() => onOpenMetric("CARBON")}
        />
        <SummaryCard 
          title="Grid Dependency"
          value={netGridLoad.toFixed(2)}
          label={selfConsumptionPercent > 50 ? "Mostly Self-Powered" : "Grid Reliant"}
          suffix=" kW"
          accent="cyber"
          onClick={() => onOpenMetric("MAX_EFFICIENCY")} // Assuming we reuse a metric overlay or add a new one
        />
        <SummaryCard 
          title="Maximum Efficiency"
          value={efficiency.toFixed(0)}
          label={efficiency > 70 ? "Peak optimization active." : "Optimization recommended."}
          suffix="%"
          accent="cyber"
          onClick={() => onOpenMetric("MAX_EFFICIENCY")}
        />
      </div>
    </div>
  );
}

function SummaryCard({ title, value, label, suffix, accent, onClick }: { 
  title: string; 
  value: string | number; 
  label: string;
  suffix?: string;
  accent: "emerald" | "cyber";
  onClick: () => void;
}) {
  const accentColor = accent === "emerald" ? "#10B981" : "#00F0FF";
  const borderClass = accent === "emerald" ? "border-accent-emerald/30" : "border-accent-cyber/30";
  const bgClass = accent === "emerald" ? "bg-accent-emerald/5 hover:bg-accent-emerald/10" : "bg-accent-cyber/5 hover:bg-accent-cyber/10";
  const textColor = accent === "emerald" ? "text-accent-emerald" : "text-accent-cyber";

  return (
    <motion.button 
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      viewport={{ once: true }}
      className={`p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] border ${borderClass} ${bgClass} backdrop-blur-3xl relative overflow-hidden group transition-all duration-500 text-left w-full h-full flex flex-col justify-between shadow-2xl shadow-cyan-900/20`}
    >
      <div className="flex justify-between items-start mb-6 sm:mb-10 w-full relative z-10">
        <h4 className="text-white/40 font-mono text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.4em] font-bold">{title}</h4>
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-amber-400 group-hover:bg-white/10 transition-all">
          <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>

      <div className="relative z-10 w-full overflow-hidden mb-4 sm:mb-6">
        <div className="flex items-baseline mb-1 sm:mb-2 flex-wrap max-w-full">
          <span className={`text-3xl sm:text-5xl lg:text-7xl font-black tracking-tighter ${textColor} break-all drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]`}>
            {value}
          </span>
          {suffix && (
            <span className="text-base sm:text-xl text-white/40 font-bold ml-1 sm:ml-2">
              {suffix}
            </span>
          )}
        </div>
        <p className="text-white font-black tracking-tight text-base sm:text-lg leading-tight uppercase opacity-80 break-words">
          {label}
        </p>
      </div>

      <div className="mt-4 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10 flex items-center gap-2 text-white/60 group-hover:text-white font-bold text-[8px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.2em] relative z-10 transition-colors duration-300">
         <Info className="w-3 h-3 sm:w-4 sm:h-4" />
         <span>Explore Calculation Formula</span>
      </div>

      <div className="absolute -bottom-10 -right-10 w-32 h-32 sm:w-48 sm:h-48 blur-[80px] sm:blur-[100px] rounded-full opacity-10 transition-opacity group-hover:opacity-30" 
           style={{ backgroundColor: accentColor }} />
    </motion.button>
  );
}
