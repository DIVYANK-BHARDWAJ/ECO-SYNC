"use client";

import { motion } from "framer-motion";
import { Info, Calculator } from "lucide-react";
import { MetricType } from "./CalculationOverlay";

interface TotalizerProps {
  totalLoad: number;
  accumulatedKwh: number;
  onOpenMetric: (type: MetricType) => void;
}

export default function Totalizer({ totalLoad, accumulatedKwh, onOpenMetric }: TotalizerProps) {
  const carbonFactor = 0.4; 
  const costFactor = 0.15; 
  
  const currentCost = accumulatedKwh * costFactor;
  const currentCarbon = accumulatedKwh * carbonFactor;

  const MAX_POTENTIAL_LOAD = 11.25;
  const BASELINE_LOAD = 0.2; 
  
  const efficiency = Math.max(0, Math.min(100, 
    100 - ((totalLoad - BASELINE_LOAD) / (MAX_POTENTIAL_LOAD - BASELINE_LOAD)) * 100
  ));

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SummaryCard 
          title="Monthly Estimate"
          value={`$${(currentCost * 720).toFixed(2)}`}
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
          title="System Efficiency"
          value={efficiency.toFixed(1)}
          label="Optimization Score"
          suffix="%"
          accent="emerald"
          onClick={() => onOpenMetric("EFFICIENCY")}
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
  const accentColor = accent === "emerald" ? "#10B981" : "#00E0FF";
  const borderClass = accent === "emerald" ? "border-emerald-500/20" : "border-cyan-500/20";
  const bgClass = accent === "emerald" ? "bg-emerald-500/5 hover:bg-emerald-500/10" : "bg-cyan-500/5 hover:bg-cyan-500/10";
  const textColor = accent === "emerald" ? "text-emerald-600" : "text-cyan-600";

  return (
    <motion.button 
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      viewport={{ once: true }}
      className={`p-10 rounded-[3rem] border ${borderClass} ${bgClass} relative overflow-hidden group transition-all duration-500 text-left w-full h-full flex flex-col justify-between shadow-sm`}
    >
      <div className="flex justify-between items-start mb-10 w-full relative z-10">
        <h4 className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.4em] font-bold">{title}</h4>
        <div className="w-10 h-10 rounded-2xl bg-white/80 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-slate-900 group-hover:bg-white transition-all">
          <Calculator className="w-5 h-5" />
        </div>
      </div>

      <div className="relative z-10 w-full overflow-hidden">
        <div className="flex items-baseline mb-4 flex-wrap max-w-full">
          <span className={`text-5xl lg:text-7xl font-black tracking-tighter ${textColor} break-all`}>
            {value}
          </span>
          {suffix && (
            <span className="text-xl text-slate-300 font-bold ml-2">
              {suffix}
            </span>
          )}
        </div>
        <p className="text-slate-600 font-black tracking-tight text-lg leading-tight uppercase opacity-80 break-words">
          {label}
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-900/5 flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] relative z-10">
         <Info className="w-3.5 h-3.5" />
         <span>Explore Calculation Formula</span>
      </div>

      <div className="absolute -bottom-10 -right-10 w-48 h-48 blur-[100px] rounded-full opacity-20 transition-opacity group-hover:opacity-40" 
           style={{ backgroundColor: accentColor }} />
    </motion.button>
  );
}
