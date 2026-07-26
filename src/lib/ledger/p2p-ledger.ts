import { PaymentProvider } from '../payments/payment-provider';
import { VerificationLevel, verifyTelemetryPayoutEligibility } from '../../types/telemetry';

export interface TradeOffer {
  offerId: string;
  sellerId: string;
  energyKwh: number;
  pricePerKwh: number;
  currency: string;
  verificationLevel: VerificationLevel;
  status: 'ACTIVE' | 'SETTLED' | 'CANCELLED';
  createdAt: string;
}

export interface SettledTrade {
  tradeId: string;
  offerId: string;
  sellerId: string;
  buyerId: string;
  energyKwh: number;
  pricePerKwh: number;
  grossAmount: number;
  feeAmount: number;
  netSellerAmount: number;
  currency: string;
  verificationLevel: VerificationLevel;
  status: 'SETTLED';
  timestamp: string;
}

export class P2PLedger {
  private paymentProvider: PaymentProvider;
  private offers: Map<string, TradeOffer> = new Map();
  private trades: Map<string, SettledTrade> = new Map();

  constructor(paymentProvider: PaymentProvider) {
    this.paymentProvider = paymentProvider;
  }

  public createTradeOffer(params: {
    sellerId: string;
    energyKwh: number;
    pricePerKwh: number;
    currency: string;
    verificationLevel: VerificationLevel;
  }): TradeOffer {
    // Enforce Level 2+ Verification Requirement for Payouts
    const mockTelemetry = {
      homeId: params.sellerId,
      deviceId: 'inv_01',
      deviceType: 'solar_inverter' as const,
      timestamp: new Date().toISOString(),
      powerKw: 0,
      energyKwh: params.energyKwh,
      direction: 'generation' as const,
      sourceAdapter: 'verification_gate',
      verificationLevel: params.verificationLevel,
    };

    const check = verifyTelemetryPayoutEligibility(mockTelemetry);
    if (!check.isEligibleForPayout) {
      throw new Error(`Trade offer rejected: verification level ${params.verificationLevel} is below minimum payout verification level requirement (${check.minRequiredLevel})`);
    }

    const offerId = `offer_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const offer: TradeOffer = {
      offerId,
      sellerId: params.sellerId,
      energyKwh: params.energyKwh,
      pricePerKwh: params.pricePerKwh,
      currency: params.currency,
      verificationLevel: params.verificationLevel,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    this.offers.set(offerId, offer);
    return offer;
  }

  public matchAndSettleTrade(offerId: string, buyerId: string): SettledTrade {
    const offer = this.offers.get(offerId);
    if (!offer) {
      throw new Error(`Offer ${offerId} not found`);
    }
    if (offer.status !== 'ACTIVE') {
      throw new Error(`Offer ${offerId} is not ACTIVE`);
    }

    const grossAmount = parseFloat((offer.energyKwh * offer.pricePerKwh).toFixed(2));
    const feeAmount = parseFloat((grossAmount * 0.03).toFixed(2)); // 3% platform fee
    const netSellerAmount = parseFloat((grossAmount - feeAmount).toFixed(2));

    const tradeId = `trade_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const settledTrade: SettledTrade = {
      tradeId,
      offerId,
      sellerId: offer.sellerId,
      buyerId,
      energyKwh: offer.energyKwh,
      pricePerKwh: offer.pricePerKwh,
      grossAmount,
      feeAmount,
      netSellerAmount,
      currency: offer.currency,
      verificationLevel: offer.verificationLevel,
      status: 'SETTLED',
      timestamp: new Date().toISOString(),
    };

    offer.status = 'SETTLED';
    this.trades.set(tradeId, settledTrade);

    return settledTrade;
  }

  public getOffers(): TradeOffer[] {
    return Array.from(this.offers.values());
  }

  public getTrades(): SettledTrade[] {
    return Array.from(this.trades.values());
  }
}
