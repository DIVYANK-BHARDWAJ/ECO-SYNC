"use client";

import { motion } from "framer-motion";
import { X, Check, Target, Zap, TrendingDown, ArrowLeft } from "lucide-react";

// Amber/Orange theme — warm "wealth & savings" palette
// Neutral SaaS theme
const A = {
  accent: "#3b82f6",
  accentDark: "#1d4ed8",
  glow: "rgba(59,130,246,0.05)",
  bg: "rgba(259,130,246,0.02)",
  border: "rgba(255,255,255,0.06)",
  popularBg: "rgba(59,130,246,0.08)",
};

interface SavingsPlansProps {
  isOpen: boolean;
  onClose: () => void;
  activePlanId: string | null;
  onSelectPlan: (planId: string) => void;
}

export default function SavingsPlans({ isOpen, onClose, activePlanId, onSelectPlan }: SavingsPlansProps) {
  if (!isOpen) return null;

  const plans = [
    {
      name: "Eco-Baseline",
      savings: "15-20%",
      desc: "Essential optimizations for the conscious homeowner.",
      features: ["Smart HVAC Scheduling", "Leaky Load Detection", "Automatic Lighting Dimming"],
      popular: false,
    },
    {
      name: "Aether Pro",
      savings: "35-45%",
      desc: "Advanced algorithmic load shifting and monitoring.",
      features: ["Off-peak EV Charging", "High-Draw Appliance Rotation", "Solar Inverter Integration"],
      popular: true,
    },
    {
      name: "Carbon Zero",
      savings: "Up to 80%",
      desc: "Full grid integration and renewable energy mastery.",
      features: ["Home Battery Management", "Grid Revenue Generation", "AI Predictive Optimization"],
      popular: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] overflow-y-auto flex items-start justify-center p-4 md:p-8 backdrop-blur-3xl"
      style={{ background: "rgba(9,9,11,0.95)" }}
    >
      {/* Amber glow in background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 900px 600px at 50% 40%, ${A.glow}, transparent 70%)` }}
      />

      <motion.div
        initial={{ scale: 0.95, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-6xl my-auto rounded-2xl shadow-2xl overflow-hidden flex flex-col relative z-10 mx-auto"
        style={{
          background: "#09090b",
          border: `1px solid ${A.border}`,
          boxShadow: `0 40px 100px -20px ${A.glow}`,
        }}
      >
        {/* Amber top strip */}
        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${A.accentDark}, ${A.accent}, #60a5fa)` }} />

        {/* Header */}
        <div
          className="p-8 sm:p-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 sm:gap-8 border-b"
          style={{ borderColor: A.border, background: "rgba(255,255,255,0.01)" }}
        >
          <div>
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <Target className="w-6 h-6" style={{ color: A.accent }} />
              <p className="font-mono text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.4em] font-black text-white/40">
                Optimization Roadmap
              </p>
            </div>
            <h3 className="text-3xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tighter">Maximize Efficiency</h3>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <motion.button
              onClick={onClose}
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all duration-300 bg-white/5 border border-white/10 text-white/60 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </motion.button>
            <button
              onClick={onClose}
              aria-label="Close savings plans"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white/5 border border-white/10 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Plans grid */}
        <div className="p-8 sm:p-12 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 flex-1">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-6 sm:p-10 rounded-2xl flex flex-col relative transition-all duration-500 hover:scale-[1.01]"
              style={{
                background: plan.popular ? A.popularBg : "rgba(255,255,255,0.02)",
                border: activePlanId === plan.name 
                  ? `2px solid ${A.accent}` 
                  : `1px solid ${plan.popular ? A.border : "rgba(255,255,255,0.04)"}`,
              }}
            >
              {(plan.popular || activePlanId === plan.name) && (
                <div
                  className="absolute top-6 right-6 px-3 py-1 rounded-full text-[8px] font-black flex gap-2 items-center"
                  style={{ background: activePlanId === plan.name ? "#fff" : A.accent, color: "#000" }}
                >
                  {activePlanId === plan.name && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                  {activePlanId === plan.name ? "CURRENTLY ACTIVE" : "RECOMMENDED"}
                </div>
              )}

              <div
                className="mb-4 sm:mb-6 font-black text-4xl sm:text-5xl tracking-tighter"
                style={{ color: plan.popular ? A.accent : "rgba(255,255,255,0.35)" }}
              >
                {plan.savings}
              </div>

              <h4 className="text-lg sm:text-xl font-black uppercase tracking-tight mb-2 text-white">{plan.name}</h4>
              <p className="text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8 font-medium text-white/50">
                {plan.desc}
              </p>

              <div className="space-y-4 flex-1">
                {plan.features.map((f, j) => (
                  <div key={j} className="flex gap-3 items-center">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center bg-white/5 text-white/40"
                    >
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-tight text-white/70">{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onSelectPlan(plan.name)}
                className="mt-6 sm:mt-8 w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                style={
                  activePlanId === plan.name
                    ? { background: "#fff", color: "#000" }
                    : plan.popular
                    ? { background: A.accent, color: "#fff" }
                    : { background: "rgba(255,255,255,0.05)", color: "white", border: `1px solid ${A.border}` }
                }
              >
                {activePlanId === plan.name ? "Deactivate" : "Activate Plan"}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="p-8 flex flex-col md:flex-row gap-8 items-center justify-center text-center border-t border-white/5"
          style={{ background: "rgba(255,255,255,0.01)" }}
        >
          <PlanAdvice icon={<Zap className="w-4 h-4 text-white/40" />} text="Plans update every 12 months based on grid tariff changes." accent="#fff" />
          <PlanAdvice icon={<TrendingDown className="w-4 h-4 text-white/40" />} text="Total potential savings calculated from your live load signature." accent="#fff" />
        </div>
      </motion.div>
    </motion.div>
  );
}

function PlanAdvice({ icon, text, accent }: { icon: any; text: string; accent: string }) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <p className="font-bold text-[10px] uppercase tracking-tight text-white/40">{text}</p>
    </div>
  );
}
