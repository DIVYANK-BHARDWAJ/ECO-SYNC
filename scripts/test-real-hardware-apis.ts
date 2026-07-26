import { EnphaseAdapter } from '../src/lib/adapters/enphase-adapter';
import { TuyaAdapter } from '../src/lib/adapters/tuya-adapter';
import { VerificationLevel } from '../src/types/telemetry';

async function runTest() {
  const enphase = new EnphaseAdapter('home_delhi_01', 'enphase_inv_101', 'mock_api_key');
  const enphaseTelemetry = enphase.readTelemetry();

  if (enphaseTelemetry.verificationLevel !== VerificationLevel.LEVEL_2_VENDOR_VERIFIED) {
    throw new Error('Enphase adapter must be Level 2 vendor verified');
  }

  const tuya = new TuyaAdapter('home_delhi_01', 'tuya_plug_01', 'client_id_mock', 'client_secret_mock');
  const tuyaTelemetry = await tuya.fetchLiveDeviceStatus();

  if (tuyaTelemetry.verificationLevel !== VerificationLevel.LEVEL_1_LOCAL_REPORTED) {
    throw new Error('Tuya plug must be Level 1 local/smart plug reported');
  }

  console.log('Real Enphase & Tuya Hardware APIs test PASSED!');
  console.log(`Enphase Inverter Power: ${enphaseTelemetry.powerKw} kW`);
  console.log(`Tuya Plug Device Status: ${tuyaTelemetry.powerKw} kW (${tuyaTelemetry.direction})`);
}

runTest().catch((err) => {
  console.error(err);
  process.exit(1);
});
