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
            className="absolute w-1 h-1 bg-accent-emerald rounded-full"
          />
        ))}
      </div>

      <div className="relative z-10 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-accent-emerald rounded-2xl opacity-20"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 border-2 border-accent-cyber rounded-xl opacity-30"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-white rounded-lg glow-emerald" />
            </div>
          </div>
          
          <h1 className="text-8xl font-black tracking-tighter text-white mb-2">
            AETHER<span className="text-accent-emerald neon-text-emerald">-</span>GRID
          </h1>
          <p className="text-white/40 font-mono tracking-[0.3em] uppercase text-sm">
            NEXT-GEN ENERGY COMMAND CENTER
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          onClick={onComplete}
          className="px-12 py-5 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform active:scale-95 glow-emerald"
        >
          START SIMULATOR
        </motion.button>
      </div>

      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1.2, delay: 0.2 }}
        className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-emerald to-transparent opacity-50"
      />
    </motion.div>
  );
}
