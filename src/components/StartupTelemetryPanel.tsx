"use client";

import { useEffect, useState } from "react";
import { Cpu, Zap, DollarSign, Bot, Activity, CheckCircle2, ShieldCheck, ArrowUpRight } from "lucide-react";

export default function StartupTelemetryPanel() {
  const [activeTab, setActiveTab] = useState<"mpc" | "telemetry" | "ledger" | "copilot">("mpc");
  const [mpcData, setMpcData] = useState<any>(null);
  const [copilotMessage, setCopilotMessage] = useState("");
  const [copilotReply, setCopilotReply] = useState<string | null>(null);

  useEffect(() => {
    fetchMpcSchedule();
  }, []);

  const fetchMpcSchedule = async () => {
    try {
      const res = await fetch("/api/forecaster/mpc?lat=28.6139&lon=77.2090");
      if (res.ok) {
        const data = await res.json();
        setMpcData(data);
      }
    } catch (e) {
      console.error("Failed to load smart schedule:", e);
    }
  };

  const handleCopilotSend = async () => {
    if (!copilotMessage.trim()) return;
    const msg = copilotMessage;
    setCopilotMessage("");
    setCopilotReply("Checking your home energy setup...");
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
      setCopilotReply("Sorry, could not connect to AI Assistant right now.");
    }
  };

  const formatActionName = (action: string) => {
    switch (action) {
      case "CHARGE_FROM_SOLAR": return "Solar Charge";
      case "CHARGE_FROM_GRID": return "Cheap Charge";
      case "DISCHARGE": return "Use Battery";
      case "SELL_SURPLUS": return "Sell Power";
      default: return "Standby";
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto my-12 px-4 py-8 bg-zinc-950/80 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.15)] text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              SMART POWER CO-PILOT
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              AUTO-OPTIMIZED
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-200 bg-clip-text text-transparent">
            Smart Battery & Savings Hub
          </h2>
          <p className="text-sm text-zinc-400">
            Automatically schedules battery charging, reduces your power bill, and manages neighborhood energy sales.
          </p>
        </div>

        {/* User-Friendly Tab Switcher */}
        <div className="flex bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab("mpc")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "mpc" ? "bg-emerald-500 text-black font-semibold shadow-lg shadow-emerald-500/25" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> Smart Schedule
          </button>
          <button
            onClick={() => setActiveTab("telemetry")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "telemetry" ? "bg-emerald-500 text-black font-semibold shadow-lg shadow-emerald-500/25" : "text-zinc-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Connected Devices
          </button>
          <button
            onClick={() => setActiveTab("ledger")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "ledger" ? "bg-emerald-500 text-black font-semibold shadow-lg shadow-emerald-500/25" : "text-zinc-400 hover:text-white"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" /> Energy Earnings
          </button>
          <button
            onClick={() => setActiveTab("copilot")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "copilot" ? "bg-emerald-500 text-black font-semibold shadow-lg shadow-emerald-500/25" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Bot className="w-3.5 h-3.5" /> AI Assistant
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="pt-6">
        {/* Tab 1: Smart Schedule */}
        {activeTab === "mpc" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="text-xs text-zinc-400">Live Weather Forecast</div>
                <div className="text-xl font-bold text-amber-400 mt-1">Sunny Skies Expected</div>
                <div className="text-xs text-emerald-400 mt-1">High Solar Production Today</div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="text-xs text-zinc-400">Estimated Daily Savings</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  ₹{mpcData?.totalEstimatedSavingsInr || "142.50"} / day
                </div>
                <div className="text-xs text-zinc-400 mt-1">Saved by avoiding peak grid rates</div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="text-xs text-zinc-400">Smart Battery Mode</div>
                <div className="text-xl font-bold text-cyan-400 mt-1">Auto-Pilot Active</div>
                <div className="text-xs text-zinc-400 mt-1">Adjusts automatically every hour</div>
              </div>
            </div>

            {/* 24 Hour Simple Schedule Timeline */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Today's Recommended Battery & Power Plan
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
                {mpcData?.schedule?.map((item: any, i: number) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-lg border text-center text-xs transition-all ${
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
                    <div className="text-[10px] opacity-80 mt-1">₹{item.tariffInr}/unit</div>
                    <div className="font-medium text-[10px] mt-1 truncate">
                      {formatActionName(item.recommendedAction)}
                    </div>
                  </div>
                )) || (
                  <div className="col-span-12 text-center py-6 text-zinc-500 text-sm">
                    Loading your smart power schedule...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Connected Devices & Trust */}
        {activeTab === "telemetry" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-300 mb-2">Connected Energy Hardware & Verified Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "Solar & Home Battery", brand: "Enphase / Tesla Inverter", status: "Verified Hardware", payout: true, color: "border-emerald-500/40 text-emerald-300 bg-emerald-950/20" },
                { title: "Grid Smart Meter", brand: "Utility Provider Direct Link", status: "Verified Meter", payout: true, color: "border-cyan-500/40 text-cyan-300 bg-cyan-950/20" },
                { title: "Smart Plugs & DIY", brand: "Home Assistant / SmartThings", status: "Local Controls", payout: false, color: "border-zinc-800 text-zinc-300 bg-zinc-900/60" },
              ].map((item, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${item.color}`}>
                  <div className="text-sm font-bold">{item.title}</div>
                  <div className="text-xs text-zinc-400 mt-1">{item.brand}</div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-medium flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {item.status}
                    </span>
                    {item.payout && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-500/30">
                        Cash Earnings Eligible
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400">
              <span className="font-semibold text-white">How Earnings Verification Works: </span>
              To protect your neighborhood energy market, cash payouts require verified data directly from your solar inverter or utility smart meter. Simulated or manual data is used for testing and home automation only.
            </div>
          </div>
        )}

        {/* Tab 3: Energy Earnings */}
        {activeTab === "ledger" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/30">
              <div>
                <h3 className="text-sm font-semibold text-white">Your Solar Sales & Cash Balance</h3>
                <p className="text-xs text-zinc-400">Earned from selling surplus solar power to nearby homes.</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-zinc-400">Withdrawable Cash Balance</div>
                <div className="text-2xl font-bold text-emerald-400">₹1,450.00</div>
              </div>
            </div>

            <div className="divide-y divide-zinc-800 bg-zinc-900/60 rounded-xl border border-zinc-800 overflow-hidden">
              {[
                { type: "Neighborhood Solar Sale", kwh: "4.5 kWh", rate: "₹7.50/unit", total: "+ ₹33.75", status: "Paid to Bank" },
                { type: "Peak Hour Grid Support", kwh: "6.0 kWh", rate: "₹9.00/unit", total: "+ ₹54.00", status: "Paid to Bank" },
                { type: "EV Charger Solar Share", kwh: "8.2 kWh", rate: "₹8.00/unit", total: "+ ₹65.60", status: "Paid to Bank" },
              ].map((tx, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white">{tx.type}</div>
                    <div className="text-zinc-400 mt-0.5">{tx.kwh} exported at {tx.rate}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-400">{tx.total}</div>
                    <div className="text-[10px] text-emerald-500">{tx.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: AI Assistant */}
        {activeTab === "copilot" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-1">
                <Bot className="w-4 h-4" /> EcoSync AI Energy Assistant
              </h3>
              <p className="text-xs text-zinc-400">Ask simple questions about your power bills, battery status, or solar earnings.</p>
            </div>

            {copilotReply && (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 text-xs">
                <div className="font-semibold text-emerald-400 mb-1">⚡ AI Assistant:</div>
                {copilotReply}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={copilotMessage}
                onChange={(e) => setCopilotMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCopilotSend()}
                placeholder="Ask your assistant (e.g. 'How much solar power am I making?' or 'How can I save more money?')..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleCopilotSend}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1"
              >
                Ask <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
