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
      <motion.div 
        style={{ 
          x: cursorX, 
          y: cursorY, 
          translateX: "-50%", 
          translateY: "-50%",
          pointerEvents: "none"
        }}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-accent-cyber/50 z-[9999] bg-accent-cyber/10 backdrop-blur-sm shadow-[0_0_20px_rgba(0,240,255,0.3)] custom-cursor"
      />
      <motion.div 
        style={{ 
          x: cursorX, 
          y: cursorY, 
          translateX: "-50%", 
          translateY: "-50%",
          pointerEvents: "none"
        }}
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-white z-[9999] custom-cursor"
      />
    </>
  );
}
