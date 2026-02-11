import { Drink } from './types';

export const METABOLISM_RATE = 0.015; // Average elimination rate per hour
export const ALCOHOL_DENSITY = 0.789; // g/ml

export const GENDER_CONSTANT = {
  male: 0.68,
  female: 0.55,
};

export const MAX_SAFE_BAC = 0.08;

export const THEME_COLORS = {
  safe: 'from-emerald-400 to-cyan-400',
  buzz: 'from-yellow-400 to-orange-400',
  drunk: 'from-pink-500 to-rose-500',
  danger: 'from-red-600 to-purple-600'
};

// --- DATA LIBRARIES ---

export interface DrinkReference {
  name: string;
  abv: number;
  type: 'beer' | 'spirit' | 'wine' | 'other';
  color: string; // Hex or rgba for liquid rendering
  tags?: string[];
}

export interface MixerReference {
  name: string;
  color: string;
}

export const BEER_LIBRARY: DrinkReference[] = [
  // Classiques / Lagers (Gold/Yellow)
  { name: 'Heineken', abv: 5.0, type: 'beer', color: '#FCD34D' },
  { name: 'Stella Artois', abv: 5.0, type: 'beer', color: '#FCD34D' },
  { name: '1664', abv: 5.5, type: 'beer', color: '#FBBF24' },
  { name: 'Kronenbourg', abv: 4.2, type: 'beer', color: '#FCD34D' },
  { name: 'Budweiser', abv: 5.0, type: 'beer', color: '#FEF08A' },
  { name: 'Corona', abv: 4.5, type: 'beer', color: '#FEF9C3' },
  
  // Triples & Fortes (Amber/Dark Gold)
  { name: 'Paix-Dieu', abv: 10.0, type: 'beer', color: '#F59E0B' },
  { name: 'Rince-Cochon', abv: 8.5, type: 'beer', color: '#FCD34D' },
  { name: 'La Chouffe', abv: 8.0, type: 'beer', color: '#F59E0B' },
  { name: 'Tripel Karmeliet', abv: 8.4, type: 'beer', color: '#fbbf24' },
  { name: 'Duvel', abv: 8.5, type: 'beer', color: '#FEF3C7' },
  { name: 'Chimay Bleue', abv: 9.0, type: 'beer', color: '#451a03' }, // Dark
  { name: 'Rochefort 10', abv: 11.3, type: 'beer', color: '#3E1F11' }, // Very Dark
  { name: 'Guinness', abv: 4.2, type: 'beer', color: '#000000' }, // Black

  // IPAs (Orange)
  { name: 'Punk IPA', abv: 5.4, type: 'beer', color: '#F59E0B' },
  { name: 'Lagunitas IPA', abv: 6.2, type: 'beer', color: '#D97706' },

  // Blanches (Pale Yellow)
  { name: 'Hoegaarden', abv: 4.9, type: 'beer', color: '#FEF9C3' },
  { name: '1664 Blanc', abv: 5.0, type: 'beer', color: '#FEF9C3' },
  { name: 'Leffe Ruby', abv: 5.0, type: 'beer', color: '#9F1239' }, // Red
];

export const SPIRIT_LIBRARY: DrinkReference[] = [
  // Whisky (Amber)
  { name: "Jack Daniel's", abv: 40, type: 'spirit', color: '#B45309' },
  { name: "Jameson", abv: 40, type: 'spirit', color: '#D97706' },
  { name: "Chivas Regal", abv: 40, type: 'spirit', color: '#B45309' },
  { name: "Nikka", abv: 45, type: 'spirit', color: '#92400E' },

  // Vodka (Clear)
  { name: "Grey Goose", abv: 40, type: 'spirit', color: '#E0F2FE' },
  { name: "Absolut", abv: 40, type: 'spirit', color: '#E0F2FE' },
  { name: "Smirnoff", abv: 37.5, type: 'spirit', color: '#E0F2FE' },

  // Rhum (Brown/Clear)
  { name: "Captain Morgan", abv: 35, type: 'spirit', color: '#78350F' },
  { name: "Havana Club 3 ans", abv: 40, type: 'spirit', color: '#FEF3C7' },
  { name: "Diplomatico", abv: 40, type: 'spirit', color: '#451a03' },
  { name: "Don Papa", abv: 40, type: 'spirit', color: '#92400E' },

  // Gin (Clear)
  { name: "Tanqueray", abv: 43, type: 'spirit', color: '#ECFEFF' },
  { name: "Hendrick's", abv: 41.4, type: 'spirit', color: '#ECFEFF' },
  { name: "Bombay Sapphire", abv: 40, type: 'spirit', color: '#CFFAFE' },

  // Tequila (Clear/Gold)
  { name: "Jose Cuervo", abv: 38, type: 'spirit', color: '#FEF3C7' },
  { name: "Patron Silver", abv: 40, type: 'spirit', color: '#E0F2FE' },

  // Liqueurs
  { name: "Jägermeister", abv: 35, type: 'spirit', color: '#280802' },
  { name: "Ricard", abv: 45, type: 'spirit', color: '#FEF9C3' },
  { name: "Aperol", abv: 11, type: 'spirit', color: '#FB923C' },
  { name: "Campari", abv: 25, type: 'spirit', color: '#DC2626' },
  { name: "Get 27", abv: 21, type: 'spirit', color: '#22C55E' },
  { name: "Baileys", abv: 17, type: 'spirit', color: '#E7E5E4' },
];

export const MIXERS: MixerReference[] = [
  { name: 'Coca-Cola', color: '#280802' },
  { name: 'Tonic Water', color: '#E0F2FE' },
  { name: 'Orange Juice', color: '#FDBA74' },
  { name: 'Red Bull', color: '#FEF08A' },
  { name: 'Sprite/7Up', color: '#F0FDFA' },
  { name: 'Soda Water', color: '#E0F2FE' },
  { name: 'Cranberry', color: '#BE123C' },
  { name: 'Ginger Beer', color: '#FEF3C7' },
];

export const GENERIC_BEERS = [
  { name: "Lager / Blonde", abv: 5.0, color: '#FCD34D' },
  { name: "Blanche / White", abv: 4.5, color: '#FEF9C3' },
  { name: "IPA", abv: 6.0, color: '#F59E0B' },
  { name: "Triple", abv: 8.5, color: '#D97706' },
  { name: "Stout / Brune", abv: 5.5, color: '#280802' },
  { name: "Forte / Strong", abv: 10.0, color: '#B45309' },
];

export const GENERIC_WINES = [
  { name: "Red Wine", abv: 13.5, color: '#7f1d1d' },
  { name: "White Wine", abv: 12.0, color: '#fef9c3' },
  { name: "Rosé", abv: 12.5, color: '#fda4af' },
  { name: "Champagne", abv: 12.0, color: '#fef3c7' },
];

export const BEER_PRESETS = [
  { label: 'Galopin', ml: 125 },
  { label: 'Demi', ml: 250 },
  { label: 'Bouteille', ml: 330 },
  { label: 'Pinte', ml: 500 },
  { label: 'Maxi', ml: 1000 },
];

export const SHOT_SIZES = [
  { label: 'Small', ml: 30 },
  { label: 'Standard', ml: 40 },
  { label: 'Large', ml: 50 },
];

// Complex SVG paths for Glass Shapes (ViewBox 0 0 100 100)
export const GLASS_SHAPES = [
  // Beers / General
  { id: 'pint', name: 'Pint Glass', capacity: 568, path: 'M 20,4 L 25,90 Q 25,96 50,96 Q 75,96 75,90 L 80,4' },
  
  // Wines
  { id: 'wine_std', name: 'Standard Wine', capacity: 450, path: 'M 30,4 L 30,20 C 10,40 10,70 30,85 L 30,96 L 70,96 L 70,85 C 90,70 90,40 70,20 L 70,4' },
  { id: 'wine_balloon', name: 'Balloon', capacity: 600, path: 'M 35,4 L 35,15 C 5,40 5,80 35,90 L 35,96 L 65,96 L 65,90 C 95,80 95,40 65,15 L 65,4' },
  { id: 'flute', name: 'Flute', capacity: 200, path: 'M 38,4 L 40,85 L 35,96 L 65,96 L 60,85 L 62,4' },

  // Cocktails / Spirits
  { id: 'tumbler', name: 'Tumbler', capacity: 300, path: 'M 15,4 L 20,90 Q 20,96 50,96 Q 80,96 80,90 L 85,4' },
  { id: 'highball', name: 'Highball', capacity: 350, path: 'M 20,4 L 20,96 L 80,96 L 80,4' },
  { id: 'rocks', name: 'Rocks', capacity: 250, path: 'M 15,4 L 25,92 L 75,92 L 85,4' },
  { id: 'martini', name: 'Martini', capacity: 200, path: 'M 5,4 L 50,55 L 95,4 M 50,55 L 50,90 L 30,96 L 70,96' },
  { id: 'hurricane', name: 'Hurricane', capacity: 450, path: 'M 30,4 C 30,4 20,20 20,35 C 20,50 30,55 35,60 C 40,65 45,70 35,90 L 65,90 C 55,70 60,65 65,60 C 70,55 80,50 80,35 C 80,20 70,4 70,4' },
  
  // Shots
  { id: 'shot', name: 'Shot', capacity: 60, path: 'M 25,10 L 35,96 L 65,96 L 75,10' },
];