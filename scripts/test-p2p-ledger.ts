import { P2PLedger } from '../src/lib/ledger/p2p-ledger';
import { StripePaymentProvider } from '../src/lib/payments/stripe-provider';
import { VerificationLevel } from '../src/types/telemetry';

const paymentProvider = new StripePaymentProvider();
const ledger = new P2PLedger(paymentProvider);

// Test 1: LEVEL_0 (Simulated) must be REJECTED for financial settlement
try {
  ledger.createTradeOffer({
    sellerId: 'user_sim_01',
    energyKwh: 5.0,
    pricePerKwh: 7.5,
    currency: 'INR',
    verificationLevel: VerificationLevel.LEVEL_0_SIMULATED,
  });
  throw new Error('FAILED: Simulated telemetry should have been rejected for real payout!');
} catch (err: any) {
  if (!err.message.includes('below minimum payout verification level')) {
    throw err;
  }
  console.log('Test 1 PASSED: Simulated telemetry correctly rejected for financial payouts');
}

// Test 2: LEVEL_2 (Vendor Verified) must be ACCEPTED
const offer = ledger.createTradeOffer({
  sellerId: 'user_real_01',
  energyKwh: 5.0,
  pricePerKwh: 7.5,
  currency: 'INR',
  verificationLevel: VerificationLevel.LEVEL_2_VENDOR_VERIFIED,
});

if (offer.status !== 'ACTIVE') {
  throw new Error('Offer should be ACTIVE');
}

// Test 3: Settle trade with buyer
const tradeResult = ledger.matchAndSettleTrade(offer.offerId, 'user_buyer_02');

if (tradeResult.status !== 'SETTLED') {
  throw new Error('Trade should be SETTLED');
}

if (tradeResult.grossAmount !== 37.5) {
  throw new Error(`Gross amount calculation error: expected 37.5, got ${tradeResult.grossAmount}`);
}

console.log('Double-Entry P2P Ledger & Payment Abstraction test PASSED successfully!');
