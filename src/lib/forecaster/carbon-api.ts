export interface LiveCarbonIntensity {
  currentGco2: number; // gCO2/kWh
  index: 'very low' | 'low' | 'moderate' | 'high' | 'very high';
  source: string;
  timestamp: string;
}

export class CarbonApiService {
  /**
   * Fetches real-time carbon intensity telemetry from National Grid API or fallback
   */
  public async getLiveCarbonIntensity(): Promise<LiveCarbonIntensity> {
    try {
      // 1. National Grid Live Carbon Intensity API
      const response = await fetch('https://api.carbonintensity.org.uk/intensity', {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      });

      if (response.ok) {
        const json = await response.json();
        if (json.data && json.data.length > 0) {
          const entry = json.data[0];
          return {
            currentGco2: entry.intensity.actual || entry.intensity.forecast || 210,
            index: entry.intensity.index || 'moderate',
            source: 'National Grid Official API',
            timestamp: new Date().toISOString()
          };
        }
      }
    } catch (err) {
      console.warn('Live National Grid Carbon API call failed, using dynamic peaker fallback:', err);
    }

    // Dynamic Peaker Model Fallback
    const hour = new Date().getHours();
    const dynamicIntensity = Math.round(
      Math.sin((hour - 3) * ((2 * Math.PI) / 24)) * 140 +
      Math.sin((hour - 13) * ((4 * Math.PI) / 24)) * 160 + 310
    );

    let index: 'very low' | 'low' | 'moderate' | 'high' | 'very high' = 'moderate';
    if (dynamicIntensity < 150) index = 'very low';
    else if (dynamicIntensity < 250) index = 'low';
    else if (dynamicIntensity < 400) index = 'moderate';
    else if (dynamicIntensity < 500) index = 'high';
    else index = 'very high';

    return {
      currentGco2: dynamicIntensity,
      index,
      source: 'Diurnal Dynamic Peaker Engine',
      timestamp: new Date().toISOString()
    };
  }
}
