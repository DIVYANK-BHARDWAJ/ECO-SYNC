"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useTransform } from "framer-motion";

const FRAME_COUNT = 128;

interface EnergyCanvasProps {
  scrollProgress: any; // MotionValue<number>
}

export default function EnergyCanvas({ scrollProgress }: EnergyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [ready, setReady] = useState(false);

  // Map scroll progress (0-1) to frame index (0-127)
  const frameIndex = useTransform(scrollProgress, [0, 1], [0, FRAME_COUNT - 1], { clamp: true });
  const opacity = useTransform(scrollProgress, [0.9, 1], [1, 0]);

  const renderFrame = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const img = imagesRef.current[Math.floor(index)];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const x = (canvas.width - img.width * scale) / 2;
    const y = (canvas.height - img.height * scale) / 2;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, x, y, img.width * scale, img.height * scale);
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
  };

  useEffect(() => {
    // Pre-allocate all slots immediately
    const imgs: HTMLImageElement[] = new Array(FRAME_COUNT);

    const loadFrame = (i: number) => {
      const img = new Image();
      img.src = `/sequence/frame_${i.toString().padStart(3, "0")}_delay-0.062s.png`;
      imgs[i] = img;

      img.onload = () => {
        imagesRef.current = imgs;

        // Draw frame 0 the moment it loads — eliminates the black screen
        if (i === 0) {
          resizeCanvas();
          renderFrame(0);
          setReady(true);
        }
      };
      img.onerror = () => {
        // still set so later renders don't stall
        imagesRef.current = imgs;
      };
    };

    // Load frame 0 first, then the rest in order
    loadFrame(0);
    for (let i = 1; i < FRAME_COUNT; i++) loadFrame(i);
  }, []);

  useEffect(() => {
    if (!ready) return;

    resizeCanvas();
    renderFrame(frameIndex.get());

    window.addEventListener("resize", () => {
      resizeCanvas();
      renderFrame(frameIndex.get());
    });

    const unsubscribe = frameIndex.on("change", (v) => renderFrame(v));

    return () => {
      window.removeEventListener("resize", () => {});
      unsubscribe();
    };
  }, [ready]);

  return (
    <motion.div
      className="fixed inset-0 z-0 h-screen w-full pointer-events-none overflow-hidden"
      style={{ 
        opacity, 
        background: "radial-gradient(ellipse at center, #0a1628 0%, #050d0a 60%, #000 100%)" 
      } as any}
    >
      <canvas ref={canvasRef} className="h-full w-full object-cover" style={{ background: "transparent" }} />
    </motion.div>
  );
}
