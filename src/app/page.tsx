"use client";

import { useEffect, useState, useRef } from "react";
import { useScroll, AnimatePresence, motion, useTransform, useInView } from "framer-motion";
import EnergyCanvas from "@/components/EnergyCanvas";
import UHDSection from "@/components/UHDSection";
import InsightSections from "@/components/InsightSections";
import Totalizer from "@/components/Totalizer";
import AetherGridIntro from "@/components/AetherGridIntro";
import CustomCursor from "@/components/CustomCursor";
import SavingsGraph from "@/components/SavingsGraph";
import { KnowledgeHub } from "@/components/KnowledgeHub";
import StartTitle from "@/components/StartTitle";
import CalculationOverlay, { MetricType } from "@/components/CalculationOverlay";
import LogsOverlay from "@/components/LogsOverlay";
import SavingsPlans from "@/components/SavingsPlans";
import ScrollyHotspots from "@/components/ScrollyHotspots";

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [activeMetric, setActiveMetric] = useState<MetricType>(null);
  const [showLogs, setShowLogs] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  
  const [applianceState, setApplianceState] = useState({
    hvac: false,
    ev: false,
    lighting: true,
    tv: false,
    fridge: true,
    dishwasher: false,
    airPurifier: true
  });

  const [totalLoad, setTotalLoad] = useState(0.2);
  const [accumulatedKwh, setAccumulatedKwh] = useState(0);
  const [loadHistory, setLoadHistory] = useState<number[]>(new Array(30).fill(0.2));

  const scrollTarget = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: scrollTarget,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    let load = 0.2; // Baseline
    if (applianceState.hvac) load += 2.5;
    if (applianceState.ev) load += 7.2;
    if (applianceState.lighting) load += 0.05;
    if (applianceState.tv) load += 0.15;
    if (applianceState.dishwasher) load += 1.2;
    if (applianceState.airPurifier) load += 0.05;
    setTotalLoad(load);
    setLoadHistory(prev => [...prev.slice(1), load]);
  }, [applianceState]);

  useEffect(() => {
    const interval = setInterval(() => {
      const addedKwh = totalLoad / 3600;
      setAccumulatedKwh((prev) => prev + addedKwh);
      setLoadHistory(prev => [...prev.slice(1), totalLoad]);
    }, 1000);
    return () => clearInterval(interval);
  }, [totalLoad]);

  return (
    <main className="relative bg-black min-h-screen cursor-none selection:bg-accent-cyber selection:text-black">
      <CustomCursor />
      
      <AnimatePresence>
        {showIntro && (
          <AetherGridIntro onComplete={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeMetric && (
          <CalculationOverlay type={activeMetric} onClose={() => setActiveMetric(null)} />
        )}
        {showLogs && (
          <LogsOverlay isOpen={showLogs} onClose={() => setShowLogs(false)} applianceState={applianceState} />
        )}
        {showPlans && (
          <SavingsPlans isOpen={showPlans} onClose={() => setShowPlans(false)} />
        )}
      </AnimatePresence>

      {!showIntro && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 1 }}
        >
          {/* Cinematic Scroller Canvas Area */}
          <div ref={scrollTarget} className="h-[600vh] relative">
            <EnergyCanvas scrollProgress={scrollYProgress} />
            
            {/* Start Title & Summary */}
            <StartTitle scrollProgress={scrollYProgress} />
            
            {/* Immersive Hotspots during scroll */}
            <ScrollyHotspots scrollProgress={scrollYProgress} />
            
            <InsightSections scrollProgress={scrollYProgress} />
          </div>

          {/* Neon Aqua Command Center (Industrial Cyber Theme) */}
          <div className="relative z-30 bg-slate-900 border-t border-white/5">
            <UHDSection 
              applianceState={applianceState} 
              setApplianceState={setApplianceState} 
              totalLoad={totalLoad}
              onOpenPlans={() => setShowPlans(true)}
            />

            {/* Dedicated Real-Time Radar Section */}
            <section className="bg-slate-950 py-32 border-t border-white/5 px-12 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-cyber/10 blur-[120px] -translate-y-1/2 translate-x-1/2" />
               <div className="max-w-7xl mx-auto relative z-10">
                  <div className="mb-16">
                     <div className="flex items-center gap-4 mb-4">
                        <div className="w-2 h-2 rounded-full bg-accent-cyber animate-pulse shadow-[0_0_10px_#00F0FF]" />
                        <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.4em] font-black">Live Pulse Stream</p>
                     </div>
                     <h2 className="text-7xl font-black text-white tracking-tighter uppercase mb-4 italic">Grid <span className="text-accent-cyber">Radar</span></h2>
                  </div>
                  <SavingsGraph data={loadHistory} />
               </div>
            </section>

            {/* Analytics Summary Section */}
            <section className="relative z-50 bg-slate-900 py-32 border-t border-white/5">
              <div className="max-w-7xl mx-auto px-12 grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
                 <div className="lg:col-span-2">
                   <div className="mb-20">
                     <h2 className="text-7xl font-black text-white tracking-tighter uppercase mb-2 italic">Live <span className="text-accent-cyber">Impact</span></h2>
                     <p className="text-white/20 font-mono text-[10px] uppercase tracking-[0.4em] font-black">Verified Mathematical Telemetry</p>
                   </div>
                   <Totalizer 
                    totalLoad={totalLoad} 
                    accumulatedKwh={accumulatedKwh}
                    onOpenMetric={(type) => setActiveMetric(type)}
                   />
                 </div>
                 <div className="flex flex-col gap-12 sticky top-32">
                   <div className="p-10 rounded-[3rem] bg-slate-950 text-white border border-white/5 shadow-2xl relative overflow-hidden group">
                      <div className="relative z-10">
                        <p className="text-accent-cyber font-mono text-[10px] uppercase tracking-widest mb-4">System Console</p>
                        <p className="text-2xl font-black uppercase tracking-tight mb-6 leading-tight">Integrity: <span className="text-accent-cyber">Nominal</span></p>
                        <button 
                          onClick={() => setShowLogs(true)}
                          className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all mb-4"
                        >
                          Launch System Logs
                        </button>
                      </div>
                   </div>
                   <div className="p-10 rounded-[3rem] bg-slate-800/40 backdrop-blur-xl border border-white/5 shadow-xl">
                      <p className="text-white text-xl font-black uppercase tracking-tight leading-tight mb-6">Saving up to 24% load via Smart-Sync</p>
                   </div>
                 </div>
              </div>
            </section>

            <KnowledgeHub />

            <footer className="py-24 border-t border-white/5 text-center bg-slate-900">
               <p className="text-white/20 font-mono text-[10px] uppercase tracking-[0.8em] font-black">
                 &copy; 2026 Aether-Grid | Advanced Command Environment
               </p>
            </footer>
          </div>
        </motion.div>
      )}
    </main>
  );
}
