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
import LogsOverlay, { DeviceLog } from "@/components/LogsOverlay";
import SavingsPlans from "@/components/SavingsPlans";
import ScrollyHotspots from "@/components/ScrollyHotspots";
import AddDeviceModal from "@/components/AddDeviceModal";
import { Device, SolarBatteryState } from "@/types/device";
import { X, Terminal } from "lucide-react";
import SolarPanelManager from "@/components/SolarPanelManager";
import BudgetManager from "@/components/BudgetManager";

const PLAN_CONFIG: Record<string, { reduction: string; multiplier: number }> = {
  "Core Nexus": { reduction: "15%", multiplier: 0.85 },
  "Titan Pulse": { reduction: "40%", multiplier: 0.60 },
  "Zenith Zero": { reduction: "75%", multiplier: 0.25 },
};

const INITIAL_DEVICES: Device[] = [
  { id: "hvac-1", label: "Climate Control", power: 1.8, isOn: false, iconName: "Wind", desc: "Zoned Heating & Cooling" },
  { id: "ev-1", label: "EV Charger", power: 7.2, isOn: false, iconName: "Zap", desc: "Level 2 Fast Charger" },
  { id: "fridge-1", label: "Refrigerator", power: 0.15, isOn: true, iconName: "Snowflake", desc: "Kitchen Refrigerator" },
  { id: "tv-1", label: "Living Room TV", power: 0.18, isOn: false, iconName: "Tv", desc: "4K Smart TV" },
  { id: "lights-1", label: "Home Lighting", power: 0.08, isOn: true, iconName: "Lightbulb", desc: "Smart LED Grid" },
  { id: "dish-1", label: "Dishwasher", power: 1.5, isOn: false, iconName: "Waves", desc: "Energy Star Cycle" },
  { id: "purifier-1", label: "Air Purifier", power: 0.07, isOn: true, iconName: "Search", desc: "HEPA Filter Unit" },
  { id: "router-1", label: "Smart Router", power: 0.02, isOn: true, iconName: "Wifi", desc: "Dual-Band Mesh Uplink" },
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
  const [activeRoutine, setActiveRoutine] = useState<string | null>(null);
  
  const [solarState, setSolarState] = useState<SolarBatteryState>({
    solarGeneration: 0,
    batteryCapacity: 13.5,
    batteryLevel: 13.5,
    batteryChargeRate: 5.0,
    gridDependency: 0,
  });

  const [solarHistory, setSolarHistory] = useState<number[]>(new Array(30).fill(0));
  const solarGenRef = useRef(solarState.solarGeneration);
  useEffect(() => {
    solarGenRef.current = solarState.solarGeneration;
  }, [solarState.solarGeneration]);

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

  // Load solar from localStorage on mount
  useEffect(() => {
    const savedSolar = localStorage.getItem("eco-sync-solar");
    if (savedSolar) {
      try {
        const parsed = JSON.parse(savedSolar);
        setSolarState(parsed);
      } catch (e) {
        console.error("Failed to load solar state", e);
      }
    }
  }, []);

  // Save solar to localStorage on change
  useEffect(() => {
    localStorage.setItem("eco-sync-solar", JSON.stringify(solarState));
  }, [solarState]);


  const bootTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const [deviceHistory, setDeviceHistory] = useState<DeviceLog[]>([
    { id: 0, label: "Eco-Sync Nexus System", action: "BOOT", time: bootTime },
  ]);

  const handleDeviceToggle = useCallback((id: string) => {
    setDevices((prev) => prev.map(d => {
      if (d.id === id) {
        const willBeOn = !d.isOn;
        const action = willBeOn ? "ON" : "OFF";
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        setDeviceHistory(h => [{ 
          id: Date.now(), 
          label: d.label, 
          action, 
          time,
          details: willBeOn ? `Drawing ${d.power}kW from grid` : "Power supply severed",
          iconName: d.iconName
        }, ...h]);
        
        return { ...d, isOn: willBeOn };
      }
      return d;
    }));
  }, []);

  const handleAddDevice = (device: Device) => {
    setDevices(prev => [...prev, device]);
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setDeviceHistory(h => [{ 
      id: Date.now(), 
      label: device.label, 
      action: "REGISTER", 
      time,
      details: `${device.power}kW rating • ${device.desc || 'No description'}`,
      iconName: device.iconName
    }, ...h]);
  };

  const handleDeleteDevice = (id: string) => {
    const deviceToDelete = devices.find(d => d.id === id);
    setDevices(prev => prev.filter(d => d.id !== id));
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setDeviceHistory(h => [{ 
      id: Date.now(), 
      label: deviceToDelete?.label || "Unknown Device", 
      action: "REMOVED", 
      time,
      details: "Hardware decommissioned from grid",
      iconName: deviceToDelete?.iconName
    }, ...h]);
  };

  const handleClearLogs = () => {
    setDeviceHistory([{ id: Date.now(), label: "System", action: "BOOT", time: new Date().toLocaleTimeString() }]);
  };

  const handleReset = () => {
    localStorage.removeItem("eco-sync-devices");
    localStorage.removeItem("eco-sync-solar");
    setDevices(INITIAL_DEVICES);
    setSolarState({
      solarGeneration: 0,
      batteryCapacity: 13.5,
      batteryLevel: 13.5,
      batteryChargeRate: 5.0,
      gridDependency: 0,
    });
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setDeviceHistory(h => [{ id: Date.now(), label: "System", action: "BOOT", time }, ...h]);
    setActiveRoutine(null);
  };

  const handleExecuteRoutine = useCallback((routineId: string) => {
    setActiveRoutine(routineId);
    
    setDevices(prev => {
      const newDevices = [...prev];
      let notificationMsg = "";
      
      const updateDevice = (idPrefix: string, isOn: boolean) => {
        const idx = newDevices.findIndex(d => d.id.toLowerCase().includes(idPrefix) || d.label.toLowerCase().includes(idPrefix));
        if (idx !== -1) newDevices[idx] = { ...newDevices[idx], isOn };
      };

      if (routineId === "leave_home") {
         newDevices.forEach((d, i) => {
            if (!d.id.includes("fridge") && !d.id.includes("router")) {
               newDevices[i] = { ...d, isOn: false };
            }
         });
         notificationMsg = "Leaving Home: Non-essential systems deactivated.";
      } else if (routineId === "night_mode") {
         updateDevice("tv", false);
         updateDevice("lights", false);
         updateDevice("hvac", true);
         updateDevice("purifier", true);
         notificationMsg = "Night Mode: Sleep environment optimized.";
      } else if (routineId === "movie_time") {
         updateDevice("tv", true);
         updateDevice("lights", false);
         notificationMsg = "Movie Time: Cinematic environment activated.";
      } else if (routineId === "eco_max") {
         newDevices.forEach((d, i) => {
            if (!d.id.includes("fridge") && !d.id.includes("router")) {
               newDevices[i] = { ...d, isOn: false };
            }
         });
         notificationMsg = "Eco Max: Maximum energy conservation active.";
      } else if (routineId === "morning_prep") {
         updateDevice("lights", true);
         updateDevice("coffee", true);
         updateDevice("hvac", true);
         notificationMsg = "Morning Routine: Systems warming up.";
      } else if (routineId === "all_off") {
         newDevices.forEach((d, i) => newDevices[i] = { ...d, isOn: false });
         notificationMsg = "All Systems Off: Complete grid disconnect.";
      }
      
      const nId = Date.now().toString();
      setNotifications(prevN => [{ id: nId, message: notificationMsg, type: "info" }, ...prevN]);
      setTimeout(() => {
        setNotifications(prevN => prevN.filter(n => n.id !== nId));
      }, 4000);
      
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setDeviceHistory(h => [{ 
        id: Date.now(), 
        label: "Routine Manager", 
        action: "EXEC", 
        time,
        details: notificationMsg,
        iconName: "Zap"
      }, ...h]);

      return newDevices;
    });
  }, []);

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
      const addedKwh = totalLoad / 3600;
      setAccumulatedKwh((prev: number) => prev + addedKwh);
      
      setSolarState(prev => {
        let dependency = totalLoad - prev.solarGeneration;
        let newLevel = prev.batteryLevel;
        
        const chargeEfficiency = 0.95;
        const dischargeEfficiency = 0.95;
        
        if (dependency < 0) {
           // charge battery
           const availableChargeKw = Math.min(-dependency, prev.batteryChargeRate);
           const chargeKwh = availableChargeKw / 3600;
           newLevel = Math.min(prev.batteryCapacity, prev.batteryLevel + (chargeKwh * chargeEfficiency));
           dependency = 0; 
        } else if (dependency > 0 && prev.batteryLevel > 0) {
           // discharge battery
           const requiredFromBatteryKw = dependency / dischargeEfficiency;
           const actualDrawKw = Math.min(requiredFromBatteryKw, prev.batteryChargeRate);
           const actualDrawKwh = actualDrawKw / 3600;
           
           const finalDrawKwh = Math.min(actualDrawKwh, prev.batteryLevel);
           const energyProvidedKw = (finalDrawKwh * 3600) * dischargeEfficiency;
           
           newLevel = prev.batteryLevel - finalDrawKwh;
           dependency = totalLoad - prev.solarGeneration - energyProvidedKw;
        }
        
        return { ...prev, batteryLevel: newLevel, gridDependency: Math.max(0, dependency) };
      });

      // Move graph forward every second for real-time scrolling
      setLoadHistory((prev: number[]) => {
         return [...prev.slice(1), totalLoad];
      });
      setSolarHistory((prev: number[]) => [...prev.slice(1), solarGenRef.current]);
    }, 1000);
    return () => clearInterval(interval);
  }, [totalLoad]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <main className="relative bg-[#09090b] min-h-screen selection:bg-zinc-800 selection:text-white">
      
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
          <LogsOverlay 
            isOpen={showLogs} 
            onClose={() => setShowLogs(false)} 
            deviceHistory={deviceHistory} 
            onClearLogs={handleClearLogs}
          />
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
              className="bg-zinc-950/80 backdrop-blur-2xl border border-white/10 p-5 rounded-2xl shadow-2xl flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-accent-secondary animate-pulse" />
                <p className="text-white font-black uppercase text-[10px] tracking-widest font-heading">{notif.message}</p>
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

          {/* Deep Blue Command Center (Nexus Theme) */}
          <div id="command-center" className="relative z-30 bg-slate-950 border-t border-white/5">
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
              activeRoutine={activeRoutine}
              onExecuteRoutine={handleExecuteRoutine}
            />

            {/* Dedicated Real-Time Radar Section */}
            <section id="grid-radar" className="bg-[#09090b] py-32 border-t border-white/5 px-12 relative overflow-hidden">
               <div className="max-w-7xl mx-auto relative z-10">
                  <div className="mb-16">
                     <div className="flex items-center gap-4 mb-4">
                        <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
                        <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.4em] font-black">Live Pulse Stream</p>
                     </div>
                     <h2 className="text-7xl font-black text-white tracking-tighter uppercase mb-4 font-heading">Power <span className="text-accent-secondary">Horizon</span></h2>
                  </div>
                  <SavingsGraph data={loadHistory} solarData={solarHistory} />
               </div>
            </section>

            {/* Analytics Summary Section */}
            <section className="relative z-50 bg-[#09090b] py-32 border-t border-white/5">
              <div className="max-w-7xl mx-auto px-12 grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
                 <div className="lg:col-span-2">
                   <div className="mb-20">
                     <h2 className="text-7xl font-black text-white tracking-tighter uppercase mb-2 font-heading">Energy <span className="text-accent-tertiary">Dynamics</span></h2>
                     <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.4em] font-black">Your usage, costs & carbon — updated every second</p>
                   </div>
                   <Totalizer 
                    totalLoad={totalLoad} 
                    accumulatedKwh={accumulatedKwh}
                    devices={devices}
                    onOpenMetric={(type) => setActiveMetric(type)}
                    activePlanId={activePlanId}
                    solarState={solarState}
                   />
                 </div>
                 <div className="flex flex-col gap-12 sticky top-32">
                   <SolarPanelManager 
                     solarState={solarState}
                     onUpdateSolarState={(updates) => setSolarState(prev => ({ ...prev, ...updates }))}
                     totalLoad={totalLoad}
                   />
                   <BudgetManager totalLoad={totalLoad} costFactor={8} />
                   <div className="p-8 rounded-2xl bg-[#121214] text-white border border-white/5 shadow-2xl relative overflow-hidden group">
                      <div className="relative z-10">
                        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mb-4">System Console</p>
                        <p className="text-2xl font-black uppercase tracking-tight mb-6 leading-tight font-heading">Status: <span className="text-zinc-400">OPTIMIZED</span></p>
                        
                        {/* mini log preview */}
                        <div className="space-y-3 mb-8">
                          {deviceHistory.slice(0, 3).map((log) => (
                            <div key={log.id} className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                              <div className={`w-1 h-1 rounded-full ${log.action === 'ON' || log.action === 'REGISTER' ? 'bg-zinc-500' : 'bg-zinc-700'}`} />
                              <p className="font-mono text-[9px] uppercase tracking-tighter truncate flex-1">
                                <span className="text-white/40">{log.time}</span> • {log.label} • <span className={log.action === 'ON' ? 'text-white' : 'text-zinc-400'}>{log.action}</span>
                              </p>
                            </div>
                          ))}
                        </div>

                        <button 
                          onClick={() => setShowLogs(true)}
                           className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all mb-4 flex items-center justify-center gap-3 group/btn font-heading"
                        >
                          <Terminal className="w-4 h-4 text-zinc-500 group-hover/btn:scale-110 transition-transform" />
                          Launch System Logs
                        </button>
                      </div>
                   </div>
                   <div className="p-8 rounded-2xl bg-[#121214] border border-white/5 shadow-xl">
                      <p className="text-white text-xl font-bold uppercase tracking-tight leading-tight mb-6 font-heading">
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

            <footer className="py-24 border-t border-white/5 text-center bg-slate-950">
               <p className="text-white/20 font-mono text-[10px] uppercase tracking-[0.8em] font-black">
                 &copy; 2024 ECO-SYNC NEXUS | THE ARCHITECTURE OF ENERGY SOVEREIGNTY
               </p>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}
