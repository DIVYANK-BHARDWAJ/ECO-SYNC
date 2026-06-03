import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userAddress, amount, price, signature, email } = await req.json();

    if (!userAddress || !amount || !price || !signature || !email) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // 1. Verify user signature to ensure authenticity
    const message = `Authorize sale of ${Number(amount).toFixed(1)} kWh for ${(Number(amount) * Number(price)).toFixed(2)} ECO tokens`;
    const signerAddress = ethers.verifyMessage(message, signature);

    if (signerAddress.toLowerCase() !== userAddress.toLowerCase()) {
      return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
    }

    // 2. Load contract address & backend keys
    const contractAddress = process.env.NEXT_PUBLIC_ECO_TOKEN_ADDRESS;
    const rpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;

    if (!contractAddress || contractAddress === "") {
      return NextResponse.json({ 
        error: "NEXT_PUBLIC_ECO_TOKEN_ADDRESS is missing in .env.local. Please deploy the contract first." 
      }, { status: 500 });
    }

    if (!privateKey || privateKey === "") {
      return NextResponse.json({ 
        error: "BLOCKCHAIN_PRIVATE_KEY is missing in .env.local. Please add a funded wallet private key." 
      }, { status: 500 });
    }

    // 3. Connect to Sepolia via Ethers.js
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const serverWallet = new ethers.Wallet(privateKey, provider);

    // 4. Load contract ABI
    const artifactPath = path.resolve(process.cwd(), "./artifacts/EcoToken.json");
    if (!fs.existsSync(artifactPath)) {
      return NextResponse.json({ error: "Contract artifacts missing. Please compile using: node scripts/compile.js" }, { status: 500 });
    }

    const { abi } = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const contract = new ethers.Contract(contractAddress, abi, serverWallet);

    // Calculate token value with 18 decimals (multiply by 10^18)
    const tokenAmount = ethers.parseEther((amount * price).toFixed(6));

    // 5. Mint tokens directly to user wallet on-chain
    console.log(`Minting ${amount * price} ECO tokens to address ${userAddress}`);
    const tx = await contract.mint(userAddress, tokenAmount);
    
    // 6. Save the transaction record to the database
    try {
      const user = await db.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      });
      if (user) {
        await db.transaction.create({
          data: {
            hash: tx.hash,
            amount: Number(amount),
            price: Number(price),
            total: Number(amount) * Number(price),
            userId: user.id
          }
        });
      }
    } catch (dbError) {
      console.error("Failed to save transaction to database:", dbError);
      // We don't fail the request if the blockchain transaction itself was successful
    }

    // Return transaction hash immediately so the client UI can track block confirmation
    return NextResponse.json({ 
      success: true, 
      txHash: tx.hash,
      message: "Transaction successfully broadcast to Sepolia."
    });

  } catch (error: any) {
    console.error("Trading settlement API error:", error);
    return NextResponse.json({ error: error.message || "Failed to execute transaction" }, { status: 500 });
  }
}
