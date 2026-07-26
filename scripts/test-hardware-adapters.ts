import { SimulatorAdapter } from '../src/lib/adapters/simulator-adapter';
import { EnphaseAdapter } from '../src/lib/adapters/enphase-adapter';
import { VerificationLevel, verifyTelemetryPayoutEligibility } from '../src/types/telemetry';

const sim = new SimulatorAdapter('home_test_1', 'sim_solar_01');
const simTelemetry = sim.readTelemetry();

if (simTelemetry.verificationLevel !== VerificationLevel.LEVEL_0_SIMULATED) {
  throw new Error('Simulator must assign LEVEL_0_SIMULATED (0)');
}

const simEligibility = verifyTelemetryPayoutEligibility(simTelemetry);
if (simEligibility.isEligibleForPayout) {
  throw new Error('Simulated telemetry must NOT be payout eligible!');
}

const enphase = new EnphaseAdapter('home_test_1', 'enphase_inv_101', 'mock_api_token');
const enphaseTelemetry = enphase.readTelemetry();

if (enphaseTelemetry.verificationLevel !== VerificationLevel.LEVEL_2_VENDOR_VERIFIED) {
  throw new Error('Enphase adapter must assign LEVEL_2_VENDOR_VERIFIED (2)');
}

const enphaseEligibility = verifyTelemetryPayoutEligibility(enphaseTelemetry);
if (!enphaseEligibility.isEligibleForPayout) {
  throw new Error('Vendor-verified telemetry must be payout eligible');
}

console.log('Hardware adapters test PASSED successfully!');
