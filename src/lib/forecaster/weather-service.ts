export interface SolarForecastData {
  latitude: number;
  longitude: number;
  hourlySolarIrradiance: number[]; // W/m² for 24 hours
  hourlyTemperature: number[]; // °C
}

export class WeatherService {
  public async get24HourSolarForecast(lat: number = 28.6139, lon: number = 77.2090): Promise<SolarForecastData> {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=direct_normal_irradiance,temperature_2m&forecast_days=1`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.hourly && json.hourly.direct_normal_irradiance) {
          return {
            latitude: lat,
            longitude: lon,
            hourlySolarIrradiance: json.hourly.direct_normal_irradiance.slice(0, 24),
            hourlyTemperature: json.hourly.temperature_2m.slice(0, 24),
          };
        }
      }
    } catch (e) {
      console.warn('Fallback to solar irradiance diurnal model due to network:', e);
    }

    // Fallback diurnal irradiance array
    const hourlyIrradiance = Array.from({ length: 24 }, (_, hour) => {
      if (hour >= 6 && hour <= 18) {
        return Math.max(0, Math.sin((hour - 6) * (Math.PI / 12)) * 850);
      }
      return 0;
    });

    const hourlyTemperature = Array.from({ length: 24 }, (_, hour) => 25 + Math.sin((hour - 8) * (Math.PI / 12)) * 5);

    return {
      latitude: lat,
      longitude: lon,
      hourlySolarIrradiance: hourlyIrradiance,
      hourlyTemperature: hourlyTemperature,
    };
  }
}
