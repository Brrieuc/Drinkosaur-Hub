import { Drink } from './types';

export const METABOLISM_RATE = 0.015; // Average elimination rate per hour
export const ALCOHOL_DENSITY = 0.789; // g/ml

export const GENDER_CONSTANT = {
  male: 0.68,
  female: 0.55,
};

export const PRESET_DRINKS: Omit<Drink, 'id' | 'timestamp'>[] = [
  { name: 'Beer (Pint)', volumeMl: 568, abv: 5.0, icon: '🍺' },
  { name: 'Wine (Large)', volumeMl: 250, abv: 13.0, icon: '🍷' },
  { name: 'Shot', volumeMl: 44, abv: 40.0, icon: '🥃' },
  { name: 'Cocktail', volumeMl: 200, abv: 12.0, icon: '🍸' },
];

export const MAX_SAFE_BAC = 0.08; // Example limit (varies by jurisdiction, strictly visual guide)

export const THEME_COLORS = {
  safe: 'from-emerald-400 to-cyan-400',
  buzz: 'from-yellow-400 to-orange-400',
  drunk: 'from-pink-500 to-rose-500',
  danger: 'from-red-600 to-purple-600'
};