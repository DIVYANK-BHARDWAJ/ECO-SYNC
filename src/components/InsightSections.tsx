"use client";

import { motion, useScroll, useTransform } from "framer-motion";

const insights = [
  {
    range: [0, 0.25] as [number, number],
    title: "Living Room",
    text: "Phantom loads account for 10% of your bill.",
    color: "emerald",
  },
  {
    range: [0.35, 0.6] as [number, number],
    title: "Kitchen",
    text: "Induction heating saves 30% more energy than gas.",
    color: "cyber",
  },
  {
    range: [0.7, 0.95] as [number, number],
    title: "Garage",
    text: "Solar integration reduces grid dependency by 60%.",
    color: "emerald",
  },
];

export default function InsightSections() {
  const { scrollYProgress } = useScroll();

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {insights.map((insight, index) => (
        <InsightBubble 
          key={index} 
          insight={insight} 
          progress={scrollYProgress} 
        />
      ))}
    </div>
  );
}

function InsightBubble({ insight, progress }: { insight: any, progress: any }) {
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
      style={{ opacity, y }}
      className="sticky top-1/2 right-12 mt-[-100px] w-72 glass-panel p-6 rounded-2xl border-l-4 border-l-accent-emerald ml-auto"
    >
      <div className={`text-[10px] font-mono mb-2 uppercase tracking-tighter ${insight.color === "emerald" ? "text-accent-emerald" : "text-accent-cyber"}`}>
        ENVIRONMENT: {insight.title}
      </div>
      <p className="text-white/80 text-sm leading-relaxed">
        {insight.text}
      </p>
    </motion.div>
  );
}
