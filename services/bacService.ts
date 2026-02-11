
import { Drink, UserProfile, BacStatus } from '../types';
import { ALCOHOL_DENSITY, GENDER_CONSTANT, METABOLISM_RATE, THEME_COLORS } from '../constants';

export const calculateBac = (drinks: Drink[], user: UserProfile): BacStatus => {
  const lang = user.language || 'en';
  const t = {
    setup: lang === 'fr' ? 'Profil Requis' : 'Setup Required',
    sober: lang === 'fr' ? 'Sobre' : 'Sober',
    buzzy: lang === 'fr' ? 'Pompette' : 'Buzzy',
    tipsy: lang === 'fr' ? 'Éméché' : 'Tipsy',
    drunk: lang === 'fr' ? 'Ivre' : 'Drunk'
  };

  if (!user.weightKg || user.weightKg <= 0) {
    return { currentBac: 0, soberTimestamp: null, statusMessage: t.setup, color: THEME_COLORS.safe };
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
    const metabolized = timeElapsedHours * METABOLISM_RATE;
    
    // Current contribution of this drink cannot be negative
    const currentDrinkBac = Math.max(0, peakBac - metabolized);
    
    totalBac += currentDrinkBac;
  });
  
  const formattedBac = Math.max(0, parseFloat(totalBac.toFixed(3)));

  // Estimate sobering time
  let soberTimestamp: number | null = null;
  if (formattedBac > 0) {
    const hoursToSober = formattedBac / METABOLISM_RATE;
    soberTimestamp = now + (hoursToSober * 60 * 60 * 1000);
  }

  let statusMessage = t.sober;
  let color = THEME_COLORS.safe;

  if (formattedBac > 0.00 && formattedBac < 0.05) {
    statusMessage = t.buzzy;
    color = THEME_COLORS.buzz;
  } else if (formattedBac >= 0.05 && formattedBac < 0.12) {
    statusMessage = t.tipsy;
    color = THEME_COLORS.drunk;
  } else if (formattedBac >= 0.12) {
    statusMessage = t.drunk;
    color = THEME_COLORS.danger;
  }

  return {
    currentBac: formattedBac,
    soberTimestamp,
    statusMessage,
    color
  };
};
