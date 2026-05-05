"use client";

import { motion } from "framer-motion";
import { Sun, Battery, Zap, AlertTriangle } from "lucide-react";
import { SolarBatteryState } from "@/types/device";

interface SolarPanelManagerProps {
  solarState: SolarBatteryState;
  onUpdateSolarState: (updates: Partial<SolarBatteryState>) => void;
  totalLoad: number;
}

export default function SolarPanelManager({ solarState, onUpdateSolarState, totalLoad }: SolarPanelManagerProps) {
  const handleSimulateSun = () => {
    // Toggle between 0 and a random high generation
    const newGen = solarState.solarGeneration === 0 ? Math.round((Math.random() * 3 + 2) * 10) / 10 : 0;
    onUpdateSolarState({ solarGeneration: newGen });
  };

  // Solar and Battery stats are currently displayed directly.

  return (
    <div className="bg-slate-900 border border-white/10 rounded-[2rem] p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-50" />
      
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-black uppercase tracking-widest text-sm">Microgrid Status</h3>
              <p className="text-white/40 text-[10px] uppercase font-mono tracking-widest">Solar & Battery</p>
            </div>
          </div>
          <button 
            onClick={handleSimulateSun}
            className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-500/30 transition-all"
          >
            {solarState.solarGeneration > 0 ? "Eclipse" : "Simulate Sun"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2 text-white/60">
              <Sun className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold tracking-wider">PV Array Gen</span>
            </div>
            <div className="text-2xl font-black text-amber-400">
              {solarState.solarGeneration.toFixed(1)} <span className="text-sm text-white/40">kW</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2 text-white/60">
              <Battery className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold tracking-wider">Battery Level</span>
            </div>
            <div className="text-2xl font-black text-emerald-400">
              {Math.round((solarState.batteryLevel / solarState.batteryCapacity) * 100)}<span className="text-sm text-white/40">%</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-accent-cyber/5 border border-accent-cyber/20 flex justify-between items-center">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-white/60 mb-1">Grid Draw</p>
            <p className="text-xl font-black text-accent-cyber">{solarState.gridDependency.toFixed(1)} kW</p>
          </div>
          {solarState.gridDependency <= 0 && (
            <div className="flex items-center gap-2 text-emerald-400 text-[10px] uppercase font-black tracking-widest bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
              <Zap className="w-3 h-3" /> Off-Grid
            </div>
          )}
          {solarState.gridDependency > 0 && (
            <div className="flex items-center gap-2 text-amber-500 text-[10px] uppercase font-black tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
              <AlertTriangle className="w-3 h-3" /> Grid Bound
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
