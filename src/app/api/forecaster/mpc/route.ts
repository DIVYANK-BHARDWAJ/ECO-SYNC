import { NextResponse } from 'next/server';
import { WeatherService } from '@/lib/forecaster/weather-service';
import { MPCOptimizer } from '@/lib/optimization/mpc-optimizer';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '28.6139');
    const lon = parseFloat(searchParams.get('lon') || '77.2090');

    const weatherService = new WeatherService();
    const weather = await weatherService.get24HourSolarForecast(lat, lon);

    const hourlyTariff = [
      6, 6, 6, 6, 6, 6, // 00:00 - 06:00
      9, 9, 9,          // 06:00 - 09:00
      7, 7, 7, 7, 7, 7, // 09:00 - 15:00
      12, 12, 12, 12,   // 15:00 - 19:00
      8, 8, 8, 8, 8     // 19:00 - 24:00
    ];

    const optimizer = new MPCOptimizer();
    const schedule = optimizer.calculateOptimal24HourSchedule({
      batteryCapacityKwh: 14,
      currentSocPercent: 45,
      hourlyTariffInr: hourlyTariff,
      solarForecastKw: weather.hourlySolarIrradiance.map(i => (i / 1000) * 5.0),
    });

    const totalEstimatedSavings = schedule.reduce((sum, item) => sum + item.estimatedCostSavingsInr, 0);

    return NextResponse.json({
      success: true,
      location: { lat, lon },
      totalEstimatedSavingsInr: parseFloat(totalEstimatedSavings.toFixed(2)),
      schedule,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
