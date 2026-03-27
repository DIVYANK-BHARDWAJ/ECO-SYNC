"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Calculator, ArrowRight, CheckCircle2 } from "lucide-react";

export type MetricType = "COST" | "CARBON" | "EFFICIENCY" | "MAX_EFFICIENCY" | null;

interface CalculationOverlayProps {
  type: MetricType;
  onClose: () => void;
}

export default function CalculationOverlay({ type, onClose }: CalculationOverlayProps) {
  if (!type) return null;

  const content = {
    COST: {
      title: "Monthly Bill Calculation",
      formula: "Cost = E (kWh) × Rate ($0.15)",
      description: "Our system takes your real-time consumption and projects it across a standard 30-day billing cycle (720 hours).",
      steps: [
        "Track live wattage across 7 appliances.",
        "Convert Power (W) to Energy (kWh) over time.",
        "Multiply by the regional utility rate ($0.15/kWh).",
        "Scale current performance to 720 hours."
      ]
    },
    CARBON: {
      title: "Carbon Footprint Calculation",
      formula: "CO2 (kg) = E (kWh) × 0.4",
      description: "Based on the average grid intensity, every kilowatt-hour consumed generates approximately 0.4 kilograms of CO2 emissions.",
      steps: [
        "Monitor total energy consumption (kWh).",
        "Apply the Carbon Intensity Factor (0.4 kg/kWh).",
        "Calculate accumulated atmospheric impact.",
        "Update offset requirements in real-time."
      ]
    },
    EFFICIENCY: {
      title: "System Efficiency Engine",
      formula: "Score = 100 - ((Load - Base) / (Max - Base)) × 100",
      description: "We compare your current active load against the maximum potential load of your household to rank your optimization efforts.",
      steps: [
        "Identify Baseline Load (Fridge/Lights) ~0.2kW.",
        "Calculcate Maximum Potential Load (All ON) ~11.25kW.",
        "Measure current deviation from baseline.",
        "Convert deviation into a 0-100% efficiency score."
      ]
    },
    MAX_EFFICIENCY: {
      title: "Peak Optimization Model",
      formula: "Max E = Optimal Config / Current Config",
      description: "This metric analyzes if your appliance schedule matches the lowest demand periods of the local grid.",
      steps: [
        "Overlay current load with grid demand map.",
        "Identify high-wattage appliances operating during peaks.",
        "Recommend shift to off-peak slots (EV/Dishwasher).",
        "Score represents current alignment with 'Green Slots'."
      ]
    }
  }[type];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-[#F8FAFC] w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/20"
      >
        {/* Left Side: Math Focus */}
        <div className="md:w-1/2 p-12 bg-white/50 border-r border-slate-200">
           <div className="flex items-center gap-4 mb-12">
             <div className="w-12 h-12 bg-accent-emerald/10 rounded-2xl flex items-center justify-center">
               <Calculator className="w-6 h-6 text-accent-emerald" />
             </div>
             <p className="text-slate-400 font-mono text-xs uppercase tracking-[0.2em] font-bold">Calculation Log</p>
           </div>
           
           <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-8">{content.title}</h3>
           
           <div className="bg-slate-900 rounded-[2.5rem] p-10 mb-8 border border-white/10 shadow-xl group">
             <p className="text-accent-cyber font-mono text-[10px] uppercase tracking-widest mb-4">Core Mathematical Formula</p>
             <p className="text-white text-3xl font-bold tracking-tight leading-relaxed">
               {content.formula}
             </p>
           </div>

           <p className="text-slate-500 text-lg leading-relaxed font-medium">
             {content.description}
           </p>
        </div>

        {/* Right Side: Execution Steps */}
        <div className="md:w-1/2 p-12 relative">
           <button 
             onClick={onClose}
             className="absolute top-8 right-8 w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-200 hover:text-slate-900 transition-all pointer-events-auto"
           >
             <X className="w-6 h-6" />
           </button>

           <h4 className="text-slate-900 font-bold uppercase tracking-widest text-sm mb-12 mt-4">Process Methodology</h4>
           
           <div className="space-y-8">
             {content.steps.map((step, i) => (
               <div key={i} className="flex gap-6 group">
                 <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-300 font-mono text-[10px] flex items-center justify-center border border-slate-100 group-hover:bg-accent-emerald group-hover:text-white transition-all">
                   {i + 1}
                 </div>
                 <p className="text-slate-600 font-bold text-base leading-snug group-hover:text-slate-900 transition-colors">
                   {step}
                 </p>
               </div>
             ))}
           </div>

           <div className="mt-16 pt-12 border-t border-slate-100">
              <div className="flex items-center gap-4 text-accent-emerald font-black uppercase tracking-tight">
                <CheckCircle2 className="w-6 h-6" />
                <span>Verified by Aether Core v3.5</span>
              </div>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
