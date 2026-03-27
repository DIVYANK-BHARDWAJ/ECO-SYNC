"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function SavingsGraph() {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Sample data points for the energy curve
  const points = [80, 75, 90, 60, 45, 55, 30, 20];
  const maxVal = 100;
  const width = 300;
  const height = 150;

  const getPath = (data: number[]) => {
    return data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (d / maxVal) * height;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  };

  const getPoint = (d: number, i: number) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - (d / maxVal) * height;
    return { x, y };
  };

  return (
    <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-2xl relative w-full overflow-hidden">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h4 className="text-slate-900 font-black text-2xl uppercase tracking-tighter">Efficiency Analytics</h4>
          <p className="text-slate-400 font-mono text-[9px] uppercase tracking-[0.2em] font-bold">24H Consumption Cycle</p>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
           Live Feed
        </div>
      </div>

      <div className="relative h-[250px] w-full mt-8">
        {/* Y-AXIS LABEL */}
        <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] whitespace-nowrap">
          Grid Load (kW)
        </div>

        {/* X-AXIS LABEL */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mt-8 py-4">
          Cycle Time (24H)
        </div>

        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height + 40}`} preserveAspectRatio="none" className="overflow-visible">
          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
            <line 
              key={i} 
              x1="0" y1={height * p} 
              x2={width} y2={height * p} 
              stroke="#F1F5F9" 
              strokeWidth="1" 
            />
          ))}

          {/* Main Area Gradient */}
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Fill Area */}
          <path
            d={`${getPath(points)} L ${width} ${height} L 0 ${height} Z`}
            fill="url(#gradient)"
          />

          {/* Main Data Line */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            d={getPath(points)}
            fill="none"
            stroke="#10B981"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Interaction Points */}
          {points.map((p, i) => {
            const { x, y } = getPoint(p, i);
            return (
              <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)}>
                <circle 
                  cx={x} cy={y} r="8" 
                  fill="white" 
                  stroke={hoveredPoint === i ? "#10B981" : "#F1F5F9"} 
                  strokeWidth="2" 
                />
                {hoveredPoint === i && (
                   <circle cx={x} cy={y} r="12" fill="#10B981" opacity="0.2" />
                )}
              </g>
            );
          })}
        </svg>

        {/* Dynamic Tooltip */}
        {hoveredPoint !== null && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-white/10 z-50"
            style={{ 
               left: `${(hoveredPoint / (points.length - 1)) * 100}%`,
               top: `calc(${height - (points[hoveredPoint] / maxVal) * height}px - 60px)`,
               transform: "translateX(-50%)"
            }}
          >
             <p className="text-[10px] font-mono text-white/40 uppercase mb-1">Peak Load</p>
             <p className="text-xl font-black">{points[hoveredPoint]}%</p>
          </motion.div>
        )}
      </div>

      <div className="flex justify-between items-center mt-20 pt-10 border-t border-slate-100">
        <div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Potential Savings</p>
          <p className="text-accent-emerald text-4xl font-black tracking-tighter">34.2<span className="text-lg ml-1 font-bold">%</span></p>
        </div>
        <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
          View Detailed Logs
        </button>
      </div>
    </div>
  );
}
