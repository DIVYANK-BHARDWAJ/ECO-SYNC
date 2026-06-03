const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

function main() {
  // Generate a new random wallet
  const wallet = ethers.Wallet.createRandom();
  
  console.log("=========================================");
  console.log("DEVELOPER WALLET GENERATED SUCCESSFULLY!");
  console.log("=========================================");
  console.log("Public Address:", wallet.address);
  console.log("Private Key:   ", wallet.privateKey);
  console.log("=========================================");
  console.log("\nINSTRUCTIONS:");
  console.log(`1. Copy this address: ${wallet.address}`);
  console.log("2. Claim free testnet ETH by pasting this address at one of these faucets:");
  console.log("   - https://sepolia-faucet.pk910.de");
  console.log("   - https://faucet.quicknode.com/drip");
  console.log("   - https://cloud.google.com/application/web3/faucet/ethereum/sepolia");
  console.log("3. Once the faucet transfers the test ETH, let me know and we will run the deployment!");
  console.log("=========================================");

  // Read .env.local and update the key
  const envPath = path.resolve(__dirname, "../.env.local");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    
    // Replace BLOCKCHAIN_PRIVATE_KEY="" or similar with the new private key
    if (envContent.includes('BLOCKCHAIN_PRIVATE_KEY=""')) {
      envContent = envContent.replace('BLOCKCHAIN_PRIVATE_KEY=""', `BLOCKCHAIN_PRIVATE_KEY="${wallet.privateKey}"`);
    } else if (envContent.includes('BLOCKCHAIN_PRIVATE_KEY=')) {
      // replace any existing line
      envContent = envContent.replace(/BLOCKCHAIN_PRIVATE_KEY=.*/, `BLOCKCHAIN_PRIVATE_KEY="${wallet.privateKey}"`);
    } else {
      // append it
      envContent += `\nBLOCKCHAIN_PRIVATE_KEY="${wallet.privateKey}"`;
    }
    
    fs.writeFileSync(envPath, envContent, "utf8");
    console.log("\n[SUCCESS] Private key automatically saved to .env.local");
  } else {
    console.log("\n[WARNING] .env.local not found. Please create it and set the private key.");
  }
}

main();
