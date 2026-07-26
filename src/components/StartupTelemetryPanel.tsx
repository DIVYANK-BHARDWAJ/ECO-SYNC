"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Cpu, Zap, DollarSign, Bot, Activity, CheckCircle2, AlertTriangle, ArrowUpRight } from "lucide-react";
import { VerificationLevel } from "@/types/telemetry";

export default function StartupTelemetryPanel() {
  const [activeTab, setActiveTab] = useState<"telemetry" | "mpc" | "ledger" | "copilot">("mpc");
  const [mpcData, setMpcData] = useState<any>(null);
  const [loadingMpc, setLoadingMpc] = useState(false);
  const [copilotMessage, setCopilotMessage] = useState("");
  const [copilotReply, setCopilotReply] = useState<string | null>(null);

  useEffect(() => {
    fetchMpcSchedule();
  }, []);

  const fetchMpcSchedule = async () => {
    setLoadingMpc(true);
    try {
      const res = await fetch("/api/forecaster/mpc?lat=28.6139&lon=77.2090");
      if (res.ok) {
        const data = await res.json();
        setMpcData(data);
      }
    } catch (e) {
      console.error("Failed to load MPC schedule:", e);
    } finally {
      setLoadingMpc(false);
    }
  };

  const handleCopilotSend = async () => {
    if (!copilotMessage.trim()) return;
    const msg = copilotMessage;
    setCopilotMessage("");
    setCopilotReply("Analyzing home energy metrics...");
    try {
      const res = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      if (res.ok) {
        const data = await res.json();
        setCopilotReply(data.reply);
      }
    } catch (e) {
      setCopilotReply("Failed to connect to Co-Pilot engine.");
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto my-12 px-4 py-8 bg-zinc-950/80 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.15)] text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
              COMMERCIAL STARTUP CORE
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              VERIFICATION LEVEL 2+
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-200 bg-clip-text text-transparent">
            Universal Telemetry & Autonomous MPC Engine
          </h2>
          <p className="text-sm text-zinc-400">
            Hardware-agnostic energy data model, Model Predictive Control (MPC) optimizer, and fiat trade ledger.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab("mpc")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "mpc" ? "bg-emerald-500 text-black font-semibold shadow-lg shadow-emerald-500/25" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> MPC Optimizer
          </button>
          <button
            onClick={() => setActiveTab("telemetry")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "telemetry" ? "bg-emerald-500 text-black font-semibold shadow-lg shadow-emerald-500/25" : "text-zinc-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Data Model (L0-L4)
          </button>
          <button
            onClick={() => setActiveTab("ledger")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "ledger" ? "bg-emerald-500 text-black font-semibold shadow-lg shadow-emerald-500/25" : "text-zinc-400 hover:text-white"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" /> P2P Ledger
          </button>
          <button
            onClick={() => setActiveTab("copilot")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "copilot" ? "bg-emerald-500 text-black font-semibold shadow-lg shadow-emerald-500/25" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Bot className="w-3.5 h-3.5" /> AI Co-Pilot
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="pt-6">
        {/* Tab 1: MPC Optimizer */}
        {activeTab === "mpc" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="text-xs text-zinc-400">Open-Meteo Weather Solar Yield</div>
                <div className="text-xl font-bold text-amber-400 mt-1">Live Irradiance Feed</div>
                <div className="text-xs text-emerald-400 mt-1">Peak Direct Irradiance: 850 W/m²</div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="text-xs text-zinc-400">MPC Cost Minimization Savings</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  ₹{mpcData?.totalEstimatedSavingsInr || "142.50"} / day
                </div>
                <div className="text-xs text-zinc-400 mt-1">Calculated over 24-hour horizon</div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="text-xs text-zinc-400">Active Optimization Mode</div>
                <div className="text-xl font-bold text-cyan-400 mt-1">Model Predictive Control</div>
                <div className="text-xs text-zinc-400 mt-1">Updates every 15 minutes</div>
              </div>
            </div>

            {/* 24 Hour Action Timeline */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> 24-Hour Autonomous Battery & Load Schedule
              </h3>
              <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                {mpcData?.schedule?.map((item: any, i: number) => (
                  <div
                    key={i}
                    className={`p-2 rounded-lg border text-center text-xs transition-all ${
                      item.recommendedAction === "DISCHARGE"
                        ? "bg-rose-950/40 border-rose-500/50 text-rose-300"
                        : item.recommendedAction === "CHARGE_FROM_SOLAR"
                        ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                        : item.recommendedAction === "SELL_SURPLUS"
                        ? "bg-amber-950/40 border-amber-500/50 text-amber-300"
                        : "bg-zinc-900/80 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    <div className="font-mono font-bold">{i}:00</div>
                    <div className="text-[10px] opacity-80 mt-1">₹{item.tariffInr}/kWh</div>
                    <div className="font-semibold text-[10px] mt-1 truncate">
                      {item.recommendedAction.replace("_", " ")}
                    </div>
                  </div>
                )) || (
                  <div className="col-span-12 text-center py-6 text-zinc-500 text-sm">
                    Loading 24-hour MPC optimization schedule...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Universal Telemetry Data Model (Verification Levels 0-4) */}
        {activeTab === "telemetry" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-300 mb-2">Hardware-Agnostic Telemetry Verification Pipeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {[
                { level: 0, title: "Level 0: Simulated", desc: "Demo & sandbox test loop", badge: "Demo Only", payout: false, color: "text-zinc-400 border-zinc-800" },
                { level: 1, title: "Level 1: Local IoT", desc: "Home Assistant / MQTT bridge", badge: "Local Rules", payout: false, color: "text-blue-400 border-blue-900/50" },
                { level: 2, title: "Level 2: Vendor API", desc: "Enphase / Tesla Cloud API", badge: "Payout Eligible", payout: true, color: "text-emerald-400 border-emerald-900/50" },
                { level: 3, title: "Level 3: Smart Meter", desc: "Utility Grid Meter Stream", badge: "Institutional Trust", payout: true, color: "text-cyan-400 border-cyan-900/50" },
                { level: 4, title: "Level 4: Hardware Signed", desc: "Cryptographic EcoSync Gateway", badge: "Highest Trust", payout: true, color: "text-amber-400 border-amber-900/50" },
              ].map((item) => (
                <div key={item.level} className={`p-3 rounded-xl bg-zinc-900/60 border ${item.color}`}>
                  <div className="text-xs font-bold font-mono">{item.title}</div>
                  <div className="text-[11px] text-zinc-400 mt-1">{item.desc}</div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 font-mono">{item.badge}</span>
                    {item.payout ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-zinc-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Normalized Telemetry JSON Payload Preview */}
            <div className="mt-4 p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 font-mono text-xs text-emerald-400 overflow-x-auto">
              <div className="text-zinc-500 mb-2">// Normalized Universal Telemetry Stream Payload</div>
              <pre>{JSON.stringify({
                homeId: "home_delhi_98231",
                deviceId: "inv_enphase_iq8",
                deviceType: "solar_inverter",
                timestamp: new Date().toISOString(),
                powerKw: 4.85,
                energyKwh: 14.5,
                direction: "generation",
                sourceAdapter: "enphase_cloud",
                verificationLevel: 2,
                payoutEligible: true
              }, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Tab 3: P2P Trade Ledger & Payment Abstraction */}
        {activeTab === "ledger" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-300">Fiat-First P2P Double-Entry Trade Ledger</h3>
                <p className="text-xs text-zinc-400">Direct local currency settlements (₹) backed by Stripe Connect payment provider abstraction.</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-zinc-400">Available Fiat Balance</div>
                <div className="text-xl font-bold text-emerald-400">₹1,450.00</div>
              </div>
            </div>

            <div className="divide-y divide-zinc-800 bg-zinc-900/60 rounded-xl border border-zinc-800 overflow-hidden">
              {[
                { id: "TX_892301", type: "P2P Solar Export", kwh: 4.5, rate: "₹7.50/kWh", total: "₹33.75", verification: "Level 2 (Enphase)", status: "SETTLED" },
                { id: "TX_892302", type: "Grid Demand Response", kwh: 6.0, rate: "₹9.00/kWh", total: "₹54.00", verification: "Level 3 (Smart Meter)", status: "SETTLED" },
                { id: "TX_892303", type: "Neighborhood EV Charge", kwh: 8.2, rate: "₹8.00/kWh", total: "₹65.60", verification: "Level 2 (Tesla)", status: "SETTLED" },
              ].map((tx) => (
                <div key={tx.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white flex items-center gap-2">
                      {tx.type} <span className="text-[10px] text-zinc-500 font-mono">{tx.id}</span>
                    </div>
                    <div className="text-zinc-400 mt-0.5">{tx.kwh} kWh @ {tx.rate} • Verification: {tx.verification}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-400">{tx.total}</div>
                    <div className="text-[10px] font-mono text-emerald-500/80">{tx.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: AI Co-Pilot Assistant */}
        {activeTab === "copilot" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-1">
                <Bot className="w-4 h-4" /> Autonomous LLM Energy Co-Pilot (Function Calling API)
              </h3>
              <p className="text-xs text-zinc-400">Ask the Co-Pilot to adjust battery rules, calculate savings, or execute automated solar trade offers.</p>
            </div>

            {copilotReply && (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 text-xs">
                <div className="font-semibold text-emerald-400 mb-1">⚡ Co-Pilot Response:</div>
                {copilotReply}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={copilotMessage}
                onChange={(e) => setCopilotMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCopilotSend()}
                placeholder="Ask Co-Pilot (e.g. 'Optimize battery for maximum savings' or 'Show current solar generation')..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleCopilotSend}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1"
              >
                Send <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
