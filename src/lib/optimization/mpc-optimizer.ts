export interface MPCScheduleAction {
  hour: number;
  tariffInr: number;
  solarKw: number;
  recommendedAction: 'CHARGE_FROM_SOLAR' | 'CHARGE_FROM_GRID' | 'DISCHARGE' | 'SELL_SURPLUS' | 'IDLE';
  targetSocPercent: number;
  estimatedCostSavingsInr: number;
}

export interface MPCOptimizerParams {
  batteryCapacityKwh: number;
  currentSocPercent: number;
  hourlyTariffInr: number[]; // 24 entries
  solarForecastKw: number[]; // 24 entries
}

export class MPCOptimizer {
  public calculateOptimal24HourSchedule(params: MPCOptimizerParams): MPCScheduleAction[] {
    const { batteryCapacityKwh, currentSocPercent, hourlyTariffInr, solarForecastKw } = params;

    // Find tariff statistics
    const maxTariff = Math.max(...hourlyTariffInr);
    const minTariff = Math.min(...hourlyTariffInr);
    const avgTariff = hourlyTariffInr.reduce((a, b) => a + b, 0) / 24;

    let runningSoc = currentSocPercent;
    const schedule: MPCScheduleAction[] = [];

    for (let hour = 0; hour < 24; hour++) {
      const tariff = hourlyTariffInr[hour];
      const solar = solarForecastKw[hour];

      let action: 'CHARGE_FROM_SOLAR' | 'CHARGE_FROM_GRID' | 'DISCHARGE' | 'SELL_SURPLUS' | 'IDLE' = 'IDLE';
      let estimatedSavings = 0;

      if (solar > 2.5 && runningSoc < 90) {
        action = 'CHARGE_FROM_SOLAR';
        runningSoc = Math.min(100, runningSoc + 15);
        estimatedSavings = solar * tariff * 0.8;
      } else if (tariff >= maxTariff * 0.95 && runningSoc > 20) {
        action = 'DISCHARGE';
        runningSoc = Math.max(10, runningSoc - 20);
        estimatedSavings = 2.0 * tariff;
      } else if (solar > 3.0 && runningSoc >= 90) {
        action = 'SELL_SURPLUS';
        estimatedSavings = solar * tariff * 0.9;
      } else if (tariff <= minTariff * 1.1 && runningSoc < 50) {
        action = 'CHARGE_FROM_GRID';
        runningSoc = Math.min(80, runningSoc + 15);
      }

      schedule.push({
        hour,
        tariffInr: tariff,
        solarKw: parseFloat(solar.toFixed(2)),
        recommendedAction: action,
        targetSocPercent: Math.round(runningSoc),
        estimatedCostSavingsInr: parseFloat(estimatedSavings.toFixed(2)),
      });
    }

    return schedule;
  }
}
