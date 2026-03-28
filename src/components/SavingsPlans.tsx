"use client";

import { motion } from "framer-motion";
import { X, Check, Target, Zap, TrendingDown, ArrowLeft } from "lucide-react";

// Amber/Orange theme — warm "wealth & savings" palette
const A = {
  accent: "#f59e0b",
  accentDark: "#d97706",
  glow: "rgba(245,158,11,0.14)",
  bg: "rgba(245,158,11,0.07)",
  border: "rgba(245,158,11,0.22)",
  popularBg: "rgba(245,158,11,0.12)",
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
      style={{ background: "rgba(6,4,0,0.92)" }}
    >
      {/* Amber glow in background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 900px 600px at 50% 40%, ${A.glow}, transparent 70%)` }}
      />

      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-6xl my-auto rounded-3xl sm:rounded-[4rem] shadow-2xl overflow-hidden flex flex-col relative z-10 mx-auto"
        style={{
          background: "#0d0a04",
          border: `1px solid ${A.border}`,
          boxShadow: `0 40px 100px -20px ${A.glow}`,
        }}
      >
        {/* Amber top strip */}
        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${A.accentDark}, ${A.accent}, #fbbf24)` }} />

        {/* Header */}
        <div
          className="p-8 sm:p-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 sm:gap-8 border-b"
          style={{ borderColor: A.border, background: A.bg }}
        >
          <div>
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <Target className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: A.accent, filter: `drop-shadow(0 0 10px ${A.accent})` }} />
              <p className="font-mono text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.4em] font-black" style={{ color: A.accent, opacity: 0.6 }}>
                Optimization Roadmap
              </p>
            </div>
            <h3 className="text-3xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tighter italic">Maximize Efficiency</h3>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <motion.button
              onClick={onClose}
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-[2rem] font-bold text-[10px] sm:text-sm uppercase tracking-widest transition-all duration-300"
              style={{ background: A.bg, border: `1px solid ${A.border}`, color: A.accent }}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 h-5" />
              <span>Back</span>
            </motion.button>
            <button
              onClick={onClose}
              className="w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all"
              style={{ background: A.bg, border: `1px solid ${A.border}`, color: A.accent }}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Plans grid */}
        <div className="p-8 sm:p-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 flex-1">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-8 sm:p-12 rounded-3xl sm:rounded-[3.5rem] flex flex-col relative transition-all duration-500 hover:scale-[1.02]"
              style={{
                background: plan.popular ? A.popularBg : "rgba(255,255,255,0.03)",
                border: activePlanId === plan.name 
                  ? `2px solid ${A.accent}` 
                  : `1px solid ${plan.popular ? A.border : "rgba(255,255,255,0.07)"}`,
                boxShadow: activePlanId === plan.name 
                  ? `0 0 40px ${A.glow}` 
                  : (plan.popular ? `0 20px 60px -20px ${A.glow}` : "none"),
              }}
            >
              {(plan.popular || activePlanId === plan.name) && (
                <div
                  className="absolute top-8 right-8 px-4 py-1.5 rounded-full text-[9px] font-black flex gap-2 items-center"
                  style={{ background: activePlanId === plan.name ? "#fff" : A.accent, color: "#0d0a04" }}
                >
                  {activePlanId === plan.name && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                  {activePlanId === plan.name ? "CURRENTLY ACTIVE" : "RECOMMENDED"}
                </div>
              )}

              <div
                className="mb-6 sm:mb-8 font-black text-4xl sm:text-6xl tracking-tighter"
                style={{ color: plan.popular ? A.accent : "rgba(255,255,255,0.35)" }}
              >
                {plan.savings}
              </div>

              <h4 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-2 sm:mb-4 text-white italic">{plan.name}</h4>
              <p className="text-sm sm:text-base leading-relaxed mb-8 sm:mb-12 font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>
                {plan.desc}
              </p>

              <div className="space-y-6 flex-1">
                {plan.features.map((f, j) => (
                  <div key={j} className="flex gap-4 items-center">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{
                        background: plan.popular ? `rgba(245,158,11,0.15)` : "rgba(255,255,255,0.08)",
                        color: plan.popular ? A.accent : "rgba(255,255,255,0.4)",
                      }}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-tight text-white/85">{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onSelectPlan(plan.name)}
                className="mt-8 sm:mt-12 w-full py-5 sm:py-6 rounded-2xl sm:rounded-[2rem] font-black text-xs sm:text-base uppercase tracking-widest transition-all hover:opacity-90 hover:scale-[1.02] flex items-center justify-center gap-2 sm:gap-3"
                style={
                  activePlanId === plan.name
                    ? { background: "#fff", color: "#0d0a04" }
                    : plan.popular
                    ? { background: A.accent, color: "#0d0a04", boxShadow: `0 10px 30px -10px ${A.glow}` }
                    : { background: "rgba(255,255,255,0.06)", color: "white", border: `1px solid ${A.border}` }
                }
              >
                {activePlanId === plan.name ? "Deactivate" : "Activate Plan"}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="p-12 flex flex-col md:flex-row gap-12 items-center justify-center text-center border-t"
          style={{ borderColor: A.border, background: "rgba(245,158,11,0.04)" }}
        >
          <PlanAdvice icon={<Zap className="w-5 h-5" style={{ color: A.accent }} />} text="Plans update every 12 months based on grid tariff changes." accent={A.accent} />
          <PlanAdvice icon={<TrendingDown className="w-5 h-5" style={{ color: A.accent }} />} text="Total potential savings calculated from your live load signature." accent={A.accent} />
        </div>
      </motion.div>
    </motion.div>
  );
}

function PlanAdvice({ icon, text, accent }: { icon: any; text: string; accent: string }) {
  return (
    <div className="flex items-center gap-4">
      {icon}
      <p className="font-bold text-[11px] uppercase tracking-tight" style={{ color: accent, opacity: 0.65 }}>{text}</p>
    </div>
  );
}
