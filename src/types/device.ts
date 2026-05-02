export interface Device {
  id: string;
  label: string;
  power: number; // In kW
  isOn: boolean;
  iconName: string; // We'll map this to Lucide icons
  desc: string;
  autoOffMinutes?: number;
  timerEndTimestamp?: number;
}
