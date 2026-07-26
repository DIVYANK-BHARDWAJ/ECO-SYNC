import { executeCopilotTool, COPILOT_TOOLS_SCHEMA } from '../src/lib/ai/copilot-tools';
import { AttestationService } from '../src/lib/blockchain/attestation-service';

async function runTest() {
  // Test 1: Tool Schema Array
  if (!Array.isArray(COPILOT_TOOLS_SCHEMA) || COPILOT_TOOLS_SCHEMA.length === 0) {
    throw new Error('COPILOT_TOOLS_SCHEMA must be a non-empty array of tools');
  }

  // Test 2: Execute getHomeEnergyStats tool
  const statsResult = await executeCopilotTool('getHomeEnergyStats', { homeId: 'home_001' });
  if (!statsResult.batteryLevel || !statsResult.solarGeneration) {
    throw new Error('getHomeEnergyStats failed to return valid stats');
  }

  // Test 3: Execute setOptimizationStrategy tool
  const strategyResult = await executeCopilotTool('setOptimizationStrategy', { strategy: 'MAX_SAVINGS' });
  if (!strategyResult.success) {
    throw new Error('setOptimizationStrategy failed');
  }

  // Test 4: Attestation Merkle Tree Generation
  const attestationService = new AttestationService();
  const merkleRoot = attestationService.generateMerkleRoot([
    { tradeId: 't1', energyKwh: 4.5, amountInr: 33.75 },
    { tradeId: 't2', energyKwh: 3.2, amountInr: 24.00 }
  ]);

  if (!merkleRoot.startsWith('0x') || merkleRoot.length !== 66) {
    throw new Error(`Invalid Merkle root format: ${merkleRoot}`);
  }

  console.log('LLM Co-Pilot tools & Web3 Attestation Rail test PASSED successfully!');
}

runTest().catch((err) => {
  console.error(err);
  process.exit(1);
});
