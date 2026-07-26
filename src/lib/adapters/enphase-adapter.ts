import { BaseHardwareAdapter } from './base-adapter';
import { EcoSyncTelemetry, VerificationLevel } from '../../types/telemetry';

export class EnphaseAdapter extends BaseHardwareAdapter {
  private apiKey: string;

  constructor(homeId: string, deviceId: string, apiKey: string) {
    super(homeId, deviceId, 'enphase', VerificationLevel.LEVEL_2_VENDOR_VERIFIED);
    this.apiKey = apiKey;
  }

  public readTelemetry(): EcoSyncTelemetry {
    // Simulates reading from Enphase Cloud API v4 with vendor-verified level 2
    return {
      homeId: this.homeId,
      deviceId: this.deviceId,
      deviceType: 'solar_inverter',
      timestamp: new Date().toISOString(),
      powerKw: 4.85,
      energyKwh: 14.5,
      direction: 'generation',
      sourceAdapter: this.adapterName,
      verificationLevel: this.verificationLevel,
    };
  }
}
