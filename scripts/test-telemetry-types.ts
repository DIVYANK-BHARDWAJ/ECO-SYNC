import { EcoSyncTelemetry, VerificationLevel } from '../src/types/telemetry';

const mockTelemetry: EcoSyncTelemetry = {
  homeId: 'home_001',
  deviceId: 'inv_01',
  deviceType: 'solar_inverter',
  timestamp: new Date().toISOString(),
  powerKw: 4.5,
  energyKwh: 12.0,
  direction: 'generation',
  sourceAdapter: 'enphase',
  verificationLevel: VerificationLevel.LEVEL_2_VENDOR_VERIFIED
};

if (mockTelemetry.verificationLevel !== 2) {
  throw new Error('Verification level mismatch');
}

if (mockTelemetry.sourceAdapter !== 'enphase') {
  throw new Error('Source adapter mismatch');
}

console.log('Telemetry types test PASSED');
