"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useTransform } from "framer-motion";

const FRAME_COUNT = 144;

interface EnergyCanvasProps {
  scrollProgress: any; // MotionValue<number>
}

export default function EnergyCanvas({ scrollProgress }: EnergyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>(new Array(FRAME_COUNT));
  const requestedFrames = useRef<boolean[]>(new Array(FRAME_COUNT).fill(false));
  const loadedFrames = useRef<boolean[]>(new Array(FRAME_COUNT).fill(false));
  const [ready, setReady] = useState(false);
  const neighborhoodTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Map scroll progress (0-1) to frame index (0-143)
  const frameIndex = useTransform(scrollProgress, [0, 1], [0, FRAME_COUNT - 1], { clamp: true });
  const opacity = useTransform(scrollProgress, [0.9, 1], [1, 0]);

  const loadFrame = (i: number, callback?: () => void) => {
    if (i < 0 || i >= FRAME_COUNT) return;
    if (requestedFrames.current[i]) {
      if (loadedFrames.current[i] && callback) callback();
      return;
    }
    requestedFrames.current[i] = true;

    const img = new Image();
    img.src = `/new_animation/frame_${i.toString().padStart(3, "0")}_delay-0.055s.png`;
    imagesRef.current[i] = img;

    img.onload = () => {
      loadedFrames.current[i] = true;
      if (i === 0 && !ready) {
        resizeCanvas();
        renderFrame(0);
        setReady(true);
      } else if (ready) {
        // Redraw current frame to update from fallback to high-quality if this is the active frame
        renderFrame(frameIndex.get());
      }
      if (callback) callback();
    };
    img.onerror = () => {
      requestedFrames.current[i] = false; // allow retry
    };
  };

  const renderFrame = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const targetIndex = Math.floor(index);

    // 1. Immediately request the active target frame
    if (!requestedFrames.current[targetIndex]) {
      loadFrame(targetIndex);
    }

    // 2. Clear pending neighborhood requests
    if (neighborhoodTimeoutRef.current) {
      clearTimeout(neighborhoodTimeoutRef.current);
    }

    // 3. Debounce neighborhood loading by 100ms to prevent network congestion during fast scroll
    neighborhoodTimeoutRef.current = setTimeout(() => {
      const priorityNeighborhood = [
        targetIndex + 1,
        targetIndex + 2,
        targetIndex - 1
      ];
      priorityNeighborhood.forEach(f => {
        if (f >= 0 && f < FRAME_COUNT && !requestedFrames.current[f]) {
          loadFrame(f);
        }
      });
    }, 100);

    // 4. Search outward for the closest loaded frame (fallback)
    let img = imagesRef.current[targetIndex];
    let isImgLoaded = img && loadedFrames.current[targetIndex] && img.complete && img.naturalWidth > 0;

    if (!isImgLoaded) {
      let foundFallback = false;
      for (let offset = 1; offset < FRAME_COUNT; offset++) {
        const prev = targetIndex - offset;
        const next = targetIndex + offset;

        if (prev >= 0) {
          const pImg = imagesRef.current[prev];
          if (pImg && loadedFrames.current[prev] && pImg.complete && pImg.naturalWidth > 0) {
            img = pImg;
            foundFallback = true;
            break;
          }
        }
        if (next < FRAME_COUNT) {
          const nImg = imagesRef.current[next];
          if (nImg && loadedFrames.current[next] && nImg.complete && nImg.naturalWidth > 0) {
            img = nImg;
            foundFallback = true;
            break;
          }
        }
      }
      if (!foundFallback) return; // Wait for at least frame 0
    }

    // Draw the image (either original or fallback)
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;
    
    let scale;
    if (canvasRatio < 0.8) {
      // Mobile/Portrait: compromise between cover and contain to show more sides
      scale = (canvas.width / img.width) * 1.1; 
      scale = Math.max(scale, canvas.height / img.height * 0.8);
    } else {
      scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    }

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

  // Mount logic: Load frame 0 immediately and prefetch a sparse set of keyframes
  useEffect(() => {
    // Load frame 0 immediately as priority
    loadFrame(0, () => {
      // Load keyframes: every 16th frame (very sparse) to provide basic scroll fallbacks
      const keyframes: number[] = [];
      for (let i = 16; i < FRAME_COUNT - 1; i += 16) {
        keyframes.push(i);
      }
      keyframes.push(FRAME_COUNT - 1);

      keyframes.forEach((f, idx) => {
        setTimeout(() => {
          loadFrame(f);
        }, idx * 100); // Spaced gently by 100ms to avoid network congestion
      });
    });

    return () => {
      if (neighborhoodTimeoutRef.current) {
        clearTimeout(neighborhoodTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update canvas on scroll / resize
  useEffect(() => {
    if (!ready) return;

    const handleResize = () => {
      resizeCanvas();
      renderFrame(frameIndex.get());
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    const unsubscribe = frameIndex.on("change", (v) => renderFrame(v));

    return () => {
      window.removeEventListener("resize", handleResize);
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, frameIndex]);

  return (
    <motion.div
      className="fixed inset-0 z-0 h-screen w-full pointer-events-none overflow-hidden"
      style={{ 
        opacity, 
        background: "radial-gradient(ellipse at center, #001f3f 0%, #000 100%)" 
      } as any}
    >
      <canvas ref={canvasRef} className="h-full w-full object-cover" style={{ background: "transparent" }} />
    </motion.div>
  );
}
