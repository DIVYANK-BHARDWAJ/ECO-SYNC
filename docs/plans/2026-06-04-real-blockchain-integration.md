# Real Blockchain & MetaMask Integration Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Replace the mock energy trading simulation in the Next.js app with a live, on-chain ERC-20 token ecosystem on the Ethereum Sepolia Testnet using MetaMask.

**Architecture:** We will implement a custom `EcoToken.sol` ERC-20 contract, compile it using a local build script, and deploy it to Sepolia. The Next.js API endpoint will act as a relayer that sponsors gas to mint/transfer ECO tokens to users after verifying their gasless cryptographic signature.

**Tech Stack:** Solidity v0.8.20, Ethers.js v6, Next.js App Router, Tailwind CSS, MetaMask SDK.

---

### Task 1: Environment & Dependencies
**Files:**
- Modify: [package.json](file:///c:/Users/DIVYANK%20BHARDWAJ/Desktop/Projects/eco%20sync%20updated/eco-sync/package.json)
- Modify: [.env.local](file:///c:/Users/DIVYANK%20BHARDWAJ/Desktop/Projects/eco%20sync%20updated/eco-sync/.env.local)

**Step 1: Install Solidity Compiler dependency**
Run: `npm install -D solc@0.8.20`
Expected: Installs compiler successfully.

**Step 2: Add Blockchain configuration placeholders to `.env.local`**
Add the following keys to [env.local](file:///c:/Users/DIVYANK%20BHARDWAJ/Desktop/Projects/eco%20sync%20updated/eco-sync/.env.local):
```env
NEXT_PUBLIC_ECO_TOKEN_ADDRESS=""
NEXT_PUBLIC_SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com"
BLOCKCHAIN_PRIVATE_KEY=""
```
Expected: Configuration placeholders added.

**Step 3: Commit**
```bash
git add package.json package-lock.json .env.local
git commit -m "chore: setup solidity compiler and blockchain env variables"
```

---

### Task 2: EcoToken Smart Contract
**Files:**
- Create: `contracts/EcoToken.sol`

**Step 1: Write the minimal Solidity ERC-20 contract**
Write the following code to `contracts/EcoToken.sol`:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EcoToken {
    string public name = "Eco Sync Token";
    string public symbol = "ECO";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    address public owner;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function transfer(address to, uint256 value) public returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) public returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        balanceOf[from] -= value;
        allowance[from][msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(from, to, value);
        return true;
    }

    function mint(address to, uint256 amount) public onlyOwner returns (bool) {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
        return true;
    }
}
```

**Step 2: Commit**
```bash
git add contracts/EcoToken.sol
git commit -m "feat: add EcoToken ERC-20 smart contract"
```

---

### Task 3: Compiler Script
**Files:**
- Create: `scripts/compile.js`

**Step 1: Write compiling logic**
Write the following code to `scripts/compile.js`:
```javascript
const path = require("path");
const fs = require("fs");
const solc = require("solc");

const contractPath = path.resolve(__dirname, "../contracts/EcoToken.sol");
const source = fs.readFileSync(contractPath, "utf8");

const input = {
  language: "Solidity",
  sources: {
    "EcoToken.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode"],
      },
    },
  },
};

console.log("Compiling contract...");
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  output.errors.forEach((err) => {
    console.error(err.formattedMessage);
  });
  if (output.errors.some(err => err.severity === 'error')) {
    process.exit(1);
  }
}

const contractData = output.contracts["EcoToken.sol"]["EcoToken"];

const artifactsDir = path.resolve(__dirname, "../artifacts");
if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir);
}

fs.writeFileSync(
  path.resolve(artifactsDir, "EcoToken.json"),
  JSON.stringify(
    {
      abi: contractData.abi,
      bytecode: contractData.evm.bytecode.object,
    },
    null,
    2
  )
);

console.log("Compilation successful! Artifacts written to artifacts/EcoToken.json");
```

**Step 2: Run the compiler script to generate JSON artifacts**
Run: `node scripts/compile.js`
Expected: Output showing "Compilation successful!" and creation of `artifacts/EcoToken.json`.

**Step 3: Commit**
```bash
git add scripts/compile.js artifacts/EcoToken.json
git commit -m "feat: add compile script and build EcoToken artifact"
```

---

### Task 4: Deployment Script
**Files:**
- Create: `scripts/deploy-eco-token.js`

**Step 1: Write deployment logic**
Write the following code to `scripts/deploy-eco-token.js` (Ethers v6 compatible):
```javascript
require("dotenv").config({ path: ".env.local" });
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
  const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
  const rpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;

  if (!privateKey) {
    console.error("Please set BLOCKCHAIN_PRIVATE_KEY in .env.local");
    process.exit(1);
  }

  console.log("Connecting to Sepolia via RPC URL:", rpcUrl);
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Deployer address:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");

  const artifactPath = path.resolve(__dirname, "../artifacts/EcoToken.json");
  if (!fs.existsSync(artifactPath)) {
    console.error("Artifact not found. Please run: node scripts/compile.js");
    process.exit(1);
  }

  const { abi, bytecode } = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  
  console.log("Deploying contract...");
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();

  console.log("Waiting for deployment transaction...");
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("EcoToken deployed successfully!");
  console.log("Contract Address:", address);
  console.log("Update NEXT_PUBLIC_ECO_TOKEN_ADDRESS in .env.local with this address.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

**Step 2: Commit**
```bash
git add scripts/deploy-eco-token.js
git commit -m "feat: add EcoToken deploy script"
```

---

### Task 5: Backend API Settle Route
**Files:**
- Create: `src/app/api/trading/sell/route.ts`

**Step 1: Write API endpoint logic**
Write the following code to `src/app/api/trading/sell/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { userAddress, amount, price, signature } = await req.json();

    if (!userAddress || !amount || !price || !signature) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // 1. Verify user signature
    const message = `Authorize sale of ${Number(amount).toFixed(1)} kWh for ${(Number(amount) * Number(price)).toFixed(2)} ECO tokens`;
    const signerAddress = ethers.verifyMessage(message, signature);

    if (signerAddress.toLowerCase() !== userAddress.toLowerCase()) {
      return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
    }

    // 2. Load contract address & backend keys
    const contractAddress = process.env.NEXT_PUBLIC_ECO_TOKEN_ADDRESS;
    const rpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;

    if (!contractAddress || !privateKey) {
      return NextResponse.json({ error: "Blockchain configuration is missing on the server" }, { status: 500 });
    }

    // 3. Connect to Sepolia via Ethers.js
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const serverWallet = new ethers.Wallet(privateKey, provider);

    // 4. Load contract ABI
    const artifactPath = path.resolve(process.cwd(), "./artifacts/EcoToken.json");
    if (!fs.existsSync(artifactPath)) {
      return NextResponse.json({ error: "Contract artifacts missing" }, { status: 500 });
    }

    const { abi } = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const contract = new ethers.Contract(contractAddress, abi, serverWallet);

    // Calculate token value with 18 decimals (multiply by 10^18)
    const tokenAmount = ethers.parseEther((amount * price).toFixed(6));

    // 5. Mint tokens directly to user wallet
    console.log(`Minting ${amount * price} ECO tokens to ${userAddress}`);
    const tx = await contract.mint(userAddress, tokenAmount);
    
    // Return transaction hash immediately so client can track
    return NextResponse.json({ 
      success: true, 
      txHash: tx.hash,
      message: "Transaction broadcast successfully."
    });

  } catch (error: any) {
    console.error("Trading settlement API error:", error);
    return NextResponse.json({ error: error.message || "Failed to execute transaction" }, { status: 500 });
  }
}
```

**Step 2: Commit**
```bash
git add src/app/api/trading/sell/route.ts
git commit -m "feat: add backend settlement API route to mint ERC-20 tokens"
```

---

### Task 6: Frontend Trading Integration
**Files:**
- Modify: [src/app/trading/page.tsx](file:///c:/Users/DIVYANK%20BHARDWAJ/Desktop/Projects/eco%20sync%20updated/eco-sync/src/app/trading/page.tsx)

**Step 1: Integrate real Sepolia & MetaMask connection in UI**
Modify [page.tsx](file:///c:/Users/DIVYANK%20BHARDWAJ/Desktop/Projects/eco%20sync%20updated/eco-sync/src/app/trading/page.tsx) to query the real contract balance, enforce Sepolia chain, prompt MetaMask signatures, and process the settlement via Next.js API.
Replace the whole file or matching chunks in [page.tsx](file:///c:/Users/DIVYANK%20BHARDWAJ/Desktop/Projects/eco%20sync%20updated/eco-sync/src/app/trading/page.tsx) with:
```typescript
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Sun, Zap, ArrowRight, 
  History, ShieldCheck, Check, Fingerprint, Coins, Network, 
  Wallet, TrendingUp, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { SolarBatteryState } from "@/types/device";
import { ethers } from "ethers";
import UserProfileHeader from "@/components/UserProfileHeader";
import AuthModal from "@/components/AuthModal";
import SettingsDrawer from "@/components/SettingsDrawer";
import { useAuth } from "@/context/AuthContext";
import AuthPage from "@/components/AuthPage";
import { Loader2 } from "lucide-react";

type Transaction = {
  id: string;
  hash: string;
  amount: number;
  price: number;
  total: number;
  time: string;
  status: "completed" | "pending";
};

const SEPOLIA_CHAIN_ID = "0xf3e1"; // 11155111 in hex

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
    batteryLevel: 0,
    batteryChargeRate: 5.0,
    gridDependency: 0,
  });

  const [walletBalance, setWalletBalance] = useState(0.00);
  const [marketPrice, setMarketPrice] = useState(0.18);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "1", hash: "0x8f...3a2b", amount: 5.2, price: 0.18, total: 0.936, time: "10 mins ago", status: "completed" }
  ]);

  const [isSelling, setIsSelling] = useState(false);
  const [sellAmount, setSellAmount] = useState<number | "">("");

  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
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
          
          // Listen to changes
          (window as any).ethereum.on('accountsChanged', async (newAccounts: string[]) => {
            if (newAccounts.length > 0) {
              setAccount(newAccounts[0]);
              await checkNetworkAndSync(newAccounts[0]);
            } else {
              setAccount(null);
              setWalletBalance(0.00);
            }
          });

          (window as any).ethereum.on('chainChanged', () => {
            window.location.reload();
          });
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

  // Switch to Sepolia automatically
  const switchNetwork = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
      } catch (switchError: any) {
        console.error("Failed to switch network", switchError);
      }
    }
  };

  // Check network and fetch real token balance
  const checkNetworkAndSync = async (address: string) => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const network = await provider.getNetwork();

      if (network.chainId !== 11155111n) {
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

  useEffect(() => {
    if (account) {
      checkNetworkAndSync(account);
    }
  }, [account]);

  // Sync profile settings with simulator values
  useEffect(() => {
    if (user) {
      setSolarState(prev => ({
        ...prev,
        batteryCapacity: user.batteryCap,
        batteryLevel: Math.min(prev.batteryLevel, user.batteryCap),
      }));
    }
  }, [user]);

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

  const batteryPct = solarState.batteryCapacity > 0
    ? Math.round((solarState.batteryLevel / solarState.batteryCapacity) * 100)
    : 0;
  const isLowBattery = batteryPct <= lowBatteryThreshold;

  // Update market price dynamically
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketPrice(prev => {
        const basePrice = 0.15;
        const demandPremium = (solarState.gridDependency / 100) * 0.15;
        const fluctuation = (Math.random() - 0.5) * 0.02;
        return Math.max(0.10, Math.min(0.40, basePrice + demandPremium + fluctuation));
      });
    }, refreshRateMs);
    return () => clearInterval(interval);
  }, [solarState.gridDependency, refreshRateMs]);

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
      const signature = await signer.personalSign(message);

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
      
      const newTx: Transaction = {
        id: Date.now().toString(),
        hash: `${txHash.slice(0, 6)}...${txHash.slice(-4)}`,
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
    <main className="min-h-screen bg-background text-foreground selection:bg-accent-secondary selection:text-black font-sans relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent-secondary/5 blur-[150px] -translate-y-1/2 translate-x-1/2 rounded-full" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-primary/5 blur-[120px] translate-y-1/2 -translate-x-1/2 rounded-full" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <header className="flex items-center justify-between mb-16">
          <Link 
            href="/"
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
                  <span className="text-5xl font-black tabular-nums tracking-tighter">{walletBalance.toFixed(4)}</span>
                  <span className="text-accent-secondary font-black tracking-widest">ECO</span>
                </div>
                
                {isWrongNetwork && (
                  <button 
                    onClick={switchNetwork}
                    className="mt-4 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-500 font-mono text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4" /> Switch to Sepolia
                  </button>
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
                  <p className="text-2xl font-bold tabular-nums flex items-center gap-2">
                    {marketPrice.toFixed(3)} <span className="text-sm text-white/40">ECO/kWh</span>
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
                   <p className="text-3xl font-black text-white tabular-nums">{solarState.solarGeneration.toFixed(1)}<span className="text-sm text-white/40 ml-1 font-sans text-white/20 font-bold">kW</span></p>
                 </div>
                 <div className={`bg-black/50 rounded-xl p-6 border transition-all ${isLowBattery ? "border-red-900/30" : "border-white/5"}`}>
                   <p className="text-white/40 font-mono text-[9px] uppercase tracking-widest mb-2 font-bold flex items-center gap-1.5">
                     Stored Energy {isLowBattery && <span className="text-[7px] text-red-500 bg-red-950/20 px-1.5 py-0.5 rounded border border-red-900/30 font-black animate-pulse">LOW</span>}
                   </p>
                   <p className={`text-3xl font-black tabular-nums transition-colors ${isLowBattery ? "text-red-500" : "text-white"}`}>
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
```

**Step 2: Commit**
```bash
git add src/app/trading/page.tsx
git commit -m "feat: complete frontend web3 MetaMask integration for Sepolia"
```
