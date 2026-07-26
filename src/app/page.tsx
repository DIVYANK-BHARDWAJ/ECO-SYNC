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
import { X, Terminal, Loader2 } from "lucide-react";
import SolarPanelManager from "@/components/SolarPanelManager";
import BudgetManager from "@/components/BudgetManager";
import UserProfileHeader from "@/components/UserProfileHeader";
import AuthModal from "@/components/AuthModal";
import SettingsDrawer from "@/components/SettingsDrawer";
import { useAuth } from "@/context/AuthContext";
import AuthPage from "@/components/AuthPage";
import BotpressChatbot from "@/components/BotpressChatbot";
import CarbonSchedulerSection from "@/components/CarbonSchedulerSection";
import NexusTerminal from "@/components/NexusTerminal";
import StartupTelemetryPanel from "@/components/StartupTelemetryPanel";


const PLAN_CONFIG: Record<string, { reduction: string; multiplier: number }> = {
  "Eco-Baseline": { reduction: "15%", multiplier: 0.85 },
  "Aether Pro": { reduction: "40%", multiplier: 0.60 },
  "Carbon Zero": { reduction: "75%", multiplier: 0.25 },
};

const INITIAL_DEVICES: Device[] = [
  { id: "hvac-1", label: "Climate Control", power: 1.8, isOn: false, iconName: "Wind", desc: "Zoned Heating & Cooling" },
  { id: "ev-1", label: "EV Charger", power: 7.2, isOn: false, iconName: "Zap", desc: "Level 2 Fast Charger" },
  { id: "fridge-1", label: "Refrigerator", power: 0.15, isOn: false, iconName: "Snowflake", desc: "Kitchen Refrigerator" },
  { id: "tv-1", label: "Living Room TV", power: 0.18, isOn: false, iconName: "Tv", desc: "4K Smart TV" },
  { id: "lights-1", label: "Home Lighting", power: 0.08, isOn: false, iconName: "Lightbulb", desc: "Smart LED Grid" },
  { id: "dish-1", label: "Dishwasher", power: 1.5, isOn: false, iconName: "Waves", desc: "Energy Star Cycle" },
  { id: "purifier-1", label: "Air Purifier", power: 0.07, isOn: false, iconName: "Search", desc: "HEPA Filter Unit" },
  { id: "router-1", label: "Smart Router", power: 0.02, isOn: false, iconName: "Wifi", desc: "Dual-Band Mesh Uplink" },
];

export default function Home() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [activeMetric, setActiveMetric] = useState<MetricType>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: "info" | "success" | "warning" }[]>([]);

  // Real-time second-by-second tracker states
  const [deviceActiveSeconds, setDeviceActiveSeconds] = useState<Record<string, number>>({});
  const [accumulatedSessionKwh, setAccumulatedSessionKwh] = useState(0);
  const [budgetTarget, setBudgetTarget] = useState<number>(3000);
  const [budgetAlertSent, setBudgetAlertSent] = useState(false);

  const costFactor = user?.costFactor ?? 8.0;
  const carbonFactor = 0.82; // India standard

  // Load budget target and accumulated kWh from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("eco-sync-budget-target");
    if (saved) {
      setBudgetTarget(parseFloat(saved));
    }
    const savedKwh = localStorage.getItem("eco-sync-accumulated-kwh");
    if (savedKwh) {
      setAccumulatedSessionKwh(parseFloat(savedKwh));
    }
  }, []);

  const handleUpdateBudgetTarget = (newTarget: number) => {
    setBudgetTarget(newTarget);
    localStorage.setItem("eco-sync-budget-target", newTarget.toString());
  };



  const [simulatedTime, setSimulatedTime] = useState(() => {
    // Start at current hour, round minutes to nearest 15 for simulation alignment
    const d = new Date();
    d.setMinutes(Math.round(d.getMinutes() / 15) * 15);
    return d;
  });
  const [schedules, setSchedules] = useState<any[]>([]);

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await fetch("/api/forecaster/schedule");
      if (res.ok) {
        const data = await res.json();
        setSchedules(data.schedules || []);
      }
    } catch (err) {
      console.error("Failed to fetch schedules", err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchSchedules();
    }
  }, [user, fetchSchedules]);

  const schedulesRef = useRef(schedules);

  useEffect(() => {
    schedulesRef.current = schedules;
  }, [schedules]);

  // Force-refresh editor cache
  // Scroll to top and show main content when intro finishes
  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  // Skip intro if URL has hash or query parameters requesting to go straight to console
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.location.hash === "#command-center" || window.location.search.includes("skipIntro=true")) {
        setShowIntro(false);
      }
    }
  }, []);

  // Handle scrolling to hash element when intro is skipped or finished
  useEffect(() => {
    if (!showIntro && typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: "auto", block: "start" });
          }, 100);
        }
      }
    }
  }, [showIntro]);

  const [showLogs, setShowLogs] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  // Load active plan from localStorage on mount
  useEffect(() => {
    const savedPlan = localStorage.getItem("eco-sync-active-plan");
    if (savedPlan) {
      setActivePlanId(savedPlan);
    }
  }, []);

  // Save active plan to localStorage on change
  useEffect(() => {
    if (activePlanId) {
      localStorage.setItem("eco-sync-active-plan", activePlanId);
    } else {
      localStorage.removeItem("eco-sync-active-plan");
    }
  }, [activePlanId]);
  const [activeRoutine, setActiveRoutine] = useState<string | null>(null);
  
  const [solarState, setSolarState] = useState<SolarBatteryState>({
    solarGeneration: 0,
    batteryCapacity: 13.5,
    batteryLevel: 13.5,
    batteryChargeRate: 5.0,
    gridDependency: 0,
    useSolarEnergy: false,
  });

  const updateSolarState = useCallback((updates: Partial<SolarBatteryState> | ((prev: SolarBatteryState) => Partial<SolarBatteryState>)) => {
    setSolarState(prev => {
      const nextUpdates = typeof updates === "function" ? updates(prev) : updates;
      const next = { ...prev, ...nextUpdates };
      localStorage.setItem("eco-sync-solar", JSON.stringify(next));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
      }
      return next;
    });
  }, []);

  const [isSolarLoaded, setIsSolarLoaded] = useState(false);
  const [tabId] = useState(() => Math.random().toString(36).substring(2, 11));

  // Sync profile settings with simulator values
  useEffect(() => {
    if (user && isSolarLoaded) {
      updateSolarState(prev => ({
        batteryCapacity: user.batteryCap,
        batteryLevel: Math.min(prev.batteryLevel, user.batteryCap),
      }));
    }
  }, [user, isSolarLoaded, updateSolarState]);

  // Local Storage Backed Simulator Settings
  const [lowBatteryThreshold, setLowBatteryThreshold] = useState(15);
  const [refreshRate, setRefreshRate] = useState("3s");
  const [gridSellback, setGridSellback] = useState(false);

  useEffect(() => {
    function loadLocalSettings() {
      const savedThreshold = localStorage.getItem("eco-sync-low-battery-threshold");
      if (savedThreshold) setLowBatteryThreshold(parseInt(savedThreshold, 10));

      const savedRate = localStorage.getItem("eco-sync-refresh-rate");
      if (savedRate) setRefreshRate(savedRate);

      const savedSellback = localStorage.getItem("eco-sync-grid-sellback");
      if (savedSellback) setGridSellback(savedSellback === "true");
    }

    loadLocalSettings();
    window.addEventListener("eco-sync-settings-updated", loadLocalSettings);
    return () => window.removeEventListener("eco-sync-settings-updated", loadLocalSettings);
  }, []);

  const refreshRateMs = refreshRate === "1s" ? 1000 : refreshRate === "5s" ? 5000 : 3000;

  const [solarHistory, setSolarHistory] = useState<number[]>(new Array(30).fill(0));
  const solarGenRef = useRef(solarState.solarGeneration);
  useEffect(() => {
    solarGenRef.current = solarState.solarGeneration;
  }, [solarState.solarGeneration]);

  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);

  const devicesRef = useRef(devices);
  useEffect(() => {
    devicesRef.current = devices;
  }, [devices]);

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

  // 1-second interval to accumulate energy consumption and active seconds dynamically
  useEffect(() => {
    const activeDevices = devices.filter(d => d.isOn);
    if (activeDevices.length === 0) {
      // Clear when idle to avoid lingering calculations
      setDeviceActiveSeconds({});
      setAccumulatedSessionKwh(0);
      setBudgetAlertSent(false); // Reset alert flag when all devices are turned off
      return;
    }

    const interval = setInterval(() => {
      let planMultiplier = 1.0;
      if (activePlanId && PLAN_CONFIG[activePlanId]) {
        planMultiplier = PLAN_CONFIG[activePlanId].multiplier;
      }

      setDeviceActiveSeconds(prev => {
        const next = { ...prev };
        activeDevices.forEach(d => {
          next[d.id] = (next[d.id] || 0) + 1;
        });
        return next;
      });

      let incrementalKwh = 0;
      activeDevices.forEach(d => {
        incrementalKwh += d.power * (1 / 3600); // 1 sec = 1/3600 of an hour
      });
      incrementalKwh *= planMultiplier;

      setAccumulatedSessionKwh(prev => {
        const newKwh = prev + incrementalKwh;
        localStorage.setItem("eco-sync-accumulated-kwh", newKwh.toString());
        const currentCost = newKwh * costFactor;

        if (currentCost >= budgetTarget && !budgetAlertSent) {
          setBudgetAlertSent(true);

          // 1. Deactivate all devices immediately
          setDevices(prevDevices => prevDevices.map(d => ({ ...d, isOn: false })));

          // 2. Trigger local notification
          const nId = "budget-limit-reached-" + Date.now();
          setNotifications(prevN => [
            { id: nId, message: `BUDGET SHUTDOWN: Target of ₹${budgetTarget} reached! All devices deactivated.`, type: "warning" },
            ...prevN
          ]);
          setTimeout(() => {
            setNotifications(current => current.filter(n => n.id !== nId));
          }, 6000);

          // 3. Append warning log to console history
          const logTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
          setDeviceHistory(h => [{
            id: Date.now(),
            label: "Nexus Core",
            action: "OFF" as const,
            time: logTime,
            details: `Target of ₹${budgetTarget} reached. Hard disconnect activated.`,
            iconName: "ShieldAlert"
          }, ...h].slice(0, 100));

          // 4. Send email notification via endpoint
          fetch("/api/auth/budget-exceeded", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ spent: currentCost, target: budgetTarget }),
          }).catch(err => console.error("Failed to trigger budget exceeded email:", err));
        }

        return newKwh;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [devices, activePlanId, budgetTarget, budgetAlertSent, costFactor]);

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
    setIsSolarLoaded(true);
  }, []);

  // Synchronize solar state with localStorage in real-time
  useEffect(() => {
    const syncSolar = () => {
      const savedSolar = localStorage.getItem("eco-sync-solar");
      if (savedSolar) {
        try {
          const parsed = JSON.parse(savedSolar);
          setSolarState(prev => {
            if (
              prev.solarGeneration === parsed.solarGeneration &&
              prev.batteryCapacity === parsed.batteryCapacity &&
              prev.batteryLevel === parsed.batteryLevel &&
              prev.batteryChargeRate === parsed.batteryChargeRate &&
              prev.gridDependency === parsed.gridDependency
            ) {
              return prev;
            }
            return { ...prev, ...parsed };
          });
        } catch (e) {
          // ignore parsing errors
        }
      }
    };

    window.addEventListener("storage", syncSolar);
    const interval = setInterval(syncSolar, 500);

    return () => {
      window.removeEventListener("storage", syncSolar);
      clearInterval(interval);
    };
  }, []);


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
    localStorage.removeItem("eco-sync-accumulated-kwh");
    setDevices(INITIAL_DEVICES);
    setDeviceActiveSeconds({});
    setAccumulatedSessionKwh(0);
    updateSolarState({
      solarGeneration: 0,
      batteryCapacity: 13.5,
      batteryLevel: 13.5,
      batteryChargeRate: 5.0,
      gridDependency: 0,
      useSolarEnergy: false,
    });
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setDeviceHistory(h => [{ id: Date.now(), label: "System", action: "BOOT", time }, ...h]);
    setActiveRoutine(null);
  };

  const handleRechargeBattery = () => {
    const capacity = user?.batteryCap ?? solarState.batteryCapacity;
    updateSolarState({ batteryLevel: capacity });
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setDeviceHistory(h => [{ id: Date.now(), label: "Battery System", action: "RECHARGE", time, details: `Restored to ${capacity} kWh (100%)`, iconName: "Battery" }, ...h]);
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

  const [totalLoad, setTotalLoad] = useState(0.0);
  const [accumulatedKwh, setAccumulatedKwh] = useState(0);
  const [loadHistory, setLoadHistory] = useState<number[]>(new Array(30).fill(0.0));

  const scrollTarget = useRef<HTMLDivElement>(null);
  const { scrollYProgress: rawScrollProgress } = useScroll({
    target: scrollTarget,
    offset: ["start start", "end end"]
  });

  const scrollYProgress = rawScrollProgress;

  useEffect(() => {
    let load = 0.0;
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

  // Trigger notification when battery level falls below threshold
  useEffect(() => {
    if (solarState.batteryCapacity > 0) {
      const pct = Math.round((solarState.batteryLevel / solarState.batteryCapacity) * 100);
      if (pct <= lowBatteryThreshold && solarState.batteryLevel > 0) {
        setNotifications(prevN => {
          const hasAlert = prevN.some(n => n.message.includes("CRITICAL"));
          if (hasAlert) return prevN;
          const nId = "battery-critical-" + Date.now();
          setTimeout(() => {
            setNotifications(current => current.filter(n => n.id !== nId));
          }, 5000);
          return [{ id: nId, message: `CRITICAL ALERT: BATTERY AT ${pct}%`, type: "warning" }, ...prevN];
        });
      }
    }
  }, [solarState.batteryLevel, solarState.batteryCapacity, lowBatteryThreshold]);

  useEffect(() => {
    if (!isSolarLoaded) return;

    const interval = setInterval(() => {
      // Check leadership
      const savedLeader = localStorage.getItem("eco-sync-sim-leader");
      let isLeader = true;
      if (savedLeader) {
        try {
          const leader = JSON.parse(savedLeader);
          const now = Date.now();
          // If there is another active tab running the simulation, yield to it
          if (leader.tabId !== tabId && (now - leader.timestamp) < Math.max(5000, refreshRateMs * 2)) {
            isLeader = false;
          }
        } catch (e) {}
      }

      if (!isLeader) {
        // We are not the leader. Just move our local graphs/history forward using the current state
        setLoadHistory((prev: number[]) => [...prev.slice(1), totalLoad]);
        setSolarHistory((prev: number[]) => [...prev.slice(1), solarGenRef.current]);
        return;
      }

      // We are the leader, update leadership timestamp
      localStorage.setItem("eco-sync-sim-leader", JSON.stringify({ tabId, timestamp: Date.now() }));

      const SIMULATION_SPEED_MULTIPLIER = 300; // 300x faster than real-time
      const intervalHours = (refreshRateMs * SIMULATION_SPEED_MULTIPLIER) / 3600000;

      // 1. Advance Simulated Time
      const tickDurationMs = refreshRateMs * SIMULATION_SPEED_MULTIPLIER;
      let nextSimTime = new Date();
      setSimulatedTime(prev => {
        nextSimTime = new Date(prev.getTime() + tickDurationMs);
        return nextSimTime;
      });

      // 2. Process Schedules (checking and triggering devices)
      const nextHour = nextSimTime.getHours();
      const nextMin = nextSimTime.getMinutes();
      const currentSimMinutes = nextHour * 60 + nextMin;

      schedulesRef.current.forEach(async (sch) => {
        const [schH, schM] = sch.startTime.split(":").map(Number);
        const startMinutes = schH * 60 + schM;
        const stopMinutes = startMinutes + sch.duration * 60;

        if (sch.status === "pending") {
          // Trigger if we enter the schedule start window
          if (currentSimMinutes >= startMinutes && currentSimMinutes < stopMinutes) {
            sch.status = "running";
            setSchedules(prev => prev.map(s => s.id === sch.id ? { ...s, status: "running" } : s));

            fetch("/api/forecaster/schedule", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: sch.id, status: "running" })
            }).catch(err => console.error("Failed to update schedule status", err));

            setDevices(prev => prev.map(d => {
              if (d.label.toLowerCase() === sch.deviceName.toLowerCase() || d.id === sch.deviceName) {
                if (!d.isOn) {
                  const timeStr = nextSimTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                  setDeviceHistory(h => [{
                    id: Date.now(),
                    label: d.label,
                    action: "ON" as const,
                    time: `${timeStr} (SIM)`,
                    details: `Automated run cycle started • Drawing ${d.power}kW`,
                    iconName: d.iconName
                  }, ...h].slice(0, 100));
                  return { ...d, isOn: true };
                }
              }
              return d;
            }));

            const nId = "sch-start-" + sch.id;
            setNotifications(prev => [{
              id: nId,
              message: `AUTO START: ${sch.deviceName} triggered automatically`,
              type: "success"
            }, ...prev]);
            setTimeout(() => {
              setNotifications(prev => prev.filter(n => n.id !== nId));
            }, 5000);
          }
        } else if (sch.status === "running") {
          // Stop if duration expired
          if (currentSimMinutes >= stopMinutes) {
            sch.status = "completed";
            setSchedules(prev => prev.map(s => s.id === sch.id ? { ...s, status: "completed" } : s));

            fetch("/api/forecaster/schedule", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: sch.id, status: "completed" })
            }).catch(err => console.error("Failed to update schedule status", err));

            setDevices(prev => prev.map(d => {
              if (d.label.toLowerCase() === sch.deviceName.toLowerCase() || d.id === sch.deviceName) {
                if (d.isOn) {
                  const timeStr = nextSimTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                  setDeviceHistory(h => [{
                    id: Date.now(),
                    label: d.label,
                    action: "OFF" as const,
                    time: `${timeStr} (SIM)`,
                    details: `Automated run cycle complete`,
                    iconName: d.iconName
                  }, ...h].slice(0, 100));
                  return { ...d, isOn: false };
                }
              }
              return d;
            }));

            const nId = "sch-stop-" + sch.id;
            setNotifications(prev => [{
              id: nId,
              message: `AUTO STOP: Completed run for ${sch.deviceName}`,
              type: "info"
            }, ...prev]);
            setTimeout(() => {
              setNotifications(prev => prev.filter(n => n.id !== nId));
            }, 5000);
          }
        }
      });

      
      // Load latest solar state from localStorage first to prevent React state stale overrides
      let currentSolar = {
        solarGeneration: 0,
        batteryCapacity: 13.5,
        batteryLevel: 13.5,
        batteryChargeRate: 5.0,
        gridDependency: 0,
        useSolarEnergy: false,
      };
      const savedSolar = localStorage.getItem("eco-sync-solar");
      if (savedSolar) {
        try {
          currentSolar = { ...currentSolar, ...JSON.parse(savedSolar) };
        } catch (e) {}
      }

      console.log("[Eco-Sync Dashboard Sim] Running Step:", {
        isLeader,
        totalLoad,
        solarGeneration: currentSolar.solarGeneration,
        batteryLevel: currentSolar.batteryLevel,
        batteryCapacity: currentSolar.batteryCapacity,
        useSolarEnergy: currentSolar.useSolarEnergy,
      });

      let dependency = totalLoad - currentSolar.solarGeneration;
      let newLevel = currentSolar.batteryLevel;
      
      const chargeEfficiency = 0.95;
      const dischargeEfficiency = 0.95;
      
      if (!currentSolar.useSolarEnergy) {
         // Trade mode: do not discharge to cover device draw, keep fully charged
         newLevel = currentSolar.batteryCapacity;
         dependency = Math.max(0, totalLoad - currentSolar.solarGeneration);
      } else {
         if (dependency < 0) {
            // Solar surplus — charge battery
            const availableChargeKw = Math.min(-dependency, currentSolar.batteryChargeRate);
            const chargeKwh = availableChargeKw * intervalHours;
            
            if (newLevel >= currentSolar.batteryCapacity && gridSellback && totalLoad > 0) {
              const surplusKw = -dependency;
              const surplusKwh = surplusKw * intervalHours;
              
              // Sell surplus to grid automatically
              const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
              setDeviceHistory(h => {
                const lastLog = h[0];
                if (lastLog && lastLog.label === "P2P Smart Sellback") {
                  return h;
                }
                return [{
                  id: Date.now(),
                  label: "P2P Smart Sellback",
                  action: "SELL" as const,
                  time,
                  details: `Exported ${surplusKwh.toFixed(4)} kWh to regional grid`,
                  iconName: "Zap"
                }, ...h].slice(0, 100);
              });
            } else {
              newLevel = Math.min(currentSolar.batteryCapacity, currentSolar.batteryLevel + (chargeKwh * chargeEfficiency));
            }
            dependency = 0; 
         } else if (dependency > 0 && currentSolar.batteryLevel > 0) {
            // discharge battery
            const requiredFromBatteryKw = dependency / dischargeEfficiency;
            const actualDrawKw = Math.min(requiredFromBatteryKw, currentSolar.batteryChargeRate);
            const actualDrawKwh = actualDrawKw * intervalHours;
            
            const finalDrawKwh = Math.min(actualDrawKwh, currentSolar.batteryLevel);
            const energyProvidedKw = (finalDrawKwh / intervalHours) * dischargeEfficiency;
            
            newLevel = currentSolar.batteryLevel - finalDrawKwh;
            dependency = totalLoad - currentSolar.solarGeneration - energyProvidedKw;
         }
      }
      
      const updatedState = {
        batteryLevel: newLevel,
        gridDependency: Math.max(0, dependency)
      };

      console.log("[Eco-Sync Dashboard Sim] Updated State:", updatedState);

      updateSolarState(updatedState);

      const addedKwh = updatedState.gridDependency * intervalHours;
      setAccumulatedKwh((prev: number) => prev + addedKwh);

      // Move graph forward
      setLoadHistory((prev: number[]) => {
         return [...prev.slice(1), totalLoad];
      });
      setSolarHistory((prev: number[]) => [...prev.slice(1), currentSolar.solarGeneration]);
    }, refreshRateMs);

    return () => {
      clearInterval(interval);
      // Clean up leadership on unmount to prevent blocking other views
      const savedLeader = localStorage.getItem("eco-sync-sim-leader");
      if (savedLeader) {
        try {
          const leader = JSON.parse(savedLeader);
          if (leader.tabId === tabId) {
            localStorage.removeItem("eco-sync-sim-leader");
          }
        } catch (e) {}
      }
    };
  }, [totalLoad, refreshRateMs, gridSellback, user, isSolarLoaded, tabId, updateSolarState]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center font-mono text-zinc-600 z-[500]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold">Initializing Connection...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // CENTRAL BILLING & CARBON CALCULATION

  const estimatedMonthlyBill = accumulatedSessionKwh * costFactor;
  const estimatedMonthlyCarbon = accumulatedSessionKwh * carbonFactor;

  return (
    <main className={`relative bg-background text-foreground min-h-screen selection:bg-zinc-800 selection:text-white ${showIntro ? "h-screen overflow-hidden" : ""}`}>
      
      <AnimatePresence>
        {showIntro && (
          <AetherGridIntro onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      {/* Floating Header Actions */}
      <div className="fixed top-6 right-6 z-[150] flex items-center gap-4">
        <UserProfileHeader
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenSettings={() => setShowSettingsDrawer(true)}
        />
      </div>

      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
          />
        )}
        {showSettingsDrawer && (
          <SettingsDrawer
            isOpen={showSettingsDrawer}
            onClose={() => setShowSettingsDrawer(false)}
          />
        )}
        {showAddModal && (
          <AddDeviceModal 
            isOpen={showAddModal} 
            onClose={() => setShowAddModal(false)} 
            onAdd={handleAddDevice} 
          />
        )}
        {activeMetric && (
          <CalculationOverlay 
            type={activeMetric} 
            onClose={() => setActiveMetric(null)} 
            devices={devices}
            activePlanId={activePlanId}
            solarState={solarState}
            gridSellback={gridSellback}
            deviceActiveSeconds={deviceActiveSeconds}
            accumulatedSessionKwh={accumulatedSessionKwh}
          />
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

            <CarbonSchedulerSection
              devices={devices}
              schedules={schedules}
              onRefreshSchedules={fetchSchedules}
              currentSimulatedHour={simulatedTime.getHours()}
              currentSimulatedMinute={simulatedTime.getMinutes()}
              solarState={solarState}
            />

            {/* Commercial Startup Universal Telemetry & MPC Optimization Panel */}
            <div className="px-6 md:px-12">
              <StartupTelemetryPanel />
            </div>


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
                     estimatedMonthlyBill={estimatedMonthlyBill}
                     estimatedMonthlyCarbon={estimatedMonthlyCarbon}
                    />
                 </div>
                 <div className="flex flex-col gap-12 sticky top-32">
                   <SolarPanelManager 
                     solarState={solarState}
                     onUpdateSolarState={updateSolarState}
                     totalLoad={totalLoad}
                     lowBatteryThreshold={lowBatteryThreshold}
                     refreshRateMs={refreshRateMs}
                     onRechargeBattery={handleRechargeBattery}
                   />
                     <BudgetManager 
                       liveSessionCost={estimatedMonthlyBill} 
                       costFactor={costFactor} 
                       budgetTarget={budgetTarget}
                       onUpdateTarget={handleUpdateBudgetTarget}
                     />
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
      <NexusTerminal />
      <BotpressChatbot
        context={{
          name: user.name || "Nexus Explorer",
          email: user.email,
          batteryLevel: solarState.batteryLevel,
          batteryCapacity: solarState.batteryCapacity,
          solarGeneration: solarState.solarGeneration,
          gridDependency: solarState.gridDependency,
          walletBalance: 0.00,
          estimatedMonthlyBill: estimatedMonthlyBill,
          estimatedMonthlyCarbon: estimatedMonthlyCarbon,
          activeDevices: devices.filter(d => d.isOn).map(d => d.label).join(", ") || "None",
        }}
      />
    </main>
  );
}
