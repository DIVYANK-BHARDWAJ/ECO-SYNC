"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareCode, X, Send } from "lucide-react";
import { formatBotpressPayload, ProsumerContext } from "@/lib/botpress";

interface BotpressChatbotProps {
  context: ProsumerContext;
}

declare global {
  interface Window {
    botpressWebChat: any;
    botpress: any;
  }
}

// Simple context-aware local response generator
function getBotResponse(userText: string, context: ProsumerContext): string {
  const query = userText.toLowerCase();
  
  if (query.includes("hello") || query.includes("hi") || query.includes("hey") || query.includes("greetings")) {
    return `Greetings, ${context.name || "Operator"}. I am online and calibrated. How can I assist you with your microgrid analytics?`;
  }
  
  if (query.includes("battery") || query.includes("charge") || query.includes("store")) {
    const level = context.batteryLevel.toFixed(1);
    const capacity = context.batteryCapacity.toFixed(1);
    const pct = context.batteryCapacity > 0
      ? Math.round((context.batteryLevel / context.batteryCapacity) * 100)
      : 0;
    return `Battery Status:\n• Stored Energy: ${level} kWh / ${capacity} kWh (${pct}% capacity)`;
  }
  
  if (query.includes("solar") || query.includes("generation") || query.includes("sun") || query.includes("yield")) {
    const gen = context.solarGeneration.toFixed(2);
    if (context.solarGeneration > 0) {
      return `Solar Status: Solar yield is actively generating ${gen} kW. Stored capacity is replenishing.`;
    } else {
      return `Solar Status: Solar generation is currently at 0.00 kW (no active sunlight or offline).`;
    }
  }

  if (query.includes("device") || query.includes("load") || query.includes("running") || query.includes("active") || query.includes("appliance")) {
    const active = context.activeDevices;
    if (!active || active === "None") {
      return "Grid Load: All smart appliances are currently powered off. Baseline draw is running.";
    }
    return `Grid Load: The following devices are active: ${active}.`;
  }

  if (query.includes("wallet") || query.includes("token") || query.includes("eco") || query.includes("balance")) {
    return `Financial Console: Your current wallet balance is ${context.walletBalance.toFixed(2)} ECO.`;
  }

  if (query.includes("budget") || query.includes("bill") || query.includes("cost") || query.includes("price") || query.includes("spent")) {
    return `Financial Console:\n• Session Consumption Cost: ₹${context.estimatedMonthlyBill.toFixed(2)}\n• Estimated Session Carbon: ${context.estimatedMonthlyCarbon.toFixed(2)} kg CO2.`;
  }

  if (query.includes("off") || query.includes("shut") || query.includes("turn off")) {
    return "Operator action required: To adjust appliance states, please navigate to the Smart Grid Control panel on the main console.";
  }

  return "I am Aetheria, your grid assistant. Ask me about: 'battery status', 'solar generation', 'active devices', 'wallet balance', or 'budget cost'.";
}

export default function BotpressChatbot({ context }: BotpressChatbotProps) {
  const [isInjectLoaded, setIsInjectLoaded] = useState(false);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLocalFallback, setIsLocalFallback] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [localMessages, setLocalMessages] = useState<Array<{ sender: "user" | "bot"; text: string; time: string }>>([]);

  const lastPayloadRef = useRef<string>("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isBotpressLoaded = isInjectLoaded && isConfigLoaded && !isLocalFallback;

  // Initialize first greeting message
  useEffect(() => {
    setLocalMessages([
      {
        sender: "bot",
        text: "Greetings, Operator. I am Aetheria, your local Grid AI assistant. I am running in offline mode. How can I help you manage your microgrid today?",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  }, []);

  // Scroll to bottom when messages list updates
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [localMessages]);

  // Sync state context helper for online webchat
  const syncContext = useCallback((forced = false) => {
    if (isLocalFallback) return;
    const bp = window.botpress || window.botpressWebChat;
    if (bp) {
      const payload = formatBotpressPayload(context);
      const payloadStr = JSON.stringify(payload);
      
      if (forced || payloadStr !== lastPayloadRef.current) {
        try {
          bp.sendPayload(payload);
          lastPayloadRef.current = payloadStr;
          console.log("[Aetheria Chatbot] Synced state context:", payload);
        } catch (e) {
          console.error("[Aetheria Chatbot] Failed to sync state payload:", e);
        }
      }
    }
  }, [context, isLocalFallback]);

  // Load Botpress Scripts dynamically on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if offline mode is explicitly requested
    const isDemoActive = localStorage.getItem("eco-sync-offline-demo") === "true";
    if (isDemoActive) {
      setIsLocalFallback(true);
      return;
    }

    // Check if script is already present
    const existingInject = document.querySelector('script[src*="webchat/v3.6/inject.js"]');
    if (existingInject) {
      setIsInjectLoaded(true);
      const existingConfig = document.querySelector('script[src*="5D6BNVCT.js"]');
      if (existingConfig) {
        setIsConfigLoaded(true);
      }
      return;
    }

    // 1. Create and inject webchat script
    const injectScript = document.createElement("script");
    injectScript.src = "https://cdn.botpress.cloud/webchat/v3.6/inject.js";
    injectScript.async = true;
    
    injectScript.onload = () => {
      setIsInjectLoaded(true);
      
      // 2. Create and inject config script after inject script finishes loading
      const configScript = document.createElement("script");
      configScript.src = "https://files.bpcontent.cloud/2026/06/10/17/20260610171736-5D6BNVCT.js";
      configScript.defer = true;
      
      configScript.onload = () => {
        setIsConfigLoaded(true);
        console.log("[Aetheria Chatbot] Botpress Webchat fully loaded");
      };

      configScript.onerror = () => {
        console.warn("[Aetheria Chatbot] Failed to load Botpress config. Falling back to local offline chat.");
        setIsLocalFallback(true);
      };
      
      document.body.appendChild(configScript);
    };

    injectScript.onerror = () => {
      console.warn("[Aetheria Chatbot] Failed to load Botpress webchat engine. Falling back to local offline chat.");
      setIsLocalFallback(true);
    };

    document.body.appendChild(injectScript);

    return () => {
      // Clean up injected scripts on unmount to keep DOM clean
      try {
        const inject = document.querySelector('script[src*="webchat/v3.6/inject.js"]');
        const config = document.querySelector('script[src*="5D6BNVCT.js"]');
        if (inject) document.body.removeChild(inject);
        if (config) document.body.removeChild(config);
      } catch (err) {
        // ignore unmount cleanup errors
      }
    };
  }, []);

  // Synchronize state contexts when config script completes loading
  useEffect(() => {
    if (isBotpressLoaded) {
      syncContext();
    }
  }, [isBotpressLoaded, syncContext]);

  const toggleChat = () => {
    if (isLocalFallback) {
      setIsOpen(!isOpen);
      return;
    }
    const bp = window.botpress || window.botpressWebChat;
    if (!bp) {
      // If scripts didn't load or failed, open in local fallback mode
      setIsLocalFallback(true);
      setIsOpen(!isOpen);
      return;
    }
    try {
      if (isOpen) {
        bp.sendEvent({ type: "hide" });
      } else {
        // Force sync current metrics on open
        syncContext(true);
        bp.sendEvent({ type: "show" });
      }
      setIsOpen(!isOpen);
    } catch (err) {
      console.error("[Aetheria Chatbot] Failed to toggle Webchat visibility, using fallback:", err);
      setIsLocalFallback(true);
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[140]">
      {/* Offline local chatbot overlay */}
      <AnimatePresence>
        {isLocalFallback && isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 h-[480px] bg-zinc-950/95 backdrop-blur-xl border border-emerald-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-[150] font-sans"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-zinc-900 to-black p-5 border-b border-emerald-500/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h4 className="font-heading font-black text-sm uppercase tracking-wider text-white">Aetheria AI</h4>
                  <p className="font-mono text-[8px] uppercase tracking-widest text-emerald-400">Offline Grid Core v1.4</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full border border-zinc-800 hover:bg-zinc-900 transition-colors text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-black/40">
              {localMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-100 rounded-tr-none"
                        : "bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <span className="text-[8px] font-mono text-zinc-600 mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!inputValue.trim()) return;
                const userText = inputValue;
                setInputValue("");

                const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                setLocalMessages((prev) => [...prev, { sender: "user", text: userText, time }]);

                // Simulate reply delay
                setTimeout(() => {
                  const replyText = getBotResponse(userText, context);
                  setLocalMessages((prev) => [
                    ...prev,
                    {
                      sender: "bot",
                      text: replyText,
                      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    }
                  ]);
                }, 600);
              }}
              className="p-4 border-t border-emerald-500/10 bg-zinc-950 flex gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about microgrid status..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-all placeholder:text-zinc-600 font-medium"
              />
              <button
                type="submit"
                className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-400 font-mono text-[9px] uppercase font-bold tracking-widest flex items-center justify-center cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggleChat}
        whileHover={{ scale: 1.1, translateY: -2 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-zinc-900/80 backdrop-blur-xl border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:border-emerald-400/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.35)] transition-all cursor-pointer"
        title="Talk to Grid Assistant"
      >
        {/* Pulsing ring */}
        <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping opacity-75 pointer-events-none" />
        
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageSquareCode className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
