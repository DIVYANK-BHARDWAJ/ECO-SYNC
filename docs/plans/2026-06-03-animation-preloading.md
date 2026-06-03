# Dynamic Scroll-Prioritized Animation Preloading Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Implement a scroll-aware progressive preloader with closest-frame fallback for the 144-frame canvas animation to make it buttery smooth on first load without blocking the dashboard.

**Architecture:**
- **Phase 1 (Baseline)**: Instantly load every 8th frame to create a low-overhead, fast baseline.
- **Phase 2 (Scroll-Aware)**: Prioritize loading the frame neighborhood (current + next 4, previous 1) based on the user's scroll.
- **Phase 3 (Background Fill)**: Sequentially load remaining gaps in the background using small delays to not block the UI.
- **Phase 4 (Closest-Frame Fallback)**: If a target frame isn't loaded yet, scan outward to render the closest loaded frame instead of showing a black screen.

**Tech Stack:** Next.js, React, Canvas 2D API, Framer Motion

---

### Task 1: Modify EnergyCanvas component to support progressive loading and fallback

**Files:**
- Modify: [EnergyCanvas.tsx](file:///c:/Users/DIVYANK%20BHARDWAJ/Desktop/Projects/eco%20sync%20updated/eco-sync/src/components/EnergyCanvas.tsx)

**Step 1: Replace implementation in EnergyCanvas.tsx**
We will replace the existing loading and rendering code with the progressive preloading, neighborhood prioritizer, background fill, and outward fallback search.

Code implementation details:
```typescript
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
      if (i === 0) {
        resizeCanvas();
        renderFrame(0);
        setReady(true);
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

    // 1. Prioritize neighborhood loading when we try to render
    const priorityNeighborhood = [
      targetIndex,
      targetIndex + 1,
      targetIndex + 2,
      targetIndex + 3,
      targetIndex + 4,
      targetIndex - 1
    ];
    priorityNeighborhood.forEach(f => {
      if (f >= 0 && f < FRAME_COUNT && !requestedFrames.current[f]) {
        loadFrame(f);
      }
    });

    // 2. Search outward for the closest loaded frame (fallback)
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

  // Mount logic: Phase 1 & Phase 3
  useEffect(() => {
    // Load frame 0 immediately as priority
    loadFrame(0, () => {
      // Load keyframes: every 8th frame
      const keyframes: number[] = [];
      for (let i = 8; i < FRAME_COUNT - 1; i += 8) {
        keyframes.push(i);
      }
      keyframes.push(FRAME_COUNT - 1);

      let keyframeIdx = 0;
      const loadNextKeyframeBatch = () => {
        if (keyframeIdx >= keyframes.length) {
          // Keyframes done, start low-priority background fill
          loadBackgroundFill();
          return;
        }
        
        const batch = keyframes.slice(keyframeIdx, keyframeIdx + 4);
        keyframeIdx += 4;
        
        let loadedCount = 0;
        batch.forEach(f => {
          loadFrame(f, () => {
            loadedCount++;
            if (loadedCount === batch.length) {
              loadNextKeyframeBatch();
            }
          });
        });
      };

      loadNextKeyframeBatch();
    });

    const loadBackgroundFill = () => {
      let currentIdx = 1;
      
      const loadNextFillBatch = () => {
        if (currentIdx >= FRAME_COUNT) return;

        // Collect next 4 unrequested frames
        const batch: number[] = [];
        while (batch.length < 4 && currentIdx < FRAME_COUNT) {
          if (!requestedFrames.current[currentIdx]) {
            batch.push(currentIdx);
          }
          currentIdx++;
        }

        if (batch.length === 0) {
          loadNextFillBatch();
          return;
        }

        let loadedCount = 0;
        batch.forEach(f => {
          loadFrame(f, () => {
            loadedCount++;
            if (loadedCount === batch.length) {
              // Yield main thread slightly between batches
              setTimeout(loadNextFillBatch, 60);
            }
          });
        });
      };

      loadNextFillBatch();
    };
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
```

**Step 2: Verify changes locally**
We will verify that the compilation is successful and the build does not fail.
Command: `npm run build` or similar.
