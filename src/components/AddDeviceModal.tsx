"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Zap, Wind, Snowflake, Tv, Lightbulb, Waves, Plus, Cpu, 
  WashingMachine, Wifi, Flame, Coffee, Fan, Laptop, Speaker, 
  ArrowLeft, Search, Microwave, Utensils, Monitor, Gamepad, 
  Shield, Camera, Lock, Bell, Sun, Battery, Droplets, Printer, 
  Smartphone, Thermometer, Music, ChefHat, Scan, Video, 
  Dumbbell, HeartPulse, Plug, Power, Radio, Tablets, Stethoscope,
  Sprout, CloudRain, HardDrive, Tablet, Volume2, Cloud, DoorOpen, LightbulbOff, Activity,
  Headphones, Mic, Trophy, Key, Anchor, Car, Bike, Plane, Map, Compass, Umbrella, 
  Hammer, Wrench, Scissors, Paintbrush, Music2, Mic2, Headset, FlaskConical, Beer, Wine,
  TreePine, Mountain, Waves as WaterWaves, Fish, Bird, Dog, Cat, Bug, ChevronRight,
  Info, Tag
} from "lucide-react";
import { Device } from "@/types/device";

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (device: Device) => void;
}

const CATEGORIES = [
  "All", "Kitchen", "Living Room", "Climate", "Laundry", "Security & Tech", "Utility", "Health", "Outdoor", "Hobby"
] as const;

type Category = typeof CATEGORIES[number];

const APPLIANCE_PRESETS = [
  // Kitchen (20)
  { label: "Refrigerator", iconName: "Snowflake", icon: Snowflake, defaultPower: 0.2, desc: "Food Preservation", category: "Kitchen" },
  { label: "Microwave", iconName: "Microwave", icon: Microwave, defaultPower: 1.2, desc: "Quick Cooking", category: "Kitchen" },
  { label: "Dishwasher", iconName: "Waves", icon: Waves, defaultPower: 1.2, desc: "Kitchen Hygiene", category: "Kitchen" },
  { label: "Coffee Machine", iconName: "Coffee", icon: Coffee, defaultPower: 1.0, desc: "Kitchen Appliance", category: "Kitchen" },
  { label: "Electric Oven", iconName: "ChefHat", icon: ChefHat, defaultPower: 2.5, desc: "Baking & Roasting", category: "Kitchen" },
  { label: "Electric Kettle", iconName: "Utensils", icon: Utensils, defaultPower: 2.0, desc: "Water Boiling", category: "Kitchen" },
  { label: "Induction Cooktop", iconName: "Flame", icon: Flame, defaultPower: 1.8, desc: "Precision Cooking", category: "Kitchen" },
  { label: "Air Fryer", iconName: "Zap", icon: Zap, defaultPower: 1.5, desc: "Healthy Cooking", category: "Kitchen" },
  { label: "Blender", iconName: "Cpu", icon: Cpu, defaultPower: 0.5, desc: "Smoothie Station", category: "Kitchen" },
  { label: "Rice Cooker", iconName: "ChefHat", icon: ChefHat, defaultPower: 0.7, desc: "Grain Preparation", category: "Kitchen" },
  { label: "Toaster", iconName: "Flame", icon: Flame, defaultPower: 0.8, desc: "Breakfast Prep", category: "Kitchen" },
  { label: "Ice Maker", iconName: "Snowflake", icon: Snowflake, defaultPower: 0.15, desc: "Ice Production", category: "Kitchen" },
  { label: "Wine Cooler", iconName: "Wine", icon: Wine, defaultPower: 0.1, desc: "Beverage Storage", category: "Kitchen" },
  { label: "Trash Compactor", iconName: "Zap", icon: Zap, defaultPower: 0.5, desc: "Waste Management", category: "Kitchen" },
  { label: "Beer Dispenser", iconName: "Beer", icon: Beer, defaultPower: 0.1, desc: "Draft System", category: "Kitchen" },
  { label: "Food Processor", iconName: "Cpu", icon: Cpu, defaultPower: 0.4, desc: "Prep Tool", category: "Kitchen" },
  { label: "Slow Cooker", iconName: "ChefHat", icon: ChefHat, defaultPower: 0.2, desc: "Low-Temp Cooking", category: "Kitchen" },
  { label: "Juicer", iconName: "Zap", icon: Zap, defaultPower: 0.3, desc: "Fresh Extracts", category: "Kitchen" },
  { label: "Electric Whisk", iconName: "Zap", icon: Zap, defaultPower: 0.1, desc: "Mixing Tool", category: "Kitchen" },
  { label: "Smart Scale Kit", iconName: "Utensils", icon: Utensils, defaultPower: 0.01, desc: "Portion Control", category: "Kitchen" },

  // Living Room / Entertainment (15)
  { label: "Smart TV", iconName: "Tv", icon: Tv, defaultPower: 0.15, desc: "Entertainment", category: "Living Room" },
  { label: "Gaming Console", iconName: "Gamepad", icon: Gamepad, defaultPower: 0.3, desc: "High Perf Gaming", category: "Living Room" },
  { label: "Smart Speaker", iconName: "Speaker", icon: Speaker, defaultPower: 0.01, desc: "Audio System", category: "Living Room" },
  { label: "Music System", iconName: "Music", icon: Music, defaultPower: 0.1, desc: "High Fidelity Audio", category: "Living Room" },
  { label: "Home Theater", iconName: "Video", icon: Video, defaultPower: 0.4, desc: "Cinematic Experience", category: "Living Room" },
  { label: "Projector", iconName: "Video", icon: Video, defaultPower: 0.25, desc: "Large Screen Viewing", category: "Living Room" },
  { label: "Vinyl Player", iconName: "Radio", icon: Radio, defaultPower: 0.05, desc: "Analog Sound", category: "Living Room" },
  { label: "Smart Lighting", iconName: "Lightbulb", icon: Lightbulb, defaultPower: 0.05, desc: "Ambient Light", category: "Living Room" },
  { label: "Accent Lights", iconName: "LightbulbOff", icon: LightbulbOff, defaultPower: 0.02, desc: "Mood Lighting", category: "Living Room" },
  { label: "Soundbar", iconName: "Volume2", icon: Volume2, defaultPower: 0.06, desc: "TV Audio Enhance", category: "Living Room" },
  { label: "Headphones Hub", iconName: "Headphones", icon: Headphones, defaultPower: 0.01, desc: "Personal Audio", category: "Living Room" },
  { label: "VR Headset", iconName: "Headset", icon: Headset, defaultPower: 0.05, desc: "Virtual Reality", category: "Living Room" },
  { label: "Smart Remote", iconName: "Wifi", icon: Wifi, defaultPower: 0.001, desc: "Unified Control", category: "Living Room" },
  { label: "Electric Fireplace", iconName: "Flame", icon: Flame, defaultPower: 1.5, desc: "Mood & Heat", category: "Living Room" },
  { label: "Digital Photo Frame", iconName: "Monitor", icon: Monitor, defaultPower: 0.02, desc: "Memory Display", category: "Living Room" },

  // Climate (12)
  { label: "Air Conditioner", iconName: "Wind", icon: Wind, defaultPower: 1.5, desc: "Climate Control", category: "Climate" },
  { label: "Ceiling Fan", iconName: "Fan", icon: Fan, defaultPower: 0.07, desc: "Ventilation", category: "Climate" },
  { label: "Water Heater", iconName: "Flame", icon: Flame, defaultPower: 2.0, desc: "Hot Water", category: "Climate" },
  { label: "Space Heater", iconName: "Thermometer", icon: Thermometer, defaultPower: 1.5, desc: "Winter Heating", category: "Climate" },
  { label: "Humidifier", iconName: "Droplets", icon: Droplets, defaultPower: 0.05, desc: "Moisture Balance", category: "Climate" },
  { label: "Dehumidifier", iconName: "Wind", icon: Wind, defaultPower: 0.25, desc: "Dry Air Control", category: "Climate" },
  { label: "Air Purifier", iconName: "Wind", icon: Wind, defaultPower: 0.06, desc: "Air Filtration", category: "Climate" },
  { label: "Smart Thermostat", iconName: "Thermometer", icon: Thermometer, defaultPower: 0.005, desc: "Climate Management", category: "Climate" },
  { label: "Radiator Node", iconName: "Flame", icon: Flame, defaultPower: 1.0, desc: "Zoned Heating", category: "Climate" },
  { label: "Mist Fan", iconName: "Cloud", icon: Cloud, defaultPower: 0.08, desc: "Outdoor Cooling", category: "Climate" },
  { label: "Floor Heater", iconName: "Zap", icon: Zap, defaultPower: 0.5, desc: "Tile Warmth", category: "Climate" },
  { label: "HVAC Unit", iconName: "Wind", icon: Wind, defaultPower: 3.5, desc: "Main Climate Hub", category: "Climate" },

  // Laundry (8)
  { label: "Washing Machine", iconName: "WashingMachine", icon: WashingMachine, defaultPower: 0.5, desc: "Laundry", category: "Laundry" },
  { label: "Clothes Dryer", iconName: "Wind", icon: Wind, defaultPower: 3.0, desc: "Tumble Drying", category: "Laundry" },
  { label: "Electric Iron", iconName: "Flame", icon: Flame, defaultPower: 1.2, desc: "Garment Care", category: "Laundry" },
  { label: "Steam Station", iconName: "Cloud", icon: Cloud, defaultPower: 2.2, desc: "Pro Ironing", category: "Laundry" },
  { label: "Fabric Steamer", iconName: "Cloud", icon: Cloud, defaultPower: 1.0, desc: "Quick Refresh", category: "Laundry" },
  { label: "Drying Cabinet", iconName: "Wind", icon: Wind, defaultPower: 1.5, desc: "Delicate Care", category: "Laundry" },
  { label: "Smart Hamper", iconName: "Wifi", icon: Wifi, defaultPower: 0.001, desc: "Laundry Tracking", category: "Laundry" },
  { label: "Ironing Press", iconName: "Flame", icon: Flame, defaultPower: 2.5, desc: "Heavy Duty Care", category: "Laundry" },

  // Security & Tech (15)
  { label: "Wi-Fi Router", iconName: "Wifi", icon: Wifi, defaultPower: 0.02, desc: "Connectivity", category: "Security & Tech" },
  { label: "Laptop", iconName: "Laptop", icon: Laptop, defaultPower: 0.06, desc: "Workstation", category: "Security & Tech" },
  { label: "Desktop PC", iconName: "Monitor", icon: Monitor, defaultPower: 0.25, desc: "High Power Workstation", category: "Security & Tech" },
  { label: "Printer", iconName: "Printer", icon: Printer, defaultPower: 0.1, desc: "Document Output", category: "Security & Tech" },
  { label: "Security Camera", iconName: "Camera", icon: Camera, defaultPower: 0.01, desc: "Surveillance", category: "Security & Tech" },
  { label: "Smart Lock", iconName: "Lock", icon: Lock, defaultPower: 0.005, desc: "Entry Control", category: "Security & Tech" },
  { label: "Scanner", iconName: "Scan", icon: Scan, defaultPower: 0.05, desc: "Digitization", category: "Security & Tech" },
  { label: "External Storage", iconName: "HardDrive", icon: HardDrive, defaultPower: 0.01, desc: "Data Backup", category: "Security & Tech" },
  { label: "Smart Doorbell", iconName: "Bell", icon: Bell, defaultPower: 0.005, desc: "Entry Monitor", category: "Security & Tech" },
  { label: "Garage Opener", iconName: "DoorOpen", icon: DoorOpen, defaultPower: 0.3, desc: "Access Control", category: "Security & Tech" },
  { label: "Smart Tablet", iconName: "Tablet", icon: Tablet, defaultPower: 0.01, desc: "Touch Interface", category: "Security & Tech" },
  { label: "Smart Mobile", iconName: "Smartphone", icon: Smartphone, defaultPower: 0.005, desc: "Mobile Comms", category: "Security & Tech" },
  { label: "Key Tracker", iconName: "Key", icon: Key, defaultPower: 0.001, desc: "Asset Location", category: "Security & Tech" },
  { label: "Server Rack", iconName: "HardDrive", icon: HardDrive, defaultPower: 1.2, desc: "Home Datacenter", category: "Security & Tech" },
  { label: "NAS System", iconName: "HardDrive", icon: HardDrive, defaultPower: 0.04, desc: "Network Storage", category: "Security & Tech" },

  // Health & Wellness (15)
  { label: "Treadmill", iconName: "Zap", icon: Zap, defaultPower: 1.5, desc: "Fitness Training", category: "Health" },
  { label: "Massage Chair", iconName: "Power", icon: Power, defaultPower: 0.2, desc: "Relaxation", category: "Health" },
  { label: "Electric Toothbrush", iconName: "Plug", icon: Plug, defaultPower: 0.005, desc: "Dental Care", category: "Health" },
  { label: "CPAP Machine", iconName: "Activity", icon: Activity, defaultPower: 0.06, desc: "Sleep Support", category: "Health" },
  { label: "Air Purifier Pro", iconName: "Wind", icon: Wind, defaultPower: 0.08, desc: "Medical Grade Air", category: "Health" },
  { label: "Body Scale", iconName: "Wifi", icon: Wifi, defaultPower: 0.001, desc: "Weight Metrics", category: "Health" },
  { label: "Exercise Bike", iconName: "Zap", icon: Zap, defaultPower: 0.1, desc: "Cardio Station", category: "Health" },
  { label: "Smart Mirror", iconName: "Monitor", icon: Monitor, defaultPower: 0.05, desc: "Fitness Feedback", category: "Health" },
  { label: "Pill Dispenser", iconName: "Tablets", icon: Tablets, defaultPower: 0.01, desc: "Medication Management", category: "Health" },
  { label: "Digital Stethoscope", iconName: "Stethoscope", icon: Stethoscope, defaultPower: 0.005, desc: "Cardiac Monitor", category: "Health" },
  { label: "Smart Gym", iconName: "Dumbbell", icon: Dumbbell, defaultPower: 0.2, desc: "Strength Training", category: "Health" },
  { label: "Heart Monitor", iconName: "HeartPulse", icon: HeartPulse, defaultPower: 0.002, desc: "Vital Tracking", category: "Health" },
  { label: "Infrared Sauna", iconName: "Flame", icon: Flame, defaultPower: 2.0, desc: "Detox Session", category: "Health" },
  { label: "UV Sanitizer", iconName: "Sun", icon: Sun, defaultPower: 0.02, desc: "Germ Protection", category: "Health" },
  { label: "Smart Bed Node", iconName: "Activity", icon: Activity, defaultPower: 0.01, desc: "Sleep Tracking", category: "Health" },

  // Outdoor / Utility (15)
  { label: "Electric Vehicle", iconName: "Zap", icon: Zap, defaultPower: 7.0, desc: "Fast Charging", category: "Utility" },
  { label: "Solar Panel", iconName: "Sun", icon: Sun, defaultPower: 0.0, desc: "Energy Generation", category: "Utility" },
  { label: "Battery Bank", iconName: "Battery", icon: Battery, defaultPower: 0.0, desc: "Energy Storage", category: "Utility" },
  { label: "Pool Pump", iconName: "Droplets", icon: Droplets, defaultPower: 1.5, desc: "Water Circulation", category: "Outdoor" },
  { label: "Smart Irrigation", iconName: "CloudRain", icon: CloudRain, defaultPower: 0.05, desc: "Garden Watering", category: "Outdoor" },
  { label: "Electric Mower", iconName: "Sprout", icon: Sprout, defaultPower: 1.2, desc: "Lawn Care", category: "Outdoor" },
  { label: "Outdoor Lighting", iconName: "Sun", icon: Sun, defaultPower: 0.1, desc: "Landscape Light", category: "Outdoor" },
  { label: "Pool Heater", iconName: "Flame", icon: Flame, defaultPower: 5.0, desc: "Water Temp Control", category: "Outdoor" },
  { label: "Security Floodlight", iconName: "Lightbulb", icon: Lightbulb, defaultPower: 0.05, desc: "Perimeter Safety", category: "Outdoor" },
  { label: "Electric Grill", iconName: "Flame", icon: Flame, defaultPower: 2.2, desc: "Outdoor Cooking", category: "Outdoor" },
  { label: "Pond Filter", iconName: "Waves", icon: Waves, defaultPower: 0.04, desc: "Aquatic Life Support", category: "Outdoor" },
  { label: "Electric Boat Motor", iconName: "Anchor", icon: Anchor, defaultPower: 3.0, desc: "Marine Propulsion", category: "Outdoor" },
  { label: "E-Bike Charger", iconName: "Bike", icon: Bike, defaultPower: 0.2, desc: "Micromobility", category: "Outdoor" },
  { label: "Electric Car Jack", iconName: "Car", icon: Car, defaultPower: 0.5, desc: "Roadside Utility", category: "Outdoor" },
  { label: "Smart Sprinkler", iconName: "CloudRain", icon: CloudRain, defaultPower: 0.01, desc: "Precision Watering", category: "Outdoor" },

  // Hobby & Misc (10)
  { label: "3D Printer", iconName: "Printer", icon: Printer, defaultPower: 0.3, desc: "Additive Manufacturing", category: "Hobby" },
  { label: "Electric Guitar Amp", iconName: "Volume2", icon: Volume2, defaultPower: 0.1, desc: "Music Studio", category: "Hobby" },
  { label: "Photography Light", iconName: "Sun", icon: Sun, defaultPower: 0.15, desc: "Studio Lighting", category: "Hobby" },
  { label: "Smart Aquarium", iconName: "Droplets", icon: Droplets, defaultPower: 0.05, desc: "Pet Care Tech", category: "Hobby" },
  { label: "Telescope Motor", iconName: "Cpu", icon: Cpu, defaultPower: 0.02, desc: "Stargazing System", category: "Hobby" },
  { label: "Soldering Station", iconName: "Flame", icon: Flame, defaultPower: 0.06, desc: "Electronics Lab", category: "Hobby" },
  { label: "Power Drill Charger", iconName: "Battery", icon: Battery, defaultPower: 0.08, desc: "Tool Maintenance", category: "Hobby" },
  { label: "Sewing Machine", iconName: "Zap", icon: Zap, defaultPower: 0.1, desc: "Textile Work", category: "Hobby" },
  { label: "Smart Easel", iconName: "Paintbrush", icon: Paintbrush, defaultPower: 0.02, desc: "Digital Art Studio", category: "Hobby" },
  { label: "Lab Centrifuge", iconName: "FlaskConical", icon: FlaskConical, defaultPower: 0.4, desc: "Home Science Lab", category: "Hobby" },

  { label: "Custom Device", iconName: "Plus", icon: Plus, defaultPower: 0.1, desc: "User Defined Interface", category: "All" },
];

export default function AddDeviceModal({ isOpen, onClose, onAdd }: AddDeviceModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<typeof APPLIANCE_PRESETS[0] | null>(null);
  const [power, setPower] = useState("");
  const [customName, setCustomName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [step, setStep] = useState(1);
  const [activeSection, setActiveSection] = useState<'info' | 'label' | 'power'>('info');
  const configRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const powerRef = useRef<HTMLDivElement>(null);



  useEffect(() => {
    if (step !== 2) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = entry.target.getAttribute('data-section');
            if (section) setActiveSection(section as 'info' | 'label' | 'power');
          }
        });
      },
      { 
        threshold: 0.3,
        rootMargin: "-10% 0px -60% 0px" 
      }
    );

    [configRef, labelRef, powerRef].forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, [step]);

  const scrollDown = () => {
    configRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setStep(2);
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filteredPresets = useMemo(() => {
    return APPLIANCE_PRESETS.filter(preset => {
      const matchesSearch = preset.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          preset.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "All" || preset.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const handleSelectPreset = (preset: typeof APPLIANCE_PRESETS[0]) => {
    setSelectedPreset(preset);
    setPower(preset.defaultPower.toString());
    setCustomName(preset.label);
    setStep(2);
    
    // Smooth scroll to config section
    setTimeout(() => {
      configRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPreset || !power) return;

    const newDevice: Device = {
      id: Date.now().toString(),
      label: customName || selectedPreset.label,
      power: parseFloat(power),
      iconName: selectedPreset.iconName,
      desc: selectedPreset.desc,
      isOn: false,
    };

    onAdd(newDevice);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setStep(1);
    setSelectedPreset(null);
    setPower("");
    setCustomName("");
    setSearchQuery("");
    setActiveCategory("All");
  };

  const handleBack = () => {
    setStep(1);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-5xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent-cyber/10 blur-[120px] -mr-48 -mt-48 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col h-full">
              {/* Header */}
              <div className="p-8 sm:p-10 border-b border-white/5 flex justify-between items-center bg-slate-900/50 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  {step === 2 && (
                    <button 
                      onClick={handleBack}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  <div>
                    <h2 className="text-white font-black text-2xl sm:text-3xl tracking-tighter uppercase italic leading-none">
                      {step === 1 ? "Select" : "Configure"} <span className="text-accent-cyber">Appliance</span>
                    </h2>
                    <p className="text-white/30 text-[10px] font-mono uppercase tracking-[0.2em] mt-2 font-bold">
                      {step === 1 ? `Step 01: Browse Catalog (${filteredPresets.length})` : "Step 02: Hardware Parameters"}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

               <div className="flex-1 relative overflow-hidden flex flex-col">
                 <AnimatePresence mode="wait">
                   {step === 1 ? (
                     <motion.div
                       key="catalog"
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -20 }}
                       className="flex-1 overflow-y-auto custom-scrollbar p-8 sm:p-10"
                     >
                      {/* Search & Categories */}
                      <div className="flex flex-col gap-6 mb-10">
                        <div className="relative group">
                          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-accent-cyber transition-all" />
                          <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="SEARCH APPLIANCES..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-white placeholder:text-white/10 focus:outline-none focus:border-accent-cyber/50 transition-all font-mono text-sm tracking-widest font-black uppercase"
                          />
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {CATEGORIES.map(cat => (
                            <button
                              key={cat}
                              onClick={() => setActiveCategory(cat)}
                              className={`px-4 py-2 rounded-xl text-[9px] font-mono uppercase tracking-widest font-black transition-all border ${
                                activeCategory === cat 
                                  ? "bg-accent-cyber text-slate-900 border-accent-cyber shadow-[0_0_20px_rgba(0,240,255,0.2)]" 
                                  : "bg-white/5 text-white/40 border-white/5 hover:border-white/10 hover:text-white"
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-10">
                        {filteredPresets.map((preset) => (
                          <motion.button
                            key={preset.label}
                            whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(0,240,255,0.2)" }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleSelectPreset(preset)}
                            className={`flex flex-col items-center p-6 rounded-3xl border transition-all text-center group ${
                              selectedPreset?.label === preset.label 
                                ? "bg-accent-cyber/10 border-accent-cyber shadow-[0_0_20px_rgba(0,240,255,0.1)]" 
                                : "bg-white/2 border-white/5"
                            }`}
                          >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all shadow-inner ${
                              selectedPreset?.label === preset.label 
                                ? "bg-accent-cyber text-slate-900" 
                                : "bg-slate-800 group-hover:bg-accent-cyber group-hover:text-slate-900"
                            }`}>
                              <preset.icon className="w-8 h-8" />
                            </div>
                            <h4 className="text-white font-black text-[10px] uppercase tracking-wider mb-1 leading-tight">{preset.label}</h4>
                            <p className="text-white/30 text-[8px] uppercase font-bold tracking-tight">{preset.desc}</p>
                          </motion.button>
                        ))}
                      </div>

                      {/* Removed Redundant Scroll Down Indicator */}
                     </motion.div>
                   ) : (
                     <motion.div
                       key="config"
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: 20 }}
                       className="flex-1 flex overflow-hidden h-full"
                     >
                          <div className="hidden sm:flex w-24 border-r border-white/5 flex-col items-center py-10 relative bg-slate-900/50 backdrop-blur-xl shrink-0">
                           {/* NAV Header */}
                           <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-20 group">
                             <div className="w-1 h-1 bg-white rounded-full" />
                             <span className="text-[7px] font-mono font-black uppercase tracking-[0.4em] [writing-mode:vertical-lr] rotate-180">NAVIGATION</span>
                           </div>

                           {/* Background Track with Ticks */}
                           <div className="absolute left-1/2 -translate-x-1/2 top-24 bottom-24 w-[1px] bg-white/5">
                             {[...Array(20)].map((_, i) => (
                               <div 
                                 key={i} 
                                 className="absolute left-1/2 -translate-x-1/2 w-1 h-[1px] bg-white/10"
                                 style={{ top: `${(i / 19) * 100}%` }}
                               />
                             ))}
                           </div>
                           
                           {/* Active Progress Line */}
                           <motion.div 
                             className="absolute left-1/2 -translate-x-1/2 w-[2px] bg-accent-cyber shadow-[0_0_15px_rgba(0,240,255,0.3)] z-10"
                             initial={false}
                             animate={{ 
                               top: "96px",
                               height: activeSection === 'info' ? '48px' : activeSection === 'label' ? '144px' : '240px'
                             }}
                             transition={{ type: "spring", stiffness: 300, damping: 35 }}
                           />

                           {/* Glow Indicator */}
                           <motion.div 
                             className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-accent-cyber rounded-full shadow-[0_0_20px_#00F0FF] z-20"
                             initial={false}
                             animate={{ 
                               top: activeSection === 'info' ? '120px' : activeSection === 'label' ? '216px' : '312px'
                             }}
                             transition={{ type: "spring", stiffness: 300, damping: 35 }}
                           />

                           <div className="flex flex-col gap-16 mt-16 relative z-30">
                             <button 
                               type="button"
                               onClick={() => scrollToSection(configRef)}
                               className="group flex flex-col items-center gap-4 transition-all hover:scale-110"
                             >
                               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg border-2 ${
                                 activeSection === 'info' 
                                   ? "bg-accent-cyber text-slate-900 shadow-accent-cyber/30 border-accent-cyber" 
                                   : "bg-white/5 border-white/10 text-white/20 group-hover:border-accent-cyber/50 group-hover:bg-accent-cyber/10"
                               }`}>
                                 <Info className="w-6 h-6" />
                               </div>
                               <span className={`text-[9px] font-mono uppercase tracking-[0.2em] transition-colors font-black ${
                                 activeSection === 'info' ? "text-accent-cyber" : "text-white/20 group-hover:text-white"
                               }`}>Info</span>
                             </button>

                             <button 
                               type="button"
                               onClick={() => scrollToSection(labelRef)}
                               className="group flex flex-col items-center gap-4 transition-all hover:scale-110"
                             >
                               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg border-2 ${
                                 activeSection === 'label' 
                                   ? "bg-accent-cyber text-slate-900 shadow-accent-cyber/30 border-accent-cyber" 
                                   : "bg-white/5 border-white/10 text-white/20 group-hover:border-accent-cyber/50 group-hover:bg-accent-cyber/10"
                               }`}>
                                 <Tag className="w-6 h-6" />
                               </div>
                               <span className={`text-[9px] font-mono uppercase tracking-[0.2em] transition-colors font-black ${
                                 activeSection === 'label' ? "text-accent-cyber" : "text-white/20 group-hover:text-white"
                               }`}>Label</span>
                             </button>

                             <button 
                               type="button"
                               onClick={() => scrollToSection(powerRef)}
                               className="group flex flex-col items-center gap-4 transition-all hover:scale-110"
                             >
                               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg border-2 ${
                                 activeSection === 'power' 
                                   ? "bg-accent-cyber text-slate-900 shadow-accent-cyber/30 border-accent-cyber" 
                                   : "bg-white/5 border-white/10 text-white/20 group-hover:border-accent-cyber/50 group-hover:bg-accent-cyber/10"
                               }`}>
                                 <Zap className="w-6 h-6" />
                               </div>
                               <span className={`text-[9px] font-mono uppercase tracking-[0.2em] transition-colors font-black ${
                                 activeSection === 'power' ? "text-accent-cyber" : "text-white/20 group-hover:text-white"
                               }`}>Power</span>
                             </button>
                           </div>
                         </div>

                       {/* Configuration Content Area */}
                       <div className="flex-1 overflow-y-auto custom-scrollbar p-8 sm:p-12">
                         <div className="max-w-2xl mx-auto">
                            <div ref={configRef} data-section="info" className="flex flex-col items-center text-center mb-16 scroll-mt-20">
                              <p className="text-accent-cyber font-mono text-[10px] uppercase tracking-[0.4em] mb-6 font-black">Node Intelligence v1.0</p>
                              <div className="w-32 h-32 rounded-[2.5rem] bg-accent-cyber text-slate-900 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(0,240,255,0.3)] border-4 border-white/20">
                                {selectedPreset ? <selectedPreset.icon className="w-16 h-16" /> : <Plus className="w-16 h-16 text-slate-900/20" />}
                              </div>
                              <h3 className="text-white text-4xl font-black uppercase tracking-tighter italic leading-none mb-4">
                                {selectedPreset ? selectedPreset.label : "Select a Device"}
                              </h3>
                              <div className="px-4 py-1 rounded-full bg-white/5 border border-white/10">
                                <p className="text-white/40 font-mono text-[9px] uppercase tracking-widest font-bold">
                                  {selectedPreset ? selectedPreset.desc : "Choose from the catalog above to begin"}
                                </p>
                              </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-16 pb-20">
                              <div className="grid grid-cols-1 gap-12">
                                <div ref={labelRef} data-section="label" className="scroll-mt-20">
                                  <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                                      <Tag className="w-4 h-4 text-accent-cyber" />
                                    </div>
                                    <label className="text-white font-black text-xs uppercase tracking-widest italic">Identity Tag</label>
                                  </div>
                                  <input 
                                    type="text" 
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    placeholder="ENTER CUSTOM LABEL..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-white placeholder:text-white/10 focus:outline-none focus:border-accent-cyber/50 focus:bg-white/10 transition-all font-bold tracking-wide text-lg"
                                  />
                                </div>



                                <div ref={powerRef} data-section="power" className="scroll-mt-20">
                                  <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                                      <Zap className="w-4 h-4 text-accent-cyber" />
                                    </div>
                                    <label className="text-white font-black text-xs uppercase tracking-widest italic">Consumption Matrix</label>
                                  </div>
                                  <div className="relative group">
                                    <input 
                                      type="number" 
                                      step="0.01"
                                      value={power}
                                      onChange={(e) => setPower(e.target.value)}
                                      placeholder="0.00"
                                      className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-12 text-7xl font-black text-white focus:outline-none focus:border-accent-cyber/50 focus:bg-white/10 transition-all text-center tabular-nums shadow-inner group-hover:border-white/20"
                                      required
                                    />
                                    <div className="absolute right-10 top-1/2 -translate-y-1/2 text-white/10 font-black text-3xl uppercase tracking-tighter italic group-focus-within:text-accent-cyber/30 transition-colors">kW</div>
                                  </div>
                                  <p className="mt-4 text-center text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">Estimated nominal load for this appliance class</p>
                                </div>
                              </div>

                              <button
                                type="submit"
                                disabled={!selectedPreset}
                                className="group relative w-full py-8 bg-accent-cyber disabled:bg-slate-800 disabled:text-white/10 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,240,255,0.3)] transition-all active:scale-[0.98] hover:shadow-accent-cyber/50 hover:-translate-y-1"
                              >
                                <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                <span className="relative z-10 text-slate-900 font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4">
                                  <Cpu className="w-6 h-6 animate-pulse" />
                                  Initialize Smart Node
                                </span>
                              </button>
                            </form>

                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      );
    }
