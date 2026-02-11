import { Drink, UserProfile, BacStatus } from '../types';
import { ALCOHOL_DENSITY, GENDER_CONSTANT, METABOLISM_RATE, THEME_COLORS } from '../constants';

export const calculateBac = (drinks: Drink[], user: UserProfile): BacStatus => {
  if (!user.weightKg || user.weightKg <= 0) {
    return { currentBac: 0, soberTimestamp: null, statusMessage: 'Setup Required', color: THEME_COLORS.safe };
  }

  const now = Date.now();
  const distributionRatio = GENDER_CONSTANT[user.gender];
  
  // Calculate total active alcohol
  let totalBac = 0;

  drinks.forEach((drink) => {
    const timeElapsedHours = (now - drink.timestamp) / (1000 * 60 * 60);
    
    // Alcohol in grams
    const alcoholGrams = drink.volumeMl * (drink.abv / 100) * ALCOHOL_DENSITY;
    
    // Widmark formula for peak BAC from this specific drink
    const peakBac = (alcoholGrams / (user.weightKg * 1000 * distributionRatio)) * 100;
    
    // Metabolism deduction
    // We assume absorption is relatively fast for simplicity in this visualizer, 
    // effectively treating it as "absorbed active alcohol" vs "metabolized".
    // A more complex model would handle absorption rates, but Widmark is standard for estimation.
    const metabolized = timeElapsedHours * METABOLISM_RATE;
    
    // Current contribution of this drink cannot be negative
    const currentDrinkBac = Math.max(0, peakBac - metabolized);
    
    totalBac += currentDrinkBac;
  });

  // Clamp usually not needed with the logic above unless metabolism exceeds intake globally, 
  // but logic above handles per-drink. However, strict Widmark sums grams first.
  // Let's do the "Sum of Active Alcohol" method which is more accurate for multiple drinks over time.
  // Method 2: Integrated Widmark
  
  // 1. Calculate total grams of alcohol consumed that could possibly still be in system (e.g. last 24h)
  // 2. Calculate time since FIRST drink in the active window.
  // Actually, the per-drink decay method is a safe approximation for a rolling session without tracking complex metabolic floor.
  // Let's stick to the per-drink contribution sum for simplicity and robustness against gaps in drinking.
  
  const formattedBac = Math.max(0, parseFloat(totalBac.toFixed(3)));

  // Estimate sobering time
  let soberTimestamp: number | null = null;
  if (formattedBac > 0) {
    const hoursToSober = formattedBac / METABOLISM_RATE;
    soberTimestamp = now + (hoursToSober * 60 * 60 * 1000);
  }

  let statusMessage = "Sober";
  let color = THEME_COLORS.safe;

  if (formattedBac > 0.00 && formattedBac < 0.05) {
    statusMessage = "Buzzy";
    color = THEME_COLORS.buzz;
  } else if (formattedBac >= 0.05 && formattedBac < 0.12) {
    statusMessage = "Tipsy";
    color = THEME_COLORS.drunk;
  } else if (formattedBac >= 0.12) {
    statusMessage = "Drunk";
    color = THEME_COLORS.danger;
  }

  return {
    currentBac: formattedBac,
    soberTimestamp,
    statusMessage,
    color
  };
};