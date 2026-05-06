"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const cursorX = useSpring(0, { damping: 20, stiffness: 250 });
  const cursorY = useSpring(0, { damping: 20, stiffness: 250 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [cursorX, cursorY]);

  return (
    <>
      {/* Outer Scanning Ring (Rotating Sonar) */}
      <motion.div 
        style={{ 
          x: cursorX, 
          y: cursorY, 
          translateX: "-50%", 
          translateY: "-50%",
          pointerEvents: "none"
        }}
        className="fixed top-0 left-0 w-10 h-10 rounded-full border border-accent-primary/10 z-[9999] custom-cursor flex items-center justify-center"
      >
        <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
           className="absolute inset-0 border-t-2 border-r border-accent-primary/40 rounded-full"
        />
        {/* Pulsing Sonar Effect */}
        <motion.div 
           animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
           transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
           className="absolute inset-0 border border-accent-primary/30 rounded-full"
        />
      </motion.div>

      {/* Mechanical Crosshair - Horizontal */}
      <motion.div 
        style={{ 
          x: cursorX, 
          y: cursorY, 
          translateX: "-50%", 
          translateY: "-50%",
          pointerEvents: "none"
        }}
        className="fixed top-0 left-0 w-5 h-[1.5px] bg-accent-primary/60 z-[9999] custom-cursor"
      />

      {/* Mechanical Crosshair - Vertical */}
      <motion.div 
        style={{ 
          x: cursorX, 
          y: cursorY, 
          translateX: "-50%", 
          translateY: "-50%",
          pointerEvents: "none"
        }}
        className="fixed top-0 left-0 w-[1.5px] h-5 bg-accent-primary/60 z-[9999] custom-cursor"
      />

      {/* Central Precision Targeting Dot */}
      <motion.div 
        style={{ 
          x: cursorX, 
          y: cursorY, 
          translateX: "-50%", 
          translateY: "-50%",
          pointerEvents: "none"
        }}
        className="fixed top-0 left-0 w-1 h-1 rounded-full bg-white z-[10000] custom-cursor shadow-[0_0_8px_rgba(255,255,255,0.8)]"
      />
    </>
  );
}
