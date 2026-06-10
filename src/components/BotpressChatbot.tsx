"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareCode, X } from "lucide-react";
import { formatBotpressPayload, ProsumerContext } from "@/lib/botpress";

interface BotpressChatbotProps {
  context: ProsumerContext;
}

declare global {
  interface Window {
    botpressWebChat: any;
  }
}

export default function BotpressChatbot({ context }: BotpressChatbotProps) {
  const [isInjectLoaded, setIsInjectLoaded] = useState(false);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const lastPayloadRef = useRef<string>("");

  const isBotpressLoaded = isInjectLoaded && isConfigLoaded;

  // Sync state context helper
  const syncContext = useCallback((forced = false) => {
    if (window.botpressWebChat) {
      const payload = formatBotpressPayload(context);
      const payloadStr = JSON.stringify(payload);
      
      if (forced || payloadStr !== lastPayloadRef.current) {
        try {
          window.botpressWebChat.sendPayload(payload);
          lastPayloadRef.current = payloadStr;
          console.log("[Aetheria Chatbot] Synced state context:", payload);
        } catch (e) {
          console.error("[Aetheria Chatbot] Failed to sync state payload:", e);
        }
      }
    }
  }, [context]);

  // Load Botpress Scripts dynamically on mount to prevent SSR hydration crashes
  useEffect(() => {
    if (typeof window === "undefined") return;

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
      
      document.body.appendChild(configScript);
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
    if (!window.botpressWebChat) return;
    try {
      if (isOpen) {
        window.botpressWebChat.sendEvent({ type: "hide" });
      } else {
        // Force sync current metrics on open
        syncContext(true);
        window.botpressWebChat.sendEvent({ type: "show" });
      }
      setIsOpen(!isOpen);
    } catch (err) {
      console.error("[Aetheria Chatbot] Failed to toggle Webchat visibility:", err);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[140]">
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
