import { EcoSyncTelemetry, VerificationLevel } from '../../types/telemetry';

export abstract class BaseHardwareAdapter {
  protected homeId: string;
  protected deviceId: string;
  protected adapterName: string;
  protected verificationLevel: VerificationLevel;

  constructor(
    homeId: string, 
    deviceId: string, 
    adapterName: string, 
    verificationLevel: VerificationLevel
  ) {
    this.homeId = homeId;
    this.deviceId = deviceId;
    this.adapterName = adapterName;
    this.verificationLevel = verificationLevel;
  }

  public getAdapterInfo() {
    return {
      homeId: this.homeId,
      deviceId: this.deviceId,
      adapterName: this.adapterName,
      verificationLevel: this.verificationLevel,
    };
  }

  public abstract readTelemetry(): EcoSyncTelemetry;
}
