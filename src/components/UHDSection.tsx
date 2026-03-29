"use client";

import { motion } from "framer-motion";
import { Zap, Fan, Lightbulb, Tv, Refrigerator, WashingMachine, Wind, Snowflake, Waves, Search, ChevronRight, Activity, LayoutGrid } from "lucide-react";
import { ApplianceState } from "./ControlOverlay";

interface UHDSectionProps {
  applianceState: ApplianceState;
  setApplianceState: (state: any) => void;
  totalLoad: number;
  onOpenPlans: () => void;
  onScrollToRadar: () => void;
}

export default function UHDSection({ applianceState, setApplianceState, totalLoad, onOpenPlans, onScrollToRadar }: UHDSectionProps) {
  const toggleAppliance = (appliance: keyof ApplianceState) => {
    setApplianceState((prev: any) => ({ ...prev, [appliance]: !prev[appliance] }));
  };

  const appliances = [
    { id: "hvac", label: "1.5 Ton AC", icon: <Wind className="w-10 h-10" />, power: "1.8 kW", desc: "Inverter Cooling" },
    { id: "ev", label: "EV Wallbox", icon: <Zap className="w-10 h-10" />, power: "7.2 kW", desc: "Fast Charging" },
    { id: "fridge", label: "Inverter Fridge", icon: <Snowflake className="w-10 h-10" />, power: "0.15 kW", desc: "Constant Cooling" },
    { id: "tv", label: "Smart OLED TV", icon: <Tv className="w-10 h-10" />, power: "0.18 kW", desc: "Entertainment" },
    { id: "lighting", label: "Smart Lighting", icon: <Lightbulb className="w-10 h-10" />, power: "0.06 kW", desc: "Adaptive Brightness" },
    { id: "dishwasher", label: "Dishwasher", icon: <Waves className="w-10 h-10" />, power: "1.5 kW", desc: "Eco Cycle" },
    { id: "airPurifier", label: "Air Purifier", icon: <Search className="w-10 h-10" />, power: "0.07 kW", desc: "HEPA Filtration" },
  ] as const;

  return (
    <section className="bg-slate-900 py-16 sm:py-32 px-6 sm:px-12 border-t border-white/5 relative overflow-hidden">
      {/* Background Ambient Glow - Cyber Aqua */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] sm:h-[500px] bg-accent-cyber/5 blur-[120px] rounded-full -mt-[150px] sm:-mt-[250px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-20 gap-6 sm:gap-8">
          <div>
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
               <div className="w-2 h-2 rounded-full bg-accent-cyber animate-pulse shadow-[0_0_10px_#00F0FF]" />
               <p className="text-white/40 font-mono text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.4em] font-black">Control Hub V3.6.0</p>
            </div>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tighter uppercase mb-2 sm:mb-4 leading-none italic">
               Command <span className="text-accent-cyber">Center</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-6 sm:gap-12 bg-slate-950/50 backdrop-blur-3xl border border-white/5 p-6 sm:p-8 rounded-3xl sm:rounded-[3rem] shadow-2xl w-full sm:w-auto">
            <div className="text-left flex-1 sm:flex-none">
               <p className="text-white/40 text-[8px] sm:text-[10px] uppercase font-mono tracking-widest mb-1 font-bold">Grid Load Meter</p>
               <p className="text-white text-4xl sm:text-6xl font-black tracking-tighter tabular-nums drop-shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                 {totalLoad.toFixed(2)}<span className="text-xs sm:text-lg text-white/20 ml-1 sm:ml-2">kW</span>
               </p>
            </div>
            <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[2rem] flex items-center justify-center border border-white/10 transition-all duration-500 ${totalLoad > 7 ? "bg-red-500 text-white shadow-[0_15px_30px_rgba(239,68,68,0.3)]" : "bg-accent-cyber text-slate-900 shadow-[0_0_30px_rgba(0,240,255,0.4)]"}`}>
               <Activity className={`w-6 h-6 sm:w-10 sm:h-10 ${totalLoad > 7 ? "animate-[pulse_1s_infinite]" : "animate-pulse"}`} />
            </div>
          </div>
        </div>

        {/* Appliance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {appliances.map((app) => (
            <motion.button
              key={app.id}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleAppliance(app.id as keyof ApplianceState)}
              className={`relative overflow-hidden group flex flex-col items-start p-6 sm:p-10 rounded-3xl sm:rounded-[3.5rem] border transition-all duration-500 ${
                applianceState[app.id as keyof ApplianceState] 
                  ? "bg-slate-800 border-accent-cyber shadow-2xl shadow-cyan-500/10" 
                  : "bg-slate-800/20 border-white/5 hover:bg-slate-800/40 hover:border-white/10 shadow-sm"
              }`}
            >
              <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[2rem] flex items-center justify-center mb-6 sm:mb-10 transition-all duration-500 ${
                applianceState[app.id as keyof ApplianceState] 
                  ? "bg-accent-cyber text-slate-900 shadow-[0_0_20px_rgba(0,240,255,0.3)]" 
                  : "bg-slate-900/50 text-white/20"
              }`}>
                {/* Scale the icon for mobile */}
                <div className="scale-75 sm:scale-100 flex items-center justify-center">
                  {app.icon}
                </div>
              </div>

              <div className="text-left relative z-10 w-full">
                <h4 className={`text-xl sm:text-2xl font-black tracking-tight mb-1 sm:mb-2 uppercase ${
                  applianceState[app.id as keyof ApplianceState] ? "text-white" : "text-white/20"
                }`}>
                  {app.label}
                </h4>
                <p className="text-white/50 text-[10px] sm:text-sm font-bold mb-6 sm:mb-10 uppercase tracking-tighter">{app.desc}</p>
                
                <div className="flex items-center justify-between w-full pt-4 sm:pt-6 border-t border-white/5">
                   <p className={`text-[8px] sm:text-xs font-mono tracking-widest uppercase font-black ${
                     applianceState[app.id as keyof ApplianceState] ? "text-accent-cyber" : "text-white/60"
                   }`}>
                     {applianceState[app.id as keyof ApplianceState] ? "ACTIVE" : "STANDBY"}
                   </p>
                   <p className="text-white/80 font-black text-xs sm:text-sm">{app.power}</p>
                </div>
              </div>
            </motion.button>
          ))}
          {/* Live Grid Radar Navigation Tile */}
          <motion.button 
            onClick={onScrollToRadar}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-8 sm:p-10 rounded-3xl sm:rounded-[3.5rem] border border-accent-emerald/20 bg-accent-emerald/5 backdrop-blur-md flex flex-col justify-between group shadow-lg text-left min-h-[220px] sm:min-h-0"
          >
             <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-accent-emerald text-slate-900 flex items-center justify-center mb-6 sm:mb-8 border border-white/10">
                <Activity className="w-6 h-6 sm:w-8 sm:h-8" />
             </div>
             <div>
               <p className="text-accent-emerald font-mono text-[8px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] mb-2 sm:mb-4 font-black">Live Pulse Stream</p>
               <h3 className="text-white font-black text-2xl sm:text-3xl leading-tight uppercase tracking-tighter">Live <br/> Grid Radar.</h3>
             </div>
             <div className="flex items-center gap-4 text-accent-emerald font-black uppercase text-[10px] sm:text-xs tracking-widest mt-6 sm:mt-8 group-hover:gap-6 transition-all">
                <span>VIEW TELEMETRY</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
             </div>
          </motion.button>

          {/* Efficiency Roadmap Tile */}
          <motion.button 
            onClick={onOpenPlans}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-8 sm:p-10 rounded-3xl sm:rounded-[3.5rem] border border-accent-cyber/20 bg-accent-cyber/5 backdrop-blur-md flex flex-col justify-between group shadow-lg text-left min-h-[220px] sm:min-h-0"
          >
             <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-accent-cyber text-slate-900 flex items-center justify-center mb-6 sm:mb-8 border border-white/10">
                <LayoutGrid className="w-6 h-6 sm:w-8 sm:h-8" />
             </div>
             <div>
               <p className="text-accent-cyber font-mono text-[8px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] mb-2 sm:mb-4 font-black">Optimization Matrix</p>
               <h3 className="text-white font-black text-2xl sm:text-3xl leading-tight uppercase tracking-tighter">Maximize <br/> your savings.</h3>
             </div>
             <div className="flex items-center gap-4 text-accent-cyber font-black uppercase text-[10px] sm:text-xs tracking-widest mt-6 sm:mt-8 group-hover:gap-6 transition-all">
                <span>VIEW PLANS</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
             </div>
          </motion.button>
        </div>
      </div>
    </section>
  );
}
