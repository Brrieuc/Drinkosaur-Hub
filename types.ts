export interface Drink {
  id: string;
  name: string;
  volumeMl: number;
  abv: number; // Alcohol by volume percentage (e.g., 5.0)
  timestamp: number; // Unix timestamp in ms
  icon?: string;
}

export interface UserProfile {
  weightKg: number;
  gender: 'male' | 'female';
  isSetup: boolean;
}

export interface BacStatus {
  currentBac: number; // Percentage
  soberTimestamp: number | null; // Estimated time to 0.00
  statusMessage: string;
  color: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  ADD_DRINK = 'ADD_DRINK',
  SETTINGS = 'SETTINGS',
  HISTORY = 'HISTORY'
}