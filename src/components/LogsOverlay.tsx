"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Terminal, Activity, Zap, Power, WifiOff } from "lucide-react";

type DeviceLog = { id: number; label: string; action: "ON" | "OFF" | "BOOT"; time: string };

interface LogsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  deviceHistory: DeviceLog[];
}

// Emerald green terminal theme
const G = {
  accent: "#10b981",
  glow: "rgba(16,185,129,0.12)",
  bg: "rgba(16,185,129,0.08)",
  border: "rgba(16,185,129,0.25)",
};

export default function LogsOverlay({ isOpen, onClose, deviceHistory }: LogsOverlayProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] overflow-y-auto flex items-start justify-center p-4 md:p-8 backdrop-blur-xl"
      style={{ background: "rgba(0,8,4,0.88)" }}
    >
      {/* Emerald glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 600px 500px at 50% 50%, ${G.glow}, transparent 70%)` }}
      />

      <motion.div
        initial={{ scale: 0.9, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 40, opacity: 0 }}
        className="w-full max-w-2xl my-auto rounded-3xl sm:rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col min-h-[400px] max-h-[85vh] relative z-10"
        style={{
          background: "#080f0c",
          border: `1px solid ${G.border}`,
          boxShadow: `0 40px 80px -20px ${G.glow}`,
        }}
      >
        {/* Green top strip */}
        <div className="h-1.5 w-full flex-shrink-0" style={{ background: "linear-gradient(90deg, #059669, #10b981)" }} />

        {/* Header */}
        <div
          className="p-6 sm:p-8 border-b flex justify-between items-center flex-shrink-0"
          style={{ borderColor: G.border, background: "rgba(16,185,129,0.04)" }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: G.bg, border: `1px solid ${G.border}`, color: G.accent }}
            >
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Device Activity Log</h3>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: G.accent, opacity: 0.6 }}>
                Full history · Real device time
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Live badge */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest"
              style={{ background: G.bg, border: `1px solid ${G.border}`, color: G.accent }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: G.accent, boxShadow: `0 0 6px ${G.accent}` }}
              />
              Live
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-full transition-all"
              style={{ background: G.bg, border: `1px solid ${G.border}`, color: G.accent }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Count bar */}
        <div
          className="px-8 py-3 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: `1px solid ${G.border}`, background: "rgba(0,0,0,0.2)" }}
        >
          <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: G.accent, opacity: 0.5 }}>
            {deviceHistory.length} event{deviceHistory.length !== 1 ? "s" : ""} recorded
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/20">
            Most recent first
          </span>
        </div>

        {/* Log entries — scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {deviceHistory.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i < 6 ? i * 0.04 : 0 }}
                className="flex items-center gap-4 p-4 rounded-2xl group"
                style={{
                  background:
                    log.action === "ON"
                      ? "rgba(16,185,129,0.06)"
                      : log.action === "BOOT"
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(255,60,60,0.05)",
                  border:
                    log.action === "ON"
                      ? "1px solid rgba(16,185,129,0.15)"
                      : log.action === "BOOT"
                      ? "1px solid rgba(255,255,255,0.06)"
                      : "1px solid rgba(255,60,60,0.15)",
                }}
              >
                {/* Icon */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      log.action === "ON"
                        ? "rgba(16,185,129,0.15)"
                        : log.action === "BOOT"
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(255,60,60,0.12)",
                    color:
                      log.action === "ON"
                        ? G.accent
                        : log.action === "BOOT"
                        ? "rgba(255,255,255,0.3)"
                        : "#f87171",
                  }}
                >
                  <div className="scale-75 sm:scale-100 flex items-center justify-center">
                    {log.action === "ON"  && <Power className="w-4 h-4" />}
                    {log.action === "OFF" && <WifiOff className="w-4 h-4" />}
                    {log.action === "BOOT" && <Activity className="w-4 h-4" />}
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-white truncate">{log.label}</p>
                  <p
                    className="font-mono text-[10px] uppercase tracking-widest"
                    style={{
                      color:
                        log.action === "ON"
                          ? G.accent
                          : log.action === "BOOT"
                          ? "rgba(255,255,255,0.25)"
                          : "#f87171",
                    }}
                  >
                    {log.action === "BOOT" ? "System started" : `Turned ${log.action}`}
                  </p>
                </div>

                {/* Time badge */}
                <div
                  className="flex-shrink-0 font-mono text-[10px] px-3 py-1.5 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  {log.time}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {deviceHistory.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Zap className="w-8 h-8 opacity-20" style={{ color: G.accent }} />
              <p className="text-white/20 font-mono text-xs uppercase tracking-widest">No activity yet — toggle an appliance</p>
            </div>
          )}
        </div>

        {/* Footer status */}
        <div
          className="p-6 flex items-center justify-between flex-shrink-0"
          style={{ borderTop: `1px solid ${G.border}`, background: "rgba(16,185,129,0.03)" }}
        >
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest" style={{ color: G.accent }}>
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: G.accent, boxShadow: `0 0 8px ${G.accent}` }}
            />
            Tracking live
          </div>
          <span className="font-mono text-[10px] text-white/20 uppercase tracking-widest">
            Toggle appliances to log events
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
