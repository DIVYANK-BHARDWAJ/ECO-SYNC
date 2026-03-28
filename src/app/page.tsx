"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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

  // Scroll to top and show main content when intro finishes
  const handleIntroComplete = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setShowIntro(false);
  };
  const [showLogs, setShowLogs] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  
  const [applianceState, setApplianceState] = useState({
    hvac: false,
    ev: false,
    lighting: true,
    tv: false,
    fridge: true,
    dishwasher: false,
    airPurifier: true
  });

  // Friendly display names for each appliance key
  const applianceLabels: Record<string, string> = {
    hvac:        "Air Conditioner (1.5 Ton)",
    ev:          "EV Wallbox Charger",
    lighting:    "Smart Lighting",
    tv:          "Smart OLED TV",
    fridge:      "Inverter Fridge",
    dishwasher:  "Dishwasher",
    airPurifier: "Air Purifier",
  };

  type DeviceLog = { id: number; label: string; action: "ON" | "OFF" | "BOOT"; time: string };

  // Pre-populate history with the three appliances that start ON
  const bootTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const [deviceHistory, setDeviceHistory] = useState<DeviceLog[]>([
    { id: 3, label: "Air Purifier",   action: "ON",   time: bootTime },
    { id: 2, label: "Inverter Fridge", action: "ON",  time: bootTime },
    { id: 1, label: "Smart Lighting",  action: "ON",  time: bootTime },
    { id: 0, label: "Eco-Sync System", action: "BOOT", time: bootTime },
  ]);

  // Intercept every toggle to log it with real device time
  const handleApplianceToggle = useCallback((updater: any) => {
    setApplianceState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      const changedKey = Object.keys(next).find(k => (next as any)[k] !== (prev as any)[k]);
      if (changedKey) {
        const action = (next as any)[changedKey] ? "ON" : "OFF";
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        const entry: DeviceLog = { id: Date.now(), label: applianceLabels[changedKey] ?? changedKey, action, time };
        setDeviceHistory(h => [entry, ...h]);
      }
      return next;
    });
  }, []);

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

    // Apply plan reductions (e.g., Aether Pro = 40% reduction, so * 0.6 multiplier)
    if (activePlanId === "Eco-Baseline") load *= 0.85;
    else if (activePlanId === "Aether Pro") load *= 0.60;
    else if (activePlanId === "Carbon Zero") load *= 0.25;

    setTotalLoad(load);
    setLoadHistory(prev => [...prev.slice(1), load]);
  }, [applianceState, activePlanId]);

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
          <AetherGridIntro onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeMetric && (
          <CalculationOverlay type={activeMetric} onClose={() => setActiveMetric(null)} />
        )}
        {showLogs && (
          <LogsOverlay isOpen={showLogs} onClose={() => setShowLogs(false)} deviceHistory={deviceHistory} />
        )}
        {showPlans && (
          <SavingsPlans 
            isOpen={showPlans} 
            onClose={() => setShowPlans(false)} 
            activePlanId={activePlanId}
            onSelectPlan={(planId) => setActivePlanId(prev => prev === planId ? null : planId)}
          />
        )}
      </AnimatePresence>

      {!showIntro && (
        <div>
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
              setApplianceState={handleApplianceToggle} 
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
                     <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.4em] font-black">Your usage, costs & carbon — updated every second</p>
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
                      <p className="text-white text-xl font-black uppercase tracking-tight leading-tight mb-6">
                        {activePlanId 
                          ? `Active Plan: ${activePlanId} — ${activePlanId === "Eco-Baseline" ? "15%" : activePlanId === "Aether Pro" ? "40%" : "75%"} Reduction` 
                          : "Saving up to 24% load via Smart-Sync"}
                      </p>
                   </div>
                 </div>
              </div>
            </section>

            <KnowledgeHub />

            <footer className="py-24 border-t border-white/5 text-center bg-slate-900">
               <p className="text-white/20 font-mono text-[10px] uppercase tracking-[0.8em] font-black">
                 &copy; 2026 Eco-Sync | Advanced Command Environment
               </p>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}
