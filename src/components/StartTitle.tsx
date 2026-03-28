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
        <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
           <div className="h-[1px] w-8 sm:w-12 bg-accent-cyber" />
           <p className="text-accent-cyber font-mono text-[8px] sm:text-[10px] uppercase tracking-[0.4em] sm:tracking-[0.8em] font-black">Initializing Model</p>
           <div className="h-[1px] w-8 sm:w-12 bg-accent-cyber" />
        </div>
        <h1 className="text-6xl sm:text-9xl md:text-[12rem] font-black text-white tracking-tighter uppercase leading-[0.8] text-center italic">
          Eco<span className="text-accent-cyber">-</span>Sync
        </h1>
        <div className="mt-4 sm:mt-8 px-4 sm:px-8 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-full">
         <p className="text-white/40 font-mono text-[8px] sm:text-[10px] uppercase tracking-widest font-bold">Smart Home Energy Dashboard</p>
        </div>
      </motion.div>

      {/* Industrial Summary Panel (Bottom Left) */}
      <motion.div 
        style={{ opacity: summaryOpacity, x: summaryX }}
        className="absolute bottom-12 sm:bottom-24 left-6 sm:left-12 max-w-[200px] sm:max-w-sm"
      >
        <div
          className="backdrop-blur-2xl px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl"
          style={{
            background: "rgba(2,8,6,0.95)",
            border: "1px solid rgba(0,240,255,0.25)",
            borderLeft: "3px solid #00F0FF",
            maxWidth: "180px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.7)",
          }}
        >
           <p className="text-accent-cyber font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-1 font-black">Assistant</p>
           <p className="text-white text-[10px] sm:text-xs leading-relaxed font-medium">
             Toggle appliances and see your bill change live.
           </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
