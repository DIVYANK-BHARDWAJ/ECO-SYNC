"use client";

import { motion, useTransform, MotionValue } from "framer-motion";

interface StartTitleProps {
  scrollProgress: MotionValue<number>;
}

export default function StartTitle({ scrollProgress }: StartTitleProps) {
  // Main Title: Fades and scales down as user scrolls
  const titleOpacity = useTransform(scrollProgress, [0, 0.1], [1, 0]);
  const titleScale = useTransform(scrollProgress, [0, 0.1], [1, 0.9]);
  const titleY = useTransform(scrollProgress, [0, 0.1], [0, -50]);

  // Capability Summary: Fades in/out during 10-40% scroll
  const summaryOpacity = useTransform(scrollProgress, [0.1, 0.15, 0.35, 0.4], [0, 1, 1, 0]);
  const summaryY = useTransform(scrollProgress, [0.1, 0.15, 0.35, 0.4], [50, 0, 0, -50]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] flex flex-col items-center justify-center p-12 text-center">
      {/* Starting Project Name */}
      <motion.div 
        style={{ opacity: titleOpacity, scale: titleScale, y: titleY }}
        className="max-w-4xl"
      >
        <h1 className="text-9xl font-black text-white italic tracking-tighter uppercase">
          Aether<span className="text-accent-emerald neon-text-emerald">-</span>Grid
        </h1>
        <p className="text-white/40 font-mono tracking-[0.5em] uppercase text-sm mt-4">
          Advanced Energy Command
        </p>
      </motion.div>

      {/* Capability Summary Overlay */}
      <motion.div 
        style={{ opacity: summaryOpacity, y: summaryY }}
        className="absolute bottom-24 bg-black/40 backdrop-blur-2xl border border-white/10 p-12 rounded-[3.5rem] max-w-2xl shadow-2xl"
      >
        <div className="flex gap-4 mb-6">
          <div className="w-2 h-2 rounded-full bg-accent-emerald glow-emerald animate-pulse" />
          <p className="text-accent-emerald font-mono text-xs uppercase tracking-widest">System Capabilities</p>
        </div>
        <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">
          Real-Time Analysis, <br/>
          <span className="text-white/40 italic">Maximum Efficiency.</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <CapItem label="Engine" value="Physics-based Tracking" />
          <CapItem label="Analytics" value="Live Savings Trends" />
          <CapItem label="Sustainability" value="CO2 Offset Monitoring" />
          <CapItem label="Automation" value="Grid Load Simulator" />
        </div>
      </motion.div>
    </div>
  );
}

function CapItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-white/20 text-[10px] uppercase font-mono tracking-widest">{label}</p>
      <p className="text-white font-bold text-sm mt-1">{value}</p>
    </div>
  );
}
