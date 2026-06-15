"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, Volume2, VolumeX, Trash2, Zap, Play, 
  ChevronDown, ChevronUp, Loader2, RefreshCw, AlertTriangle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type SystemNotification = {
  id: string;
  message: string;
  createdAt: string;
};

export default function NexusTerminal() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [flashOnNew, setFlashOnNew] = useState(false);

  const prevNotificationsRef = useRef<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Play a cyberpunk synth alert sound using Web Audio API
  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(330, audioCtx.currentTime + 0.25); // Ramp down to E4

      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
      console.warn("Failed to play retro synthesizer alert:", e);
    }
  };

  // Fetch notifications
  const fetchNotifications = async (isFirstLoad = false) => {
    if (!user) return;
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        const list: SystemNotification[] = data.notifications || [];
        setNotifications(list);

        // Check if there are any new notification IDs that weren't in the list before
        const currentIds = list.map(n => n.id);
        const prevIds = prevNotificationsRef.current;

        if (!isFirstLoad && prevIds.length > 0) {
          const hasNew = currentIds.some(id => !prevIds.includes(id));
          if (hasNew) {
            playAlertSound();
            setFlashOnNew(true);
            setTimeout(() => setFlashOnNew(false), 1000);
            
            // If minimized, auto-open or flash indicator
            if (!isOpen) {
              setIsOpen(true);
            }
          }
        }

        prevNotificationsRef.current = currentIds;
      }
    } catch (err) {
      console.error("Failed to sync terminal notifications:", err);
    }
  };

  // Poll for notifications
  useEffect(() => {
    if (user) {
      // Load initially
      fetchNotifications(true);

      // Set up polling interval every 3 seconds
      pollIntervalRef.current = setInterval(() => {
        fetchNotifications(false);
      }, 3000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [user, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom on new notification
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [notifications, isOpen]);

  // Wipe all notification logs
  const handleClearLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", { method: "DELETE" });
      if (res.ok) {
        setNotifications([]);
        prevNotificationsRef.current = [];
      }
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger test notification
  const handleSendTest = async () => {
    setIsSendingTest(true);
    try {
      await fetch("/api/auth/test-notify", { method: "POST" });
      // Trigger a quick fetch after posting the test notification
      setTimeout(() => fetchNotifications(false), 500);
    } catch (err) {
      console.error("Failed to trigger test notification:", err);
    } finally {
      setIsSendingTest(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[180] font-mono">
      <AnimatePresence>
        {!isOpen ? (
          // Minimised Floating Command FAB
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className={`flex items-center gap-2 px-4 py-3 bg-zinc-950 border border-emerald-500/40 text-emerald-400 rounded-xl hover:bg-zinc-900 transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] duration-300 relative group cursor-pointer ${
              flashOnNew ? "border-emerald-400 bg-emerald-950/20 scale-105 animate-pulse" : ""
            }`}
          >
            {/* Blinking notification dot */}
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            )}
            <Terminal className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase font-black tracking-widest font-heading">
              Nexus Terminal {notifications.length > 0 ? `(${notifications.length})` : ""}
            </span>
          </motion.button>
        ) : (
          // Maximised Terminal Box
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            className={`w-full max-w-sm sm:max-w-md bg-zinc-950 border rounded-2xl flex flex-col shadow-[0_15px_40px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 ${
              flashOnNew ? "border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.25)]" : "border-zinc-800"
            }`}
          >
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/40 border-b border-zinc-900">
              <div className="flex items-center gap-2.5 text-emerald-500">
                <Terminal className="w-4 h-4 animate-pulse" />
                <h4 className="text-[10px] font-black uppercase tracking-widest font-heading">
                  Nexus Uplink Terminal v1.0.0
                </h4>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Audio Toggle */}
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1.5 rounded border border-zinc-800/80 text-zinc-500 hover:text-zinc-300 transition-colors hover:bg-zinc-900 cursor-pointer"
                  title={soundEnabled ? "Mute alert audio" : "Unmute alert audio"}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
                {/* Collapse button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded border border-zinc-800/80 text-zinc-500 hover:text-zinc-300 transition-colors hover:bg-zinc-900 cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* CRT Phosphor Scanline Overlay */}
            <div className="relative flex-1 flex flex-col bg-[#050507] min-h-[220px] max-h-[300px]">
              {/* Scanlines Effect */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-gradient-to-b from-transparent via-emerald-500 to-transparent bg-[length:100%_4px]" />
              
              {/* Message History Container */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar select-text"
              >
                {notifications.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-10 text-center opacity-40">
                    <Zap className="w-8 h-8 text-zinc-700 animate-pulse mb-3" />
                    <p className="text-[9px] uppercase tracking-widest text-zinc-500">No transmissions caught in grid</p>
                    <p className="text-[8px] uppercase tracking-wider text-zinc-600 mt-1">Uplink listening for grid changes...</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const localTime = new Date(notif.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit"
                    });
                    return (
                      <div key={notif.id} className="space-y-1 group">
                        <div className="flex items-center justify-between text-[8px] text-zinc-500">
                          <span className="text-emerald-500 font-bold">⚡ NEXUS PROTOCOL ALERT</span>
                          <span>{localTime} (SIM)</span>
                        </div>
                        <pre className="font-mono text-[9px] leading-tight text-emerald-400 bg-black/90 p-3 rounded-lg border border-emerald-950/80 whitespace-pre overflow-x-auto shadow-[inset_0_0_10px_rgba(16,185,129,0.08)]">
                          {notif.message}
                        </pre>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Terminal Control Actions Bar */}
            <div className="px-4 py-3 bg-zinc-900/20 border-t border-zinc-900 flex justify-between gap-3 shrink-0">
              <button
                onClick={handleSendTest}
                disabled={isSendingTest}
                className="flex-1 py-2 px-3 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 rounded-xl transition-all text-[9px] uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer active:scale-95"
              >
                {isSendingTest ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Play className="w-3 h-3 text-emerald-500" />
                )}
                Send Test Alert
              </button>

              <button
                onClick={handleClearLogs}
                disabled={loading || notifications.length === 0}
                className="py-2 px-3 border border-zinc-800 hover:border-red-900/50 text-zinc-500 hover:text-red-400 hover:bg-red-950/10 rounded-xl transition-all text-[9px] uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 disabled:opacity-30 cursor-pointer active:scale-95"
                title="Wipe Terminal Logs"
              >
                <Trash2 className="w-3 h-3" />
                Clear Buffer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
