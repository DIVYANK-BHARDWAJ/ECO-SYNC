"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Cpu, Zap, Lightbulb, Thermometer, Wind } from "lucide-react";

export function KnowledgeHub() {
  return (
    <section className="py-32 px-12 bg-black relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 mb-32">
          {/* About Us */}
          <div>
            <h2 className="text-7xl font-black text-white mb-12 tracking-tighter uppercase italic">
              What we <span className="text-accent-emerald">do</span>
            </h2>
            <p className="text-white/50 text-xl leading-relaxed font-light mb-8">
              Aether-Grid is at the forefront of digital energy management. We provide homeowners with a high-fidelity window into their consumption patterns, empowering a sustainable future through data-driven decisions.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div className="p-8 bg-white/5 rounded-3xl border border-white/5">
                <ShieldCheck className="w-10 h-10 text-accent-emerald mb-4" />
                <h4 className="text-white font-bold mb-2">Sustainability</h4>
                <p className="text-white/30 text-xs">Committed to reducing global CO2 footprints.</p>
              </div>
              <div className="p-8 bg-white/5 rounded-3xl border border-white/5">
                <Cpu className="w-10 h-10 text-accent-cyber mb-4" />
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
                { title: "Real-time Tracking", desc: "Our engine updates consumption every second using $E = P*t/1000$." },
                { title: "Hardware Integration", desc: "Simulating live feedback from smart appliances across your home." },
                { title: "Predictive Analytics", desc: "Calculating annual projections to help you budget better." }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 p-6 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5 group">
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/20 font-mono group-hover:border-accent-cyber group-hover:text-accent-cyber transition-all">
                    0{i+1}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">{item.title}</h4>
                    <p className="text-white/40 text-sm mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Savings Tips Section */}
        <div className="border-t border-white/10 pt-32">
          <h2 className="text-6xl font-black text-white mb-16 tracking-tighter text-center uppercase italic">
             Maximize <span className="text-accent-emerald neon-text-emerald">Savings</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TipCard 
              icon={<Thermometer className="w-8 h-8 text-accent-emerald" />}
              title="Climate Efficiency"
              tips={["Set HVAC to 78°F in summer", "Use eco-mode for central air", "Maintain filter health monthly"]}
            />
            <TipCard 
              icon={<Lightbulb className="w-8 h-8 text-accent-cyber" />}
              title="Smart Lighting"
              tips={["Enable motion-link sensing", "Schedule sundown dimming", "Use 10W LED equivalents"]}
            />
            <TipCard 
              icon={<Zap className="w-8 h-8 text-white" />}
              title="Peak Management"
              tips={["Run appliances after 9PM", "Leverage EV scheduled charging", "Monitor standby power drain"]}
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
      className="p-10 bg-[#050505] border border-white/5 rounded-[3rem] transition-all hover:neon-border-emerald"
    >
      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight">{title}</h3>
      <ul className="space-y-4">
        {tips.map((tip, i) => (
          <li key={i} className="flex gap-3 text-white/40 text-sm leading-relaxed">
            <ChevronSmallRight className="w-4 h-4 text-accent-emerald shrink-0 mt-1" />
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
