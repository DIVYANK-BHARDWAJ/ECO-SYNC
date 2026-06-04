"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Sun, Zap, ArrowRight, 
  History, ShieldCheck, Check, Fingerprint, Coins, Network, 
  Wallet, TrendingUp, AlertTriangle, Loader2
} from "lucide-react";
import Link from "next/link";
import { Device, SolarBatteryState } from "@/types/device";
import { ethers } from "ethers";
import UserProfileHeader from "@/components/UserProfileHeader";
import AuthModal from "@/components/AuthModal";
import SettingsDrawer from "@/components/SettingsDrawer";
import { useAuth } from "@/context/AuthContext";
import AuthPage from "@/components/AuthPage";

type Transaction = {
  id: string;
  hash: string;
  amount: number;
  price: number;
  total: number;
  time: string;
  status: "completed" | "pending";
};

const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111 in hex (Sepolia Testnet)

const ECO_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

export default function EnergyTrading() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  const [solarState, setSolarState] = useState<SolarBatteryState>({
    solarGeneration: 0,
    batteryCapacity: 13.5,
    batteryLevel: 13.5,
    batteryChargeRate: 5.0,
    gridDependency: 0,
  });
  const [isSolarLoaded, setIsSolarLoaded] = useState(false);
  const [tabId] = useState(() => Math.random().toString(36).substring(2, 11));

  // Load solar state from localStorage on mount
  useEffect(() => {
    const savedSolar = localStorage.getItem("eco-sync-solar");
    if (savedSolar) {
      try {
        const parsed = JSON.parse(savedSolar);
        setSolarState(parsed);
      } catch (e) {
        console.error("Failed to load solar state on trading page mount", e);
      }
    }
    setIsSolarLoaded(true);
  }, []);

  const [walletBalance, setWalletBalance] = useState(0.00);
  const [marketPrice, setMarketPrice] = useState(0.18);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [isSelling, setIsSelling] = useState(false);
  const [sellAmount, setSellAmount] = useState<number | "">("");

  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const [detectedChainId, setDetectedChainId] = useState<string | null>(null);
  const [txProgressMessage, setTxProgressMessage] = useState("");

  // Connect MetaMask Wallet
  const connectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        setIsConnecting(true);
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        
        // Request accounts
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          const currentAccount = accounts[0];
          setAccount(currentAccount);
          await checkNetworkAndSync(currentAccount);
        }
      } catch (err) {
        console.error("Wallet connection failed", err);
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("Please install MetaMask to connect your wallet.");
    }
  };

  // Switch to Sepolia automatically (with fallback to add network)
  const switchNetwork = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
      } catch (switchError: any) {
        console.error("Failed to switch network", switchError);
        // Error code 4902 indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await (window as any).ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: SEPOLIA_CHAIN_ID,
                  chainName: "Sepolia Test Network",
                  rpcUrls: ["https://ethereum-sepolia-rpc.publicnode.com"],
                  nativeCurrency: {
                    name: "Sepolia Ether",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  blockExplorerUrls: ["https://sepolia.etherscan.io"],
                },
              ],
            });
          } catch (addError) {
            console.error("Failed to add network", addError);
          }
        } else {
          alert(`Failed to switch to Sepolia: ${switchError.message || switchError}`);
        }
      }
    }
  };

  // Check network and fetch real token balance
  const checkNetworkAndSync = async (address: string) => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const network = await provider.getNetwork();

      setDetectedChainId(network.chainId.toString());

      if (network.chainId !== BigInt(11155111)) {
        setIsWrongNetwork(true);
        setWalletBalance(0.00);
        return;
      }

      setIsWrongNetwork(false);
      
      const contractAddress = process.env.NEXT_PUBLIC_ECO_TOKEN_ADDRESS;
      if (contractAddress && contractAddress !== "") {
        try {
          const contract = new ethers.Contract(contractAddress, ECO_TOKEN_ABI, provider);
          const balance = await contract.balanceOf(address);
          setWalletBalance(Number(ethers.formatEther(balance)));
        } catch (e) {
          console.error("Error reading token balance on-chain:", e);
          setWalletBalance(0.00);
        }
      }
    }
  };

  // Auto-connect and listen to changes on mount
  useEffect(() => {
    const initWallet = async () => {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          
          // Check if already authorized
          const accounts = await provider.send("eth_accounts", []);
          if (accounts.length > 0) {
            const currentAccount = accounts[0];
            setAccount(currentAccount);
            await checkNetworkAndSync(currentAccount);
          }

          // Register listeners
          (window as any).ethereum.on('accountsChanged', async (newAccounts: string[]) => {
            if (newAccounts.length > 0) {
              setAccount(newAccounts[0]);
              await checkNetworkAndSync(newAccounts[0]);
            } else {
              setAccount(null);
              setWalletBalance(0.00);
              setDetectedChainId(null);
            }
          });

          (window as any).ethereum.on('chainChanged', () => {
            window.location.reload();
          });

        } catch (e) {
          console.error("Error checking pre-authorized accounts", e);
        }
      }
    };

    initWallet();
  }, []);

  useEffect(() => {
    if (account) {
      checkNetworkAndSync(account);
    }
  }, [account]);

  // Keep sellAmount synchronized with stored energy (batteryLevel) in real-time
  useEffect(() => {
    if (solarState.batteryLevel >= 0) {
      setSellAmount(Number(solarState.batteryLevel.toFixed(1)));
    }
  }, [solarState.batteryLevel]);

  // Sync profile settings with simulator values
  useEffect(() => {
    if (user && isSolarLoaded) {
      setSolarState(prev => ({
        ...prev,
        batteryCapacity: user.batteryCap,
        batteryLevel: Math.min(prev.batteryLevel, user.batteryCap),
      }));
    }
  }, [user, isSolarLoaded]);

  // Save solar to localStorage on change (after load is complete, checking for differences)
  useEffect(() => {
    if (isSolarLoaded) {
      const currentStateString = JSON.stringify(solarState);
      const savedStateString = localStorage.getItem("eco-sync-solar");
      if (currentStateString !== savedStateString) {
        localStorage.setItem("eco-sync-solar", currentStateString);
      }
    }
  }, [solarState, isSolarLoaded]);

  // Simulator settings states
  const [lowBatteryThreshold, setLowBatteryThreshold] = useState(15);
  const [refreshRate, setRefreshRate] = useState("3s");

  useEffect(() => {
    function loadLocalSettings() {
      const savedThreshold = localStorage.getItem("eco-sync-low-battery-threshold");
      if (savedThreshold) setLowBatteryThreshold(parseInt(savedThreshold, 10));

      const savedRate = localStorage.getItem("eco-sync-refresh-rate");
      if (savedRate) setRefreshRate(savedRate);
    }

    loadLocalSettings();
    window.addEventListener("eco-sync-settings-updated", loadLocalSettings);
    return () => window.removeEventListener("eco-sync-settings-updated", loadLocalSettings);
  }, []);

  const refreshRateMs = refreshRate === "1s" ? 1000 : refreshRate === "5s" ? 5000 : 3000;

  // Load simulator parameters from localStorage dynamically
  const simDevicesRef = useRef<Device[]>([]);
  const simActivePlanRef = useRef<string | null>(null);
  const simGridSellbackRef = useRef(false);

  useEffect(() => {
    const loadParams = () => {
      const savedDevices = localStorage.getItem("eco-sync-devices");
      if (savedDevices) {
        try {
          simDevicesRef.current = JSON.parse(savedDevices);
        } catch (e) {}
      }
      simActivePlanRef.current = localStorage.getItem("eco-sync-active-plan");
      simGridSellbackRef.current = localStorage.getItem("eco-sync-grid-sellback") === "true";
    };

    loadParams();
    const interval = setInterval(loadParams, 1000);
    return () => clearInterval(interval);
  }, []);

  // Run background simulator loop on trading page when active
  useEffect(() => {
    if (!isSolarLoaded) return;

    const PLAN_CONFIG: Record<string, { reduction: string; multiplier: number }> = {
      "Core Nexus": { reduction: "15%", multiplier: 0.85 },
      "Titan Pulse": { reduction: "40%", multiplier: 0.60 },
      "Zenith Zero": { reduction: "75%", multiplier: 0.25 },
    };

    const interval = setInterval(() => {
      // Check leadership
      const savedLeader = localStorage.getItem("eco-sync-sim-leader");
      let isLeader = true;
      if (savedLeader) {
        try {
          const leader = JSON.parse(savedLeader);
          const now = Date.now();
          // If there is another active tab running the simulation, yield to it
          if (leader.tabId !== tabId && (now - leader.timestamp) < Math.max(5000, refreshRateMs * 2)) {
            isLeader = false;
          }
        } catch (e) {}
      }

      if (!isLeader) {
        return;
      }

      // We are the leader, update leadership timestamp
      localStorage.setItem("eco-sync-sim-leader", JSON.stringify({ tabId, timestamp: Date.now() }));

      const SIMULATION_SPEED_MULTIPLIER = 300; // 300x faster than real-time
      const intervalHours = (refreshRateMs * SIMULATION_SPEED_MULTIPLIER) / 3600000;
      
      // Calculate current load based on localStorage devices list
      let load = 0.2; // Baseline
      simDevicesRef.current.forEach(d => {
        if (d.isOn) load += d.power;
      });
      if (simActivePlanRef.current && PLAN_CONFIG[simActivePlanRef.current]) {
        load *= PLAN_CONFIG[simActivePlanRef.current].multiplier;
      }

      // Read latest solar state from localStorage first to prevent React state stale overrides
      let currentSolar = {
        solarGeneration: 0,
        batteryCapacity: 13.5,
        batteryLevel: 13.5,
        batteryChargeRate: 5.0,
        gridDependency: 0,
      };
      const savedSolar = localStorage.getItem("eco-sync-solar");
      if (savedSolar) {
        try {
          currentSolar = { ...currentSolar, ...JSON.parse(savedSolar) };
        } catch (e) {}
      }

      console.log("[Eco-Sync Trading Sim] Running Step:", {
        isLeader,
        load,
        solarGeneration: currentSolar.solarGeneration,
        batteryLevel: currentSolar.batteryLevel,
        batteryCapacity: currentSolar.batteryCapacity,
      });

      let dependency = load - currentSolar.solarGeneration;
      let newLevel = currentSolar.batteryLevel;
      
      const chargeEfficiency = 0.95;
      const dischargeEfficiency = 0.95;
      
      if (dependency < 0) {
        // charge battery
        const availableChargeKw = Math.min(-dependency, currentSolar.batteryChargeRate);
        const chargeKwh = availableChargeKw * intervalHours;
        newLevel = Math.min(currentSolar.batteryCapacity, currentSolar.batteryLevel + (chargeKwh * chargeEfficiency));
        dependency = 0;
      } else if (dependency > 0 && currentSolar.batteryLevel > 0) {
        // discharge battery
        const requiredFromBatteryKw = dependency / dischargeEfficiency;
        const actualDrawKw = Math.min(requiredFromBatteryKw, currentSolar.batteryChargeRate);
        const actualDrawKwh = actualDrawKw * intervalHours;
        const finalDrawKwh = Math.min(actualDrawKwh, currentSolar.batteryLevel);
        const energyProvidedKw = (finalDrawKwh / intervalHours) * dischargeEfficiency;
        
        newLevel = currentSolar.batteryLevel - finalDrawKwh;
        dependency = load - currentSolar.solarGeneration - energyProvidedKw;
      }

      const updatedState = {
        ...currentSolar,
        batteryLevel: newLevel,
        gridDependency: Math.max(0, dependency)
      };

      console.log("[Eco-Sync Trading Sim] Updated State:", updatedState);

      // Save back to localStorage and update state
      localStorage.setItem("eco-sync-solar", JSON.stringify(updatedState));
      setSolarState(updatedState);

    }, refreshRateMs);

    return () => {
      clearInterval(interval);
      // Clean up leadership on unmount to prevent blocking other views
      const savedLeader = localStorage.getItem("eco-sync-sim-leader");
      if (savedLeader) {
        try {
          const leader = JSON.parse(savedLeader);
          if (leader.tabId === tabId) {
            localStorage.removeItem("eco-sync-sim-leader");
          }
        } catch (e) {}
      }
    };
  }, [refreshRateMs, isSolarLoaded, tabId]);

  // Synchronize solar state with localStorage in real-time
  useEffect(() => {
    const syncSolar = () => {
      const savedSolar = localStorage.getItem("eco-sync-solar");
      if (savedSolar) {
        try {
          const parsed = JSON.parse(savedSolar);
          setSolarState(prev => {
            // Only update if there is a real difference to avoid infinite loops
            if (
              prev.solarGeneration === parsed.solarGeneration &&
              prev.batteryCapacity === parsed.batteryCapacity &&
              prev.batteryLevel === parsed.batteryLevel &&
              prev.batteryChargeRate === parsed.batteryChargeRate &&
              prev.gridDependency === parsed.gridDependency
            ) {
              return prev;
            }
            return { ...prev, ...parsed };
          });
        } catch (e) {
          // ignore parsing errors
        }
      }
    };

    // 1. Listen to storage changes from other tabs/pages
    window.addEventListener("storage", syncSolar);

    // 2. Poll localStorage periodically to capture updates in same-tab navigation instantly
    const interval = setInterval(syncSolar, 500);

    return () => {
      window.removeEventListener("storage", syncSolar);
      clearInterval(interval);
    };
  }, []);



  const batteryPct = solarState.batteryCapacity > 0
    ? Math.round((solarState.batteryLevel / solarState.batteryCapacity) * 100)
    : 0;
  const isLowBattery = batteryPct <= lowBatteryThreshold;

  // Update market price immediately when inputs change, and also dynamically on interval
  useEffect(() => {
    const updatePrice = () => {
      setMarketPrice(prev => {
        const costMultiplier = user?.costFactor ?? 8.0;
        // Base price scales dynamically with the user's grid cost multiplier
        const basePrice = 0.15 * (costMultiplier / 8.0);
        const demandPremium = (solarState.gridDependency / 100) * 0.15;
        const fluctuation = (Math.random() - 0.5) * 0.02;
        return Math.max(0.02, Math.min(2.00, basePrice + demandPremium + fluctuation));
      });
    };

    updatePrice(); // Update immediately on load or dependency change

    const interval = setInterval(updatePrice, refreshRateMs);
    return () => clearInterval(interval);
  }, [solarState.gridDependency, refreshRateMs, user?.costFactor]);

  // Fetch transaction history from database
  const fetchTransactionHistory = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch("/api/trading/history");
      const data = await res.json();
      if (res.ok && data.success) {
        const formatted = data.transactions.map((tx: any) => {
          const date = new Date(tx.createdAt);
          const now = new Date();
          const diffMs = now.getTime() - date.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          let timeLabel = "";
          if (diffMins < 1) {
            timeLabel = "Just now";
          } else if (diffMins < 60) {
            timeLabel = `${diffMins} mins ago`;
          } else {
            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) {
              timeLabel = `${diffHours} hours ago`;
            } else {
              timeLabel = date.toLocaleDateString();
            }
          }

          return {
            id: tx.id,
            hash: tx.hash,
            amount: tx.amount,
            price: tx.price,
            total: tx.total,
            time: timeLabel,
            status: "completed" as const
          };
        });
        setTransactions(formatted);
      }
    } catch (error) {
      console.error("Failed to fetch transaction history:", error);
    }
  };

  // Sync transaction history when user loads
  useEffect(() => {
    if (user) {
      fetchTransactionHistory();
    }
  }, [user]);

  // Settle sale transaction on-chain
  const handleSell = async () => {
    const amount = Number(sellAmount);
    if (!amount || amount <= 0 || amount > solarState.batteryLevel || !account) return;
    
    setIsSelling(true);
    setTxProgressMessage("Requesting MetaMask Signature...");

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      // 1. Gasless user authorization signature
      const earned = amount * marketPrice;
      const message = `Authorize sale of ${amount.toFixed(1)} kWh for ${earned.toFixed(2)} ECO tokens`;
      const signature = await signer.signMessage(message);

      setTxProgressMessage("Broadcasting trade to the Sepolia Grid...");

      // 2. Send authorization signature to Next.js settlement API
      const res = await fetch("/api/trading/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: account,
          amount: amount,
          price: marketPrice,
          signature: signature
        })
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "API transaction request failed");
      }

      setTxProgressMessage("Waiting for Block Confirmation...");

      // 3. Wait on-chain for block mining using transaction hash
      const txHash = result.txHash;
      const txReceipt = await provider.waitForTransaction(txHash, 1);

      if (!txReceipt || txReceipt.status === 0) {
        throw new Error("On-chain transaction failed execution.");
      }

      // 4. Update local states on success
      setWalletBalance(prev => prev + earned);
      
      const newState = { ...solarState, batteryLevel: solarState.batteryLevel - amount };
      setSolarState(newState);
      localStorage.setItem("eco-sync-solar", JSON.stringify(newState));
      
      await fetchTransactionHistory();
      
      setSellAmount("");
      setTxProgressMessage("");
      alert("Grid Settlement Successful! Tokens transferred to your MetaMask wallet.");

    } catch (err: any) {
      console.error("Trade transaction failed:", err);
      alert(err.message || "Failed to finalize trade.");
    } finally {
      setIsSelling(false);
      setTxProgressMessage("");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center font-mono text-zinc-600 z-[500]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold">Initializing Connection...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-accent-secondary selection:text-black font-sans relative overflow-hidden font-heading">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent-secondary/5 blur-[150px] -translate-y-1/2 translate-x-1/2 rounded-full" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-primary/5 blur-[120px] translate-y-1/2 -translate-x-1/2 rounded-full" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <header className="flex items-center justify-between mb-16">
          <Link 
            href="/#command-center"
            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">Return to Grid</span>
          </Link>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-accent-secondary animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] font-black text-accent-secondary">Grid Connected</span>
            </div>
            <UserProfileHeader
              onOpenAuth={() => setShowAuthModal(true)}
              onOpenSettings={() => setShowSettingsDrawer(true)}
            />
          </div>
        </header>

        <div className="mb-16">
          <h1 className="text-6xl sm:text-8xl font-black uppercase tracking-tighter leading-none mb-4">
            Energy <span className="text-accent-secondary">Exchange</span>
          </h1>
          <p className="text-white/40 font-mono text-xs uppercase tracking-[0.3em] font-bold">
            Peer-to-Peer Energy Sovereignty & Real-Time Settlement
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
          <div className="lg:col-span-5 flex flex-col gap-8">
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
                    {account ? "Sepolia" : "Disconnected"}
                  </span>
                </div>
              </div>
              
              <div className="mb-10 relative z-10">
                <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest mb-2 font-bold">
                  {account ? `Wallet: ${account.slice(0, 6)}...${account.slice(-4)}` : "Available Balance"}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black tabular-nums tracking-tighter font-mono">{walletBalance.toFixed(4)}</span>
                  <span className="text-accent-secondary font-black tracking-widest">ECO</span>
                </div>
                
                {isWrongNetwork && (
                  <div className="flex flex-col gap-2 mt-4">
                    <button 
                      onClick={switchNetwork}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-500 font-mono text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer w-fit"
                    >
                      <AlertTriangle className="w-4 h-4" /> Switch to Sepolia
                    </button>
                    {detectedChainId && (
                      <p className="text-[10px] font-mono text-zinc-500">
                        Detected Chain ID: <span className="text-red-400 font-bold">{detectedChainId}</span> (Expected: 11155111)
                      </p>
                    )}
                  </div>
                )}

                {!account && (
                  <button 
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="mt-4 px-4 py-2 bg-accent-secondary/10 hover:bg-accent-secondary/20 border border-accent-secondary/30 rounded-xl text-accent-secondary font-mono text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    {isConnecting ? "Connecting..." : "Connect MetaMask"}
                  </button>
                )}
              </div>

              <div className="pt-8 border-t border-white/10 flex items-center justify-between relative z-10">
                <div>
                  <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest mb-1 font-bold">Market Rate</p>
                  <p className="text-2xl font-bold tabular-nums flex items-center gap-2 font-mono">
                    {marketPrice.toFixed(3)} <span className="text-sm text-white/40 font-sans">ECO/kWh</span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-accent-secondary/10 flex items-center justify-center border border-accent-secondary/20">
                  <TrendingUp className="w-6 h-6 text-accent-secondary" />
                </div>
              </div>
            </div>

            <div className={`bg-zinc-900/40 backdrop-blur-xl border rounded-2xl p-8 shadow-xl relative overflow-hidden transition-all duration-300 ${
              isLowBattery ? "border-red-900/40" : "border-white/5"
            }`}>
               <div className={`flex items-center gap-3 mb-8 ${isLowBattery ? "text-red-500" : "text-accent-primary"}`}>
                  <Sun className="w-6 h-6" />
                  <h3 className="font-mono text-[11px] uppercase tracking-widest font-black">
                    {isLowBattery ? "Battery Critical Alert" : "Local Generation"}
                  </h3>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-black/50 rounded-xl p-6 border border-white/5">
                   <p className="text-white/40 font-mono text-[9px] uppercase tracking-widest mb-2 font-bold">Solar Yield</p>
                   <p className="text-3xl font-black text-white tabular-nums font-mono">{solarState.solarGeneration.toFixed(1)}<span className="text-sm text-white/40 ml-1 font-sans text-white/20 font-bold">kW</span></p>
                 </div>
                 <div className={`bg-black/50 rounded-xl p-6 border transition-all ${isLowBattery ? "border-red-900/30" : "border-white/5"}`}>
                   <p className="text-white/40 font-mono text-[9px] uppercase tracking-widest mb-2 font-bold flex items-center gap-1.5">
                     Stored Energy {isLowBattery && <span className="text-[7px] text-red-500 bg-red-950/20 px-1.5 py-0.5 rounded border border-red-900/30 font-black animate-pulse">LOW</span>}
                   </p>
                   <p className={`text-3xl font-black tabular-nums transition-colors font-mono ${isLowBattery ? "text-red-500" : "text-white"}`}>
                     {solarState.batteryLevel.toFixed(1)}
                     <span className="text-sm text-white/40 ml-1 font-sans text-white/20 font-bold">kWh ({batteryPct}%)</span>
                   </p>
                 </div>
               </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-8">
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
                    <span className={`font-mono text-[10px] uppercase tracking-widest font-bold transition-all ${
                      isLowBattery ? "text-red-500 animate-pulse" : "text-accent-secondary"
                    }`}>
                      Max: {solarState.batteryLevel.toFixed(1)}
                    </span>
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
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-8 py-8 text-5xl font-black text-white focus:outline-none focus:border-accent-secondary/30 focus:bg-white/5 transition-all tabular-nums font-mono"
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
                    <span className="text-2xl font-bold tabular-nums font-mono">
                      {sellAmount ? (Number(sellAmount) * marketPrice).toFixed(2) : "0.00"} ECO
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSell}
                  disabled={isSelling || !sellAmount || Number(sellAmount) <= 0 || Number(sellAmount) > solarState.batteryLevel || !account || isWrongNetwork}
                  className="w-full relative py-6 bg-accent-secondary rounded-xl disabled:bg-slate-800 disabled:text-white/20 disabled:border-white/10 overflow-hidden group border border-accent-secondary transition-all cursor-pointer"
                >
                  <AnimatePresence mode="wait">
                    {isSelling ? (
                      <motion.div 
                        key="processing"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col items-center justify-center gap-1.5 text-slate-900"
                      >
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="font-black uppercase tracking-[0.2em] text-sm">{txProgressMessage}</span>
                        </div>
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
                        <span className="font-black uppercase tracking-[0.2em] text-sm">
                          {!account ? "Connect Wallet to Trade" : isWrongNetwork ? "Switch Network to Trade" : "Finalize Peer-to-Peer Settlement"}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>

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
                          {tx.hash.startsWith("0x") && tx.hash.length > 15 ? (
                            <a 
                              href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-[10px] text-accent-secondary/60 hover:text-accent-secondary hover:underline transition-colors cursor-pointer flex items-center gap-1"
                            >
                              Tx: {tx.hash}
                            </a>
                          ) : (
                            <p className="font-mono text-[10px] text-accent-secondary/60">
                              Tx: {tx.hash}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-lg text-accent-secondary font-mono">+{tx.total.toFixed(2)} ECO</p>
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

      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
          />
        )}
        {showSettingsDrawer && (
          <SettingsDrawer
            isOpen={showSettingsDrawer}
            onClose={() => setShowSettingsDrawer(false)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
