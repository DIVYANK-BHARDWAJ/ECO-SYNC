import { CarbonApiService } from '../src/lib/forecaster/carbon-api';

async function runTest() {
  const service = new CarbonApiService();
  const intensity = await service.getLiveCarbonIntensity();

  if (typeof intensity.currentGco2 !== 'number' || intensity.currentGco2 <= 0) {
    throw new Error(`Failed to retrieve positive numeric carbon intensity, got ${intensity.currentGco2}`);
  }

  if (!intensity.source) {
    throw new Error('Carbon intensity response must include a source attribute');
  }

  console.log('Live Carbon API Test PASSED!');
  console.log(`Current Grid Intensity: ${intensity.currentGco2} gCO2/kWh (Source: ${intensity.source})`);
}

runTest().catch((err) => {
  console.error(err);
  process.exit(1);
});
