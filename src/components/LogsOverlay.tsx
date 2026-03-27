"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Terminal, Activity, Zap, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

interface LogsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  applianceState: any;
}

export default function LogsOverlay({ isOpen, onClose, applianceState }: LogsOverlayProps) {
  const [logs, setLogs] = useState<{ id: number; msg: string; type: string; time: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      const initialLogs = [
        { id: Date.now(), msg: "SYSTEM INITIALIZED: AETHER CORE V3.5", type: "system", time: new Date().toLocaleTimeString() },
        { id: Date.now() + 1, msg: "GRID CONNECTION STABLE", type: "success", time: new Date().toLocaleTimeString() },
      ];
      setLogs(initialLogs);
    }
  }, [isOpen]);

  useEffect(() => {
    const activeAppliance = Object.entries(applianceState).find(([_, val]) => val)?.[0];
    if (activeAppliance) {
      const newLog = {
        id: Date.now(),
        msg: `LOAD DETECTED: ${activeAppliance.toUpperCase()} COMPONENT ACTIVE`,
        type: "load",
        time: new Date().toLocaleTimeString()
      };
      setLogs(prev => [newLog, ...prev.slice(0, 15)]);
    }
  }, [applianceState]);

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.9, x: 100 }}
        animate={{ scale: 1, x: 0 }}
        className="bg-slate-900 w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden border border-white/10 flex flex-col h-[70vh]"
      >
        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-black/20">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-accent-cyber/20 rounded-2xl flex items-center justify-center text-accent-cyber border border-accent-cyber/30">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">System Console</h3>
                <p className="text-white/30 font-mono text-[9px] uppercase tracking-[0.2em] font-bold">Real-time Event Stream</p>
              </div>
           </div>
           <button onClick={onClose} className="p-4 rounded-full bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all">
             <X className="w-5 h-5" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 font-mono text-sm space-y-6 custom-scrollbar">
           <AnimatePresence mode="popLayout">
             {logs.map((log) => (
               <motion.div 
                 key={log.id}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="flex gap-6 items-start group"
               >
                 <span className="text-white/10 text-[10px] pt-1 whitespace-nowrap">[{log.time}]</span>
                 <div className="flex gap-3 items-center">
                    {log.type === "load" && <Zap className="w-3.5 h-3.5 text-accent-emerald" />}
                    {log.type === "system" && <Activity className="w-3.5 h-3.5 text-accent-cyber" />}
                    {log.type === "success" && <div className="w-1.5 h-1.5 rounded-full bg-accent-emerald" />}
                    <span className={`font-bold tracking-tight uppercase ${
                      log.type === "load" ? "text-accent-emerald" : 
                      log.type === "system" ? "text-accent-cyber" : 
                      "text-white/60"
                    }`}>
                      {log.msg}
                    </span>
                 </div>
               </motion.div>
             ))}
           </AnimatePresence>
        </div>

        <div className="p-10 bg-black/40 border-t border-white/5 flex gap-8">
           <StatusItem icon={<Activity className="w-4 h-4" />} label="Uptime" value="100.0%" />
           <StatusItem icon={<Zap className="w-4 h-4" />} label="Latency" value="2ms" />
           <div className="ml-auto flex items-center gap-2 text-[10px] text-white/20 font-bold uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
              Live Telemetry
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatusItem({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
       <div className="text-white/20">{icon}</div>
       <div>
         <p className="text-white/10 text-[8px] uppercase tracking-widest font-bold">{label}</p>
         <p className="text-white font-mono text-xs font-bold uppercase tracking-tighter">{value}</p>
       </div>
    </div>
  );
}
