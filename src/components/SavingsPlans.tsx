"use client";

import { motion } from "framer-motion";
import { X, Check, Target, Zap, TrendingDown } from "lucide-react";

interface SavingsPlansProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SavingsPlans({ isOpen, onClose }: SavingsPlansProps) {
  if (!isOpen) return null;

  const plans = [
    {
      name: "Eco-Baseline",
      savings: "15-20%",
      desc: "Essential optimizations for the conscious homeowner.",
      features: ["Smart HVAC Scheduling", "Leaky Load Detection", "Automatic Lighting Dimming"],
      accent: "emerald"
    },
    {
      name: "Aether Pro",
      savings: "35-45%",
      desc: "Advanced algorithmic load shifting and monitoring.",
      features: ["Off-peak EV Charging", "High-Draw Appliance Rotation", "Solar Inverter Integration"],
      accent: "cyber",
      popular: true
    },
    {
      name: "Carbon Zero",
      savings: "Up to 80%",
      desc: "Full grid integration and renewable energy mastery.",
      features: ["Home Battery Management", "Grid Revenue Generation", "AI Predictive Optimization"],
      accent: "emerald"
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-3xl"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-slate-900 w-full max-w-6xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col border border-white/10"
      >
        <div className="p-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 bg-slate-950/50 border-b border-white/5">
           <div>
              <div className="flex items-center gap-4 mb-6">
                 <Target className="w-8 h-8 text-accent-cyber shadow-[0_0_15px_#00F0FF]" />
                 <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.4em] font-black">Optimization Roadmap</p>
              </div>
              <h3 className="text-6xl font-black text-white uppercase tracking-tighter">Maximize Efficiency</h3>
           </div>
           <button onClick={onClose} className="w-16 h-16 rounded-full bg-white/5 text-white/40 flex items-center justify-center border border-white/10 hover:bg-white/10 hover:text-white transition-all">
             <X className="w-8 h-8" />
           </button>
        </div>

        <div className="p-16 grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
           {plans.map((plan, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className={`p-12 rounded-[3.5rem] border flex flex-col relative transition-all duration-500 hover:scale-[1.02] ${
                 plan.popular ? "bg-slate-950 border-accent-cyber shadow-2xl shadow-cyan-500/10" : "bg-white/5 border-white/10 text-white"
               }`}
             >
               {plan.popular && (
                 <div className="absolute top-8 right-8 bg-accent-cyber px-4 py-1.5 rounded-full text-[9px] font-black text-slate-900">RECOMMENDED</div>
               )}

               <div className={`mb-8 font-black text-6xl tracking-tighter ${plan.popular ? "text-accent-cyber" : "text-white/40"}`}>
                  {plan.savings}
               </div>
               
               <h4 className="text-2xl font-black uppercase tracking-tight mb-4">{plan.name}</h4>
               <p className={`${plan.popular ? "text-white/60" : "text-white/40"} text-sm leading-relaxed mb-12 font-medium`}>{plan.desc}</p>

               <div className="space-y-6 flex-1">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex gap-4 items-center">
                       <div className={`w-6 h-6 rounded-full flex items-center justify-center ${plan.popular ? "bg-accent-cyber/20 text-accent-cyber" : "bg-white/10 text-white/40"}`}>
                          <Check className="w-3.5 h-3.5" />
                       </div>
                       <span className={`text-[11px] font-bold uppercase tracking-tight ${plan.popular ? "text-white/80" : "text-white/60"}`}>{f}</span>
                    </div>
                  ))}
               </div>

               <button className={`mt-12 w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all ${
                 plan.popular ? "bg-accent-cyber text-slate-900 hover:bg-white" : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
               }`}>
                 ACTIVATE PLAN
               </button>
             </motion.div>
           ))}
        </div>

        <div className="p-12 bg-black/40 flex flex-col md:flex-row gap-12 items-center justify-center text-center">
           <PlanAdvice icon={<Zap className="w-5 h-5 text-accent-cyber" />} text="Plans update every 12 months based on grid tariff changes." />
           <PlanAdvice icon={<TrendingDown className="w-5 h-5 text-accent-cyber" />} text="Total potential savings calculated from your live load signature." />
        </div>
      </motion.div>
    </motion.div>
  );
}

function PlanAdvice({ icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-4">
       {icon}
       <p className="text-white/60 font-bold text-[10px] uppercase tracking-tight">{text}</p>
    </div>
  );
}
