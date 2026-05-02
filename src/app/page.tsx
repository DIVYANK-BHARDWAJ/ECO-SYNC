"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useScroll, AnimatePresence, motion, useTransform, useInView, animate, useSpring } from "framer-motion";
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
import AddDeviceModal from "@/components/AddDeviceModal";
import { Device } from "@/types/device";
import { X } from "lucide-react";

const PLAN_CONFIG: Record<string, { reduction: string; multiplier: number }> = {
  "Eco-Baseline": { reduction: "15%", multiplier: 0.85 },
  "Aether Pro": { reduction: "40%", multiplier: 0.60 },
  "Carbon Zero": { reduction: "75%", multiplier: 0.25 },
};

const INITIAL_DEVICES: Device[] = [
  { id: "hvac-1", label: "1.5 Ton AC", power: 1.8, isOn: false, iconName: "Wind", desc: "Master Suite Cooling" },
  { id: "ev-1", label: "EV Wallbox", power: 7.2, isOn: false, iconName: "Zap", desc: "Tesla Fast Charger" },
  { id: "fridge-1", label: "Family Fridge", power: 0.15, isOn: true, iconName: "Snowflake", desc: "Main Refrigerator" },
  { id: "tv-1", label: "OLED 8K TV", power: 0.18, isOn: false, iconName: "Tv", desc: "Living Room Cinema" },
  { id: "lights-1", label: "Main Lighting", power: 0.08, isOn: true, iconName: "Lightbulb", desc: "Full House Mesh" },
  { id: "dish-1", label: "Dishwasher", power: 1.5, isOn: false, iconName: "Waves", desc: "Kitchen Hygiene" },
  { id: "purifier-1", label: "Air Purifier", power: 0.07, isOn: true, iconName: "Search", desc: "HEPA Filtering" },
  { id: "router-1", label: "Mesh Router", power: 0.02, isOn: true, iconName: "Wifi", desc: "Gigabit Network" },
];

export default function Home() {
  const [showIntro, setShowIntro] = useState(false);
  const [activeMetric, setActiveMetric] = useState<MetricType>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: "info" | "success" | "warning" }[]>([]);

  // Scroll to top and show main content when intro finishes
  const handleIntroComplete = () => {
    setShowIntro(false);
  };
  const [showLogs, setShowLogs] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("eco-sync-devices");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setDevices(parsed);
        }
      } catch (e) {
        console.error("Failed to load devices", e);
        setDevices(INITIAL_DEVICES);
      }
    } else {
      setDevices(INITIAL_DEVICES);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("eco-sync-devices", JSON.stringify(devices));
  }, [devices]);

  type DeviceLog = { id: number; label: string; action: "ON" | "OFF" | "BOOT" | "REGISTER" | "REMOVED"; time: string };

  const bootTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const [deviceHistory, setDeviceHistory] = useState<DeviceLog[]>([
    { id: 0, label: "Eco-Sync System", action: "BOOT", time: bootTime },
  ]);

  const handleDeviceToggle = useCallback((id: string) => {
    setDevices((prev) => prev.map(d => {
      if (d.id === id) {
        const willBeOn = !d.isOn;
        const action = willBeOn ? "ON" : "OFF";
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        setDeviceHistory(h => [{ id: Date.now(), label: d.label, action, time }, ...h]);
        
        let timerEndTimestamp = undefined;
        if (willBeOn && d.autoOffMinutes) {
          timerEndTimestamp = Date.now() + d.autoOffMinutes * 60000;
        }

        return { ...d, isOn: willBeOn, timerEndTimestamp };
      }
      return d;
    }));
  }, []);

  const handleAddDevice = (device: Device) => {
    setDevices(prev => [...prev, device]);
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setDeviceHistory(h => [{ id: Date.now(), label: device.label, action: "REGISTER", time }, ...h]);
  };

  const handleDeleteDevice = (id: string) => {
    const deviceToDelete = devices.find(d => d.id === id);
    setDevices(prev => prev.filter(d => d.id !== id));
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setDeviceHistory(h => [{ id: Date.now(), label: deviceToDelete?.label || "Unknown Device", action: "REMOVED", time }, ...h]);
  };

  const handleReset = () => {
    localStorage.removeItem("eco-sync-devices");
    setDevices(INITIAL_DEVICES);
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setDeviceHistory(h => [{ id: Date.now(), label: "System", action: "BOOT", time }, ...h]);
  };

  const [totalLoad, setTotalLoad] = useState(0.2);
  const [accumulatedKwh, setAccumulatedKwh] = useState(0);
  const [loadHistory, setLoadHistory] = useState<number[]>(new Array(30).fill(0.2));

  const scrollTarget = useRef<HTMLDivElement>(null);
  const { scrollYProgress: rawScrollProgress } = useScroll({
    target: scrollTarget,
    offset: ["start start", "end end"]
  });

  const scrollYProgress = rawScrollProgress;

  useEffect(() => {
    let load = 0.2; // Baseline
    devices.forEach(device => {
      if (device.isOn) load += device.power;
    });

    // Apply plan reductions using centralized config
    if (activePlanId && PLAN_CONFIG[activePlanId]) {
      load *= PLAN_CONFIG[activePlanId].multiplier;
    }

    setTotalLoad(load);
    setLoadHistory((prev: number[]) => [...prev.slice(1), load]);
  }, [devices, activePlanId]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let timerExpired = false;

      setDevices((prev) => {
        const updated = prev.map(d => {
          if (d.isOn && d.timerEndTimestamp && now >= d.timerEndTimestamp) {
            timerExpired = true;
            const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
            
            // Log it
            setDeviceHistory(h => [{ id: Date.now(), label: d.label, action: "OFF", time: `${time} (AUTO)` }, ...h]);
            
            // Notify
            const notifId = Date.now().toString();
            setNotifications(n => [
              { id: notifId, message: `${d.label} turned off automatically.`, type: "info" },
              ...n
            ]);
            
            // Auto-dismiss after 5s
            setTimeout(() => {
              removeNotification(notifId);
            }, 5000);

            return { ...d, isOn: false, timerEndTimestamp: undefined };
          }
          return d;
        });

        if (timerExpired) {
          return updated;
        }
        return prev;
      });

      const addedKwh = totalLoad / 3600;
      setAccumulatedKwh((prev: number) => prev + addedKwh);
      setLoadHistory((prev: number[]) => [...prev.slice(1), totalLoad]);
    }, 1000);
    return () => clearInterval(interval);
  }, [totalLoad]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <main className="relative bg-black min-h-screen cursor-none selection:bg-accent-cyber selection:text-black">
      <CustomCursor />
      
      <AnimatePresence>
        {showIntro && (
          <AetherGridIntro onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <AddDeviceModal 
            isOpen={showAddModal} 
            onClose={() => setShowAddModal(false)} 
            onAdd={handleAddDevice} 
          />
        )}
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
            onSelectPlan={(planId) => setActivePlanId((prev: string | null) => prev === planId ? null : planId)}
          />
        )}
      </AnimatePresence>

      {/* Real-time Notifications Overlay */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-4 w-full max-w-md px-6">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="bg-slate-900/80 backdrop-blur-2xl border border-accent-cyber/30 p-5 rounded-2xl shadow-2xl flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-accent-cyber animate-pulse shadow-[0_0_10px_#00F0FF]" />
                <p className="text-white font-black uppercase text-[10px] tracking-widest">{notif.message}</p>
              </div>
              <button 
                onClick={() => removeNotification(notif.id)}
                className="p-1 rounded-lg hover:bg-white/5 text-white/20 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!showIntro && (
        <div>
          {/* Cinematic Scroller Canvas Area */}
          <div ref={scrollTarget} className="h-[1000vh] relative">
            <EnergyCanvas scrollProgress={scrollYProgress} />
            
            {/* Start Title & Summary */}
            <StartTitle scrollProgress={scrollYProgress} />
            
            {/* Immersive Hotspots during scroll */}
            <ScrollyHotspots scrollProgress={scrollYProgress} />
            
            <InsightSections scrollProgress={scrollYProgress} />
          </div>

          {/* Neon Aqua Command Center (Industrial Cyber Theme) */}
          <div id="command-center" className="relative z-30 bg-slate-900 border-t border-white/5">
            <UHDSection 
              devices={devices} 
              onToggleDevice={handleDeviceToggle} 
              onAddDevice={() => setShowAddModal(true)}
              onDeleteDevice={handleDeleteDevice}
              totalLoad={totalLoad}
              onOpenPlans={() => setShowPlans(true)}
              onScrollToRadar={() => {
                document.getElementById("grid-radar")?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              onReset={handleReset}
            />

            {/* Dedicated Real-Time Radar Section */}
            <section id="grid-radar" className="bg-slate-950 py-32 border-t border-white/5 px-12 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-emerald/10 blur-[120px] -translate-y-1/2 translate-x-1/2" />
               <div className="max-w-7xl mx-auto relative z-10">
                  <div className="mb-16">
                     <div className="flex items-center gap-4 mb-4">
                        <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse shadow-[0_0_10px_#10B981]" />
                        <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.4em] font-black">Live Pulse Stream</p>
                     </div>
                     <h2 className="text-7xl font-black text-white tracking-tighter uppercase mb-4 italic">Grid <span className="text-accent-emerald">Radar</span></h2>
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
                    devices={devices}
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
                        {activePlanId && PLAN_CONFIG[activePlanId]
                          ? `Active Plan: ${activePlanId} — ${PLAN_CONFIG[activePlanId].reduction} Reduction` 
                          : activePlanId
                            ? `Active Plan: ${activePlanId} — Unknown Reduction`
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
