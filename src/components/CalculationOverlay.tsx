"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Calculator, Info, Zap, TrendingDown, Leaf } from "lucide-react";

export type MetricType = "COST" | "CARBON" | "EFFICIENCY" | "MAX_EFFICIENCY" | null;

interface CalculationOverlayProps {
  type: MetricType;
  onClose: () => void;
}

const content = {
  COST: {
    title: "Electricity Billing Explained",
    subtitle: "How your monthly bill is calculated",
    icon: <Calculator className="w-12 h-12 text-accent-cyber" />,
    formula: "Units Used (kWh) × ₹8.00 per Unit",
    explanation: "Your bill depends on how many 'Units' of electricity you use. In India, 1 Unit is equal to 1 kWh. We use a standard rate of ₹8 per unit to estimate your monthly cost.",
    example: "If you run a 1.5 Ton AC (1.8 kW) for 10 hours, it uses 18 Units. At ₹8/unit, that's ₹144 for just that day.",
    tips: ["Use Inverter ACs to save up to 30%", "Switch off geysers after 15 mins", "Old fans use 75W, Smart fans use only 28W"]
  },
  CARBON: {
    title: "Pollution Created",
    subtitle: "Your impact on the environment",
    icon: <Leaf className="w-12 h-12 text-accent-emerald" />,
    formula: "Units Used × 0.82 kg CO2",
    explanation: "Most of India's electricity comes from coal. For every unit (kWh) you use, about 0.82 kg of CO2 is released into the air. Reducing units directly reduces pollution.",
    example: "Saving 100 units a month is like planting 2 trees!",
    tips: ["Switch to LED bulbs", "Use natural sunlight during the day", "Check for star ratings on appliances"]
  },
  EFFICIENCY: {
    title: "System Efficiency",
    subtitle: "How well you manage your load",
    icon: <Zap className="w-12 h-12 text-yellow-400" />,
    formula: "100 - (Current Load % of Max)",
    explanation: "This score shows if you are using too many heavy appliances at once. A high score means you are balancing your load well to avoid grid trips.",
    example: "Running the AC, Geyser, and EV Charger together drops efficiency.",
    tips: ["Stagger heavy appliance use", "Use timers for water heaters", "Monitor live usage signature"]
  },
  MAX_EFFICIENCY: {
    title: "Optimization Potential",
    subtitle: "Max savings possible",
    icon: <TrendingDown className="w-12 h-12 text-accent-emerald" />,
    formula: "Current Score vs. Ideal Pattern",
    explanation: "We compare your current usage to an 'Eco-Sync' pattern. This reveals how much more money you could save by making small changes.",
    example: "Optimizing AC usage can save up to ₹1,200 per month.",
    tips: ["Follow the AI recommendations", "Enable Auto-Sync mode", "Identify 'Vampire' appliances"]
  }
};

export default function CalculationOverlay({ type, onClose }: CalculationOverlayProps) {
  if (!type) return null;
  const data = content[type];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 md:p-12"
    >
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-3xl" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.9, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 40, opacity: 0 }}
        className="bg-slate-900 border border-white/10 rounded-[4rem] shadow-2xl relative z-10 w-full max-w-4xl overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-10 right-10 p-4 rounded-full bg-white/5 hover:bg-white/10 transition-all text-white/40 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-16 md:p-24">
          <div className="flex flex-col md:flex-row gap-12 items-start mb-16">
            <div className="p-8 rounded-[2.5rem] bg-slate-950/50 shadow-inner border border-white/5">
              {data.icon}
            </div>
            <div>
              <h2 className="text-6xl font-black text-white tracking-tighter uppercase mb-2">{data.title}</h2>
              <p className="text-white/40 font-mono text-sm uppercase tracking-widest">{data.subtitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <div className="mb-12">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <Calculator className="w-4 h-4" /> Calculation Method
                </p>
                <p className="text-3xl font-black text-accent-cyber bg-slate-950/50 p-8 rounded-3xl border border-white/5 shadow-sm leading-tight">
                  {data.formula}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">The Logic</p>
                <p className="text-white/60 leading-relaxed text-lg">
                  {data.explanation}
                </p>
              </div>
            </div>

            <div className="space-y-12">
               <div className="bg-accent-cyber/5 p-10 rounded-[3rem] border border-accent-cyber/10">
                  <p className="text-accent-cyber font-black text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Info className="w-4 h-4" /> Relatable Example
                  </p>
                  <p className="text-white font-bold leading-relaxed italic opacity-80">
                    "{data.example}"
                  </p>
               </div>

               <div>
                 <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-6">Quick Savings Tips</p>
                 <div className="space-y-4">
                   {data.tips.map((tip, i) => (
                     <div key={i} className="flex items-center gap-4 text-white/80 font-bold bg-white/5 shadow-sm p-4 rounded-2xl border border-white/5">
                        <div className="w-2 h-2 rounded-full bg-accent-cyber shadow-[0_0_8px_#00F0FF]" />
                        {tip}
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          </div>

          <div className="mt-20 pt-10 border-t border-white/5 flex justify-center">
             <button 
               onClick={onClose}
               className="px-16 py-6 bg-accent-cyber text-slate-900 rounded-[2.5rem] font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-cyan-500/20"
             >
               Return to Dashboard
             </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
