# Design: Progressive Frame-Skipping Animation Preloading with Scroll-Aware Priority

## Context & Problem Statement
The website contains a scroll-driven canvas animation displaying `144` high-definition frames located in `/new_animation/`. Each frame is a PNG image of approximately `1.1MB` to `1.4MB`. In total, the full sequence is around `160MB`.
Currently, the `EnergyCanvas.tsx` component loads Frame 0, draws it, and then initiates loading of all remaining `143` frames in parallel. This causes massive network congestion, high server latency, and means that when a user lands on the website and scrolls immediately:
1. The target frames are not loaded, resulting in blank/black flashing canvases.
2. The user experience is stuttery and visually broken.
3. The page performance is severely degraded during the first visit.

The user wants the landing page to be **instantaneously interactive and scrollable** (no loading screens blocking dashboard entry), but also **fully smooth** without visual glitches.

## Proposed Design
We will implement a **Smart Progressive Frame-Skipping Preloader** in `EnergyCanvas.tsx`.

### 1. Multi-Phase Loading Strategy
*   **Phase 1: Keyframe Baseline (Sparse Load)**:
    *   We will immediately load a sparse subset of frames: **every 8th frame** (`0, 8, 16, 24, 32, ..., 136, 143`).
    *   This constitutes only `19` frames (~20MB total) instead of `144` frames (~160MB).
    *   Once these 19 frames load, the user can scroll from top to bottom, and the canvas will always have a frame to show.
*   **Phase 2: Dynamic Scroll-Aware Prioritized Loading**:
    *   As the user scrolls and approaches frame `F`, we dynamically trigger loading of the immediate neighborhood of frames (e.g., `F - 2` to `F + 5`).
    *   This ensures that the frames corresponding to the user's current scroll speed and position are prioritized over idle background frames.
*   **Phase 3: Background Full Scan (Idle Load)**:
    *   A background process will sequentially load the remaining frames from start to finish during idle periods, filling the gaps.

### 2. Closest-Frame Fallback Logic
When drawing the canvas at frame index `F`:
1. If the image for frame `F` is loaded and complete, draw it.
2. If the image for frame `F` is NOT loaded, scan outward:
   * Look at `F - 1`, `F + 1`, `F - 2`, `F + 2`, etc., up to a maximum distance.
   * Draw the first frame in this search that is loaded.
3. Because Phase 1 guarantees all every-8th frames are loaded, the search is guaranteed to find a fallback frame within at most `4` steps.
4. This ensures there are **zero black screens or flashing frames** during fast scroll.

### 3. Component State Changes in `EnergyCanvas.tsx`
*   `imagesRef`: Maintain an array of `HTMLImageElement` of size `144`.
*   `loadedFrames`: A state or ref tracking which frames are loaded.
*   `requestedFrames`: A ref tracking which frames have had their loading initiated, preventing duplicate network requests.

## Verification Plan
1. **Initial Load**: Confirm the dashboard opens instantly and draws Frame 0.
2. **Scroll Behavior**: Scroll rapidly immediately after loading. Verify that no black frames or flickering occur, and that the scroll animation remains visually continuous.
3. **Network Performance**: Verify in Chrome DevTools that only ~19 images are requested initially, followed by scroll-priority and background fill requests.
