"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";

interface SavingsGraphProps {
  data: number[];
  solarData?: number[];
}

export default function SavingsGraph({ data, solarData }: SavingsGraphProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Constants for SVG scaling
  const allValues = [...data, ...(solarData || [])];
  const maxVal = Math.max(10, ...allValues) * 1.25; // Headroom
  const width = 1000;
  const height = 400;

  // Linear Path Logic (Straight lines between points - Jagged Stock Chart Style)
  const linearPath = useMemo(() => {
    if (data.length < 2) return "";
    
    return data.reduce((acc, d, i, arr) => {
      const x = (i / (arr.length - 1)) * width;
      const y = height - (d / maxVal) * height;

      if (i === 0) return `M ${x} ${y}`;

      return `${acc} L ${x} ${y}`;
    }, "");
  }, [data, maxVal]);

  const solarPath = useMemo(() => {
    if (!solarData || solarData.length < 2) return "";
    
    return solarData.reduce((acc, d, i, arr) => {
      const x = (i / (arr.length - 1)) * width;
      const y = height - (d / maxVal) * height;

      if (i === 0) return `M ${x} ${y}`;

      return `${acc} L ${x} ${y}`;
    }, "");
  }, [solarData, maxVal]);

  return (
    <div className="bg-slate-900/40 backdrop-blur-3xl p-6 sm:p-10 md:p-16 rounded-3xl sm:rounded-[4rem] border border-white/5 shadow-2xl relative w-full overflow-hidden">
      {/* Background Radar Mesh */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#10B981 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8 relative z-10">
        <div>
          <h4 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tighter italic">Live Usage <span className="text-accent-emerald">Radar</span></h4>
          <p className="text-white/40 font-mono text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.4em] font-bold">Real-time Digital Signature | Adjusted for Grid Load</p>
        </div>
        <div className="flex gap-4">
           <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#EAB308] animate-ping shadow-[0_0_10px_#EAB308]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#EAB308]">Solar</span>
           </div>
           <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent-emerald animate-ping shadow-[0_0_10px_#10B981]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-accent-emerald">Grid</span>
           </div>
        </div>
      </div>

      <div className="relative h-[300px] sm:h-[450px] w-full mt-12 sm:mt-16 bg-black/40 rounded-[2rem] sm:rounded-[4rem] border border-white/10 pl-20 sm:pl-32 pr-12 sm:pr-32 py-16 sm:py-24 overflow-visible">
        {/* Y-AXIS LABELS */}
        <div className="absolute left-4 sm:left-12 inset-y-24 flex flex-col justify-between text-[12px] sm:text-[14px] font-mono text-slate-400 font-black uppercase tracking-widest text-right w-12">
           <span>{(maxVal).toFixed(1)}</span>
           <span>{(maxVal * 0.75).toFixed(1)}</span>
           <span>{(maxVal * 0.5).toFixed(1)}</span>
           <span>{(maxVal * 0.25).toFixed(1)}</span>
           <span>0.0</span>
        </div>

        {/* X-AXIS LABELS */}
        <div className="absolute -bottom-10 left-16 right-24 flex justify-between text-[12px] sm:text-[14px] font-mono text-slate-400 font-black uppercase tracking-widest py-4">
           <span>-30s</span>
           <span>-20s</span>
           <span>-10s</span>
           <span className="text-accent-emerald">NOW</span>
        </div>

        {/* Labels Overlay */}
        <div className="absolute -left-16 sm:-left-12 top-1/2 -translate-y-1/2 -rotate-90 text-[12px] font-black text-slate-500 uppercase tracking-[0.4em] whitespace-nowrap">
          Grid Load (kW)
        </div>

        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible ml-4">
          {/* Radar Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
            <line 
              key={i} 
              x1="0" y1={height * p} 
              x2={width} y2={height * p} 
              stroke="white" 
              strokeWidth="1" 
              opacity="0.1"
              strokeDasharray="4 4"
            />
          ))}
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
            <line 
              key={i} 
              x1={width * p} y1="0" 
              x2={width * p} y2={height} 
              stroke="white" 
              strokeWidth="1" 
              opacity="0.1"
              strokeDasharray="4 4"
            />
          ))}

          {/* Area Gradient */}
          <defs>
            <linearGradient id="live-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="solar-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EAB308" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#EAB308" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Fill Area - Solar */}
          {solarData && (
            <path
              d={`${solarPath} L ${width} ${height} L 0 ${height} Z`}
              fill="url(#solar-gradient)"
            />
          )}

          {/* Fill Area - Grid */}
          <path
            d={`${linearPath} L ${width} ${height} L 0 ${height} Z`}
            fill="url(#live-gradient)"
          />

          {/* Neon Glow Outer - Solar */}
          {solarData && (
            <motion.path
              d={solarPath}
              fill="none"
              stroke="#EAB308"
              strokeWidth="10"
              opacity="0.1"
              strokeLinecap="round"
              style={{ filter: "blur(6px)" }}
            />
          )}

          {/* Primary Data Line - Solar */}
          {solarData && (
            <motion.path
              d={solarPath}
              fill="none"
              stroke="#EAB308"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          )}

          {/* Primary Data Line - Grid */}
          <motion.path
            d={linearPath}
            fill="none"
            stroke="#10B981"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />

          {/* Current Position Pulse - Solar */}
          {solarData && solarData.length > 0 && (
             <motion.circle 
                cx={(solarData.length - 1) / (solarData.length - 1) * width} 
                cy={height - (solarData[solarData.length - 1] / maxVal) * height} 
                r="5" 
                fill="#EAB308" 
                className="shadow-[0_0_15px_#EAB308]"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
             />
          )}

          {/* Current Position Pulse - Grid */}
          {data.length > 0 && (
             <motion.circle 
                cx={(data.length - 1) / (data.length - 1) * width} 
                cy={height - (data[data.length - 1] / maxVal) * height} 
                r="5" 
                fill="#10B981" 
                className="shadow-[0_0_15px_#10B981]"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
             />
          )}

          {/* Interaction Nodes */}
          {data.map((p, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - (p / maxVal) * height;
            
            if (i % 5 !== 0 && i !== data.length-1) return null;

            return (
              <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)}>
                <circle 
                  cx={x} cy={y} r="3.5" 
                  fill={hoveredPoint === i ? "#10B981" : "white"} 
                  opacity={hoveredPoint === i ? 1 : 0.15} 
                />
              </g>
            );
          })}
        </svg>

        {/* Dynamic Tooltip */}
        {hoveredPoint !== null && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute bg-slate-900/90 backdrop-blur-xl text-white p-6 rounded-[2rem] shadow-2xl border border-white/10 z-50 pointer-events-none flex flex-col gap-4"
            style={{ 
               left: `calc(16px + ${(hoveredPoint / (data.length - 1)) * (width / 1000) * 100}%)`,
               top: `calc(${height - (data[hoveredPoint] / maxVal) * height}px + 40px)`,
               transform: "translate(-50%, 0)"
            }}
          >
             <div>
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse shadow-[0_0_5px_#10B981]" />
                  <p className="text-[9px] font-mono text-white/40 uppercase tracking-[0.2em] font-bold">Grid Load</p>
               </div>
               <p className="text-3xl font-black tracking-tighter">
                  {data[hoveredPoint].toFixed(2)}
                  <span className="text-xs ml-2 text-accent-emerald uppercase font-bold tracking-widest">kW</span>
               </p>
             </div>
             
             {solarData && (
               <div>
                 <div className="flex items-center gap-3 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#EAB308] animate-pulse shadow-[0_0_5px_#EAB308]" />
                    <p className="text-[9px] font-mono text-white/40 uppercase tracking-[0.2em] font-bold">Solar Generation</p>
                 </div>
                 <p className="text-3xl font-black tracking-tighter">
                    {solarData[hoveredPoint].toFixed(2)}
                    <span className="text-xs ml-2 text-[#EAB308] uppercase font-bold tracking-widest">kW</span>
                 </p>
               </div>
             )}
          </motion.div>
        )}
      </div>

      <div className="mt-12 sm:mt-20 flex flex-col xl:flex-row gap-8 sm:gap-16 items-start xl:items-center justify-between relative z-10 w-full">
         <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 sm:gap-16 w-full sm:w-auto">
            <StatsItem label="Current Load" value={`${(data[data.length - 1] || 0).toFixed(2)} kW`} />
            <StatsItem label="System Peak" value={`${Math.max(...data).toFixed(2)} kW`} />
            <StatsItem label="Current Solar" value={`${(solarData?.[solarData.length - 1] || 0).toFixed(2)} kW`} />
            <StatsItem label="Baseline Deviation" value="-12.4%" />
         </div>
         <div className="text-left xl:text-right glass-card p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-white/5 bg-white/[0.02] w-full sm:w-auto">
            <p className="text-white/20 font-mono text-[8px] sm:text-[10px] uppercase tracking-widest mb-2 sm:mb-3 font-bold">Status: Synchronized</p>
            <div className="flex items-center gap-3 text-white font-black text-xl sm:text-2xl uppercase tracking-tighter italic">
               <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-accent-emerald animate-pulse shadow-[0_0_20px_#10B981]" />
               Pulse Grid Optimal
            </div>
         </div>
      </div>
    </div>
  );
}

function StatsItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-white/20 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest mb-1 sm:mb-2 font-black whitespace-nowrap">{label}</p>
      <p className="text-white text-2xl sm:text-4xl font-black tracking-tighter uppercase tabular-nums">{value}</p>
    </div>
  );
}
