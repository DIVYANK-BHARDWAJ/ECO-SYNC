"use client";

import { motion } from "framer-motion";

interface AetherGridIntroProps {
  onComplete: () => void;
}

export default function AetherGridIntro({ onComplete }: AetherGridIntroProps) {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Particles (Animated Dots) */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              opacity: 0 
            }}
            animate={{ 
              y: [null, "-20%"],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: Math.random() * 5 + 5, 
              repeat: Infinity,
              delay: Math.random() * 5
            }}
             className="absolute w-1 h-1 bg-slate-300 rounded-full"
          />
        ))}
      </div>

      <div className="relative z-10 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <div className="w-24 h-24 mx-auto mb-8 relative">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-slate-300 rounded-2xl opacity-20"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 border-2 border-accent-secondary rounded-xl opacity-30"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-white rounded-lg" />
            </div>
          </div>
          
          <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter text-slate-100 mb-6 uppercase px-4 leading-none">
            ECO<span className="text-accent-secondary">-</span>SYNC <span className="text-slate-200">NEXUS</span>
          </h1>
          <p className="text-slate-400/50 font-mono tracking-[0.5em] uppercase text-[10px] sm:text-xs px-6">
            THE ARCHITECTURE OF ENERGY SOVEREIGNTY
          </p>
        </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            onClick={onComplete}
            className="px-12 sm:px-16 py-5 sm:py-6 bg-white text-black font-black rounded-full hover:scale-105 transition-all active:scale-95 text-xs sm:text-sm uppercase tracking-[0.2em]"
          >
            Enter Dashboard
          </motion.button>
      </div>

      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1.2, delay: 0.2 }}
        className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-secondary to-transparent opacity-50"
      />
    </motion.div>
  );
}
