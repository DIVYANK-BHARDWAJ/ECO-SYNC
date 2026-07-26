import { MPCOptimizer } from '../src/lib/optimization/mpc-optimizer';
import { WeatherService } from '../src/lib/forecaster/weather-service';

async function runTest() {
  const weatherService = new WeatherService();
  const weather = await weatherService.get24HourSolarForecast(28.6139, 77.2090); // Delhi coordinates

  if (weather.hourlySolarIrradiance.length !== 24) {
    throw new Error(`Expected 24-hour solar array, got ${weather.hourlySolarIrradiance.length}`);
  }

  const optimizer = new MPCOptimizer();
  const schedule = optimizer.calculateOptimal24HourSchedule({
    batteryCapacityKwh: 10,
    currentSocPercent: 30,
    hourlyTariffInr: [
      6, 6, 6, 6, 6, 6, // 00:00 - 06:00 Off-peak
      9, 9, 9,           // 06:00 - 09:00 Morning peak
      7, 7, 7, 7, 7, 7, // 09:00 - 15:00 Midday solar
      12, 12, 12, 12,    // 15:00 - 19:00 Evening peak
      8, 8, 8, 8, 8      // 19:00 - 24:00 Night
    ],
    solarForecastKw: weather.hourlySolarIrradiance.map(i => (i / 1000) * 5.0) // 5 kW array
  });

  if (schedule.length !== 24) {
    throw new Error(`Expected 24 optimal schedule actions, got ${schedule.length}`);
  }

  // Check that peak hours (15:00-19:00, index 15-18) recommend battery DISCHARGE
  const peakHourAction = schedule[16];
  if (peakHourAction.recommendedAction !== 'DISCHARGE' && peakHourAction.recommendedAction !== 'SELL_SURPLUS') {
    throw new Error(`Expected DISCHARGE/SELL on peak hour, got ${peakHourAction.recommendedAction}`);
  }

  console.log('Real Weather API & MPC Optimizer test PASSED successfully!');
}

runTest().catch((err) => {
  console.error(err);
  process.exit(1);
});
