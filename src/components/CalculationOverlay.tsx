"use client";

import { motion } from "framer-motion";
import { X, Calculator, Info, Zap, TrendingDown, Leaf } from "lucide-react";

export type MetricType = "COST" | "CARBON" | "EFFICIENCY" | "MAX_EFFICIENCY" | null;

interface CalculationOverlayProps {
  type: MetricType;
  onClose: () => void;
}

// Each metric gets its own full color identity
const themes: Record<NonNullable<MetricType>, {
  accent: string; glow: string; bg: string; border: string; strip: string;
}> = {
  COST:          { accent: "var(--accent-secondary)", glow: "rgba(59,130,246,0.05)",  bg: "rgba(59,130,246,0.02)",  border: "rgba(255,255,255,0.08)", strip: "var(--accent-secondary)" },
  CARBON:        { accent: "var(--accent-primary)",   glow: "rgba(255,255,255,0.03)", bg: "rgba(255,255,255,0.02)",  border: "rgba(255,255,255,0.08)", strip: "var(--accent-primary)" },
  EFFICIENCY:    { accent: "var(--accent-budget)",    glow: "rgba(16,185,129,0.05)", bg: "rgba(16,185,129,0.02)",  border: "rgba(255,255,255,0.08)", strip: "var(--accent-budget)" },
  MAX_EFFICIENCY:{ accent: "var(--accent-tertiary)",  glow: "rgba(20,184,166,0.05)", bg: "rgba(20,184,166,0.02)",  border: "rgba(255,255,255,0.08)", strip: "var(--accent-tertiary)" },
};

const content: Record<NonNullable<MetricType>, {
  title: string; subtitle: string; icon: React.ReactNode;
  formula: string; explanation: string; example: string; tips: string[];
}> = {
  COST: {
    title: "Electricity Billing",
    subtitle: "How your monthly bill is calculated",
    icon: <Calculator className="w-12 h-12" />,
    formula: "Units Used (kWh) × ₹8.00 per Unit",
    explanation: "Your bill depends on how many 'Units' of electricity you use. In India, 1 Unit is equal to 1 kWh. We use a standard rate of ₹8 per unit to estimate your monthly cost.",
    example: "If you run a 1.5 Ton AC (1.8 kW) for 10 hours, it uses 18 Units. At ₹8/unit, that's ₹144 for just that day.",
    tips: ["Use Inverter ACs to save up to 30%", "Switch off geysers after 15 mins", "Old fans use 75W, Smart fans use only 28W"]
  },
  CARBON: {
    title: "Pollution Created",
    subtitle: "Your impact on the environment",
    icon: <Leaf className="w-12 h-12" />,
    formula: "Units Used × 0.82 kg CO₂",
    explanation: "Most of India's electricity comes from coal. For every unit (kWh) you use, about 0.82 kg of CO₂ is released into the air. Reducing units directly reduces pollution.",
    example: "Saving 100 units a month is like planting 2 trees!",
    tips: ["Switch to LED bulbs", "Use natural sunlight during the day", "Check for star ratings on appliances"]
  },
  EFFICIENCY: {
    title: "System Efficiency",
    subtitle: "How well you manage your load",
    icon: <Zap className="w-12 h-12" />,
    formula: "Grid Usage Penalty + Savings Plan Bonus",
    explanation: "This score rewards smart energy habits. We penalize heavy simultaneous loads that strain the grid, but give significant bonuses if you've committed to a Savings Plan.",
    example: "A 'Carbon Zero' plan provides a +40% score boost, offsetting high usage impact.",
    tips: ["Stagger heavy appliance use", "Active plans provide the biggest score boost", "Usage below 50% capacity is ideal"]
  },
  MAX_EFFICIENCY: {
    title: "Optimization Potential",
    subtitle: "Max savings possible",
    icon: <TrendingDown className="w-12 h-12" />,
    formula: "Current Score vs. AI Recommended Benchmarks",
    explanation: "We analyze your usage signature against highly efficient 'Eco-Sync Nexus' benchmarks. A score below 70% suggests significant room for saving via automated plans.",
    example: "Switching to 'Aether Pro' can jump your score from 40% to 65% instantly.",
    tips: ["Follow the AI recommendations", "Enable Auto-Sync mode", "Identify 'Vampire' appliances"]
  }
};

export default function CalculationOverlay({ type, onClose }: CalculationOverlayProps) {
  if (!type) return null;
  const data = content[type];
  const t = themes[type];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] overflow-y-auto flex items-start justify-center p-4 md:p-10"
    >
      {/* Tinted backdrop unique to each metric */}
      <div
        className="absolute inset-0 backdrop-blur-3xl bg-black/60 dark:bg-black/80"
        onClick={onClose}
      />
      {/* Subtle colored glow blob behind the card */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 800px 600px at 50% 50%, ${t.glow}, transparent 70%)`,
        }}
      />

      <motion.div
        initial={{ scale: 0.95, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 30, opacity: 0 }}
        className="relative z-10 w-full max-w-4xl my-auto overflow-hidden rounded-2xl shadow-2xl bg-[#09090b] border border-white/10"
        style={{
          boxShadow: `0 40px 80px -20px ${t.glow}`,
        }}
      >
        {/* Colored top strip */}
        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${t.strip}, ${t.accent})` }} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-3 rounded-full transition-all border border-white/10 bg-white/5 hover:bg-white/10"
          style={{ color: t.accent }}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start mb-10 md:mb-12 text-center md:text-left">
            <div
              className="p-5 rounded-xl flex-shrink-0 border border-white/10 bg-white/5"
              style={{ color: t.accent }}
            >
              {data.icon}
            </div>
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase mb-2">
                {data.title}
              </h2>
              <p className="font-mono text-xs uppercase tracking-widest" style={{ color: t.accent, opacity: 0.7 }}>
                {data.subtitle}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div>
              {/* Formula */}
              <div className="mb-8">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <Calculator className="w-4 h-4" /> Calculation Method
                </p>
                <p
                  className="text-xl md:text-2xl font-black p-6 rounded-xl leading-tight text-center bg-white/5 border border-white/10"
                  style={{ color: t.accent }}
                >
                  {data.formula}
                </p>
              </div>

              {/* Explanation */}
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">The Logic</p>
                <p className="text-white/60 leading-relaxed text-base">{data.explanation}</p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Example box */}
              <div
                className="p-6 rounded-xl bg-white/5 border border-white/10"
              >
                <p
                  className="font-black text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2"
                  style={{ color: t.accent }}
                >
                  <Info className="w-4 h-4" /> Relatable Example
                </p>
                <p className="text-white font-semibold leading-relaxed text-sm opacity-80">
                  &quot;{data.example}&quot;
                </p>
              </div>

              {/* Tips */}
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">
                  Quick Savings Tips
                </p>
                <div className="space-y-2">
                  {data.tips.map((tip, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 font-bold text-white/80 p-3.5 rounded-xl bg-white/5 border border-white/5"
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: t.accent }}
                      />
                      <span className="text-xs">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="mt-12 pt-8 border-t border-white/5 flex justify-center">
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all"
              style={{
                background: t.accent,
                color: type === "CARBON" ? "var(--background)" : "#ffffff",
              }}
            >
              Return to Dashboard
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
