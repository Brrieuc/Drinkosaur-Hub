
import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Drink } from '../types';
import { 
  BEER_LIBRARY, SPIRIT_LIBRARY, GENERIC_BEERS, GENERIC_WINES,
  BEER_PRESETS, SHOT_SIZES, GLASS_SHAPES, MIXERS,
  DrinkReference, MixerReference
} from '../constants';
import { Search, ChevronLeft, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface AddDrinkProps {
  onAdd: (drink: Drink) => void;
  onClose: () => void;
  language?: 'en' | 'fr';
}

type DrinkType = 'beer' | 'wine' | 'cocktail' | 'shot';
type Step = 'type' | 'brand' | 'glass' | 'pour' | 'confirm';

// Helper for hex to rgba
const hexToRgba = (hex: string, alpha: number) => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  return `rgba(${r},${g},${b},${alpha})`;
};

export const AddDrink: React.FC<AddDrinkProps> = ({ onAdd, onClose, language = 'en' }) => {
  // -- State --
  const [step, setStep] = useState<Step>('type');
  const [drinkType, setDrinkType] = useState<DrinkType | null>(null);
  
  // Selection States
  const [selectedItem, setSelectedItem] = useState<DrinkReference | null>(null); // The Alcohol
  const [selectedMixer, setSelectedMixer] = useState<MixerReference | null>(null); // The Mixer
  const [selectedGlassId, setSelectedGlassId] = useState<string>('');
  
  // Volume States
  const [alcoholVolume, setAlcoholVolume] = useState<number>(0);
  const [mixerVolume, setMixerVolume] = useState<number>(0);

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Translations
  const t = {
    chooseType: language === 'fr' ? 'Type de Boisson' : 'Choose Type',
    selectWine: language === 'fr' ? 'Choisir le Vin' : 'Select Wine',
    selectBrand: language === 'fr' ? 'Choisir la Marque' : 'Select Brand',
    selectGlass: language === 'fr' ? 'Choisir le Verre' : 'Select Glass',
    adjustDose: language === 'fr' ? 'Ajuster la Dose' : 'Adjust Dose',
    beer: language === 'fr' ? 'Bière' : 'Beer',
    wine: language === 'fr' ? 'Vin' : 'Wine',
    mix: language === 'fr' ? 'Cocktail' : 'Mix',
    shot: language === 'fr' ? 'Shot' : 'Shot',
    commonTypes: language === 'fr' ? 'Types Communs' : 'Common Types',
    library: language === 'fr' ? 'Bibliothèque' : 'Library',
    search: language === 'fr' ? 'Rechercher...' : 'Search...',
    custom: language === 'fr' ? 'Autre' : 'Custom',
    alcohol: language === 'fr' ? 'Alcool' : 'Alcohol',
    mixer: language === 'fr' ? 'Diluant' : 'Mixer',
    dragMixer: language === 'fr' ? 'Glisser pour diluer' : 'Drag to add mixer',
    dragAdjust: language === 'fr' ? 'Glisser pour ajuster' : 'Drag liquid to adjust',
    addMixer: language === 'fr' ? 'Ajouter Diluant ?' : 'Add Mixer?',
    skipNeat: language === 'fr' ? 'Pur / Passer' : 'Skip / Neat',
    logDrink: language === 'fr' ? 'Ajouter' : 'Log Drink',
  };

  // -- Helpers --
  const currentGlass = useMemo(() => GLASS_SHAPES.find(g => g.id === selectedGlassId) || GLASS_SHAPES[0], [selectedGlassId]);
  
  const filteredLibrary = useMemo(() => {
    let lib: DrinkReference[] = [];
    if (drinkType === 'beer') lib = BEER_LIBRARY;
    else if (drinkType === 'wine') return []; // Generic wines handling handled differently
    else lib = SPIRIT_LIBRARY;
    
    if (!searchTerm) return lib;
    return lib.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [drinkType, searchTerm]);

  // -- Handlers --

  const handleTypeSelect = (type: DrinkType) => {
    setDrinkType(type);
    if (type === 'wine') {
        setStep('brand'); // Go to generic wine selection
    } else {
        setStep('brand');
    }
  };

  const handleBrandSelect = (item: DrinkReference) => {
    setSelectedItem(item);
    setSearchTerm('');
    
    if (drinkType === 'beer') {
      setStep('pour'); // Beer goes straight to presets
    } else if (drinkType === 'shot') {
        setStep('pour'); // Shot goes to presets
    } else {
      setStep('glass'); // Wine & Cocktail go to glass select
    }
  };

  const handleGlassSelect = (id: string) => {
    setSelectedGlassId(id);
    setStep('pour');
    // Default start volumes
    if (drinkType === 'wine') setAlcoholVolume(125); // Std glass
    if (drinkType === 'cocktail') setAlcoholVolume(50); // Std shot
  };

  const finalizeDrink = (volumeOverride?: number) => {
    if (!selectedItem) return;

    // Use localized name for generics if available
    let finalName = (language === 'fr' && selectedItem.name_fr) ? selectedItem.name_fr : selectedItem.name;
    
    // Fix: Use override if provided (presets), otherwise use state (sliders/inputs)
    let finalVol = volumeOverride !== undefined ? volumeOverride : alcoholVolume;
    
    // Safety check
    if (finalVol <= 0) return;

    let finalAbv = selectedItem.abv;
    let icon = '🍺';

    if (drinkType === 'wine') {
        icon = '🍷';
        // finalVol is correct
    } else if (drinkType === 'cocktail') {
        icon = '🍹';
        finalName = selectedMixer ? `${finalName} & ${selectedMixer.name}` : finalName;
        // Calculate diluted ABV for display if needed, but BAC calc uses pure alcohol.
        // We will store the TOTAL volume and the EFFECTIVE ABV.
        const totalVol = finalVol + mixerVolume;
        const pureAlcohol = finalVol * (selectedItem.abv / 100);
        finalAbv = totalVol > 0 ? (pureAlcohol / totalVol) * 100 : selectedItem.abv;
        finalVol = totalVol;
    } else if (drinkType === 'shot') {
        icon = '🥃';
        // finalVol is correct
    }

    onAdd({
      id: uuidv4(),
      name: finalName,
      volumeMl: Math.round(finalVol),
      abv: parseFloat(finalAbv.toFixed(1)),
      timestamp: Date.now(),
      icon
    });
    onClose();
  };

  // -- Render Components --

  const GlassView = ({ 
    glassId, 
    fillPercent1, 
    color1, 
    fillPercent2 = 0, 
    color2 = 'transparent',
    interactive = false,
    isCarbonated1 = false,
    isCarbonated2 = false,
    onInteract = () => {}
  }: { 
    glassId: string, 
    fillPercent1: number, 
    color1: string, 
    fillPercent2?: number, 
    color2?: string,
    interactive?: boolean,
    isCarbonated1?: boolean,
    isCarbonated2?: boolean,
    onInteract?: (p: number) => void
  }) => {
    const glass = GLASS_SHAPES.find(g => g.id === glassId) || GLASS_SHAPES[0];
    const containerRef = useRef<HTMLDivElement>(null);

    // --- PHYSICS ENGINE ---
    
    // Map Volume Percentage (0-1) to Height Percentage (0-1) based on shape
    const getPhysicallyAccurateHeight = useCallback((volPercent: number) => {
        // VISIBILITY FIX: If volume > 0, enforce a minimum visual height (e.g. 2%)
        // This ensures 5ml is visible in a 500ml glass.
        const MIN_VISUAL_PERCENT = 2.5;
        
        // Clamp basic 0-1
        const p = Math.max(0, Math.min(1, volPercent / 100));
        
        let result = 0;

        if (volPercent > 0 && volPercent < 0.5) {
            // Very small amounts just get the floor
             return MIN_VISUAL_PERCENT;
        }

        switch (glass.fillType) {
            case 'cone': // Martini
                result = Math.pow(p, 1/3) * 100;
                break;
            case 'bowl': // Wine
                if (p < 0.5) {
                    result = Math.pow(p, 0.7) * 100; 
                } else {
                    result = p * 100;
                }
                break;
            case 'cylinder':
            default:
                result = volPercent;
        }
        
        // Apply minimum floor if volume exists
        return volPercent > 0 ? Math.max(result, MIN_VISUAL_PERCENT) : 0;

    }, [glass.fillType]);

    // Reverse Map: Height Percentage to Volume Percentage (For dragging)
    const getVolumeFromHeight = useCallback((hPercent: number) => {
        const h = Math.max(0, Math.min(1, hPercent / 100));
        
        switch (glass.fillType) {
            case 'cone':
                return Math.pow(h, 3) * 100;
            case 'bowl':
                 if (h < 0.5) {
                    return Math.pow(h, 1/0.7) * 100;
                 } else {
                     return h * 100;
                 }
            case 'cylinder':
            default:
                return hPercent;
        }
    }, [glass.fillType]);


    // Geometry Helpers
    const liqBot = glass.liquidBottom || 95;
    const liqTop = glass.liquidTop || 5;
    const totalLiqHeight = liqBot - liqTop;

    // Calculate Visual Heights based on Physics
    const visualH1 = (getPhysicallyAccurateHeight(fillPercent1) / 100) * totalLiqHeight;
    const visualTotal = (getPhysicallyAccurateHeight(fillPercent1 + fillPercent2) / 100) * totalLiqHeight;
    const visualH2 = Math.max(0, visualTotal - visualH1); // Ensure no negative height overlap logic issues
    
    // Y Coordinates (Top of the liquid chunk)
    const y1 = liqBot - visualH1;
    const y2 = y1 - visualH2;

    const handleTouch = (e: any) => {
        if (!interactive || !containerRef.current) return;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const rect = containerRef.current.getBoundingClientRect();
        
        // RelY in Pixels from top of SVG
        const relY = clientY - rect.top;
        const svgY = (relY / rect.height) * 100;

        // Map SVG Y to Height Percentage (0 at bot, 100 at top)
        let rawH = 0;
        if (svgY >= liqBot) rawH = 0;
        else if (svgY <= liqTop) rawH = 100;
        else {
            rawH = ((liqBot - svgY) / totalLiqHeight) * 100;
        }

        const volP = getVolumeFromHeight(rawH);
        onInteract(volP);
    };

    // Micro Bubbles Generator
    const renderMicroBubbles = () => (
        Array.from({ length: 15 }).map((_, i) => {
            const size = Math.random() > 0.7 ? 2 : 1; // 1px or 2px
            const left = Math.random() * 100;
            const delay = Math.random() * 5;
            const duration = 2 + Math.random() * 3;
            
            return (
                <div 
                    key={i}
                    className="absolute bottom-0 bg-white/40 rounded-full animate-[float_linear_infinite]"
                    style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        left: `${left}%`,
                        animationDuration: `${duration}s`,
                        animationDelay: `${delay}s`,
                        opacity: 0.3 + Math.random() * 0.4
                    }}
                />
            );
        })
    );

    return (
        <div 
          ref={containerRef}
          className="relative w-48 h-72 mx-auto cursor-pointer touch-none"
          onTouchMove={handleTouch}
          onMouseMove={(e) => e.buttons === 1 && handleTouch(e)}
          onClick={handleTouch}
        >
            <svg 
                viewBox="0 0 100 100" 
                className="w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                preserveAspectRatio="xMidYMid meet"
                style={{ overflow: 'visible' }}
            >
                <defs>
                    <clipPath id={`clip-${glassId}`}>
                        <path d={glass.mask} />
                    </clipPath>

                    {/* Gloss Gradient for Glass Surface */}
                    <linearGradient id="glassGloss" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                        <stop offset="30%" stopColor="rgba(255,255,255,0.1)" />
                        <stop offset="50%" stopColor="rgba(255,255,255,0)" />
                        <stop offset="70%" stopColor="rgba(255,255,255,0.1)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
                    </linearGradient>
                </defs>

                {/* 1. Back of Glass */}
                <path 
                    d={glass.path} 
                    fill="rgba(255,255,255,0.02)" 
                    stroke="rgba(255,255,255,0.05)" 
                    strokeWidth="0.5" 
                />

                {/* 2. THE LIQUID */}
                <foreignObject x="0" y="0" width="100" height="100" clipPath={`url(#clip-${glassId})`}>
                    <div className="w-full h-full relative">
                        
                        {/* Liquid 1 (Main Alcohol) */}
                        <div 
                            className="absolute bottom-0 w-full transition-all duration-300 ease-out"
                            style={{ 
                                height: `${(visualH1 / 100) * 100}%`,
                                bottom: `${((100 - liqBot) / 100) * 100}%`
                            }}
                        >   
                             <div className="absolute inset-0 w-full h-full overflow-hidden">
                                 {/* Body */}
                                 <div className="w-full h-full opacity-90" style={{ backgroundColor: color1, boxShadow: `inset 0 0 20px ${hexToRgba(color1, 0.5)}` }}></div>
                                 
                                 {/* Surface Foam / Wave - Only if carbonated */}
                                 {fillPercent1 > 0 && isCarbonated1 && (
                                     <>
                                        <div className="absolute -top-1 left-0 w-[200%] h-3 bg-white/40 rounded-[100%] animate-[liquid-wave_3s_linear_infinite]" />
                                        <div className="absolute -top-1 left-[-10%] w-[200%] h-3 bg-white/30 rounded-[100%] animate-[liquid-wave_5s_linear_infinite_reverse]" />
                                     </>
                                 )}
                                 
                                 {/* Surface Line (Flat) - If not carbonated */}
                                 {fillPercent1 > 0 && !isCarbonated1 && (
                                     <div className="absolute top-0 w-full h-[1px] bg-white/40 shadow-[0_0_5px_rgba(255,255,255,0.5)]"></div>
                                 )}

                                 {/* Micro Bubbles - Only if carbonated */}
                                 {isCarbonated1 && renderMicroBubbles()}
                             </div>
                        </div>

                        {/* Liquid 2 (Mixer) */}
                        {fillPercent2 > 0 && (
                            <div 
                                className="absolute bottom-0 w-full transition-all duration-300 ease-out"
                                style={{ 
                                    height: `${(visualH2 / 100) * 100}%`,
                                    bottom: `${((100 - y1) / 100) * 100}%`
                                }}
                            >
                                <div className="absolute inset-0 w-full h-full overflow-hidden">
                                     <div className="w-full h-full opacity-90" style={{ backgroundColor: color2 }}></div>
                                     
                                     {/* Mixer Foam - Only if carbonated */}
                                     {isCarbonated2 && (
                                         <div className="absolute -top-1 left-0 w-[200%] h-3 bg-white/40 rounded-[100%] animate-[liquid-wave_4s_linear_infinite]" />
                                     )}
                                     
                                     {/* Mixer Flat Line */}
                                     {!isCarbonated2 && (
                                         <div className="absolute top-0 w-full h-[1px] bg-white/40 shadow-[0_0_5px_rgba(255,255,255,0.5)]"></div>
                                     )}

                                     {/* Mixer Bubbles */}
                                     {isCarbonated2 && renderMicroBubbles()}
                                </div>
                            </div>
                        )}
                        
                        {/* Overall Sheen overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                    </div>
                </foreignObject>

                {/* 3. Glass Front (Gloss & Reflection) */}
                <path 
                    d={glass.path} 
                    fill="url(#glassGloss)" 
                    stroke="rgba(255,255,255,0.3)" 
                    strokeWidth="0.8" 
                    className="pointer-events-none"
                    style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.1))' }}
                />
                
                {/* Specular Highlight */}
                <ellipse cx="50" cy={liqTop} rx="20" ry="2" fill="rgba(255,255,255,0.2)" filter="blur(2px)" />
            </svg>
        </div>
    );
  };

  // --- WIZARD STEPS ---

  return (
    <div className="flex flex-col h-full bg-[#050508] text-white animate-fade-in overflow-hidden relative">
      
      {/* Top Nav */}
      <div className="flex items-center justify-between px-6 py-4 z-50 flex-shrink-0">
        {step !== 'type' ? (
            <button onClick={() => setStep('type')} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white/70">
                <ChevronLeft />
            </button>
        ) : <div className="w-10" />}
        
        <h2 className="text-lg font-bold uppercase tracking-widest text-white/80">
            {step === 'type' && t.chooseType}
            {step === 'brand' && (drinkType === 'wine' ? t.selectWine : t.selectBrand)}
            {step === 'glass' && t.selectGlass}
            {step === 'pour' && t.adjustDose}
        </h2>
        
        <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-white/10 text-white/70">
            <X />
        </button>
      </div>

      {/* --- STEP 1: TYPE SELECTION --- */}
      {step === 'type' && (
        <div className="flex-1 p-6 grid grid-cols-2 gap-4 animate-slide-up pb-32 overflow-y-auto min-h-0 no-scrollbar">
            <button onClick={() => handleTypeSelect('beer')} className="group relative rounded-[32px] overflow-hidden bg-gradient-to-br from-amber-500/20 to-orange-900/20 border border-amber-500/30 flex flex-col items-center justify-center gap-4 hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                <div className="text-6xl drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transform group-hover:-rotate-12 transition-transform">🍺</div>
                <span className="text-xl font-bold text-amber-100">{t.beer}</span>
            </button>
            <button onClick={() => handleTypeSelect('wine')} className="group relative rounded-[32px] overflow-hidden bg-gradient-to-br from-rose-500/20 to-pink-900/20 border border-rose-500/30 flex flex-col items-center justify-center gap-4 hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(244,63,94,0.1)]">
                <div className="text-6xl drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transform group-hover:rotate-12 transition-transform">🍷</div>
                <span className="text-xl font-bold text-rose-100">{t.wine}</span>
            </button>
            <button onClick={() => handleTypeSelect('cocktail')} className="group relative rounded-[32px] overflow-hidden bg-gradient-to-br from-blue-500/20 to-indigo-900/20 border border-blue-500/30 flex flex-col items-center justify-center gap-4 hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                <div className="text-6xl drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transform group-hover:-rotate-12 transition-transform">🍸</div>
                <span className="text-xl font-bold text-blue-100">{t.mix}</span>
            </button>
            <button onClick={() => handleTypeSelect('shot')} className="group relative rounded-[32px] overflow-hidden bg-gradient-to-br from-emerald-500/20 to-green-900/20 border border-emerald-500/30 flex flex-col items-center justify-center gap-4 hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <div className="text-6xl drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transform group-hover:rotate-12 transition-transform">🥃</div>
                <span className="text-xl font-bold text-emerald-100">{t.shot}</span>
            </button>
        </div>
      )}

      {/* --- STEP 2: BRAND/REFERENCE SELECTION --- */}
      {step === 'brand' && (
        <div className="flex-1 flex flex-col p-6 animate-slide-up min-h-0">
            {drinkType === 'wine' ? (
                // WINE SELECTION
                <div className="grid grid-cols-1 gap-4 overflow-y-auto no-scrollbar pb-32 min-h-0">
                    {GENERIC_WINES.map((wine, i) => (
                        <button 
                            key={i} 
                            onClick={() => handleBrandSelect({ ...wine, type: 'wine' } as any)}
                            className="p-6 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors flex-shrink-0"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full shadow-[0_0_15px_currentColor]" style={{ color: wine.color, backgroundColor: wine.color }} />
                                <span className="text-xl font-bold">{(language === 'fr' && wine.name_fr) ? wine.name_fr : wine.name}</span>
                            </div>
                            <span className="text-white/40 font-mono">{wine.abv}%</span>
                        </button>
                    ))}
                </div>
            ) : (
                // GENERIC SEARCH (Beer/Spirit/Shot)
                <>
                    <div className="relative mb-6 flex-shrink-0">
                        <Search className="absolute left-4 top-4 text-white/30" size={20} />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t.search}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:bg-white/10 transition-all text-lg"
                            autoFocus
                        />
                    </div>
                    
                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-32 min-h-0">
                        {/* Pre-Generic for Beers */}
                        {drinkType === 'beer' && !searchTerm && (
                            <div className="mb-6 flex-shrink-0">
                                <div className="text-xs font-bold text-white/30 mb-2 uppercase tracking-wider">{t.commonTypes}</div>
                                {GENERIC_BEERS.map((b, i) => (
                                    <button key={i} onClick={() => handleBrandSelect({ ...b, type: 'beer' } as any)} className="w-full p-4 rounded-xl bg-white/5 border border-white/5 mb-2 text-left hover:bg-white/10 flex justify-between">
                                        <span>{(language === 'fr' && b.name_fr) ? b.name_fr : b.name}</span>
                                        <span className="text-white/40">{b.abv}%</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="text-xs font-bold text-white/30 mb-2 uppercase tracking-wider flex-shrink-0">{t.library}</div>
                        {filteredLibrary.map((item, i) => (
                            <button 
                                key={i} 
                                onClick={() => handleBrandSelect(item)}
                                className="w-full p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center hover:bg-white/10 group transition-all"
                            >
                                <span className="font-bold text-lg group-hover:pl-2 transition-all">{(language === 'fr' && item.name_fr) ? item.name_fr : item.name}</span>
                                <span className="text-sm bg-black/30 px-2 py-1 rounded-lg text-white/50">{item.abv}%</span>
                            </button>
                        ))}
                         {/* Empty state spacer for scrolling */}
                        <div className="h-10"></div>
                    </div>
                </>
            )}
        </div>
      )}

      {/* --- STEP 3: GLASS SELECTION (Wine/Cocktail) --- */}
      {step === 'glass' && (
        <div className="flex-1 flex flex-col animate-slide-up min-h-0">
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-4 content-start pb-32 no-scrollbar min-h-0">
                {GLASS_SHAPES.filter(g => drinkType === 'wine' ? g.id.startsWith('wine') || g.id === 'flute' : g.id !== 'shot').map((glass) => (
                    <button 
                        key={glass.id}
                        onClick={() => handleGlassSelect(glass.id)}
                        className="aspect-square rounded-[24px] bg-white/5 border border-white/10 hover:bg-white/10 flex flex-col items-center justify-center p-4 gap-2 transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                    >
                        <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-80" style={{ overflow: 'visible' }}>
                            <path d={glass.path} fill="none" stroke="white" strokeWidth="2" />
                        </svg>
                        <span className="text-sm font-medium text-white/70">{(language === 'fr' && (glass as any).name_fr) ? (glass as any).name_fr : glass.name}</span>
                    </button>
                ))}
            </div>
        </div>
      )}

      {/* --- STEP 4: POUR / VOLUME --- */}
      {step === 'pour' && selectedItem && (
        <div className="flex-1 flex flex-col p-6 animate-slide-up relative overflow-y-auto no-scrollbar pb-32 min-h-0">
            
            {/* Context Header */}
            <div className="text-center mb-6 flex-shrink-0">
                <div className="text-2xl font-bold">{(language === 'fr' && selectedItem.name_fr) ? selectedItem.name_fr : selectedItem.name}</div>
                <div className="text-white/40">{selectedItem.abv}% ABV</div>
            </div>

            {/* SCENARIO A: BEER & SHOTS (Presets) */}
            {(drinkType === 'beer' || drinkType === 'shot') && (
                <div className="flex-1 flex flex-col justify-center gap-4">
                    {(drinkType === 'beer' ? BEER_PRESETS : SHOT_SIZES).map((p) => (
                        <button 
                            key={p.ml}
                            onClick={() => { 
                                setAlcoholVolume(p.ml); 
                                finalizeDrink(p.ml); 
                            }}
                            className={`p-6 rounded-[24px] border border-white/10 flex items-center justify-between hover:scale-105 transition-all ${
                                drinkType === 'beer' ? 'bg-amber-500/10 hover:bg-amber-500/20' : 'bg-emerald-500/10 hover:bg-emerald-500/20'
                            }`}
                        >
                            <span className="text-xl font-bold text-white">
                                {language === 'fr' 
                                    ? ((p as any).label_fr || p.label) 
                                    : ((p as any).label_en || p.label)}
                            </span>
                            <span className="text-2xl font-mono text-white/60">{p.ml}<span className="text-sm ml-1">ml</span></span>
                        </button>
                    ))}
                    {/* Custom Input */}
                     <div className="p-6 rounded-[24px] border border-white/10 bg-white/5 flex items-center justify-between">
                        <span className="text-xl font-bold text-white">{t.custom}</span>
                        <input 
                            type="number" 
                            className="bg-transparent text-right text-2xl font-mono text-white focus:outline-none w-24 border-b border-white/20 focus:border-white"
                            placeholder="0"
                            onChange={(e) => setAlcoholVolume(Number(e.target.value))}
                            onBlur={() => alcoholVolume > 0 && finalizeDrink()}
                        />
                    </div>
                </div>
            )}

            {/* SCENARIO B: WINE & COCKTAILS (Interactive) */}
            {(drinkType === 'wine' || drinkType === 'cocktail') && (
                <div className="flex-1 flex flex-col min-h-[400px]">
                    
                    {/* The 3D Glass */}
                    <div className="flex-1 relative flex items-center justify-center my-4 min-h-[300px]">
                        <div className="absolute top-0 right-0 text-right z-10">
                             <div className="text-4xl font-bold font-mono">{Math.round(alcoholVolume)}<span className="text-sm text-white/50">ml</span></div>
                             <div className="text-xs uppercase tracking-widest text-white/40">{t.alcohol}</div>
                        </div>

                        {drinkType === 'cocktail' && mixerVolume > 0 && (
                             <div className="absolute top-16 right-0 text-right text-blue-300 z-10">
                                <div className="text-2xl font-bold font-mono">+{Math.round(mixerVolume)}<span className="text-sm text-white/50">ml</span></div>
                                <div className="text-xs uppercase tracking-widest text-white/40">{selectedMixer?.name || t.mixer}</div>
                           </div>
                        )}

                        <GlassView 
                            glassId={selectedGlassId}
                            color1={selectedItem.color}
                            fillPercent1={(alcoholVolume / currentGlass.capacity) * 100}
                            color2={selectedMixer?.color}
                            fillPercent2={(mixerVolume / currentGlass.capacity) * 100}
                            interactive={true}
                            isCarbonated1={selectedItem.carbonated}
                            isCarbonated2={selectedMixer?.carbonated}
                            onInteract={(percent) => {
                                const vol = Math.round((percent / 100) * currentGlass.capacity);
                                if (!selectedMixer) {
                                    setAlcoholVolume(vol);
                                } else {
                                    // If mixer selected, we are adjusting mixer volume (on top of alcohol)
                                    // Total height = percent. Alcohol is fixed.
                                    // Mixer percent = Total Percent - Alcohol Percent
                                    const alcoholPercent = (alcoholVolume / currentGlass.capacity) * 100;
                                    const mixerP = Math.max(0, percent - alcoholPercent);
                                    setMixerVolume(Math.round((mixerP / 100) * currentGlass.capacity));
                                }
                            }}
                        />

                        {/* Drag Hint */}
                        <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/30 animate-pulse pointer-events-none">
                            {selectedMixer ? t.dragMixer : t.dragAdjust}
                        </div>
                    </div>

                    {/* Mixer Selection (For Cocktails) */}
                    {drinkType === 'cocktail' && !selectedMixer && (
                         <div className="flex-shrink-0 h-32 mt-4 overflow-y-auto bg-black/20 rounded-2xl p-2 grid grid-cols-2 gap-2">
                             <div className="col-span-2 text-xs font-bold text-white/30 uppercase text-center mb-1">{t.addMixer}</div>
                             {MIXERS.map(m => (
                                 <button key={m.name} onClick={() => setSelectedMixer(m)} className="p-2 rounded-lg bg-white/5 text-sm hover:bg-white/10 text-left flex items-center gap-2">
                                     <div className="w-3 h-3 rounded-full" style={{backgroundColor: m.color}}/> {m.name}
                                 </button>
                             ))}
                             <button onClick={() => finalizeDrink()} className="col-span-2 p-3 bg-blue-600 rounded-xl font-bold mt-2">{t.skipNeat}</button>
                         </div>
                    )}

                    {/* Finalize Button */}
                    {(drinkType === 'wine' || selectedMixer) && (
                        <button 
                            onClick={() => finalizeDrink()}
                            className="w-full py-4 mt-6 rounded-[24px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xl shadow-[0_0_30px_rgba(37,99,235,0.3)] active:scale-95 transition-transform flex-shrink-0"
                        >
                            {t.logDrink}
                        </button>
                    )}
                </div>
            )}
        </div>
      )}

    </div>
  );
};
