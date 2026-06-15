"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  X, User, ShieldCheck, Sun, Moon, Laptop, Loader2, Cpu, 
  BatteryCharging, RefreshCw, Zap, ShieldAlert, Check, Smartphone 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { getOtpMessage, getTimerMessage, getDeviceMessage, getTradeMessage, MessageStyle } from "@/lib/message-templates";

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  "/avatars/monkey.png",
  "/avatars/cat.png",
  "/avatars/panda.png",
  "/avatars/fox.png",
  "/avatars/robot.png",
  "/avatars/alien.png",
];

export default function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const { user, updateProfile } = useAuth();
  const { setThemeMode } = useTheme();
  
  // Section 1: Profile Identity State
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  // Section 2: System Settings State
  const [themeMode, setThemeModeState] = useState<"dark" | "light" | "system">("system");
  const [costFactor, setCostFactor] = useState(8.0);
  const [batteryCap, setBatteryCap] = useState(13.5);
  
  // Cyberpunk Message Styles state
  const [messageStyle, setMessageStyle] = useState<MessageStyle>("random");
  const [previewTab, setPreviewTab] = useState<"otp" | "timer" | "trade">("trade");
  
  // New Simulator Settings (Local Storage backed)
  const [lowBatteryThreshold, setLowBatteryThreshold] = useState(15);
  const [refreshRate, setRefreshRate] = useState("3s");
  const [gridSellback, setGridSellback] = useState(false);
  
  // Save Feedback & Indicators
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [systemSyncMessage, setSystemSyncMessage] = useState("");

  // Sync state with user data
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setAvatarUrl(user.avatarUrl || "/avatars/nexus-default.png");
      setThemeModeState(user.themeMode || "system");
      setCostFactor(user.costFactor ?? 8.0);
      setBatteryCap(user.batteryCap ?? 13.5);
      setMessageStyle((user.messageStyle as MessageStyle) || "random");
    }
  }, [user, isOpen]);

  // Load new simulator settings from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedThreshold = localStorage.getItem("eco-sync-low-battery-threshold");
      if (savedThreshold) setLowBatteryThreshold(parseInt(savedThreshold, 10));

      const savedRate = localStorage.getItem("eco-sync-refresh-rate");
      if (savedRate) setRefreshRate(savedRate);

      const savedSellback = localStorage.getItem("eco-sync-grid-sellback");
      if (savedSellback) setGridSellback(savedSellback === "true");
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  // Save Identity Profile (manual)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage("");

    try {
      await updateProfile({
        name,
        bio,
        avatarUrl,
      });
      setProfileMessage("Identity Profile synchronized!");
      setTimeout(() => setProfileMessage(""), 3000);
    } catch (err: any) {
      console.error(err);
      setProfileMessage("Failed to update profile settings.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Instant updates logic for DB settings
  const triggerSystemSyncIndicator = () => {
    setSystemSyncMessage("Config applied...");
    setTimeout(() => setSystemSyncMessage(""), 2000);
  };

  const handleThemeChange = async (mode: "dark" | "light" | "system") => {
    setThemeModeState(mode);
    // Apply the theme immediately to the DOM via ThemeContext
    setThemeMode(mode);
    triggerSystemSyncIndicator();
    try {
      await updateProfile({ themeMode: mode });
    } catch (err) {
      console.error("Theme sync failed", err);
    }
  };

  // Alerts go to the in-app terminal console dynamically

  const handleCostFactorRelease = async () => {
    triggerSystemSyncIndicator();
    try {
      await updateProfile({ costFactor });
    } catch (err) {
      console.error("Cost multiplier sync failed", err);
    }
  };

  const handleBatteryCapRelease = async () => {
    triggerSystemSyncIndicator();
    try {
      await updateProfile({ batteryCap });
    } catch (err) {
      console.error("Battery capacity sync failed", err);
    }
  };

  const handleMessageStyleChange = async (style: MessageStyle) => {
    setMessageStyle(style);
    triggerSystemSyncIndicator();
    try {
      await updateProfile({ messageStyle: style });
    } catch (err) {
      console.error("Message style sync failed", err);
    }
  };

  // Instant updates for localStorage settings
  const handleLowBatteryThresholdRelease = (val: number) => {
    localStorage.setItem("eco-sync-low-battery-threshold", val.toString());
    window.dispatchEvent(new Event("eco-sync-settings-updated"));
    triggerSystemSyncIndicator();
  };

  const handleRefreshRateChange = (val: string) => {
    setRefreshRate(val);
    localStorage.setItem("eco-sync-refresh-rate", val);
    window.dispatchEvent(new Event("eco-sync-settings-updated"));
    triggerSystemSyncIndicator();
  };

  const handleGridSellbackToggle = () => {
    const nextVal = !gridSellback;
    setGridSellback(nextVal);
    localStorage.setItem("eco-sync-grid-sellback", nextVal.toString());
    window.dispatchEvent(new Event("eco-sync-settings-updated"));
    triggerSystemSyncIndicator();
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-end bg-black/60 backdrop-blur-sm">
      {/* Backdrop area click to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="w-full max-w-md h-full bg-zinc-950 border-l border-zinc-800 text-zinc-100 flex flex-col shadow-2xl relative"
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3 text-amber-500">
            <Cpu className="w-5 h-5" />
            <h2 className="text-lg font-black uppercase tracking-tight font-heading">Nexus Preferences</h2>
          </div>
          <div className="flex items-center gap-3">
            {systemSyncMessage && (
              <span className="text-[10px] font-mono text-emerald-500 bg-emerald-950/20 px-2.5 py-1 rounded border border-emerald-900/30 animate-pulse">
                {systemSyncMessage}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full border border-zinc-800 hover:bg-zinc-900 transition-colors text-zinc-400 hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Settings Panel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* SECTION 1: IDENTITY PROFILE */}
          <form onSubmit={handleSaveProfile} className="space-y-6 pb-6 border-b border-zinc-900">
            <h3 className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest font-bold flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> 1. Identity Profile
            </h3>
            
            {/* Name and Avatar Display */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                {avatarUrl && avatarUrl !== "" && avatarUrl !== "/avatars/nexus-default.png" ? (
                  <img
                    src={avatarUrl}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black bg-zinc-800 text-amber-500 text-xl font-heading">
                    {name ? name[0].toUpperCase() : user.email[0].toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-2">
                <label className="block text-zinc-400 font-mono text-[9px] uppercase tracking-wider font-bold">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nexus Agent"
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-zinc-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none transition-all placeholder:text-zinc-700 font-bold"
                />
              </div>
            </div>

            {/* Avatar Selection Grid */}
            <div className="space-y-2">
              <label className="block text-zinc-400 font-mono text-[9px] uppercase tracking-wider font-bold">
                Select Profile Avatar
              </label>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = avatarUrl === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAvatarUrl(preset)}
                      className={`relative aspect-square rounded-xl bg-zinc-900 border overflow-hidden transition-all duration-200 active:scale-95 cursor-pointer ${
                        isSelected
                          ? "border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.25)] ring-1 ring-amber-500"
                          : "border-zinc-800/80 hover:border-zinc-700 hover:scale-105"
                      }`}
                    >
                      <img
                        src={preset}
                        alt="Avatar Preset"
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-amber-500/15 flex items-center justify-center" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bio Field */}
            <div className="space-y-2">
              <label className="block text-zinc-400 font-mono text-[9px] uppercase tracking-wider font-bold">About Yourself (Bio)</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Synchronizing regional microgrids and blockchain assets."
                rows={3}
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-zinc-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none transition-all placeholder:text-zinc-700 leading-normal resize-none"
              />
            </div>

            {/* Uplink Console Stream Status */}
            <div className="space-y-2.5 bg-zinc-950 p-4 rounded-2xl border border-zinc-900">
              <label className="block text-zinc-500 font-mono text-[9px] uppercase tracking-wider font-bold">Uplink Console Stream</label>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono text-emerald-400 font-black uppercase tracking-widest">CONSOLE LINKED</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-normal">
                Real-time transactions, automation permits, and security grid updates are streamed directly to the terminal at the bottom-left of the viewport.
              </p>
            </div>

            {/* Save Button for Profile */}
            <div className="space-y-2">
              {profileMessage && (
                <div className="text-center text-xs font-mono py-2 rounded bg-zinc-900 border border-zinc-800 text-amber-500 animate-pulse">
                  {profileMessage}
                </div>
              )}
              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-3 bg-amber-500 text-zinc-950 font-black rounded-xl hover:bg-amber-400 transition-colors uppercase tracking-widest text-[10px] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving Identity...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </form>

          {/* SECTION 2: SYSTEM & GRID SETTINGS (Instant Updates) */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest font-bold flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5" /> 2. System & Grid Settings
              </h3>
              <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider">
                Instant Auto-Apply
              </span>
            </div>

            {/* Theme Selector */}
            <div className="space-y-2">
              <label className="block text-zinc-400 font-mono text-[9px] uppercase tracking-wider font-bold">Theme Mode</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleThemeChange("light")}
                  className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    themeMode === "light"
                      ? "bg-white text-zinc-950 border-white font-bold"
                      : "bg-zinc-900/40 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-900"
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span className="font-mono text-[8px] uppercase tracking-wider">Light</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleThemeChange("dark")}
                  className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    themeMode === "dark"
                      ? "bg-zinc-900 text-white border-zinc-700 font-bold"
                      : "bg-zinc-900/40 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-900"
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span className="font-mono text-[8px] uppercase tracking-wider">Dark</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleThemeChange("system")}
                  className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    themeMode === "system"
                      ? "bg-zinc-900 text-zinc-200 border-zinc-700 font-bold"
                      : "bg-zinc-900/40 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-900"
                  }`}
                >
                  <Laptop className="w-4 h-4" />
                  <span className="font-mono text-[8px] uppercase tracking-wider">System</span>
                </button>
              </div>
            </div>

            {/* Cost Factor Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-mono text-[9px] uppercase tracking-wider font-bold">Grid Cost Multiplier</span>
                <span className="text-amber-500 font-mono font-bold">{costFactor.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={costFactor}
                onChange={(e) => setCostFactor(parseFloat(e.target.value))}
                onMouseUp={handleCostFactorRelease}
                onTouchEnd={handleCostFactorRelease}
                className="w-full accent-amber-500 bg-zinc-900 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Battery Capacity Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-mono text-[9px] uppercase tracking-wider font-bold">Battery Capacity</span>
                <span className="text-amber-500 font-mono font-bold">{batteryCap.toFixed(1)} kWh</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="0.5"
                value={batteryCap}
                onChange={(e) => setBatteryCap(parseFloat(e.target.value))}
                onMouseUp={handleBatteryCapRelease}
                onTouchEnd={handleBatteryCapRelease}
                className="w-full accent-amber-500 bg-zinc-900 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Low Battery Alert Threshold */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-mono text-[9px] uppercase tracking-wider font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-zinc-500" /> Low Battery Alert Threshold
                </span>
                <span className="text-amber-500 font-mono font-bold">{lowBatteryThreshold}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={lowBatteryThreshold}
                onChange={(e) => setLowBatteryThreshold(parseInt(e.target.value, 10))}
                onMouseUp={() => handleLowBatteryThresholdRelease(lowBatteryThreshold)}
                onTouchEnd={() => handleLowBatteryThresholdRelease(lowBatteryThreshold)}
                className="w-full accent-amber-500 bg-zinc-900 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Auto-Refresh Rate */}
            <div className="space-y-2">
              <label className="block text-zinc-400 font-mono text-[9px] uppercase tracking-wider font-bold flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-zinc-500" /> Auto-Refresh Rate
              </label>
              <select
                value={refreshRate}
                onChange={(e) => handleRefreshRateChange(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-zinc-700 transition-all font-mono font-bold"
              >
                <option value="1s">1s - Fast Update</option>
                <option value="3s">3s - Normal Update</option>
                <option value="5s">5s - Eco Mode Update</option>
              </select>
            </div>

            {/* Cyberpunk Message Customizer & Phone Emulator */}
            <div className="space-y-4 pt-4 border-t border-zinc-900">
              <div className="flex justify-between items-center">
                <label className="block text-zinc-400 font-mono text-[9px] uppercase tracking-wider font-bold flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-zinc-500" /> Uplink Customizer // Cyber-SMS Styles
                </label>
              </div>

              {/* Theme Selection Buttons */}
              <div className="grid grid-cols-5 gap-1">
                {(["nexus-border", "quantum-terminal", "neo-minimalist", "grid-override", "random"] as MessageStyle[]).map((styleOpt) => {
                  const isSelected = messageStyle === styleOpt;
                  const labelMap: Record<string, string> = {
                    "nexus-border": "Nexus",
                    "quantum-terminal": "Quantum",
                    "neo-minimalist": "Minimal",
                    "grid-override": "Grid",
                    "random": "Random"
                  };
                  return (
                    <button
                      key={styleOpt}
                      type="button"
                      onClick={() => handleMessageStyleChange(styleOpt)}
                      className={`py-1.5 rounded-lg border text-[9px] font-mono font-bold uppercase transition-all tracking-wider ${
                        isSelected
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.15)]"
                          : "bg-zinc-900/40 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-900"
                      }`}
                    >
                      {labelMap[styleOpt]}
                    </button>
                  );
                })}
              </div>

              {/* Phone Emulator Viewport */}
              <div className="relative border border-zinc-800 bg-zinc-950/80 rounded-2xl p-3 flex flex-col shadow-inner select-none aspect-[16/10] overflow-hidden">
                {/* Simulated Notch & Connection Info */}
                <div className="flex justify-between items-center text-[7px] text-zinc-500 font-mono pb-2 border-b border-zinc-900/50">
                  <span className="flex items-center gap-1">📶 NEXUS-NET</span>
                  <div className="w-10 h-2 bg-zinc-900 rounded-full mx-auto relative top-[-4px]" />
                  <span>⚡ 94%</span>
                </div>

                {/* Preview Tabs */}
                <div className="flex gap-1 my-2">
                  {(["otp", "timer", "trade"] as const).map((tab) => {
                    const isTabSelected = previewTab === tab;
                    const tabLabels = { otp: "OTP Verification", timer: "Timer Scheduled", trade: "Energy Trade" };
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setPreviewTab(tab)}
                        className={`flex-1 py-1 rounded text-[7px] font-mono font-bold uppercase tracking-wider transition-colors border ${
                          isTabSelected
                            ? "bg-zinc-900 text-zinc-100 border-zinc-700"
                            : "bg-transparent text-zinc-500 border-transparent hover:text-zinc-400"
                        }`}
                      >
                        {tabLabels[tab]}
                      </button>
                    );
                  })}
                </div>

                {/* Message Notification Bubble */}
                <div className="flex-1 bg-zinc-950 border border-zinc-900 rounded-xl p-2 relative overflow-y-auto min-h-0 flex flex-col justify-center">
                  <div className="text-[7px] text-zinc-500 font-mono mb-1 flex justify-between">
                    <span>💬 ECO-SYNC UPLINK</span>
                    <span>JUST NOW</span>
                  </div>
                  <pre className="font-mono text-[8px] leading-tight text-emerald-400 bg-black/90 p-2 rounded-lg border border-emerald-950/80 whitespace-pre overflow-x-auto shadow-[0_0_12px_rgba(16,185,129,0.06)] scrollbar-none select-text">
                    {previewTab === "otp"
                      ? getOtpMessage(messageStyle, "8429")
                      : previewTab === "timer"
                      ? getTimerMessage(messageStyle, "Tesla Charger", "7.2", "18:00", "4.0")
                      : getTradeMessage(messageStyle, "14.8", "8.0", "118.40", "0x7d39f...e82b")
                    }
                  </pre>
                </div>
              </div>
            </div>

            {/* Alert Channels Info Card */}
            <div className="bg-zinc-900/40 border border-emerald-900/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">Terminal Logs Stream</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                You will automatically receive real-time alerts printed inside the <strong className="text-white">Cyberpunk Terminal Console</strong> for:
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] text-zinc-300">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>⚡ Energy trade settlements (kWh sold → ECO tokens minted)</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-300">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>🤖 Device scheduler activation (appliance timer starts)</span>
                </div>
              </div>
            </div>

            {/* P2P Grid Sellback Toggle */}
            <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-200">P2P Grid Sellback</p>
                  <p className="text-[10px] text-zinc-500 leading-snug">Automatically sell surplus solar yield to the regional grid when battery is fully charged.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleGridSellbackToggle}
                className={`w-12 h-6 rounded-full p-1 transition-all duration-300 relative shrink-0 ${
                  gridSellback ? "bg-amber-500" : "bg-zinc-800"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-zinc-950 transition-all duration-300 ${
                    gridSellback ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            
          </div>

        </div>
      </motion.div>
    </div>
  );
}
