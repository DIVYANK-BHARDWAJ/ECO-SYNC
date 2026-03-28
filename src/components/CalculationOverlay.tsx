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
  COST:          { accent: "#f59e0b", glow: "rgba(245,158,11,0.15)",  bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.25)", strip: "#d97706" },
  CARBON:        { accent: "#10b981", glow: "rgba(16,185,129,0.15)", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.25)", strip: "#059669" },
  EFFICIENCY:    { accent: "#6366f1", glow: "rgba(99,102,241,0.15)", bg: "rgba(99,102,241,0.08)",  border: "rgba(99,102,241,0.25)", strip: "#4f46e5" },
  MAX_EFFICIENCY:{ accent: "#d946ef", glow: "rgba(217,70,239,0.15)", bg: "rgba(217,70,239,0.08)",  border: "rgba(217,70,239,0.25)", strip: "#c026d3" },
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
    formula: "100 − (Current Load % of Max)",
    explanation: "This score shows if you are using too many heavy appliances at once. A high score means you are balancing your load well to avoid grid trips.",
    example: "Running the AC, Geyser, and EV Charger together drops efficiency.",
    tips: ["Stagger heavy appliance use", "Use timers for water heaters", "Monitor live usage signature"]
  },
  MAX_EFFICIENCY: {
    title: "Optimization Potential",
    subtitle: "Max savings possible",
    icon: <TrendingDown className="w-12 h-12" />,
    formula: "Current Score vs. Ideal Pattern",
    explanation: "We compare your current usage to an 'Eco-Sync' pattern. This reveals how much more money you could save by making small changes.",
    example: "Optimizing AC usage can save up to ₹1,200 per month.",
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
        className="absolute inset-0 backdrop-blur-3xl"
        style={{ backgroundColor: "rgba(2,4,15,0.92)" }}
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
        initial={{ scale: 0.9, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 40, opacity: 0 }}
        className="relative z-10 w-full max-w-4xl my-auto overflow-hidden rounded-[2.5rem] md:rounded-[4rem] shadow-2xl"
        style={{
          background: "#0f1119",
          border: `1px solid ${t.border}`,
          boxShadow: `0 40px 80px -20px ${t.glow}, 0 0 0 1px ${t.border}`,
        }}
      >
        {/* Colored top strip */}
        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${t.strip}, ${t.accent})` }} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 md:top-10 md:right-10 p-3 md:p-4 rounded-full transition-all"
          style={{ background: `${t.bg}`, border: `1px solid ${t.border}`, color: t.accent }}
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 md:p-20">
          {/* Header */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start mb-10 md:mb-16 text-center md:text-left">
            <div
              className="p-5 md:p-7 rounded-3xl md:rounded-[2rem] flex-shrink-0"
              style={{ background: t.bg, border: `1px solid ${t.border}`, color: t.accent }}
            >
              {data.icon}
            </div>
            <div>
              <h2 className="text-3xl md:text-6xl font-black text-white tracking-tighter uppercase mb-3">
                {data.title}
              </h2>
              <p className="font-mono text-sm uppercase tracking-widest" style={{ color: t.accent, opacity: 0.7 }}>
                {data.subtitle}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
            <div>
              {/* Formula */}
              <div className="mb-10">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <Calculator className="w-4 h-4" /> Calculation Method
                </p>
                <p
                  className="text-xl md:text-3xl font-black p-6 md:p-8 rounded-3xl leading-tight"
                  style={{ color: t.accent, background: "rgba(255,255,255,0.03)", border: `1px solid ${t.border}` }}
                >
                  {data.formula}
                </p>
              </div>

              {/* Explanation */}
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">The Logic</p>
                <p className="text-white/65 leading-relaxed text-lg">{data.explanation}</p>
              </div>
            </div>

            <div className="space-y-10">
              {/* Example box */}
              <div
                className="p-10 rounded-[2.5rem]"
                style={{ background: t.bg, border: `1px solid ${t.border}` }}
              >
                <p
                  className="font-black text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2"
                  style={{ color: t.accent }}
                >
                  <Info className="w-4 h-4" /> Relatable Example
                </p>
                <p className="text-white font-semibold leading-relaxed italic opacity-80">
                  "{data.example}"
                </p>
              </div>

              {/* Tips */}
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-5">
                  Quick Savings Tips
                </p>
                <div className="space-y-3">
                  {data.tips.map((tip, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 font-bold text-white/80 p-4 rounded-2xl"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: t.accent, boxShadow: `0 0 8px ${t.accent}` }}
                      />
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="mt-16 pt-10 border-t border-white/5 flex justify-center">
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="px-14 py-5 rounded-[2.5rem] font-black uppercase tracking-widest transition-all"
              style={{
                background: t.accent,
                color: "#06080f",
                boxShadow: `0 20px 40px -10px ${t.glow}`,
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
