"use client";

import { motion, useTransform, MotionValue, AnimatePresence } from "framer-motion";
import { Info, Zap, Wind, Lightbulb } from "lucide-react";

interface ScrollyHotspotsProps {
  scrollProgress: MotionValue<number>;
}

export default function ScrollyHotspots({ scrollProgress }: ScrollyHotspotsProps) {
  // Hotspot 1: Living Room AC (appears 5-15%)
  const hs1Opacity = useTransform(scrollProgress, [0.05, 0.08, 0.12, 0.15], [0, 1, 1, 0]);
  const hs1Scale = useTransform(scrollProgress, [0.05, 0.08, 0.12, 0.15], [0.5, 1, 1, 0.5]);

  // Hotspot 2: Kitchen Induction (appears 25-35%)
  const hs2Opacity = useTransform(scrollProgress, [0.25, 0.28, 0.32, 0.35], [0, 1, 1, 0]);
  const hs2Scale = useTransform(scrollProgress, [0.25, 0.28, 0.32, 0.35], [0.5, 1, 1, 0.5]);

  // Hotspot 3: Garage EV Charger (appears 75-85%)
  const hs3Opacity = useTransform(scrollProgress, [0.75, 0.78, 0.82, 0.85], [0, 1, 1, 0]);
  const hs3Scale = useTransform(scrollProgress, [0.75, 0.78, 0.82, 0.85], [0.5, 1, 1, 0.5]);

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* Living Room Hotspot */}
      <Hotspot 
        opacity={hs1Opacity} 
        scale={hs1Scale} 
        top="40%" 
        left="60%" 
        label="Climate Control" 
        value="2.5kW Peak" 
        icon={<Wind className="w-4 h-4" />}
      />

      {/* Kitchen Hotspot */}
      <Hotspot 
        opacity={hs2Opacity} 
        scale={hs2Scale} 
        top="35%" 
        left="50%" 
        label="Induction Hob" 
        value="1.2kW Active" 
        icon={<Zap className="w-4 h-4" />}
      />

      {/* Garage Hotspot */}
      <Hotspot 
        opacity={hs3Opacity} 
        scale={hs3Scale} 
        top="50%" 
        left="30%" 
        label="Level 2 Charger" 
        value="7.2kW Fast" 
        icon={<Zap className="w-4 h-4" />}
      />
    </div>
  );
}

function Hotspot({ opacity, scale, top, left, label, value, icon }: any) {
  return (
    <motion.div 
      style={{ opacity, scale, top, left }}
      className="absolute pointer-events-auto group"
    >
      <div className="relative">
         {/* Pulsing Ring */}
         <div className="absolute inset-0 w-12 h-12 bg-accent-emerald/20 rounded-full animate-ping" />
         <div className="relative w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white cursor-pointer group-hover:bg-accent-emerald group-hover:text-black transition-all">
            <Info className="w-6 h-6" />
         </div>

         {/* Info Bubble */}
         <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 pointer-events-none">
            <div className="bg-black/80 backdrop-blur-xl border border-white/20 p-5 rounded-3xl shadow-2xl overflow-hidden">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-accent-emerald">
                     {icon}
                  </div>
                  <p className="text-white/40 font-mono text-[8px] uppercase tracking-widest">{label}</p>
               </div>
               <p className="text-white font-black text-sm uppercase tracking-tighter">{value}</p>
               
               {/* Decorative Gradient Line */}
               <div className="h-0.5 w-full bg-gradient-to-r from-accent-emerald/50 to-transparent mt-4" />
            </div>
         </div>
      </div>
    </motion.div>
  );
}
