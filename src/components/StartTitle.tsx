"use client";

import { motion, useTransform } from "framer-motion";

interface StartTitleProps {
  scrollProgress: any; // MotionValue<number>
}

export default function StartTitle({ scrollProgress }: StartTitleProps) {
  // Title animations: Fades out early (0-10% scroll)
  const titleOpacity = useTransform(scrollProgress, [0, 0.05], [1, 0]);
  const titleScale = useTransform(scrollProgress, [0, 0.05], [1, 0.8]);
  const titleY = useTransform(scrollProgress, [0, 0.05], [0, -50]);

  // Capability Summary: Fades in/out during 10-40% scroll, aligned to bottom-left
  const summaryOpacity = useTransform(scrollProgress, [0.1, 0.15, 0.35, 0.4], [0, 1, 1, 0]);
  const summaryX = useTransform(scrollProgress, [0.1, 0.15, 0.35, 0.4], [-50, 0, 0, -50]);
  
  const containerOpacity = useTransform(scrollProgress, [0.9, 1], [1, 0]);

  return (
    <motion.div 
      style={{ opacity: containerOpacity }}
      className="fixed inset-0 pointer-events-none z-[60]"
    >
      {/* Starting Project Name - Refined for High Visibility */}
      <motion.div 
        style={{ opacity: titleOpacity, scale: titleScale, y: titleY }}
        className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm"
      >
        <div className="flex items-center gap-4 mb-4">
           <div className="h-[1px] w-12 bg-accent-cyber" />
           <p className="text-accent-cyber font-mono text-[10px] uppercase tracking-[0.8em] font-black">Initializing Model</p>
           <div className="h-[1px] w-12 bg-accent-cyber" />
        </div>
        <h1 className="text-[12rem] font-black text-white tracking-tighter uppercase leading-[0.8] text-center italic">
          Eco<span className="text-accent-cyber">-</span>Sync
        </h1>
        <div className="mt-8 px-8 py-3 bg-white/5 border border-white/10 rounded-full">
           <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest font-bold">Smart Home Energy Simulator v4.0</p>
        </div>
      </motion.div>

      {/* Industrial Summary Panel (Bottom Left) */}
      <motion.div 
        style={{ opacity: summaryOpacity, x: summaryX }}
        className="absolute bottom-24 left-12 max-w-sm"
      >
        <div className="bg-slate-900/80 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-2xl">
           <p className="text-accent-cyber font-mono text-[10px] uppercase tracking-[0.4em] mb-4 font-black">Digital Twin Status</p>
           <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 leading-tight">Physics-Based <span className="text-accent-cyber">Telemetry</span></h3>
           <p className="text-white/40 text-[11px] leading-relaxed uppercase font-bold tracking-tight">
             Simulating real-time thermal dynamics and electrical consumption patterns for precise grid impact forecasting.
           </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
