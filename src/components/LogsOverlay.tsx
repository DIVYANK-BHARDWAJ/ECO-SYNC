"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Terminal, Activity, Zap, Power, WifiOff, Plus, Trash2, ShieldCheck, Database,
  Wind, Snowflake, Tv, Lightbulb, Waves, Search, Cpu, WashingMachine, Wifi, Flame,
  Coffee, Fan, Laptop, Speaker, Microwave, ChefHat, Utensils, Gamepad, Music,
  Thermometer, Monitor, Printer, Camera, Lock, Bell, Sun, Battery, Droplets,
  Smartphone, Scan, Video, Dumbbell, HeartPulse, Plug, Radio, Tablets, Stethoscope,
  Sprout, CloudRain, HardDrive, Tablet, Volume2, Cloud, DoorOpen, LightbulbOff
} from "lucide-react";

export type DeviceLog = { 
  id: number; 
  label: string; 
  action: "ON" | "OFF" | "BOOT" | "REGISTER" | "REMOVED" | "EXEC"; 
  time: string;
  details?: string;
  iconName?: string;
};

interface LogsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  deviceHistory: DeviceLog[];
  onClearLogs?: () => void;
}

// Icons Map for logs
const LOG_ICON_MAP: Record<string, any> = {
  Activity: <Activity className="w-5 h-5" />,
  Wind: <Wind className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  Snowflake: <Snowflake className="w-5 h-5" />,
  Tv: <Tv className="w-5 h-5" />,
  Lightbulb: <Lightbulb className="w-5 h-5" />,
  Waves: <Waves className="w-5 h-5" />,
  Search: <Search className="w-5 h-5" />,
  Cpu: <Cpu className="w-5 h-5" />,
  WashingMachine: <WashingMachine className="w-5 h-5" />,
  Wifi: <Wifi className="w-5 h-5" />,
  Flame: <Flame className="w-5 h-5" />,
  Coffee: <Coffee className="w-5 h-5" />,
  Fan: <Fan className="w-5 h-5" />,
  Laptop: <Laptop className="w-5 h-5" />,
  Speaker: <Speaker className="w-5 h-5" />,
  Microwave: <Microwave className="w-5 h-5" />,
  ChefHat: <ChefHat className="w-5 h-5" />,
  Utensils: <Utensils className="w-5 h-5" />,
  Gamepad: <Gamepad className="w-5 h-5" />,
  Music: <Music className="w-5 h-5" />,
  Thermometer: <Thermometer className="w-5 h-5" />,
  Monitor: <Monitor className="w-5 h-5" />,
  Printer: <Printer className="w-5 h-5" />,
  Camera: <Camera className="w-5 h-5" />,
  Lock: <Lock className="w-5 h-5" />,
  Bell: <Bell className="w-5 h-5" />,
  Sun: <Sun className="w-5 h-5" />,
  Battery: <Battery className="w-5 h-5" />,
  Droplets: <Droplets className="w-5 h-5" />,
  Smartphone: <Smartphone className="w-5 h-5" />,
  Scan: <Scan className="w-5 h-5" />,
  Video: <Video className="w-5 h-5" />,
  Dumbbell: <Dumbbell className="w-5 h-5" />,
  HeartPulse: <HeartPulse className="w-5 h-5" />,
  Plug: <Plug className="w-5 h-5" />,
  Power: <Power className="w-5 h-5" />,
  Radio: <Radio className="w-5 h-5" />,
  Tablets: <Tablets className="w-5 h-5" />,
  Stethoscope: <Stethoscope className="w-5 h-5" />,
  Sprout: <Sprout className="w-5 h-5" />,
  CloudRain: <CloudRain className="w-5 h-5" />,
  HardDrive: <HardDrive className="w-5 h-5" />,
  Tablet: <Tablet className="w-5 h-5" />,
  Volume2: <Volume2 className="w-5 h-5" />,
  Cloud: <Cloud className="w-5 h-5" />,
  DoorOpen: <DoorOpen className="w-5 h-5" />,
  LightbulbOff: <LightbulbOff className="w-5 h-5" />,
};

// Futuristic Cyber Theme
const THEME = {
  accent: "#3b82f6", // Premium Blue
  accentSecondary: "#FFFFFF", // White
  danger: "#ef4444",
  bg: "#09090b", // Zinc 950
  surface: "rgba(24, 24, 27, 0.9)", // Zinc 900 with alpha
  border: "rgba(255, 255, 255, 0.06)",
  glow: "rgba(255, 255, 255, 0.01)",
};

export default function LogsOverlay({ isOpen, onClose, deviceHistory, onClearLogs }: LogsOverlayProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] overflow-hidden flex items-center justify-center p-4 md:p-8 backdrop-blur-md"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)", backgroundSize: "24px 24px" }} />
      
      {/* Cyber Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent-secondary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-3xl h-[85vh] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col relative z-10"
        style={{
          background: THEME.bg,
          boxShadow: `0 0 0 1px ${THEME.border}, 0 20px 50px rgba(0,0,0,0.8)`,
        }}
      >
        {/* Top Header Rail */}
        <div className="h-1 w-full bg-gradient-to-r from-accent-secondary via-accent-primary to-accent-secondary" />

        <div className="p-8 border-b border-white/5 bg-zinc-900/30 flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-accent-secondary/10 border border-accent-secondary/20 flex items-center justify-center relative group">
                <Terminal className="w-7 h-7 text-accent-secondary relative z-10" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Grid <span className="text-accent-secondary">Protocol</span></h3>
                  <div className="px-2 py-0.5 rounded bg-accent-secondary/10 border border-accent-secondary/20 text-[8px] font-black text-accent-secondary uppercase tracking-widest">v4.2.0</div>
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3" /> System Integrity Monitor
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {onClearLogs && deviceHistory.length > 0 && (
                <button
                  onClick={onClearLogs}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-danger hover:bg-danger/10 hover:border-danger/30 transition-all group"
                  title="Wipe Logs"
                >
                  <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-black/40 border border-white/5">
              <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1 font-black">Events</p>
              <p className="text-xl font-black text-white">{deviceHistory.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-white/5">
              <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1 font-black">Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
                <p className="text-xl font-black text-accent-primary uppercase">Active</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-white/5">
              <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1 font-black">Buffer</p>
              <p className="text-xl font-black text-white uppercase">Real-Time</p>
            </div>
          </div>
        </div>

        {/* Logs Stream */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-zinc-950/20">
          <AnimatePresence mode="popLayout" initial={false}>
            {deviceHistory.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
                className="relative flex items-center gap-6 p-5 mb-3 rounded-xl border transition-all hover:bg-white/5 group"
                style={{
                  background: log.action === "ON" || log.action === "REGISTER" 
                    ? "rgba(59, 130, 246, 0.03)" 
                    : log.action === "REMOVED" || log.action === "OFF"
                    ? "rgba(239, 68, 68, 0.02)"
                    : "rgba(255, 255, 255, 0.02)",
                  borderColor: log.action === "ON" || log.action === "REGISTER"
                    ? "rgba(59, 130, 246, 0.1)"
                    : log.action === "REMOVED" || log.action === "OFF"
                    ? "rgba(239, 68, 68, 0.08)"
                    : "rgba(255, 255, 255, 0.04)"
                }}
              >
                {/* Timeline Connector Line */}
                {i < deviceHistory.length - 1 && (
                  <div className="absolute left-[2.75rem] top-full h-3 w-[1px] bg-white/5" />
                )}

                {/* Status Icon with Glow */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 relative transition-transform group-hover:scale-110
                  ${log.action === "ON" || log.action === "REGISTER" ? "bg-accent-primary/10 text-accent-primary border border-accent-primary/20" : 
                    log.action === "REMOVED" || log.action === "OFF" ? "bg-danger/10 text-danger border border-danger/20" : 
                    "bg-white/5 text-white/40 border border-white/10"}`}
                >
                  {log.iconName && LOG_ICON_MAP[log.iconName] ? LOG_ICON_MAP[log.iconName] : (
                    <>
                      {log.action === "ON" && <Power className="w-5 h-5" />}
                      {log.action === "OFF" && <WifiOff className="w-5 h-5" />}
                      {log.action === "BOOT" && <Activity className="w-5 h-5" />}
                      {log.action === "REGISTER" && <Plus className="w-5 h-5" />}
                      {log.action === "REMOVED" && <Trash2 className="w-5 h-5" />}
                    </>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-black text-lg text-white uppercase tracking-tight group-hover:text-accent-secondary transition-colors">
                      {log.label}
                    </p>
                    <span className="font-mono text-[10px] text-white/20 bg-white/5 px-2 py-1 rounded border border-white/5 uppercase">
                      ID: {log.id.toString().slice(-4)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded
                      ${log.action === "ON" ? "bg-accent-primary/10 text-accent-primary" : 
                        log.action === "OFF" ? "bg-danger/10 text-danger" : 
                        log.action === "REGISTER" ? "bg-accent-secondary/10 text-accent-secondary" :
                        log.action === "REMOVED" ? "bg-danger/10 text-danger" :
                        "bg-white/10 text-white/60"}`}
                    >
                      {log.action === "BOOT" ? "Core Initialization" : 
                       log.action === "REGISTER" ? "Device Registered" :
                       log.action === "REMOVED" ? "Decommissioned" :
                       `State: ${log.action}`}
                    </div>
                    {log.details && (
                      <p className="text-[10px] text-white/40 font-medium truncate max-w-[200px]">
                        • {log.details}
                      </p>
                    )}
                  </div>
                </div>

                {/* Timestamp */}
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-white/60 font-mono tracking-tighter">{log.time}</p>
                  <p className="text-[8px] text-white/20 uppercase font-mono tracking-widest mt-0.5">Time_UTC_8</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {deviceHistory.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center mb-6">
                <Database className="w-10 h-10 text-white/10" />
              </div>
              <p className="text-white/40 font-mono text-xs uppercase tracking-[0.4em] font-black">No protocol logs detected</p>
              <p className="text-white/10 text-[9px] mt-2 uppercase tracking-widest">Waiting for grid interaction...</p>
            </div>
          )}
        </div>

        {/* Footer Interaction Bar */}
        <div className="p-6 border-t border-white/5 bg-slate-900/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-accent-secondary animate-ping" />
            <p className="font-mono text-[9px] text-accent-secondary uppercase tracking-widest font-black">Socket Stream: Active</p>
          </div>
          <p className="text-[9px] text-white/20 uppercase tracking-[0.3em] font-bold">
            Eco-Sync Nexus Console v1.0.4
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

