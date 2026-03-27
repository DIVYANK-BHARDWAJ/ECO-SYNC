"use client";

import { motion, useTransform, MotionValue } from "framer-motion";

interface StartTitleProps {
  scrollProgress: MotionValue<number>;
}

export default function StartTitle({ scrollProgress }: StartTitleProps) {
  // Main Title: Fades and scales down as user scrolls
  const titleOpacity = useTransform(scrollProgress, [0, 0.08], [1, 0]);
  const titleScale = useTransform(scrollProgress, [0, 0.08], [1, 0.8]);
  const titleY = useTransform(scrollProgress, [0, 0.08], [0, -100]);

  // Capability Summary: Fades in/out during 10-40% scroll, aligned to bottom-left
  const summaryOpacity = useTransform(scrollProgress, [0.1, 0.15, 0.35, 0.4], [0, 1, 1, 0]);
  const summaryX = useTransform(scrollProgress, [0.1, 0.15, 0.35, 0.4], [-50, 0, 0, -50]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[60]">
      {/* Starting Project Name - Refined for High Visibility */}
      <motion.div 
        style={{ opacity: titleOpacity, scale: titleScale, y: titleY }}
        className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center"
      >
        <div className="relative">
          {/* Subtle Backing for Legibility */}
          <div className="absolute -inset-10 bg-black/40 blur-3xl rounded-full" />
          
          <h1 className="text-8xl md:text-9xl font-black text-white tracking-tighter uppercase relative z-10">
            AETHER<span className="text-accent-emerald drop-shadow-[0_0_20px_#10B981]">-</span>GRID
          </h1>
          <p className="text-white font-mono tracking-[0.8em] uppercase text-xs mt-6 relative z-10 opacity-60">
            Advanced Energy Command
          </p>
        </div>
      </motion.div>

      {/* Capability Summary - Aligned to Bottom-Left for Side-Focus */}
      <motion.div 
        style={{ opacity: summaryOpacity, x: summaryX }}
        className="absolute bottom-24 left-12 bg-black/60 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] max-w-md shadow-2xl"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex">
             <div className="w-2.5 h-2.5 rounded-full bg-accent-emerald animate-ping absolute opacity-75" />
             <div className="w-2.5 h-2.5 rounded-full bg-accent-emerald glow-emerald relative" />
          </div>
          <p className="text-accent-emerald font-mono text-[10px] uppercase tracking-[0.3em] font-bold">Live Analysis Mode</p>
        </div>
        
        <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tight leading-none">
          Deep Tracking. <br/>
          <span className="text-white/30">Physics Driven.</span>
        </h2>
        
        <div className="space-y-6">
          <CapItem label="Engine Core" value="Physics-based Load Tracking" />
          <CapItem label="Transparency" value="Verified Math Explanations" />
          <CapItem label="Grid Impact" value="Real-time CO2 Offsetting" />
        </div>
      </motion.div>
    </div>
  );
}

function CapItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l-2 border-white/5 pl-4 py-1">
      <p className="text-white/20 text-[9px] uppercase font-mono tracking-[0.2em] font-bold">{label}</p>
      <p className="text-white font-bold text-sm mt-0.5 uppercase">{value}</p>
    </div>
  );
}
