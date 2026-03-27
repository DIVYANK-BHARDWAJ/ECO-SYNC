"use client";

import { motion } from "framer-motion";
import { Zap, Fan, Lightbulb, Tv, Refrigerator, WashingMachine, Wind, ChevronRight, Activity, LayoutGrid } from "lucide-react";
import { ApplianceState } from "./ControlOverlay";

interface UHDSectionProps {
  applianceState: ApplianceState;
  setApplianceState: (state: any) => void;
  totalLoad: number;
  onOpenPlans: () => void;
}

export default function UHDSection({ applianceState, setApplianceState, totalLoad, onOpenPlans }: UHDSectionProps) {
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
    <section className="py-32 px-12 bg-[#F1F5F9] border-t border-slate-200 relative overflow-hidden">
      {/* Background Ambient Glow - Adjusted for light theme */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-accent-emerald/5 blur-[120px] rounded-full -mt-[250px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div>
            <h2 className="text-7xl font-black text-slate-900 tracking-tighter uppercase mb-4">
               Command <span className="text-accent-emerald">Center</span>
            </h2>
            <p className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.4em] font-bold">Interactive Grid v3.5.0</p>
          </div>
          
          <div className="flex items-center gap-12 bg-white border border-slate-200 p-8 rounded-[3rem] shadow-xl">
            <div className="text-left">
               <p className="text-slate-400 text-[10px] uppercase font-mono tracking-widest mb-1 font-bold">Grid Load Meter</p>
               <p className="text-slate-900 text-6xl font-black tracking-tighter tabular-nums">
                 {totalLoad.toFixed(2)}<span className="text-lg text-slate-300 ml-2">kW</span>
               </p>
            </div>
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center border transition-all duration-500 ${totalLoad > 7 ? "bg-red-500 text-white shadow-[0_15px_30px_rgba(239,68,68,0.3)]" : "bg-accent-emerald text-white shadow-[0_15px_30px_rgba(16,185,129,0.3)]"}`}>
               <Activity className={`w-10 h-10 ${totalLoad > 7 ? "animate-[pulse_1s_infinite]" : "animate-pulse"}`} />
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
              className={`relative overflow-hidden group flex flex-col items-start p-10 rounded-[3.5rem] border transition-all duration-500 ${
                applianceState[app.id as keyof ApplianceState] 
                  ? "bg-white border-accent-emerald shadow-2xl shadow-emerald-500/10" 
                  : "bg-white/50 border-slate-200 hover:bg-white hover:border-slate-300 shadow-sm"
              }`}
            >
              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-10 transition-all duration-500 ${
                applianceState[app.id as keyof ApplianceState] 
                  ? "bg-accent-emerald text-white" 
                  : "bg-slate-100 text-slate-300"
              }`}>
                {app.icon}
              </div>

              <div className="text-left relative z-10 w-full">
                <h4 className={`text-2xl font-black tracking-tight mb-2 uppercase ${
                  applianceState[app.id as keyof ApplianceState] ? "text-slate-900" : "text-slate-400"
                }`}>
                  {app.label}
                </h4>
                <p className="text-slate-400 text-xs font-bold mb-10 uppercase tracking-tighter">{app.desc}</p>
                
                <div className="flex items-center justify-between w-full pt-6 border-t border-slate-100">
                   <p className={`text-[10px] font-mono tracking-widest uppercase font-black ${
                     applianceState[app.id as keyof ApplianceState] ? "text-accent-emerald" : "text-slate-200"
                   }`}>
                     {applianceState[app.id as keyof ApplianceState] ? "ACTIVE" : "STANDBY"}
                   </p>
                   <p className="text-slate-300 font-black text-xs">{app.power}</p>
                </div>
              </div>
            </motion.button>
          ))}

          {/* Efficiency Roadmap Tile */}
          <motion.button 
            onClick={onOpenPlans}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-10 rounded-[3.5rem] border border-cyan-500/30 bg-white/80 backdrop-blur-md flex flex-col justify-between group shadow-lg text-left"
          >
             <div className="w-16 h-16 rounded-3xl bg-cyan-50 flex items-center justify-center text-cyan-500 mb-8 border border-cyan-100">
                <LayoutGrid className="w-8 h-8" />
             </div>
             <div>
               <p className="text-cyan-500 font-mono text-[10px] uppercase tracking-[0.2em] mb-4 font-black">Optimization Matrix</p>
               <h3 className="text-slate-900 font-black text-3xl leading-tight uppercase tracking-tighter">Maximize <br/> your savings.</h3>
             </div>
             <div className="flex items-center gap-4 text-cyan-600 font-black uppercase text-xs tracking-widest mt-8 group-hover:gap-6 transition-all">
                <span>VIEW PLANS</span>
                <ChevronRight className="w-5 h-5" />
             </div>
          </motion.button>
        </div>
      </div>
    </section>
  );
}
