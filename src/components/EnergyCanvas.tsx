"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useTransform } from "framer-motion";

const FRAME_COUNT = 128;

interface EnergyCanvasProps {
  scrollProgress: any; // MotionValue<number>
}

export default function EnergyCanvas({ scrollProgress }: EnergyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Map scroll progress (0-1) to frame index (0-127)
  const frameIndex = useTransform(scrollProgress, [0, 1], [0, FRAME_COUNT - 1], { clamp: true });
  const opacity = useTransform(scrollProgress, [0.9, 1], [1, 0]);

  useEffect(() => {
    // Preload images
    const loadImages = async () => {
      const loadedImages: HTMLImageElement[] = [];
      const promises = [];

      for (let i = 0; i < FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `/sequence/frame_${i.toString().padStart(3, "0")}_delay-0.062s.png`;
        promises.push(new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve; // Continue even if one fails
        }));
        loadedImages.push(img);
      }

      await Promise.all(promises);
      setImages(loadedImages);
      setIsLoading(false);
    };

    loadImages();
  }, []);

  useEffect(() => {
    if (images.length === 0 || !canvasRef.current) return;

    const context = canvasRef.current.getContext("2d");
    if (!context) return;

    const render = (index: number) => {
      const img = images[Math.floor(index)];
      if (!img || !img.complete) return;

      const canvas = canvasRef.current!;
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Maintain aspect ratio while filling canvas
      const scale = Math.max(
        canvas.width / img.width,
        canvas.height / img.height
      );
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;
      
      context.drawImage(img, x, y, img.width * scale, img.height * scale);
    };

    // Keep it sharp
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth * window.devicePixelRatio;
        canvasRef.current.height = window.innerHeight * window.devicePixelRatio;
        render(frameIndex.get());
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    const unsubscribe = frameIndex.on("change", (v) => render(v));

    return () => {
      window.removeEventListener("resize", handleResize);
      unsubscribe();
    };
  }, [images]);

  return (
    <motion.div 
      style={{ opacity }}
      className="fixed inset-0 z-0 h-screen w-full pointer-events-none overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full object-cover"
      />
    </motion.div>
  );
}
