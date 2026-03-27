"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

const FRAME_COUNT = 128;

export default function EnergyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollYProgress } = useScroll();
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Map scroll progress (0-1) to frame index (0-127)
  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, FRAME_COUNT - 1]);

  useEffect(() => {
    // Preload images
    const loadImages = async () => {
      const loadedImages: HTMLImageElement[] = [];
      let loadedCount = 0;

      for (let i = 0; i < FRAME_COUNT; i++) {
        const img = new Image();
        const frameStr = i.toString().padStart(3, "0");
        img.src = `/sequence/frame_${frameStr}_delay-0.062s.png`;
        img.onload = () => {
          loadedCount++;
          if (loadedCount === FRAME_COUNT) {
            setIsLoading(false);
          }
        };
        loadedImages.push(img);
      }
      setImages(loadedImages);
    };

    loadImages();
  }, []);

  useEffect(() => {
    // Draw frame on canvas when scroll position changes
    const render = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const currentFrame = Math.floor(frameIndex.get());

      if (ctx && images[currentFrame]) {
        const img = images[currentFrame];
        
        // Aspect ratio logic: cover the canvas
        const canvasWidth = canvas!.width;
        const canvasHeight = canvas!.height;
        const imgWidth = img.width;
        const imgHeight = img.height;
        
        const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
        const x = (canvasWidth - imgWidth * scale) / 2;
        const y = (canvasHeight - imgHeight * scale) / 2;
        
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(img, x, y, imgWidth * scale, imgHeight * scale);
      }
    };

    const unsubscribe = frameIndex.on("change", render);
    
    // Initial render
    if (!isLoading) render();

    return () => unsubscribe();
  }, [frameIndex, images, isLoading]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="fixed inset-0 z-0 h-screen w-full pointer-events-none">
      <canvas
        ref={canvasRef}
        className="h-full w-full object-cover"
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-50">
          <div className="text-accent-emerald animate-pulse text-xl font-mono">
            SYNCING ENVIRONMENTS...
          </div>
        </div>
      )}
    </div>
  );
}
