const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Manually parse .env.local to avoid adding external dependencies like dotenv
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split(/\r?\n/).forEach((line) => {
    // Match KEY="value" or KEY=value
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      // Strip wrapping quotes
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

async function main() {
  const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
  const rpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://sepolia.drpc.org";

  if (!privateKey) {
    console.error("ERROR: BLOCKCHAIN_PRIVATE_KEY is not defined in .env.local");
    console.error("Please add BLOCKCHAIN_PRIVATE_KEY=\"your_private_key\" to .env.local first.");
    process.exit(1);
  }

  console.log("Connecting to Sepolia Network via RPC URL:", rpcUrl);
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Deployer Wallet Address:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Deployer ETH Balance:", ethers.formatEther(balance), "ETH");

  const artifactPath = path.resolve(__dirname, "../artifacts/EcoToken.json");
  if (!fs.existsSync(artifactPath)) {
    console.error("ERROR: Contract artifacts not found. Please run: node scripts/compile.js");
    process.exit(1);
  }

  const { abi, bytecode } = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  
  console.log("Deploying EcoToken Contract to Sepolia...");
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();

  console.log("Waiting for block confirmation...");
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\n================================================");
  console.log("SUCCESS: EcoToken deployed successfully!");
  console.log("Contract Address:", address);
  console.log("================================================");
  console.log("\nNEXT STEPS:");
  console.log(`1. Copy the Contract Address above.`);
  console.log(`2. Update NEXT_PUBLIC_ECO_TOKEN_ADDRESS="${address}" in your .env.local file.`);
  console.log(`3. Fund the backend wallet (${wallet.address}) with Sepolia testnet ETH to pay transaction gas fees.`);
}

main().catch((err) => {
  console.error("\nDeployment failed with error:", err);
  process.exit(1);
});
