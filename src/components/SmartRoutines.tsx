"use client";

import { motion } from "framer-motion";
import { Moon, Home, Film, PowerOff, Sun, Zap } from "lucide-react";

export interface Routine {
  id: string;
  label: string;
  icon: any;
  desc: string;
}

export const ROUTINES: Routine[] = [
  { id: "leave_home", label: "Leave Home", icon: Home, desc: "Turn off non-essentials" },
  { id: "night_mode", label: "Night Mode", icon: Moon, desc: "Optimized for sleep" },
  { id: "movie_time", label: "Movie Time", icon: Film, desc: "Cinema experience" },
  { id: "eco_max", label: "Eco Max", icon: Zap, desc: "Maximum savings" },
  { id: "morning_prep", label: "Morning", icon: Sun, desc: "Wake up gently" },
  { id: "all_off", label: "All Off", icon: PowerOff, desc: "Complete shutdown" },
];

interface SmartRoutinesProps {
  onExecuteRoutine: (routineId: string) => void;
  activeRoutine: string | null;
}

export default function SmartRoutines({ onExecuteRoutine, activeRoutine }: SmartRoutinesProps) {
  return (
    <div className="w-full mt-12 sm:mt-16 bg-slate-950/80 backdrop-blur-3xl border border-white/5 p-6 sm:p-10 rounded-3xl sm:rounded-[3rem] shadow-2xl">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="w-2 h-2 rounded-full bg-accent-routine animate-pulse shadow-[0_0_10px_#6366F1]" />
        <h3 className="text-white font-black uppercase tracking-widest text-base sm:text-xl font-heading italic">Smart Routines</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {ROUTINES.map((routine) => {
          const Icon = routine.icon;
          const isActive = activeRoutine === routine.id;
          return (
            <motion.button
              key={routine.id}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onExecuteRoutine(routine.id)}
              className={`relative overflow-hidden p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 text-center ${
                isActive 
                  ? "bg-accent-routine/20 border-accent-routine text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]" 
                  : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white hover:border-white/20"
              }`}
            >
              <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${isActive ? "text-accent-routine" : "text-white/40"}`} />
              <div>
                <p className={`font-black uppercase tracking-tighter text-sm sm:text-base font-heading italic ${isActive ? "text-white drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]" : ""}`}>{routine.label}</p>
                <p className="text-[8px] sm:text-[10px] font-mono tracking-widest uppercase opacity-70 mt-1">{routine.desc}</p>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  );
}
