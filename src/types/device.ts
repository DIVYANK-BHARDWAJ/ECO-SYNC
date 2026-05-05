export interface Device {
  id: string;
  label: string;
  power: number; // In kW
  isOn: boolean;
  iconName: string; // We'll map this to Lucide icons
  desc: string;
}

export interface SolarBatteryState {
  solarGeneration: number; // In kW (positive means generating)
  batteryCapacity: number; // Total capacity in kWh
  batteryLevel: number; // Current level in kWh
  batteryChargeRate: number; // Max charge/discharge rate in kW
  gridDependency: number; // Total load minus solar generation minus battery output
}
