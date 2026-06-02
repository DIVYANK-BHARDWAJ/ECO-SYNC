"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Sun, Battery, Zap, Activity, ArrowRight, 
  History, ShieldCheck, Check, Fingerprint, Coins, Network, 
  Wallet, TrendingUp 
} from "lucide-react";
import Link from "next/link";
import { SolarBatteryState } from "@/types/device";
import { ethers } from "ethers";

type Transaction = {
  id: string;
  hash: string;
  amount: number;
  price: number;
  total: number;
  time: string;
  status: "completed" | "pending";
};

export default function EnergyTrading() {
  const [solarState, setSolarState] = useState<SolarBatteryState>({
    solarGeneration: 0,
    batteryCapacity: 13.5,
    batteryLevel: 0,
    batteryChargeRate: 5.0,
    gridDependency: 0,
  });

  const [walletBalance, setWalletBalance] = useState(1450.25); // ECO tokens
  const [marketPrice, setMarketPrice] = useState(0.18); // ECO per kWh
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "1", hash: "0x8f...3a2b", amount: 5.2, price: 0.18, total: 0.936, time: "10 mins ago", status: "completed" },
    { id: "2", hash: "0x2c...9d1e", amount: 12.5, price: 0.17, total: 2.125, time: "2 hours ago", status: "completed" },
    { id: "3", hash: "0x5e...4f8a", amount: 3.1, price: 0.19, total: 0.589, time: "Yesterday", status: "completed" },
  ]);

  const [isSelling, setIsSelling] = useState(false);
  const [sellAmount, setSellAmount] = useState<number | "">("");

  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        setIsConnecting(true);
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const balance = await provider.getBalance(accounts[0]);
          setWalletBalance(Number(ethers.formatEther(balance)));
          
          (window as any).ethereum.on('accountsChanged', async (newAccounts: string[]) => {
            if (newAccounts.length > 0) {
              setAccount(newAccounts[0]);
              const newBalance = await provider.getBalance(newAccounts[0]);
              setWalletBalance(Number(ethers.formatEther(newBalance)));
            } else {
              setAccount(null);
              setWalletBalance(1450.25); // Fallback mock
            }
          });
        }
      } catch (err) {
        console.error("Wallet connection failed", err);
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("Please install a Web3 wallet like MetaMask to connect.");
    }
  };

  // Load solar state from localStorage
  useEffect(() => {
    const savedSolar = localStorage.getItem("eco-sync-solar");
    if (savedSolar) {
      try {
        const parsed = JSON.parse(savedSolar);
        setSolarState(parsed);
      } catch (e) {
        console.error("Failed to load solar state", e);
      }
    }
  }, []);

  // Update market price dynamically based on grid dependency
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketPrice(prev => {
        // Base price 0.15, adds up to 0.15 based on grid demand
        const basePrice = 0.15;
        const demandPremium = (solarState.gridDependency / 100) * 0.15;
        const fluctuation = (Math.random() - 0.5) * 0.02;
        return Math.max(0.10, Math.min(0.40, basePrice + demandPremium + fluctuation));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [solarState.gridDependency]);

  const handleSell = async () => {
    const amount = Number(sellAmount);
    if (!amount || amount <= 0 || amount > solarState.batteryLevel) return;
    
    setIsSelling(true);
    
    let txHash = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;

    // If wallet connected, simulate Web3 signing
    if (account && (window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        
        // Dummy transaction to self with 0 value just to prompt signature
        const tx = await signer.sendTransaction({
          to: account,
          value: 0
        });
        
        await tx.wait();
        txHash = tx.hash;
      } catch (err) {
        console.error("Transaction failed", err);
        setIsSelling(false);
        return; // Stop if rejected
      }
    } else {
      // Mock delay if no wallet
      await new Promise(resolve => setTimeout(resolve, 2500));
    }

    const earned = amount * marketPrice;
    setWalletBalance(prev => prev + earned);
    
    const newTx: Transaction = {
      id: Date.now().toString(),
      hash: txHash.length > 20 ? `${txHash.slice(0, 6)}...${txHash.slice(-4)}` : txHash,
      amount: amount,
      price: marketPrice,
      total: earned,
      time: "Just now",
      status: "completed"
    };
    
    setTransactions(prev => [newTx, ...prev]);
    
    const newState = { ...solarState, batteryLevel: solarState.batteryLevel - amount };
    setSolarState(newState);
    localStorage.setItem("eco-sync-solar", JSON.stringify(newState));
    
    setSellAmount("");
    setIsSelling(false);
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-accent-secondary selection:text-black font-sans relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent-secondary/5 blur-[150px] -translate-y-1/2 translate-x-1/2 rounded-full" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-primary/5 blur-[120px] translate-y-1/2 -translate-x-1/2 rounded-full" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header Navigation */}
        <header className="flex items-center justify-between mb-16">
          <Link 
            href="/"
            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">Return to Grid</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-accent-secondary animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] font-black text-accent-secondary">Grid Connected</span>
          </div>
        </header>

        {/* Page Title */}
        <div className="mb-16">
          <h1 className="text-6xl sm:text-8xl font-black uppercase tracking-tighter leading-none mb-4">
            Energy <span className="text-accent-secondary">Exchange</span>
          </h1>
          <p className="text-white/40 font-mono text-xs uppercase tracking-[0.3em] font-bold">
            Peer-to-Peer Energy Sovereignty & Real-Time Settlement
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Solar & Market Data */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {/* Wallet & Market Status */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-secondary/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3 text-accent-secondary">
                  <Wallet className="w-6 h-6" />
                  <h3 className="font-mono text-[11px] uppercase tracking-widest font-black">Crypto Wallet</h3>
                </div>
                <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 flex items-center gap-2">
                  <Network className="w-3 h-3 text-white/40" />
                  <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">
                    {account ? "Connected" : "Polygon"}
                  </span>
                </div>
              </div>
              
              <div className="mb-10 relative z-10">
                <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest mb-2 font-bold">
                  {account ? `Wallet: ${account.slice(0, 6)}...${account.slice(-4)}` : "Available Balance"}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black tabular-nums tracking-tighter">{walletBalance.toFixed(2)}</span>
                  <span className="text-accent-secondary font-black tracking-widest">ECO</span>
                </div>
                
                {!account && (
                  <button 
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="mt-4 px-4 py-2 bg-accent-secondary/10 hover:bg-accent-secondary/20 border border-accent-secondary/30 rounded-xl text-accent-secondary font-mono text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2"
                  >
                    {isConnecting ? "Connecting..." : "Connect MetaMask"}
                  </button>
                )}
              </div>

              <div className="pt-8 border-t border-white/10 flex items-center justify-between relative z-10">
                <div>
                  <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest mb-1 font-bold">Market Rate</p>
                  <p className="text-2xl font-bold tabular-nums flex items-center gap-2">
                    {marketPrice.toFixed(3)} <span className="text-sm text-white/40">ECO/kWh</span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-accent-secondary/10 flex items-center justify-center border border-accent-secondary/20">
                  <TrendingUp className="w-6 h-6 text-accent-secondary" />
                </div>
              </div>
            </div>

            {/* Current Solar Status */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-xl relative overflow-hidden">
               <div className="flex items-center gap-3 text-accent-primary mb-8">
                  <Sun className="w-6 h-6" />
                  <h3 className="font-mono text-[11px] uppercase tracking-widest font-black">Local Generation</h3>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-black/50 rounded-xl p-6 border border-white/5">
                   <p className="text-white/40 font-mono text-[9px] uppercase tracking-widest mb-2 font-bold">Solar Yield</p>
                   <p className="text-3xl font-black text-white tabular-nums">{solarState.solarGeneration.toFixed(1)}<span className="text-sm text-white/40 ml-1 font-sans text-white/20 font-bold">kW</span></p>
                 </div>
                 <div className="bg-black/50 rounded-xl p-6 border border-white/5">
                   <p className="text-white/40 font-mono text-[9px] uppercase tracking-widest mb-2 font-bold">Stored Energy</p>
                   <p className="text-3xl font-black text-white tabular-nums">{solarState.batteryLevel.toFixed(1)}<span className="text-sm text-white/40 ml-1 font-sans text-white/20 font-bold">kWh</span></p>
                 </div>
               </div>
            </div>
          </div>

          {/* Right Column - Trading Interface */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* Sell Form */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8 md:p-12 shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-xl bg-accent-secondary text-slate-900 flex items-center justify-center">
                  <ArrowRight className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Asset <span className="text-accent-secondary">Settlement</span></h2>
                  <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest">Offload excess battery capacity to the grid</p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <label className="text-white/80 font-mono text-[11px] uppercase tracking-widest font-bold">Amount to Sell (kWh)</label>
                    <span className="text-accent-secondary font-mono text-[10px] uppercase tracking-widest font-bold">Max: {solarState.batteryLevel.toFixed(1)}</span>
                  </div>
                  <div className="relative group">
                    <input 
                      type="number" 
                      value={sellAmount}
                      onChange={(e) => setSellAmount(e.target.value ? Number(e.target.value) : "")}
                      max={solarState.batteryLevel}
                      min="0"
                      step="0.1"
                      placeholder="0.0"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-8 py-8 text-5xl font-black text-white focus:outline-none focus:border-accent-secondary/30 focus:bg-white/5 transition-all tabular-nums"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <button 
                        onClick={() => setSellAmount(solarState.batteryLevel)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-black uppercase tracking-widest transition-colors border border-white/10"
                      >
                        Max
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6 flex items-center justify-between border border-white/10">
                  <span className="text-white/60 font-mono text-[11px] uppercase tracking-widest font-bold">Estimated Return</span>
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-accent-secondary" />
                    <span className="text-2xl font-bold tabular-nums">
                      {sellAmount ? (Number(sellAmount) * marketPrice).toFixed(2) : "0.00"} ECO
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSell}
                  disabled={isSelling || !sellAmount || Number(sellAmount) <= 0 || Number(sellAmount) > solarState.batteryLevel}
                  className="w-full relative py-6 bg-accent-secondary rounded-xl disabled:bg-slate-800 disabled:text-white/20 disabled:border-white/10 overflow-hidden group border border-accent-secondary transition-all"
                >
                  <AnimatePresence mode="wait">
                    {isSelling ? (
                      <motion.div 
                        key="processing"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-center gap-3 text-slate-900"
                      >
                        <Fingerprint className="w-6 h-6 animate-pulse" />
                        <span className="font-black uppercase tracking-[0.2em] text-sm">Signing Transaction...</span>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="idle"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-center gap-3 text-slate-900 group-disabled:text-white/20"
                      >
                        <ShieldCheck className="w-6 h-6" />
                        <span className="font-black uppercase tracking-[0.2em] text-sm">Finalize Peer-to-Peer Settlement</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <History className="w-5 h-5 text-white/40" />
                <h3 className="font-mono text-[11px] uppercase tracking-widest font-black text-white/60">Grid Transaction History</h3>
              </div>

              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {transactions.map((tx) => (
                    <motion.div 
                      key={tx.id}
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                      className="bg-black/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between group hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-accent-secondary/10 flex items-center justify-center border border-accent-secondary/20">
                          <Check className="w-5 h-5 text-accent-secondary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-black text-white">Sold {tx.amount.toFixed(1)} kWh</span>
                            <span className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] font-mono text-white/40 uppercase">{tx.time}</span>
                          </div>
                          <p className="font-mono text-[10px] text-accent-secondary/60 group-hover:text-accent-secondary transition-colors cursor-pointer flex items-center gap-1">
                            Tx: {tx.hash}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-lg text-accent-secondary">+{tx.total.toFixed(2)} ECO</p>
                        <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest">@ {tx.price.toFixed(3)}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
