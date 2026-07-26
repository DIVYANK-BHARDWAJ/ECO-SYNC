import { BaseHardwareAdapter } from './base-adapter';
import { EcoSyncTelemetry, VerificationLevel } from '../../types/telemetry';

export class SimulatorAdapter extends BaseHardwareAdapter {
  constructor(homeId: string = 'sim_home_01', deviceId: string = 'sim_solar_01') {
    super(homeId, deviceId, 'simulator', VerificationLevel.LEVEL_0_SIMULATED);
  }

  public readTelemetry(): EcoSyncTelemetry {
    // Generate realistic diurnal curve for testing
    const hour = new Date().getHours();
    const solarGenKw = Math.max(0, Math.sin((hour - 6) * (Math.PI / 12)) * 5.2);
    
    return {
      homeId: this.homeId,
      deviceId: this.deviceId,
      deviceType: 'solar_inverter',
      timestamp: new Date().toISOString(),
      powerKw: parseFloat(solarGenKw.toFixed(2)),
      energyKwh: parseFloat((solarGenKw * 0.25).toFixed(2)),
      direction: 'generation',
      sourceAdapter: this.adapterName,
      verificationLevel: this.verificationLevel,
    };
  }
}
