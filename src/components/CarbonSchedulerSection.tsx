"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, Leaf, Zap, Trash2, Loader2, Calendar, 
  ChevronRight, Sparkles, AlertTriangle, CheckCircle,
  Activity, Coins, BatteryCharging
} from "lucide-react";
import { Device, SolarBatteryState } from "@/types/device";
import { useAuth } from "@/context/AuthContext";

interface CarbonSchedulerSectionProps {
  devices: Device[];
  schedules: any[];
  onRefreshSchedules: () => void;
  currentSimulatedHour: number;
  currentSimulatedMinute: number;
  solarState: SolarBatteryState;
}

interface ForecastItem {
  hour: number;
  intensity: number;
  status: "clean" | "moderate" | "peak";
}

export default function CarbonSchedulerSection({ 
  devices, 
  schedules, 
  onRefreshSchedules, 
  currentSimulatedHour, 
  currentSimulatedMinute,
  solarState
}: CarbonSchedulerSectionProps) {
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [loadingForecast, setLoadingForecast] = useState(true);
  const [averageIntensity, setAverageIntensity] = useState(250);
  const [bestHour, setBestHour] = useState(3);
  
  // Scheduler state
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [scheduledHour, setScheduledHour] = useState(currentSimulatedHour);
  const [duration, setDuration] = useState(2); // hours
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { user } = useAuth();
  const batteryCap = solarState.batteryCapacity;
  const costFactor = user?.costFactor ?? 8.0;

  // Simulated live market price for trade opportunity calculations
  const [marketPrice, setMarketPrice] = useState(0.18);

  useEffect(() => {
    const basePrice = 0.15 * (costFactor / 8.0);
    const demandPremium = (solarState.gridDependency / 100) * 0.15;
    const fluctuation = (Math.random() - 0.5) * 0.01;
    setMarketPrice(Math.max(0.02, Math.min(2.00, basePrice + demandPremium + fluctuation)));
  }, [costFactor, solarState.gridDependency]);

  // Fetch forecast data
  useEffect(() => {
    async function fetchForecast() {
      try {
        const res = await fetch("/api/forecaster/grid");
        if (res.ok) {
          const data = await res.json();
          setForecast(data.forecast || []);
          setAverageIntensity(data.averageIntensity || 250);
          setBestHour(data.bestHour || 3);
        }
      } catch (err) {
        console.error("Failed to load carbon forecast", err);
      } finally {
        setLoadingForecast(false);
      }
    }
    fetchForecast();
  }, []);

  // Update selected hour slider when current simulated hour changes (only if untouched)
  useEffect(() => {
    setScheduledHour(currentSimulatedHour);
  }, [currentSimulatedHour]);

  // Handle default device selection on load
  useEffect(() => {
    if (devices.length > 0 && !selectedDeviceId) {
      // Find high draw device (EV Charger or HVAC)
      const ev = devices.find(d => d.id.includes("ev"));
      const hvac = devices.find(d => d.id.includes("hvac"));
      setSelectedDeviceId(ev?.id || hvac?.id || devices[0].id);
    }
  }, [devices, selectedDeviceId]);

  const selectedDevice = devices.find(d => d.id === selectedDeviceId);

  // Carbon Math
  const intensityAtSelectedHour = forecast.find(f => f.hour === scheduledHour)?.intensity ?? 250;
  const powerKw = selectedDevice ? selectedDevice.power : 1.5;
  const carbonFootprintGrams = powerKw * duration * intensityAtSelectedHour;
  
  // Calculate savings compared to running at the worst hour
  const maxIntensity = forecast.length > 0 ? Math.max(...forecast.map(f => f.intensity)) : 520;
  const worstHourFootprintGrams = powerKw * duration * maxIntensity;
  const savingsKg = Math.max(0, (worstHourFootprintGrams - carbonFootprintGrams) / 1000);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice) return;
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    const padZero = (n: number) => n.toString().padStart(2, "0");
    const startTimeStr = `${padZero(scheduledHour)}:00`;

    try {
      const res = await fetch("/api/forecaster/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceName: selectedDevice.label,
          powerDraw: selectedDevice.power,
          startTime: startTimeStr,
          duration: Number(duration),
        })
      });

      if (res.ok) {
        setSuccessMsg(`Successfully scheduled ${selectedDevice.label} for ${startTimeStr}`);
        onRefreshSchedules();
        setTimeout(() => setSuccessMsg(""), 5000);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to schedule appliance");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      const res = await fetch(`/api/forecaster/schedule?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onRefreshSchedules();
      }
    } catch (err) {
      console.error("Failed to delete schedule", err);
    }
  };

  // SVG Chart Dimensions
  const chartWidth = 500;
  const chartHeight = 150;
  const paddingX = 20;
  const paddingY = 15;

  const getPointsPath = () => {
    if (forecast.length === 0) return "";
    const minVal = 50;
    const maxVal = 550;
    const valRange = maxVal - minVal;
    
    return forecast.map((f, i) => {
      const x = paddingX + (i / (forecast.length - 1)) * (chartWidth - paddingX * 2);
      const pct = (f.intensity - minVal) / valRange;
      const y = chartHeight - paddingY - pct * (chartHeight - paddingY * 2);
      return `${x},${y}`;
    }).join(" ");
  };

  const getAreaPath = () => {
    const points = getPointsPath();
    if (!points) return "";
    return `${points} ${chartWidth - paddingX},${chartHeight - paddingY} ${paddingX},${chartHeight - paddingY}`;
  };

  const getCurrentHourX = () => {
    if (forecast.length === 0) return paddingX;
    const index = currentSimulatedHour + currentSimulatedMinute / 60;
    return paddingX + (index / 23) * (chartWidth - paddingX * 2);
  };

  const getHourColorClass = (intensity: number) => {
    if (intensity < 140) return "text-emerald-400";
    if (intensity > 340) return "text-red-400 animate-pulse";
    return "text-blue-400";
  };

  return (
    <section className="bg-[#09090b] py-24 border-t border-white/5 px-6 sm:px-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-accent-tertiary/5 blur-[100px] rounded-full" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Title */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-2 h-2 rounded-full bg-accent-tertiary animate-pulse" />
            <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.4em] font-black">Carbon Optimizer V1.0</p>
          </div>
          <h2 className="text-5xl sm:text-7xl font-black text-white tracking-tighter uppercase mb-4 font-heading">
            Eco <span className="text-accent-tertiary">Scheduler</span>
          </h2>
          <p className="text-zinc-500 text-sm max-w-2xl">
            Coordinate heavy appliance cycles around regional grid supply. Running devices during low-carbon peaks balances local microgrids and dramatically shrinks domestic footprint.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          
          {/* Left: Forecast Chart */}
          <div className="flex flex-col p-8 rounded-2xl bg-[#121214] border border-white/5 shadow-2xl relative overflow-hidden justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-tertiary/5 blur-[50px] rounded-full pointer-events-none" />
            
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <p className="text-zinc-400 font-mono text-[10px] uppercase tracking-wider">Grid Carbon Intensity (24h Forecast)</p>
                <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] uppercase tracking-wider">
                  <Leaf className="w-3 h-3" />
                  Eco-Friendly
                </div>
              </div>
              <h3 className="text-3xl font-black uppercase text-white font-heading">
                Grid Pulse: <span className={getHourColorClass(intensityAtSelectedHour)}>
                  {intensityAtSelectedHour} <span className="text-xs text-zinc-500 font-normal">gCO2/kWh</span>
                </span>
              </h3>
            </div>

            {/* SVG Plot */}
            <div className="relative my-6 border-b border-white/5 pb-4">
              {loadingForecast ? (
                <div className="h-[150px] flex items-center justify-center font-mono text-zinc-600 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin mr-3 text-accent-tertiary" />
                  ANALYZING REGIONAL GRID DATA...
                </div>
              ) : (
                <div className="w-full overflow-hidden">
                  <svg 
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                    className="w-full h-auto overflow-visible"
                  >
                    <defs>
                      <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent-tertiary)" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="var(--accent-tertiary)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
                    <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.02)" strokeDasharray="3" />
                    <line x1={paddingX} y1={chartHeight/2} x2={chartWidth - paddingX} y2={chartHeight/2} stroke="rgba(255,255,255,0.02)" strokeDasharray="3" />

                    {/* Gradient Fill under spline */}
                    {forecast.length > 0 && (
                      <polygon points={getAreaPath()} fill="url(#gradient-area)" />
                    )}

                    {/* Forecast Spline Line */}
                    {forecast.length > 0 && (
                      <polyline
                        fill="none"
                        stroke="var(--accent-tertiary)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={getPointsPath()}
                        className="opacity-80"
                      />
                    )}

                    {/* Current Simulated Time Vertical Indicator */}
                    <line
                      x1={getCurrentHourX()}
                      y1={paddingY}
                      x2={getCurrentHourX()}
                      y2={chartHeight - paddingY}
                      stroke="var(--accent-secondary)"
                      strokeWidth="2"
                      strokeDasharray="4"
                      className="animate-[pulse_2s_infinite]"
                    />
                    
                    {/* Circle tracker at current hour intersection */}
                    {forecast.length > 0 && (
                      <circle
                        cx={getCurrentHourX()}
                        cy={
                          chartHeight - paddingY - 
                          ((forecast[Math.min(23, Math.floor(currentSimulatedHour))].intensity - 50) / 500) * 
                          (chartHeight - paddingY * 2)
                        }
                        r="5"
                        fill="var(--accent-secondary)"
                      />
                    )}
                  </svg>
                  
                  {/* X Axis Labels */}
                  <div className="flex justify-between font-mono text-[9px] text-zinc-500 mt-2 px-1">
                    <span>12 AM</span>
                    <span>6 AM</span>
                    <span>12 PM</span>
                    <span>6 PM</span>
                    <span>11 PM</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats Panel */}
            <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6 mt-4">
              <div>
                <p className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider">Optimal Slot</p>
                <p className="text-white text-lg font-black font-heading">
                  {bestHour.toString().padStart(2, "0")}:00 <span className="text-[10px] text-zinc-400 font-normal">AM</span>
                </p>
              </div>
              <div>
                <p className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider">Grid Average</p>
                <p className="text-white text-lg font-black font-heading">
                  {averageIntensity} <span className="text-[10px] text-zinc-400 font-mono font-normal">g/kWh</span>
                </p>
              </div>
              <div>
                <p className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider">Sim Clock</p>
                <p className="text-accent-secondary text-lg font-black font-mono">
                  {currentSimulatedHour.toString().padStart(2, "0")}:{currentSimulatedMinute.toString().padStart(2, "0")}
                </p>
              </div>
            </div>

          </div>

          {/* Right: Scheduler form and Visual hour select */}
          <div className="flex flex-col p-8 rounded-2xl bg-[#121214] border border-white/5 shadow-2xl justify-between">
            <form onSubmit={handleCreateSchedule} className="space-y-6 flex-1">
              <div>
                <h4 className="text-xl font-black uppercase text-white font-heading mb-1">Schedule Smart Routine</h4>
                <p className="text-zinc-500 text-[11px] uppercase tracking-wider font-mono">Assign heavy load targets to cleanest hours</p>
              </div>

              {/* Form Selects */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-zinc-400 text-[10px] uppercase font-mono tracking-widest font-bold">Select Appliance Interface</label>
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/5 p-4 rounded-xl text-white text-xs outline-none focus:border-accent-tertiary transition-all"
                  >
                    {devices.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label} (Rating: {d.power} kW draw)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration Controller */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-zinc-400 text-[10px] uppercase font-mono tracking-widest font-bold">Run Duration</label>
                    <span className="text-accent-tertiary font-mono font-bold text-xs bg-accent-tertiary/10 border border-accent-tertiary/20 px-2.5 py-1 rounded">
                      [ {duration.toFixed(1)} Hrs ]
                    </span>
                  </div>

                  {/* Preset Duration Cards */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { val: 1.0, label: "Flash", desc: "1h cycle", icon: Zap },
                      { val: 2.0, label: "Standard", desc: "2h cycle", icon: Clock },
                      { val: 4.0, label: "Deep", desc: "4h charge", icon: BatteryCharging },
                      { val: 6.0, label: "Industrial", desc: "6h draw", icon: Activity },
                    ].map((preset) => {
                      const isPresetSelected = duration === preset.val;
                      const Icon = preset.icon;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setDuration(preset.val)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            isPresetSelected
                              ? "bg-accent-tertiary/10 border-accent-tertiary text-white shadow-[0_0_12px_rgba(20,184,166,0.18)]"
                              : "bg-zinc-950 border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/10 hover:bg-zinc-900/40"
                          }`}
                        >
                          <Icon className={`w-4 h-4 mb-1.5 ${isPresetSelected ? "text-accent-tertiary" : "text-zinc-500"}`} />
                          <span className="text-[10px] font-black uppercase font-heading tracking-wider">{preset.label}</span>
                          <span className="text-[8px] text-zinc-500 font-mono mt-0.5">{preset.desc}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Fine-Tuning Range Slider */}
                  <div className="space-y-1">
                    <input
                      type="range"
                      min="0.5"
                      max="12"
                      step="0.5"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full accent-accent-tertiary cursor-pointer bg-zinc-900 rounded-lg appearance-none h-1.5"
                    />
                    <div className="flex justify-between text-[8px] font-mono text-zinc-600">
                      <span>0.5 Hrs Min</span>
                      <span>6.0 Hrs</span>
                      <span>12.0 Hrs Max</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Slider Selection */}
              <div className="space-y-3 bg-zinc-950/40 p-5 rounded-xl border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-[10px] uppercase font-mono tracking-widest font-bold">Target Start Hour</span>
                  <span className="text-accent-tertiary font-mono font-bold text-xs">
                    {scheduledHour.toString().padStart(2, "0")}:00
                  </span>
                </div>
                
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={scheduledHour}
                  onChange={(e) => setScheduledHour(Number(e.target.value))}
                  className="w-full accent-accent-tertiary cursor-pointer bg-zinc-800 rounded-lg appearance-none h-1"
                />
                
                <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                  <span>Midnight</span>
                  <span>Noon</span>
                  <span>11 PM</span>
                </div>
              </div>

              {/* System Impact & Trade Diagnostic Panel */}
              <div className="bg-zinc-950 border border-white/5 rounded-xl p-5 space-y-4 shadow-inner">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
                  <Activity className="w-4 h-4 text-accent-tertiary" />
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">System Impact & Trade Diagnostics</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Energy Consumed Card */}
                  <div className="bg-white/2 border border-white/5 rounded-lg p-3">
                    <p className="text-zinc-500 font-mono text-[8px] uppercase tracking-wider mb-1">Total Consumption</p>
                    <p className="text-white text-lg font-black font-heading">
                      {(powerKw * duration).toFixed(1)} <span className="text-[10px] text-zinc-500 font-normal">kWh</span>
                    </p>
                    <p className="text-[8px] text-zinc-600 font-mono">
                      Rating: {powerKw.toFixed(1)} kW × {duration.toFixed(1)} h
                    </p>
                  </div>

                  {/* Deferred Trade Opportunity Card */}
                  <div className="bg-white/2 border border-white/5 rounded-lg p-3">
                    <p className="text-zinc-500 font-mono text-[8px] uppercase tracking-wider mb-1">Deferred Trade Yield</p>
                    <p className="text-accent-secondary text-lg font-black font-mono flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" />
                      +{((powerKw * duration) * marketPrice).toFixed(2)}
                    </p>
                    <p className="text-[8px] text-zinc-600 font-mono">
                      Est. Rate: {marketPrice.toFixed(3)} ECO/kWh
                    </p>
                  </div>
                </div>

                {/* Battery capacity progress bar */}
                <div className="space-y-1.5 bg-white/2 border border-white/5 rounded-lg p-3">
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className="text-zinc-500 uppercase tracking-wider font-bold">Storage Draw Allocation</span>
                    <span className={`font-bold ${
                      (powerKw * duration) > batteryCap ? "text-red-400 animate-pulse" : "text-accent-tertiary"
                    }`}>
                      {((powerKw * duration) / batteryCap * 100).toFixed(0)}% of Stored Capacity
                    </span>
                  </div>
                  
                  {/* Visual battery bar */}
                  <div className="w-full h-2.5 bg-zinc-900 border border-white/5 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        (powerKw * duration) > batteryCap 
                          ? "bg-gradient-to-r from-red-600 to-amber-500" 
                          : "bg-gradient-to-r from-accent-tertiary to-emerald-400"
                      }`}
                      style={{ width: `${Math.min(100, ((powerKw * duration) / batteryCap * 100))}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[8px] font-mono text-zinc-600">
                    <span>Capacity: {batteryCap.toFixed(1)} kWh</span>
                    { (powerKw * duration) > batteryCap && (
                      <span className="text-red-400 font-bold flex items-center gap-1 uppercase tracking-wide">
                        <AlertTriangle className="w-3 h-3" /> Overdraw +{((powerKw * duration) - batteryCap).toFixed(1)} kWh (Grid dependency)
                      </span>
                    )}
                  </div>
                </div>

                {/* Carbon Savings Summary */}
                <div className="flex items-start gap-2 text-[10px] text-zinc-400 leading-snug bg-accent-tertiary/5 border border-accent-tertiary/10 p-3.5 rounded-lg">
                  <Sparkles className="w-4 h-4 text-accent-tertiary shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold text-white uppercase tracking-wider">Carbon Optimization Output:</span> Saves <span className="text-accent-tertiary font-bold font-mono">{savingsKg.toFixed(2)} kg</span> of CO2 emission compared to worst grid hour peak (Offset: {carbonFootprintGrams.toFixed(0)}g vs {worstHourFootprintGrams.toFixed(0)}g).
                  </div>
                </div>
              </div>

              {/* Status messages */}
              {successMsg && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}
              {errorMsg && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Trigger */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-accent-tertiary hover:bg-accent-tertiary/80 text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    SCHEDULING ROUTINE...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    Commit Scheduled Cycle
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Panel: Queue List */}
        <div className="mt-12 p-8 rounded-2xl bg-[#121214] border border-white/5 shadow-2xl">
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
            <div>
              <h4 className="text-2xl font-black uppercase text-white font-heading">Automated Run Queue</h4>
              <p className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider">Active schedules in the microgrid database</p>
            </div>
            <div className="text-zinc-500 font-mono text-xs uppercase">
              Total Queue: <span className="text-white font-bold">{schedules.length}</span>
            </div>
          </div>

          {schedules.length === 0 ? (
            <div className="py-12 text-center text-zinc-600 font-mono text-xs border border-dashed border-white/5 rounded-xl">
              QUEUE VACANT. DEPLOY HEAVY LOADS ABOVE TO AUTOSCHEDULE RUNS.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-zinc-500 uppercase tracking-widest text-[9px] font-bold">
                    <th className="py-4">Appliance</th>
                    <th className="py-4">Load Rating</th>
                    <th className="py-4">Start Slot</th>
                    <th className="py-4">Duration</th>
                    <th className="py-4">Status</th>
                    <th className="py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  {schedules.map((schedule) => (
                    <tr key={schedule.id} className="hover:bg-white/2 transition-colors">
                      <td className="py-4 font-black uppercase text-white font-heading text-sm">{schedule.deviceName}</td>
                      <td className="py-4">{schedule.powerDraw} kW</td>
                      <td className="py-4 text-accent-tertiary font-bold">{schedule.startTime}</td>
                      <td className="py-4">{schedule.duration} Hrs</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider font-bold ${
                          schedule.status === "running" ? "bg-accent-secondary/15 text-accent-secondary border border-accent-secondary/20" :
                          schedule.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          schedule.status === "cancelled" ? "bg-zinc-800 text-zinc-400 border border-white/5" :
                          "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {schedule.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500 text-white/40 transition-all"
                          title="Cancel Schedule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
