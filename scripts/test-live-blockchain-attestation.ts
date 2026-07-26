import { AttestationService } from '../src/lib/blockchain/attestation-service';

async function runTest() {
  const service = new AttestationService();
  const merkleRoot = service.generateMerkleRoot([
    { tradeId: 'trade_sepolia_01', energyKwh: 5.5, amountInr: 41.25 },
    { tradeId: 'trade_sepolia_02', energyKwh: 3.0, amountInr: 22.50 }
  ]);

  if (!merkleRoot || !merkleRoot.startsWith('0x') || merkleRoot.length !== 66) {
    throw new Error(`Invalid Merkle root: ${merkleRoot}`);
  }

  const broadcastResult = await service.broadcastMerkleRootToSepolia(merkleRoot);
  if (!broadcastResult.success || !broadcastResult.blockNumber) {
    throw new Error(`Broadcast to Sepolia failed: ${JSON.stringify(broadcastResult)}`);
  }

  console.log('Live Sepolia RPC Attestation test PASSED!');
  console.log(`Merkle Root Hash: ${merkleRoot}`);
  console.log(`Sepolia RPC Network Block Height: ${broadcastResult.blockNumber} (Network: ${broadcastResult.network})`);
}

runTest().catch((err) => {
  console.error(err);
  process.exit(1);
});
