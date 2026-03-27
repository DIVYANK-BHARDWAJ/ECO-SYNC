"use client";

import { motion } from "framer-motion";
import { Zap, Fan, Lightbulb, Tv, Refrigerator, WashingMachine, Wind, ChevronRight, Activity } from "lucide-react";
import { ApplianceState } from "./ControlOverlay";

interface UHDSectionProps {
  applianceState: ApplianceState;
  setApplianceState: (state: any) => void;
  totalLoad: number;
}

export default function UHDSection({ applianceState, setApplianceState, totalLoad }: UHDSectionProps) {
  const toggleAppliance = (appliance: keyof ApplianceState) => {
    setApplianceState((prev: any) => ({ ...prev, [appliance]: !prev[appliance] }));
  };

  const appliances = [
    { id: "hvac", label: "Climate Control", icon: <Fan className="w-10 h-10" />, power: "2.5 kW", desc: "Variable Speed HVAC" },
    { id: "ev", label: "Tesla Wallbox", icon: <Zap className="w-10 h-10" />, power: "7.2 kW", desc: "Level 2 Fast Charging" },
    { id: "lighting", label: "Smart Lighting", icon: <Lightbulb className="w-10 h-10" />, power: "0.05 kW", desc: "Whole Home LED Array" },
    { id: "tv", label: "8K OLED TV", icon: <Tv className="w-10 h-10" />, power: "0.15 kW", desc: "Peak Entertainment" },
    { id: "fridge", label: "Smart Fridge", icon: <Refrigerator className="w-10 h-10" />, power: "0.10 kW", desc: "Always-on Preservation" },
    { id: "dishwasher", label: "Dishwasher", icon: <WashingMachine className="w-10 h-10" />, power: "1.2 kW", desc: "Ultra-Efficient Cycle" },
    { id: "airPurifier", label: "Air Purifier", icon: <Wind className="w-10 h-10" />, power: "0.05 kW", desc: "H13 HEPA Filtration" },
  ] as const;

  return (
    <section className="py-32 px-12 bg-black border-t border-white/5 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-accent-emerald/5 blur-[120px] rounded-full -mt-[250px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div>
            <h2 className="text-7xl font-black text-white italic tracking-tighter uppercase mb-4">
               Command <span className="text-accent-emerald neon-text-emerald">Center</span>
            </h2>
            <p className="text-white/30 font-mono text-sm tracking-[0.3em] uppercase">Interactive Grid v3.5.0</p>
          </div>
          <div className="flex items-center gap-12 bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
            <div className="text-left">
               <p className="text-white/20 text-[10px] uppercase font-mono tracking-widest mb-1">Live Grid Load</p>
               <p className="text-white text-5xl font-black tracking-tighter tabular-nums">
                 {totalLoad.toFixed(2)}<span className="text-lg text-white/30 ml-2">kW</span>
               </p>
            </div>
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border transition-all ${totalLoad > 8 ? "bg-red-500/20 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]" : "bg-accent-emerald/20 border-accent-emerald/30"}`}>
               <Activity className={`w-8 h-8 ${totalLoad > 8 ? "text-red-500" : "text-accent-emerald"} animate-pulse`} />
            </div>
          </div>
        </div>

        {/* Appliance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {appliances.map((app) => (
            <motion.button
              key={app.id}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleAppliance(app.id as keyof ApplianceState)}
              className={`relative overflow-hidden group flex flex-col items-start p-10 rounded-[3rem] border transition-all duration-500 ${
                applianceState[app.id as keyof ApplianceState] 
                  ? "bg-white/10 border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.5)]" 
                  : "bg-transparent border-white/5 hover:bg-white/5 hover:border-white/10"
              }`}
            >
              {/* Active Highlight Glow */}
              <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] -mr-16 -mt-16 transition-opacity duration-700 ${
                applianceState[app.id as keyof ApplianceState] ? "bg-accent-emerald/20 opacity-100" : "opacity-0"
              }`} />

              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 transition-all duration-500 ${
                applianceState[app.id as keyof ApplianceState] 
                  ? "bg-accent-emerald text-black shadow-[0_0_30px_#10B981]" 
                  : "bg-white/5 text-white/40"
              }`}>
                {app.icon}
              </div>

              <div className="text-left relative z-10 w-full">
                <h4 className={`text-2xl font-black tracking-tight mb-2 transition-colors ${
                  applianceState[app.id as keyof ApplianceState] ? "text-white" : "text-white/40"
                }`}>
                  {app.label}
                </h4>
                <p className="text-white/20 text-xs font-medium mb-8">{app.desc}</p>
                
                <div className="flex items-center justify-between w-full pt-6 border-t border-white/5">
                   <p className={`text-[10px] font-mono tracking-widest uppercase italic transition-colors ${
                     applianceState[app.id as keyof ApplianceState] ? "text-accent-emerald font-bold" : "text-white/10"
                   }`}>
                     {applianceState[app.id as keyof ApplianceState] ? "ACTIVE" : "STANDBY"}
                   </p>
                   <p className="text-white/40 font-bold text-sm">{app.power}</p>
                </div>
              </div>
            </motion.button>
          ))}

          {/* Efficiency Summary Tile */}
          <div className="p-10 rounded-[3rem] border border-accent-cyber/20 bg-accent-cyber/5 flex flex-col justify-between group">
             <div>
               <p className="text-accent-cyber font-mono text-[10px] uppercase tracking-widest mb-4">Grid Efficiency</p>
               <h3 className="text-white font-black text-4xl leading-tight">Optimizing your potential.</h3>
             </div>
             <div className="flex items-center gap-4 text-accent-cyber font-bold group-hover:gap-6 transition-all">
                <span>REDUCE LOAD NOW</span>
                <ChevronRight className="w-6 h-6" />
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
