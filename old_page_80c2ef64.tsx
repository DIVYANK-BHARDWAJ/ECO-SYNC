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

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
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
    let load = 0;
    if (applianceState.hvac) load += 2.5;
    if (applianceState.ev) load += 7.2;
    if (applianceState.lighting) load += 0.05;
    if (applianceState.tv) load += 0.15;
    if (applianceState.fridge) load += 0.1;
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

      {!showIntro && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 1 }}
        >
          {/* Cinematic Scroller Canvas Area */}
          <div ref={scrollTarget} className="h-[500vh] relative">
            <EnergyCanvas />
            
            {/* Start Title & Scroll-linked Capability Summary */}
            <StartTitle scrollProgress={scrollYProgress} />
            
            <InsightSections />
          </div>

          {/* Dedicated UHD Command Center Dashboard */}
          <UHDSection 
            applianceState={applianceState} 
            setApplianceState={setApplianceState} 
            totalLoad={totalLoad}
          />

          {/* Analytics Section */}
          <section className="relative z-50 bg-[#020202] border-t border-white/5 py-32">
            <div className="max-w-7xl mx-auto px-12 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
               <div className="lg:col-span-2">
                 <div className="mb-12">
                   <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase mb-2">Live <span className="text-accent-cyber neon-text-cyber">Impact</span></h2>
                   <p className="text-white/20 font-mono text-xs uppercase tracking-widest">Real-time dynamic data feed</p>
                 </div>
                 <Totalizer 
                  totalLoad={totalLoad} 
                  accumulatedKwh={accumulatedKwh}
                 />
               </div>
               <div className="flex flex-col justify-center">
                 <SavingsGraph />
               </div>
            </div>
          </section>

          {/* Educational Sections */}
          <KnowledgeHub />
          
          <footer className="py-20 border-t border-white/5 text-center bg-black">
             <p className="text-white/10 font-mono text-[10px] uppercase tracking-[0.5em]">
               &copy; 2026 Aether-Grid | Advanced Energy Command
             </p>
          </footer>
        </motion.div>
      )}
    </main>
  );
}
