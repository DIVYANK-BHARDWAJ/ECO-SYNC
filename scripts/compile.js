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
