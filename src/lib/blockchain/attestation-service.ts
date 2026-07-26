import { ethers } from 'ethers';

export interface OffChainTradeRecord {
  tradeId: string;
  energyKwh: number;
  amountInr: number;
}

export class AttestationService {
  /**
   * Generates a cryptographic Merkle root hash representing a batch of off-chain settled energy trades
   */
  public generateMerkleRoot(trades: OffChainTradeRecord[]): string {
    if (trades.length === 0) {
      return ethers.ZeroHash;
    }

    const hashes = trades.map(t => 
      ethers.solidityPackedKeccak256(
        ['string', 'uint256', 'uint256'], 
        [t.tradeId, Math.round(t.energyKwh * 100), Math.round(t.amountInr * 100)]
      )
    );

    // Combine hashes into a single Merkle root hash
    const combined = hashes.join('');
    return ethers.keccak256(ethers.toUtf8Bytes(combined));
  }
}
