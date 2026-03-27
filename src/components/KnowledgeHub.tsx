"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Cpu, Zap, Lightbulb, Thermometer, Wind } from "lucide-react";

export function KnowledgeHub() {
  return (
    <section className="py-32 px-12 bg-slate-950 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent-cyber/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 mb-32">
          {/* About Us */}
          <div>
            <h2 className="text-7xl font-black text-white mb-12 tracking-tighter uppercase italic">
              What we <span className="text-accent-cyber">do</span>
            </h2>
            <p className="text-white/50 text-xl leading-relaxed font-light mb-8">
              Aether-Grid is at the forefront of digital energy management. We provide homeowners with a high-fidelity window into their consumption patterns, empowering a sustainable future through data-driven decisions.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div className="p-8 bg-slate-900 rounded-3xl border border-white/5 shadow-xl">
                <ShieldCheck className="w-10 h-10 text-accent-cyber mb-4" />
                <h4 className="text-white font-bold mb-2">Sustainability</h4>
                <p className="text-white/30 text-xs">Committed to reducing global CO2 footprints in India.</p>
              </div>
              <div className="p-8 bg-slate-900 rounded-3xl border border-white/5 shadow-xl">
                <Cpu className="w-10 h-10 text-accent-cyber mb-4 shadow-[0_0_10px_#00F0FF]" />
                <h4 className="text-white font-bold mb-2">Innovation</h4>
                <p className="text-white/30 text-xs">Real-time simulation using physics-based modeling.</p>
              </div>
            </div>
          </div>

          {/* How We Achieve It */}
          <div>
            <h2 className="text-7xl font-black text-white mb-12 tracking-tighter uppercase italic">
              How we <span className="text-accent-cyber">work</span>
            </h2>
            <div className="space-y-6">
              {[
                { title: "Real-time Tracking", desc: "Our engine updates consumption every second using Power Consumption data." },
                { title: "Hardware Integration", desc: "Simulating live feedback from 1.5 Ton ACs and Smart Appliances." },
                { title: "Predictive Analytics", desc: "Calculating monthly projections to help you budget better in Rupees." }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 p-6 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5 group">
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/20 font-mono group-hover:border-accent-cyber group-hover:text-accent-cyber transition-all">
                    0{i+1}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">{item.title}</h4>
                    <p className="text-white/60 text-sm mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Savings Tips Section */}
        <div className="border-t border-white/10 pt-32">
          <h2 className="text-6xl font-black text-white mb-16 tracking-tighter text-center uppercase italic">
             Maximize <span className="text-accent-cyber neon-text-cyber">Savings</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TipCard 
              icon={<Wind className="w-8 h-8 text-accent-cyber" />}
              title="Climate Efficiency"
              tips={["Set AC to 24°C for balance", "Use dry-mode in monsoon", "Clean AC filters every 15 days"]}
            />
            <TipCard 
              icon={<Lightbulb className="w-8 h-8 text-accent-cyber" />}
              title="Smart Lighting"
              tips={["Use LED bulbs (9W typical)", "Schedule sundown dimming", "Turn off lights in empty rooms"]}
            />
            <TipCard 
              icon={<Zap className="w-8 h-8 text-white" />}
              title="Peak Management"
              tips={["Run heavy load after 9PM", "Charge EVs during off-peak", "Unplug idle phone chargers"]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function TipCard({ icon, title, tips }: { icon: any, title: string, tips: string[] }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="p-10 bg-[#050505] border border-white/5 rounded-[3rem] transition-all hover:border-accent-cyber/30"
    >
      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight">{title}</h3>
      <ul className="space-y-4">
        {tips.map((tip, i) => (
          <li key={i} className="flex gap-3 text-white/60 text-sm leading-relaxed">
            <ChevronSmallRight className="w-4 h-4 text-accent-cyber shrink-0 mt-1" />
            {tip}
          </li>
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
