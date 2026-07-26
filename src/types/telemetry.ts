export enum VerificationLevel {
  LEVEL_0_SIMULATED = 0,     // Demo / sandbox / automated testing (zero payout eligibility)
  LEVEL_1_LOCAL_REPORTED = 1,// Home Assistant / MQTT local bridge (analytics & automation rules)
  LEVEL_2_VENDOR_VERIFIED = 2,// Direct Manufacturer Cloud API (inverter/battery cloud APIs, payout eligible)
  LEVEL_3_METER_VERIFIED = 3, // Smart Meter / Utility Grid API (full financial payout eligible)
  LEVEL_4_GATEWAY_SIGNED = 4, // Cryptographic EcoSync Trusted Hardware Gateway (institutional grade trust)
}

export type DeviceType = 
  | 'solar_inverter' 
  | 'battery' 
  | 'ev_charger' 
  | 'smart_plug' 
  | 'smart_meter' 
  | 'grid_connection';

export type EnergyDirection = 
  | 'generation' 
  | 'consumption' 
  | 'storage_charge' 
  | 'storage_discharge' 
  | 'grid_import' 
  | 'grid_export';

export interface EcoSyncTelemetry {
  homeId: string;
  deviceId: string;
  deviceType: DeviceType;
  timestamp: string; // ISO 8601 string format
  powerKw: number;
  energyKwh: number;
  direction: EnergyDirection;
  sourceAdapter: string;
  verificationLevel: VerificationLevel;
}

export interface TelemetryVerificationResult {
  isEligibleForPayout: boolean;
  minRequiredLevel: VerificationLevel;
  actualLevel: VerificationLevel;
  reason?: string;
}

export function verifyTelemetryPayoutEligibility(
  telemetry: EcoSyncTelemetry, 
  minLevel: VerificationLevel = VerificationLevel.LEVEL_2_VENDOR_VERIFIED
): TelemetryVerificationResult {
  const isEligible = telemetry.verificationLevel >= minLevel;
  return {
    isEligibleForPayout: isEligible,
    minRequiredLevel: minLevel,
    actualLevel: telemetry.verificationLevel,
    reason: isEligible 
      ? 'Telemetry meets payout verification requirements' 
      : `Telemetry verification level ${telemetry.verificationLevel} is below minimum payout requirement ${minLevel}`
  };
}
