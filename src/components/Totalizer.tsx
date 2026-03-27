"use client";

import { motion } from "framer-motion";
import { Info } from "lucide-react";

interface TotalizerProps {
  totalLoad: number;
  accumulatedKwh: number;
}

export default function Totalizer({ totalLoad, accumulatedKwh }: TotalizerProps) {
  const carbonFactor = 0.4; // kg CO2 per kWh
  const costFactor = 0.15; // $ per kWh
  
  const currentCost = accumulatedKwh * costFactor;
  const currentCarbon = accumulatedKwh * carbonFactor;

  // Maximum Load Calculation (All appliances ON)
  const MAX_POTENTIAL_LOAD = 11.25;
  const BASELINE_LOAD = 0.2; // Fridge + Lighting + Air
  
  // Efficiency = % of "Waste" avoided. 
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
          info="Based on current live load scaled to 30 days."
        />
        <SummaryCard 
          title="Carbon Footprint"
          value={currentCarbon.toFixed(3)}
          label="kg CO2 Output"
          suffix=" kg"
          accent="emerald"
          info="Real-time accumulated emissions ($0.4/kWh$ cost)."
        />
        <SummaryCard 
          title="System Efficiency"
          value={efficiency.toFixed(1)}
          label="Optimization Score"
          suffix="%"
          accent="emerald"
          info="Your savings ranking based on current vs max load."
        />
        <SummaryCard 
          title="Maximum Efficiency"
          value={efficiency.toFixed(0)}
          label={efficiency > 70 ? "Peak optimization active." : "Optimization recommended."}
          suffix="%"
          accent="cyber"
          info="Current real-time savings rank."
        />
      </div>
    </div>
  );
}

function SummaryCard({ title, value, label, suffix, accent, info }: { 
  title: string; 
  value: string | number; 
  label: string;
  suffix?: string;
  accent: "emerald" | "cyber";
  info: string;
}) {
  const accentColor = accent === "emerald" ? "#10B981" : "#00E0FF";
  const borderClass = accent === "emerald" ? "neon-border-emerald" : "neon-border-cyber";
  const textShadowClass = accent === "emerald" ? "neon-text-emerald" : "neon-text-cyber";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`bg-[#050505] p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group transition-all duration-500 hover:scale-[1.02] ${borderClass} h-full flex flex-col justify-between`}
    >
      <div className="flex justify-between items-start mb-10 w-full">
        <h4 className="text-white/20 font-mono text-[10px] uppercase tracking-[0.4em]">{title}</h4>
        <div className="relative group/info">
          <Info className="w-4 h-4 text-white/10 group-hover/info:text-white/40 transition-colors" />
          <div className="absolute right-0 top-6 w-48 bg-black/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl opacity-0 group-hover/info:opacity-100 transition-all pointer-events-none z-50">
            <p className="text-[9px] text-white/50 leading-relaxed font-mono italic">{info}</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full overflow-hidden">
        <div className="flex items-baseline mb-4 flex-wrap max-w-full">
          <span className={`text-5xl lg:text-6xl font-black tracking-tighter break-all ${textShadowClass}`}>
            {value}
          </span>
          {suffix && (
            <span className="text-xl text-white/20 font-light ml-2">
              {suffix}
            </span>
          )}
        </div>
        <p className="text-white font-bold tracking-tight text-lg leading-tight opacity-50 break-words">
          {label}
        </p>
      </div>

      <div className="absolute -bottom-10 -right-10 w-32 h-32 blur-[80px] rounded-full opacity-10 transition-opacity group-hover:opacity-20" 
           style={{ backgroundColor: accentColor }} />
    </motion.div>
  );
}
