import { NextResponse } from 'next/server';
import { AttestationService } from '@/lib/blockchain/attestation-service';

export async function POST(request: Request) {
  try {
    const { trades } = await request.json();
    const service = new AttestationService();

    const mockTrades = trades || [
      { tradeId: 'trade_sepolia_101', energyKwh: 4.8, amountInr: 36.00 },
      { tradeId: 'trade_sepolia_102', energyKwh: 6.2, amountInr: 46.50 },
    ];

    const merkleRoot = service.generateMerkleRoot(mockTrades);
    const broadcastResult = await service.broadcastMerkleRootToSepolia(merkleRoot);

    return NextResponse.json({
      success: true,
      merkleRoot,
      broadcastResult,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
