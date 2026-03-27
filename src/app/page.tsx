"use client";

import { useEffect, useState, useRef } from "react";
import { useScroll, AnimatePresence, motion } from "framer-motion";
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
  }, [applianceState]);

  useEffect(() => {
    const interval = setInterval(() => {
      const addedKwh = totalLoad / 3600;
      setAccumulatedKwh((prev) => prev + addedKwh);
    }, 1000);
    return () => clearInterval(interval);
  }, [totalLoad]);

  return (
    <main className="relative bg-black min-h-screen cursor-none selection:bg-accent-emerald selection:text-black">
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
          <div ref={scrollTarget} className="h-[500vh] relative">
            <EnergyCanvas />
            
            {/* Start Title & Summary */}
            <StartTitle scrollProgress={scrollYProgress} />
            
            {/* Immersive Hotspots during scroll */}
            <ScrollyHotspots scrollProgress={scrollYProgress} />
            
            <InsightSections />
          </div>

          {/* Formal Medium-Light Command Center */}
          <div className="bg-[#F1F5F9]">
            <UHDSection 
              applianceState={applianceState} 
              setApplianceState={setApplianceState} 
              totalLoad={totalLoad}
              onOpenPlans={() => setShowPlans(true)}
            />

            {/* Analytics Section */}
            <section className="relative z-50 bg-white py-32 border-t border-slate-200">
              <div className="max-w-7xl mx-auto px-12 grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
                 <div className="lg:col-span-2">
                   <div className="mb-20">
                     <h2 className="text-7xl font-black text-slate-900 tracking-tighter uppercase mb-2">Live <span className="text-accent-cyber">Impact</span></h2>
                     <p className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.4em] font-black">Verified Mathematical Telemetry</p>
                   </div>
                   <Totalizer 
                    totalLoad={totalLoad} 
                    accumulatedKwh={accumulatedKwh}
                    onOpenMetric={(type) => setActiveMetric(type)}
                   />
                 </div>
                 
                 <div className="flex flex-col gap-12 sticky top-32">
                   <div onClick={() => setShowLogs(true)} className="cursor-none">
                    <SavingsGraph />
                   </div>
                   
                   <div className="p-10 rounded-[3rem] bg-slate-900 text-white shadow-2xl">
                      <p className="text-accent-emerald font-mono text-[10px] uppercase tracking-widest mb-4">Grid Health</p>
                      <p className="text-2xl font-black uppercase tracking-tight mb-4 leading-tight">System Integrity: Nominal</p>
                      <button 
                        onClick={() => setShowLogs(true)}
                        className="w-full py-5 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        Launch Detailed Console
                      </button>
                   </div>
                 </div>
              </div>
            </section>

            {/* Educational Sections */}
            <KnowledgeHub />
          </div>
          
          <footer className="py-20 border-t border-slate-200 text-center bg-white">
             <p className="text-slate-300 font-mono text-[10px] uppercase tracking-[0.8em] font-black">
               &copy; 2026 Aether-Grid | Advanced Command Environment
             </p>
          </footer>
        </motion.div>
      )}
    </main>
  );
}
