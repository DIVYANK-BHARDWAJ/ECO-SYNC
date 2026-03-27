"use client";

import { motion } from "framer-motion";

export default function SavingsGraph() {
  // Simulated data points for a 24h cycle
  const currentUsage = [30, 45, 25, 60, 85, 40, 20, 50, 70, 30, 15, 40];
  const optimalUsage = [20, 25, 20, 30, 40, 25, 15, 25, 35, 20, 10, 25];

  const createPath = (data: number[]) => {
    const width = 400;
    const height = 150;
    const step = width / (data.length - 1);
    return data.map((val, i) => `${i === 0 ? "M" : "L"} ${i * step} ${height - (val / 100) * height}`).join(" ");
  };

  return (
    <div className="bg-[#050505] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group hover:neon-border-cyber transition-all duration-500">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-white font-bold text-xl tracking-tight">Efficiency Analytics</h3>
          <p className="text-white/30 text-xs font-mono uppercase tracking-widest mt-1">24H Consumption Cycle</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <span className="text-[10px] text-white/40 font-mono">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-cyber glow-cyber" />
            <span className="text-[10px] text-accent-cyber font-mono font-bold">Optimal</span>
          </div>
        </div>
      </div>

      <div className="relative h-[150px] w-full">
        <svg viewBox="0 0 400 150" className="w-full h-full overflow-visible">
          {/* Grid Lines */}
          {[0, 0.5, 1].map((p) => (
            <line 
              key={p} 
              x1="0" y1={150 * p} x2="400" y2={150 * p} 
              stroke="white" strokeOpacity="0.05" strokeDasharray="4 4"
            />
          ))}

          {/* Current Usage Path */}
          <motion.path
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            d={createPath(currentUsage)}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="2"
          />

          {/* Optimal Usage Path */}
          <motion.path
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            d={createPath(optimalUsage)}
            fill="none"
            stroke="#00E0FF"
            strokeWidth="3"
            className="glow-cyber"
          />

          {/* Dots for current state */}
          <circle cx="400" cy={150 - (optimalUsage[11] / 100) * 150} r="4" fill="#00E0FF" className="glow-cyber" />
        </svg>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
        <div className="text-left">
          <p className="text-white/30 text-[10px] uppercase font-mono tracking-widest">Potential Savings</p>
          <p className="text-accent-cyber text-2xl font-black neon-text-cyber transition-all">34.2<span className="text-xs ml-1">%</span></p>
        </div>
        <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white hover:text-black transition-all">
          View Detailed Logs
        </button>
      </div>
    </div>
  );
}
