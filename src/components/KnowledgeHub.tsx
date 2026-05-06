"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Cpu, Zap, Lightbulb, Wind } from "lucide-react";

export function KnowledgeHub() {
  return (
    <section className="py-16 sm:py-32 px-6 sm:px-12 bg-background relative overflow-hidden border-t border-accent-system/20">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-accent-system/5 blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2" />
      {/* Decorative Glow — bottom right */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent-system/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 mb-32">
          {/* About Us */}
          <div>
            <h2 className="text-4xl sm:text-7xl font-black text-white mb-8 sm:mb-12 tracking-tighter uppercase italic">
              What we <span className="text-accent-system">do</span>
            </h2>
            <p className="text-white/50 text-lg sm:text-xl leading-relaxed font-light mb-8 font-sans">
              ECO-SYNC NEXUS is at the forefront of digital energy architecture. We provide homeowners with a high-fidelity window into their consumption patterns, empowering energy sovereignty through data-driven precision.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
              <div className="p-6 sm:p-8 bg-slate-950 rounded-3xl border border-white/5 shadow-xl group hover:border-accent-system/30 transition-all">
                <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-accent-system mb-4" />
                <h4 className="text-white font-bold mb-2 uppercase tracking-tighter font-heading">Sustainability</h4>
                <p className="text-white/30 text-xs text-balance">Committed to reducing global CO2 footprints via optimized grid intelligence.</p>
              </div>
              <div className="p-6 sm:p-8 bg-slate-950 rounded-3xl border border-white/5 shadow-xl group hover:border-accent-system/30 transition-all">
                <Cpu className="w-8 h-8 sm:w-10 sm:h-10 text-accent-system mb-4 shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
                <h4 className="text-white font-bold mb-2 uppercase tracking-tighter font-heading">Innovation</h4>
                <p className="text-white/30 text-xs text-balance">Real-time simulation using advanced physics-based modeling and AI nodes.</p>
              </div>
            </div>
          </div>

          {/* How We Achieve It */}
          <div>
            <h2 className="text-4xl sm:text-7xl font-black text-white mb-8 sm:mb-12 tracking-tighter uppercase italic">
              How we <span className="text-accent-system">work</span>
            </h2>
            <div className="space-y-6">
              {[
                { title: "Pulse Stream Tracking", desc: "Our engine updates consumption every second using live high-frequency data streams." },
                { title: "Hardware Synthesis", desc: "Simulating live feedback from heavy thermal loads and smart infrastructure nodes." },
                { title: "Predictive Intelligence", desc: "Calculating future projections to help you architect your budget with precision." }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 p-6 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10 group">
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/20 font-mono group-hover:border-accent-system group-hover:text-accent-system transition-all">
                    0{i+1}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg uppercase tracking-tight font-heading">{item.title}</h4>
                    <p className="text-white/60 text-sm mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Savings Tips Section — Interactive */}
        <MaximizeSavingsSection />
      </div>
    </section>
  );
}

function MaximizeSavingsSection() {
  const [unlocked, setUnlocked] = React.useState(false);

  const categories = [
    {
      icon: <Wind className="w-8 h-8 text-accent-system" />,
      title: "Thermal Efficiency",
      tips: ["Maintain thermal balance at 24°C", "Optimize air-flow during high humidity", "Conduct bi-weekly hardware filtration maintenance"],
      badge: "CLIMATE",
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-accent-system" />,
      title: "Luminous Control",
      tips: ["Deploy LED arrays for efficiency", "Implement sunset luminosity protocols", "Deactivate illumination in vacant sectors"],
      badge: "LUMENS",
    },
    {
      icon: <Zap className="w-8 h-8 text-accent-system" />,
      title: "Load Balancing",
      tips: ["Shift heavy loads to off-peak windows", "Initialize EV protocols post-midnight", "Eliminate phantom energy dissipation"],
      badge: "GRID",
    },
  ];

  return (
    <div className="border-t border-white/5 pt-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-12 sm:mb-16">
        <div className="text-center md:text-left">
          <p className="text-accent-system/60 font-mono text-[9px] sm:text-[11px] uppercase tracking-[0.4em] mb-2 sm:mb-3 font-bold">
            {unlocked ? "— Intelligence Unlocked —" : "— Encrypted Strategies —"}
          </p>
          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase italic font-heading">
            Optimize <span className="text-accent-system" style={{ textShadow: "0 0 30px rgba(168,85,247,0.3)" }}>Savings</span>
          </h2>
        </div>

        {/* Toggle Button */}
        <motion.button
          onClick={() => setUnlocked(v => !v)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className={`relative flex items-center gap-4 px-8 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all duration-500 overflow-hidden font-heading ${
            unlocked
              ? "bg-slate-950 border border-white/10 text-white hover:border-accent-system/40"
              : "bg-accent-system text-white shadow-[0_0_40px_rgba(168,85,247,0.3)] hover:bg-purple-600"
          }`}
        >
          {!unlocked && (
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "linear", repeatDelay: 0.6 }}
              className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
            />
          )}
          <span className="relative z-10 text-xl">{unlocked ? "🔓" : "🔒"}</span>
          <span className="relative z-10">{unlocked ? "Hide Protocols" : "Decrypt Efficiency Guide"}</span>
          {!unlocked && (
            <span className="relative z-10 ml-1 bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
              ACTIVE
            </span>
          )}
        </motion.button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {unlocked ? (
          categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: i * 0.12, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <TipCard icon={cat.icon} title={cat.title} tips={cat.tips} badge={cat.badge} />
            </motion.div>
          ))
        ) : (
          /* Locked placeholder cards */
          categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              className="p-10 bg-slate-950 border border-white/5 rounded-[3rem] relative overflow-hidden cursor-pointer"
              onClick={() => setUnlocked(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "linear", delay: i * 0.4 }}
                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
              />
              <div className="blur-[3px] opacity-40 select-none pointer-events-none text-white">
                <div className="w-16 h-16 bg-white/5 rounded-2xl mb-8" />
                <div className="h-6 w-3/4 bg-white/10 rounded-full mb-6" />
                <div className="space-y-4">
                  <div className="h-4 w-full bg-white/5 rounded-full" />
                  <div className="h-4 w-5/6 bg-white/5 rounded-full" />
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-slate-900/90 border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-3 backdrop-blur-sm">
                  <span className="text-lg">🔒</span>
                  <span className="text-white/40 font-bold text-xs uppercase tracking-widest">{cat.badge}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {!unlocked && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-white/20 font-mono text-xs uppercase tracking-widest mt-10"
        >
          ↑ Access decrypted energy intelligence nodes
        </motion.p>
      )}
    </div>
  );
}

function TipCard({ icon, title, tips, badge }: { icon: any; title: string; tips: string[]; badge: string }) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="p-10 bg-slate-950 border border-white/10 rounded-[3rem] transition-all hover:border-accent-system/30 hover:shadow-[0_0_60px_rgba(168,85,247,0.1)] relative overflow-hidden group h-full"
    >
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent-system/5 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex items-start justify-between mb-8">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-accent-system/10 transition-colors">
          {icon}
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 border border-white/10 px-3 py-1.5 rounded-full">
          {badge}
        </span>
      </div>
      <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight italic font-heading">{title}</h3>
      <ul className="space-y-4">
        {tips.map((tip, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className="flex gap-3 text-white/60 text-sm leading-relaxed"
          >
            <ChevronSmallRight className="w-4 h-4 text-accent-system shrink-0 mt-1" />
            {tip}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

function ChevronSmallRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
