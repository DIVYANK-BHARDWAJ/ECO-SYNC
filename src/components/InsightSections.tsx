"use client";

import { motion, useTransform } from "framer-motion";

// Each environment gets its own distinct color so it never blends into the animation
const colorMap: Record<string, { label: string; border: string; text: string; dot: string; cardBg: string }> = {
  emerald: {
    label: "#10b981",
    border: "#10b981",
    text: "#10b981",
    dot: "#10b981",
    cardBg: "rgba(4, 20, 12, 0.97)",
  },
  cyber: {
    label: "#f59e0b",     // amber — distinct from the site's cyan AND from emerald
    border: "#f59e0b",
    text: "#f59e0b",
    dot: "#f59e0b",
    cardBg: "rgba(20, 12, 4, 0.97)",
  },
};

const insights = [
  {
    range: [0, 0.25] as [number, number],
    title: "Living Room",
    text: "Standby devices waste 10% of your bill.",
    color: "emerald",
  },
  {
    range: [0.35, 0.6] as [number, number],
    title: "Kitchen",
    text: "Electric cooking uses 30% less power than gas.",
    color: "cyber",
  },
  {
    range: [0.7, 0.95] as [number, number],
    title: "Garage",
    text: "Solar panels can cut electricity costs by 60%.",
    color: "emerald",
  },
];

interface InsightSectionsProps {
  scrollProgress: any; // MotionValue<number>
}

export default function InsightSections({ scrollProgress }: InsightSectionsProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {insights.map((insight, index) => (
        <InsightBubble 
          key={index} 
          insight={insight} 
          progress={scrollProgress} 
        />
      ))}
    </div>
  );
}

function InsightBubble({ insight, progress }: { insight: any, progress: any }) {
  const c = colorMap[insight.color] ?? colorMap.emerald;

  const opacity = useTransform(
    progress,
    [insight.range[0], insight.range[0] + 0.05, insight.range[1] - 0.05, insight.range[1]],
    [0, 1, 1, 0]
  );
  
  const y = useTransform(
    progress,
    [insight.range[0], insight.range[1]],
    [50, -50]
  );

  return (
    <motion.div
      style={{ opacity, y, maxWidth: "200px" }}
      className="sticky top-1/2 right-6 mt-[-80px] ml-auto"
    >
      <div
        className="rounded-xl px-4 py-5 backdrop-blur-2xl"
        style={{
          background: c.cardBg,
          border: `1px solid ${c.border}`,
          borderLeft: `3px solid ${c.border}`,
          boxShadow: `0 4px 20px rgba(0,0,0,0.7), 0 0 12px ${c.border}18`,
        }}
      >
        {/* Label */}
        <div className="flex items-center gap-1.5 mb-3">
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: c.dot, boxShadow: `0 0 5px ${c.dot}` }}
          />
          <span
            className="text-[10px] font-black font-mono uppercase tracking-[0.25em] leading-none"
            style={{ color: c.label }}
          >
            {insight.title}
          </span>
        </div>
        {/* Tip */}
        <p className="text-white text-xs leading-relaxed font-medium">
          {insight.text}
        </p>
      </div>
    </motion.div>
  );
}
