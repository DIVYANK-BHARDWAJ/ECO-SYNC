"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { 
  Zap, Fan, Lightbulb, Tv, Refrigerator, WashingMachine, Wind, Snowflake, 
  Waves, Search, ChevronRight, Activity, LayoutGrid, Plus, Cpu, X, Wifi, 
  Flame, Coffee, Laptop, Speaker, Microwave, ChefHat, Utensils, Gamepad, 
  Music, Thermometer, Monitor, Printer, Camera, Lock, Bell, Sun, Battery, 
  Droplets, Smartphone, Scan, Video, Dumbbell, HeartPulse, Plug, Power, 
  Radio, Tablets, Stethoscope, Sprout, CloudRain, HardDrive, Tablet, 
  Volume2, Cloud, DoorOpen, LightbulbOff
} from "lucide-react";
import { Device } from "@/types/device";
import SmartRoutines from "./SmartRoutines";

const ICON_MAP: Record<string, any> = {
  Activity: <Activity className="w-10 h-10" />,
  Wind: <Wind className="w-10 h-10" />,
  Zap: <Zap className="w-10 h-10" />,
  Snowflake: <Snowflake className="w-10 h-10" />,
  Tv: <Tv className="w-10 h-10" />,
  Lightbulb: <Lightbulb className="w-10 h-10" />,
  Waves: <Waves className="w-10 h-10" />,
  Search: <Search className="w-10 h-10" />,
  Cpu: <Cpu className="w-10 h-10" />,
  WashingMachine: <WashingMachine className="w-10 h-10" />,
  Wifi: <Wifi className="w-10 h-10" />,
  Flame: <Flame className="w-10 h-10" />,
  Coffee: <Coffee className="w-10 h-10" />,
  Fan: <Fan className="w-10 h-10" />,
  Laptop: <Laptop className="w-10 h-10" />,
  Speaker: <Speaker className="w-10 h-10" />,
  Microwave: <Microwave className="w-10 h-10" />,
  ChefHat: <ChefHat className="w-10 h-10" />,
  Utensils: <Utensils className="w-10 h-10" />,
  Gamepad: <Gamepad className="w-10 h-10" />,
  Music: <Music className="w-10 h-10" />,
  Thermometer: <Thermometer className="w-10 h-10" />,
  Monitor: <Monitor className="w-10 h-10" />,
  Printer: <Printer className="w-10 h-10" />,
  Camera: <Camera className="w-10 h-10" />,
  Lock: <Lock className="w-10 h-10" />,
  Bell: <Bell className="w-10 h-10" />,
  Sun: <Sun className="w-10 h-10" />,
  Battery: <Battery className="w-10 h-10" />,
  Droplets: <Droplets className="w-10 h-10" />,
  Smartphone: <Smartphone className="w-10 h-10" />,
  Plus: <Plus className="w-10 h-10" />,
  Scan: <Scan className="w-10 h-10" />,
  Video: <Video className="w-10 h-10" />,
  Dumbbell: <Dumbbell className="w-10 h-10" />,
  HeartPulse: <HeartPulse className="w-10 h-10" />,
  Plug: <Plug className="w-10 h-10" />,
  Power: <Power className="w-10 h-10" />,
  Radio: <Radio className="w-10 h-10" />,
  Tablets: <Tablets className="w-10 h-10" />,
  Stethoscope: <Stethoscope className="w-10 h-10" />,
  Sprout: <Sprout className="w-10 h-10" />,
  CloudRain: <CloudRain className="w-10 h-10" />,
  HardDrive: <HardDrive className="w-10 h-10" />,
  Tablet: <Tablet className="w-10 h-10" />,
  Volume2: <Volume2 className="w-10 h-10" />,
  Cloud: <Cloud className="w-10 h-10" />,
  DoorOpen: <DoorOpen className="w-10 h-10" />,
  LightbulbOff: <LightbulbOff className="w-10 h-10" />,
};

interface UHDSectionProps {
  devices: Device[];
  onToggleDevice: (id: string) => void;
  onAddDevice: () => void;
  onDeleteDevice: (id: string) => void;
  totalLoad: number;
  onOpenPlans: () => void;
  onScrollToRadar: () => void;
  onReset: () => void;
  activeRoutine: string | null;
  onExecuteRoutine: (routineId: string) => void;
}

export default function UHDSection({ devices, onToggleDevice, onAddDevice, onDeleteDevice, totalLoad, onOpenPlans, onScrollToRadar, onReset, activeRoutine, onExecuteRoutine }: UHDSectionProps) {
  const filteredDevices = devices;

  return (
    <section className="bg-slate-950 py-16 sm:py-32 px-6 sm:px-12 border-t border-white/5 relative overflow-hidden">
      {/* Background Ambient Glow - Deep Blue */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] sm:h-[500px] bg-accent-secondary/5 blur-[120px] rounded-full -mt-[150px] sm:-mt-[250px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-20 gap-6 sm:gap-8">
          <div>
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
               <div className="w-2 h-2 rounded-full bg-accent-secondary animate-pulse" />
               <p className="text-white/40 font-mono text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.4em] font-bold">Control Hub V3.6.0</p>
            </div>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white tracking-tighter uppercase mb-2 sm:mb-4 leading-none font-heading">
               NEXUS <span className="text-accent-secondary">Oversight</span>
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 bg-[#121214]/50 backdrop-blur-3xl border border-white/5 p-6 sm:p-8 rounded-2xl shadow-xl w-full sm:w-auto">
            <div className="text-left flex-1 sm:flex-none">
               <p className="text-white/40 text-[8px] sm:text-[10px] uppercase font-mono tracking-widest mb-1 font-bold">Grid Load Meter</p>
               <p className="text-white text-4xl sm:text-6xl font-bold tracking-tighter tabular-nums font-mono">
                 {totalLoad.toFixed(2)}<span className="text-xs sm:text-lg text-white/20 ml-1 sm:ml-2 font-sans font-black">kW</span>
               </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={onReset}
                className="h-14 px-6 sm:h-20 sm:px-8 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all font-mono text-[10px] uppercase tracking-widest font-black"
              >
                Reset
              </button>
              
              <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center border border-white/10 transition-all duration-500 ${totalLoad > 7 ? "bg-red-500 text-white" : "bg-accent-secondary text-white"}`}>
                 <Activity className={`w-6 h-6 sm:w-10 sm:h-10 ${totalLoad > 7 ? "animate-[pulse_1s_infinite]" : "animate-pulse"}`} />
              </div>
            </div>
          </div>
        </div>



        {/* Appliance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredDevices.map((device) => (
            <motion.div
              key={device.id}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative group"
            >
              <button
                onClick={() => onToggleDevice(device.id)}
                className={`w-full relative overflow-hidden flex flex-col items-start p-6 sm:p-8 rounded-2xl border transition-all duration-500 ${
                  device.isOn 
                    ? "bg-[#121214] border-accent-secondary/50 shadow-lg" 
                    : "bg-[#121214]/20 border-white/5 hover:bg-[#121214]/40 hover:border-white/10 shadow-sm"
                }`}
              >
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mb-6 sm:mb-8 transition-all duration-500 ${
                  device.isOn 
                    ? "bg-accent-secondary text-white" 
                    : "bg-white/5 text-white/20"
                }`}>
                  <div className="scale-75 sm:scale-100 flex items-center justify-center">
                    {ICON_MAP[device.iconName] || <Zap className="w-10 h-10" />}
                  </div>
                </div>

                <div className="text-left relative z-10 w-full">
                  <h4 className={`text-xl sm:text-2xl font-black tracking-tight mb-1 sm:mb-2 uppercase font-heading ${
                    device.isOn ? "text-white" : "text-white/20"
                  }`}>
                    {device.label}
                  </h4>
                  <p className="text-white/50 text-[10px] sm:text-sm font-bold mb-6 sm:mb-10 uppercase tracking-tighter">{device.desc}</p>
                  


                  <div className="flex items-center justify-between w-full pt-4 sm:pt-6 border-t border-white/5">
                     <p className={`text-[8px] sm:text-xs font-mono tracking-widest uppercase font-black ${
                       device.isOn ? "text-accent-secondary" : "text-white/60"
                     }`}>
                       {device.isOn ? "ACTIVE" : "STANDBY"}
                     </p>
                      <p className="text-white/80 font-bold text-xs sm:text-sm font-mono tracking-tight">
                        {device.power} <span className="font-sans text-[10px] sm:text-xs text-white/40 font-black ml-1">kW</span>
                      </p>
                  </div>
                </div>
              </button>

              {/* Elegant Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteDevice(device.id);
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 opacity-0 group-hover:opacity-100 transition-all z-20"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}

          {/* Add Device Button Tile */}
          <motion.button 
            onClick={onAddDevice}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="p-6 rounded-2xl border border-dashed border-white/10 bg-white/2 hover:bg-white/5 flex flex-col items-center justify-center group transition-all min-h-[220px]"
          >
             <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-105 group-hover:border-accent-secondary/50 transition-all">
                <Plus className="w-6 h-6 text-white/20 group-hover:text-accent-secondary transition-all" />
             </div>
             <p className="text-white/30 text-xs font-mono uppercase tracking-[0.2em] font-bold group-hover:text-white transition-all text-center">Add New Interface</p>
          </motion.button>

          {/* Live Grid Radar Navigation Tile */}
          <motion.button 
            onClick={onScrollToRadar}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="p-6 rounded-2xl border border-white/5 bg-[#121214]/30 backdrop-blur-md flex flex-col justify-between group shadow-sm text-left min-h-[220px]"
          >
             <div className="w-10 h-10 rounded-xl bg-white/5 text-white flex items-center justify-center mb-6 border border-white/10">
                <Activity className="w-5 h-5" />
             </div>
             <div>
                <p className="text-white/40 font-mono text-[8px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] mb-2 font-bold">Live Pulse Stream</p>
                <h3 className="text-white font-bold text-xl sm:text-2xl leading-tight uppercase tracking-tight font-heading">Power Horizon Telemetry</h3>
             </div>
             <div className="flex items-center gap-4 text-white/60 font-bold uppercase text-[10px] sm:text-xs tracking-widest mt-6 group-hover:gap-5 transition-all">
                <span>VIEW TELEMETRY</span>
                <ChevronRight className="w-4 h-4" />
             </div>
          </motion.button>
        </div>

        <SmartRoutines activeRoutine={activeRoutine} onExecuteRoutine={onExecuteRoutine} />
      </div>
    </section>
  );
}
