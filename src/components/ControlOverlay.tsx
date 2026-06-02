"use client";

import { motion } from "framer-motion";
import { Zap, Fan, Lightbulb, Tv, Refrigerator, WashingMachine, Wind, ChevronRight, Activity } from "lucide-react";

export interface ApplianceState {
  hvac: boolean;
  ev: boolean;
  lighting: boolean;
  tv: boolean;
  fridge: boolean;
  dishwasher: boolean;
  airPurifier: boolean;
}

interface ControlOverlayProps {
  applianceState: ApplianceState;
  setApplianceState: (state: any) => void;
  totalLoad: number;
}

export default function ControlOverlay({ applianceState, setApplianceState, totalLoad }: ControlOverlayProps) {
  const toggleAppliance = (appliance: keyof ApplianceState) => {
    setApplianceState((prev: any) => ({ ...prev, [appliance]: !prev[appliance] }));
  };

  const appliances = [
    { id: "hvac", label: "Climate Control", icon: <Fan className="w-5 h-5" />, power: "2.5 kW" },
    { id: "ev", label: "Tesla Wallbox", icon: <Zap className="w-5 h-5" />, power: "7.2 kW" },
    { id: "lighting", label: "Smart Lighting", icon: <Lightbulb className="w-5 h-5" />, power: "0.05 kW" },
    { id: "tv", label: "8K OLED TV", icon: <Tv className="w-5 h-5" />, power: "0.15 kW" },
    { id: "fridge", label: "Smart Fridge", icon: <Refrigerator className="w-5 h-5" />, power: "0.10 kW" },
    { id: "dishwasher", label: "Dishwasher", icon: <WashingMachine className="w-5 h-5" />, power: "1.2 kW" },
    { id: "airPurifier", label: "Air Purifier", icon: <Wind className="w-5 h-5" />, power: "0.05 kW" },
  ] as const;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-end p-12 overflow-hidden">
      <motion.div 
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        className="w-[420px] bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-2xl p-10 pointer-events-auto shadow-2xl relative overflow-hidden group"
      >
        {/* Glow Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 blur-[100px] -mr-32 -mt-32 transition-colors duration-700" 
             style={{ backgroundColor: totalLoad > 8 ? "rgba(239, 68, 68, 0.05)" : "rgba(59, 130, 246, 0.05)" }} />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-white font-black text-3xl tracking-tighter uppercase">Aether<span className="text-accent-secondary">UHD</span></h2>
              <p className="text-white/30 text-[10px] font-mono uppercase tracking-[0.2em] mt-1">Grid System v2.0</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${totalLoad > 8 ? "bg-red-500/10 border-red-500/20" : "bg-white/5 border-white/10"}`}>
              <Activity className={`w-6 h-6 transition-colors ${totalLoad > 8 ? "text-red-500" : "text-accent-secondary"} animate-pulse`} />
            </div>
          </div>

          {/* Load Meter */}
          <div className="mb-12 p-6 bg-white/5 rounded-xl border border-white/5 relative overflow-hidden">
            <div className="flex justify-between items-end mb-4">
              <span className="text-white/40 text-[10px] font-mono tracking-widest uppercase">Live Demand</span>
              <span className="text-white font-black text-4xl tabular-nums tracking-tighter">
                {totalLoad.toFixed(2)}<span className="text-lg text-white/30 ml-1">kW</span>
              </span>
            </div>
            
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                animate={{ width: `${Math.min((totalLoad / 12) * 100, 100)}%` }}
                className={`h-full transition-colors duration-500 ${totalLoad > 8 ? "bg-red-500" : "bg-accent-secondary"}`}
              />
            </div>
          </div>

          <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <p className="text-white/20 text-[9px] font-mono uppercase tracking-[0.3em] mb-4">Connected Network</p>
            {appliances.map((app) => (
              <button
                key={app.id}
                onClick={() => toggleAppliance(app.id as keyof ApplianceState)}
                className={`w-full group/btn flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
                  applianceState[app.id as keyof ApplianceState] 
                    ? "bg-white/10 border-white/20 glow-primary" 
                    : "bg-transparent border-white/5 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl transition-colors ${
                    applianceState[app.id as keyof ApplianceState] ? "bg-accent-primary/20 text-accent-primary" : "bg-white/5 text-white/40"
                  }`}>
                    {app.icon}
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-bold transition-colors ${applianceState[app.id as keyof ApplianceState] ? "text-white" : "text-white/70"}`}>
                      {app.label}
                    </p>
                    <p className="text-xs font-mono text-white/50 tracking-wider transition-colors group-hover/btn:text-white/70">{app.power}</p>
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                  applianceState[app.id as keyof ApplianceState] ? "border-accent-secondary bg-accent-secondary text-white" : "border-white/10 text-white/10"
                }`}>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
