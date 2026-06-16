"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IndianRupee, AlertCircle, CheckCircle2, TrendingUp, TrendingDown } from "lucide-react";

interface BudgetManagerProps {
  liveSessionCost: number;
  costFactor: number; // cost per kWh
  budgetTarget: number;
  onUpdateTarget: (newTarget: number) => void;
}

export default function BudgetManager({ liveSessionCost, costFactor, budgetTarget, onUpdateTarget }: BudgetManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(budgetTarget.toString());

  useEffect(() => {
    setInputValue(budgetTarget.toString());
  }, [budgetTarget]);

  const isOverBudget = liveSessionCost > budgetTarget;
  const percentageOfBudget = Math.min(200, (liveSessionCost / budgetTarget) * 100);

  const handleSave = () => {
    const val = parseFloat(inputValue);
    if (!isNaN(val) && val > 0) {
      onUpdateTarget(val);
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-[#121214] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden group">
      <div className={`absolute inset-0 bg-gradient-to-br ${isOverBudget ? 'from-red-500/5' : 'from-accent-budget/5'} to-transparent opacity-50 transition-colors duration-500`} />
      
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${isOverBudget ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-accent-budget/10 border-accent-budget/30 text-accent-budget'} border flex items-center justify-center transition-colors`}>
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-black uppercase tracking-widest text-sm">Budget Tracker</h3>
              <p className="text-white/40 text-[10px] uppercase font-mono tracking-widest">Session Cost vs Target</p>
            </div>
          </div>
          <button 
            onClick={() => {
              if (isEditing) handleSave();
              else setIsEditing(true);
            }}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all font-heading"
          >
            {isEditing ? "Save" : "Set Target"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2 text-white/60">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold tracking-wider">Live Spent</span>
            </div>
            <div className={`text-2xl font-bold ${isOverBudget ? 'text-red-400' : 'text-accent-budget'} font-mono tracking-tighter`}>
              ₹{liveSessionCost.toFixed(3)}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2 text-white/60">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold tracking-wider">Target</span>
            </div>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <span className="text-white/40">₹</span>
                <input 
                  type="number" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onBlur={handleSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  autoFocus
                  className="bg-transparent border-b border-accent-budget outline-none text-2xl font-bold text-white w-full font-mono tracking-tighter"
                />
              </div>
            ) : (
              <div className="text-2xl font-bold text-white font-mono tracking-tighter">
                ₹{budgetTarget.toFixed(0)} <span className="text-sm text-white/40 font-sans font-black">/mo</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] uppercase font-bold tracking-wider text-white/60">Budget Utilization</p>
            <p className={`text-[10px] uppercase font-black tracking-wider ${isOverBudget ? 'text-red-400' : 'text-accent-budget'} font-mono`}>
              {percentageOfBudget.toFixed(3)}%
            </p>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, percentageOfBudget)}%` }}
              className={`h-full ${isOverBudget ? 'bg-red-500' : 'bg-accent-budget'}`}
              transition={{ type: "spring", stiffness: 50 }}
            />
          </div>
          {isOverBudget && (
            <div className="mt-3 flex items-start gap-2 text-red-400 text-[10px] uppercase font-black tracking-widest bg-red-400/10 p-3 rounded-xl border border-red-400/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>Warning: Current consumption exceeds target budget. Consider running &apos;Eco Max&apos; routine.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
