
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Drink } from '../types';
import { 
  BEER_LIBRARY, SPIRIT_LIBRARY, GENERIC_BEERS, GENERIC_WINES,
  BEER_PRESETS, SHOT_SIZES, GLASS_SHAPES, MIXERS,
  DrinkReference, MixerReference
} from '../constants';
import { Search, ChevronLeft, Check, Beer, Wine, Martini, Info, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface AddDrinkProps {
  onAdd: (drink: Drink) => void;
  onClose: () => void;
}

type DrinkType = 'beer' | 'wine' | 'cocktail' | 'shot';
type Step = 'type' | 'brand' | 'glass' | 'pour' | 'confirm';

export const AddDrink: React.FC<AddDrinkProps> = ({ onAdd, onClose }) => {
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

    let finalName = selectedItem.name;
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
        finalName = selectedMixer ? `${selectedItem.name} & ${selectedMixer.name}` : selectedItem.name;
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
    onInteract = (p: number) => {}
  }: { 
    glassId: string, 
    fillPercent1: number, 
    color1: string, 
    fillPercent2?: number, 
    color2?: string,
    interactive?: boolean,
    onInteract?: (p: number) => void
  }) => {
    const glass = GLASS_SHAPES.find(g => g.id === glassId) || GLASS_SHAPES[0];
    const glassRef = useRef<HTMLDivElement>(null);

    const handleTouch = (e: any) => {
        if (!interactive || !glassRef.current) return;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const rect = glassRef.current.getBoundingClientRect();
        const height = rect.height;
        const relY = clientY - rect.top;
        const rawP = ((height - relY) / height) * 100;
        onInteract(Math.max(0, Math.min(100, rawP)));
    };

    return (
        <div 
          className="relative w-40 h-64 mx-auto"
          ref={glassRef}
          onTouchMove={handleTouch}
          onMouseMove={(e) => e.buttons === 1 && handleTouch(e)}
          onClick={handleTouch}
        >
            {/* SVG Mask Container */}
            <div className="absolute inset-0 z-10 pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                 <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="glassGloss" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                            <stop offset="20%" stopColor="rgba(255,255,255,0.1)" />
                            <stop offset="50%" stopColor="rgba(255,255,255,0)" />
                            <stop offset="80%" stopColor="rgba(255,255,255,0.1)" />
                            <stop offset="100%" stopColor="rgba(255,255,255,0.4)" />
                        </linearGradient>
                         <clipPath id={`clip-${glassId}`}>
                            <path d={glass.path} />
                        </clipPath>
                    </defs>
                    
                    {/* Glass Outline/Gloss */}
                    <path d={glass.path} fill="url(#glassGloss)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
                 </svg>
            </div>

            {/* Liquid Layer 1 (Bottom) */}
            <div className="absolute inset-0 z-0" style={{ clipPath: `path('${glass.path}')` }}>
                 <div 
                    className="absolute bottom-0 w-full transition-all duration-75 ease-linear"
                    style={{ 
                        height: `${fillPercent1}%`,
                        backgroundColor: color1,
                        boxShadow: `0 0 20px ${color1}`
                    }}
                 >
                    {/* Bubbles / Texture */}
                    <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')]"></div>
                 </div>
                 
                 {/* Liquid Layer 2 (Mixer - Top) */}
                 <div 
                    className="absolute bottom-0 w-full transition-all duration-75 ease-linear"
                    style={{ 
                        height: `${fillPercent1 + fillPercent2}%`,
                    }}
                 >
                     <div 
                        className="absolute top-0 w-full"
                        style={{
                            height: `${(fillPercent2 / (fillPercent1 + fillPercent2 || 1)) * 100}%`,
                            backgroundColor: color2,
                            opacity: 0.9
                        }}
                     />
                 </div>
                 
                 {/* Surface Line */}
                 <div 
                    className="absolute w-full h-[1px] bg-white/50" 
                    style={{ bottom: `${fillPercent1 + fillPercent2}%` }} 
                 />
            </div>
        </div>
    );
  };

  // --- WIZARD STEPS ---

  return (
    <div className="flex flex-col h-full bg-[#050508] text-white animate-fade-in overflow-hidden relative">
      
      {/* Top Nav */}
      <div className="flex items-center justify-between px-6 py-4 z-50">
        {step !== 'type' ? (
            <button onClick={() => setStep('type')} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white/70">
                <ChevronLeft />
            </button>
        ) : <div className="w-10" />}
        
        <h2 className="text-lg font-bold uppercase tracking-widest text-white/80">
            {step === 'type' && 'Choose Type'}
            {step === 'brand' && (drinkType === 'wine' ? 'Select Wine' : 'Select Brand')}
            {step === 'glass' && 'Select Glass'}
            {step === 'pour' && 'Adjust Dose'}
        </h2>
        
        <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-white/10 text-white/70">
            <X />
        </button>
      </div>

      {/* --- STEP 1: TYPE SELECTION --- */}
      {step === 'type' && (
        <div className="flex-1 p-6 grid grid-cols-2 gap-4 animate-slide-up pb-32 overflow-y-auto no-scrollbar">
            <button onClick={() => handleTypeSelect('beer')} className="group relative rounded-[32px] overflow-hidden bg-gradient-to-br from-amber-500/20 to-orange-900/20 border border-amber-500/30 flex flex-col items-center justify-center gap-4 hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                <div className="text-6xl drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transform group-hover:-rotate-12 transition-transform">🍺</div>
                <span className="text-xl font-bold text-amber-100">Beer</span>
            </button>
            <button onClick={() => handleTypeSelect('wine')} className="group relative rounded-[32px] overflow-hidden bg-gradient-to-br from-rose-500/20 to-pink-900/20 border border-rose-500/30 flex flex-col items-center justify-center gap-4 hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(244,63,94,0.1)]">
                <div className="text-6xl drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transform group-hover:rotate-12 transition-transform">🍷</div>
                <span className="text-xl font-bold text-rose-100">Wine</span>
            </button>
            <button onClick={() => handleTypeSelect('cocktail')} className="group relative rounded-[32px] overflow-hidden bg-gradient-to-br from-blue-500/20 to-indigo-900/20 border border-blue-500/30 flex flex-col items-center justify-center gap-4 hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                <div className="text-6xl drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transform group-hover:-rotate-12 transition-transform">🍸</div>
                <span className="text-xl font-bold text-blue-100">Mix</span>
            </button>
            <button onClick={() => handleTypeSelect('shot')} className="group relative rounded-[32px] overflow-hidden bg-gradient-to-br from-emerald-500/20 to-green-900/20 border border-emerald-500/30 flex flex-col items-center justify-center gap-4 hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <div className="text-6xl drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transform group-hover:rotate-12 transition-transform">🥃</div>
                <span className="text-xl font-bold text-emerald-100">Shot</span>
            </button>
        </div>
      )}

      {/* --- STEP 2: BRAND/REFERENCE SELECTION --- */}
      {step === 'brand' && (
        <div className="flex-1 flex flex-col p-6 animate-slide-up">
            {drinkType === 'wine' ? (
                // WINE SELECTION
                <div className="grid grid-cols-1 gap-4 overflow-y-auto no-scrollbar pb-32">
                    {GENERIC_WINES.map((wine, i) => (
                        <button 
                            key={i} 
                            onClick={() => handleBrandSelect({ ...wine, type: 'wine' } as any)}
                            className="p-6 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full shadow-[0_0_15px_currentColor]" style={{ color: wine.color, backgroundColor: wine.color }} />
                                <span className="text-xl font-bold">{wine.name}</span>
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
                            placeholder={`Search ${drinkType}...`}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:bg-white/10 transition-all text-lg"
                            autoFocus
                        />
                    </div>
                    
                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-32">
                        {/* Pre-Generic for Beers */}
                        {drinkType === 'beer' && !searchTerm && (
                            <div className="mb-6">
                                <div className="text-xs font-bold text-white/30 mb-2 uppercase tracking-wider">Common Types</div>
                                {GENERIC_BEERS.map((b, i) => (
                                    <button key={i} onClick={() => handleBrandSelect({ ...b, type: 'beer' } as any)} className="w-full p-4 rounded-xl bg-white/5 border border-white/5 mb-2 text-left hover:bg-white/10 flex justify-between">
                                        <span>{b.name}</span>
                                        <span className="text-white/40">{b.abv}%</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="text-xs font-bold text-white/30 mb-2 uppercase tracking-wider">Library</div>
                        {filteredLibrary.map((item, i) => (
                            <button 
                                key={i} 
                                onClick={() => handleBrandSelect(item)}
                                className="w-full p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center hover:bg-white/10 group transition-all"
                            >
                                <span className="font-bold text-lg group-hover:pl-2 transition-all">{item.name}</span>
                                <span className="text-sm bg-black/30 px-2 py-1 rounded-lg text-white/50">{item.abv}%</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
      )}

      {/* --- STEP 3: GLASS SELECTION (Wine/Cocktail) --- */}
      {step === 'glass' && (
        <div className="flex-1 flex flex-col animate-slide-up">
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-4 content-start pb-32 no-scrollbar">
                {GLASS_SHAPES.filter(g => drinkType === 'wine' ? g.id.startsWith('wine') || g.id === 'flute' : g.id !== 'shot').map((glass) => (
                    <button 
                        key={glass.id}
                        onClick={() => handleGlassSelect(glass.id)}
                        className="aspect-square rounded-[24px] bg-white/5 border border-white/10 hover:bg-white/10 flex flex-col items-center justify-center p-4 gap-2 transition-all hover:scale-105 active:scale-95"
                    >
                        <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-80">
                            <path d={glass.path} fill="none" stroke="white" strokeWidth="2" />
                        </svg>
                        <span className="text-sm font-medium text-white/70">{glass.name}</span>
                    </button>
                ))}
            </div>
        </div>
      )}

      {/* --- STEP 4: POUR / VOLUME --- */}
      {step === 'pour' && selectedItem && (
        <div className="flex-1 flex flex-col p-6 animate-slide-up relative overflow-y-auto no-scrollbar pb-32">
            
            {/* Context Header */}
            <div className="text-center mb-6 flex-shrink-0">
                <div className="text-2xl font-bold">{selectedItem.name}</div>
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
                            <span className="text-xl font-bold text-white">{p.label}</span>
                            <span className="text-2xl font-mono text-white/60">{p.ml}<span className="text-sm ml-1">ml</span></span>
                        </button>
                    ))}
                    {/* Custom Input */}
                     <div className="p-6 rounded-[24px] border border-white/10 bg-white/5 flex items-center justify-between">
                        <span className="text-xl font-bold text-white">Custom</span>
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
                    <div className="flex-1 relative flex items-center justify-center my-4">
                        <div className="absolute top-0 right-0 text-right">
                             <div className="text-4xl font-bold font-mono">{Math.round(alcoholVolume)}<span className="text-sm text-white/50">ml</span></div>
                             <div className="text-xs uppercase tracking-widest text-white/40">Alcohol</div>
                        </div>

                        {drinkType === 'cocktail' && mixerVolume > 0 && (
                             <div className="absolute top-16 right-0 text-right text-blue-300">
                                <div className="text-2xl font-bold font-mono">+{Math.round(mixerVolume)}<span className="text-sm text-white/50">ml</span></div>
                                <div className="text-xs uppercase tracking-widest text-white/40">{selectedMixer?.name || 'Mixer'}</div>
                           </div>
                        )}

                        <GlassView 
                            glassId={selectedGlassId}
                            color1={selectedItem.color}
                            fillPercent1={(alcoholVolume / currentGlass.capacity) * 100}
                            color2={selectedMixer?.color}
                            fillPercent2={(mixerVolume / currentGlass.capacity) * 100}
                            interactive={true}
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
                        <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/30 animate-pulse">
                            {selectedMixer ? 'Drag to add mixer' : 'Drag liquid to adjust'}
                        </div>
                    </div>

                    {/* Mixer Selection (For Cocktails) */}
                    {drinkType === 'cocktail' && !selectedMixer && (
                         <div className="flex-shrink-0 h-32 mt-4 overflow-y-auto bg-black/20 rounded-2xl p-2 grid grid-cols-2 gap-2">
                             <div className="col-span-2 text-xs font-bold text-white/30 uppercase text-center mb-1">Add Mixer?</div>
                             {MIXERS.map(m => (
                                 <button key={m.name} onClick={() => setSelectedMixer(m)} className="p-2 rounded-lg bg-white/5 text-sm hover:bg-white/10 text-left flex items-center gap-2">
                                     <div className="w-3 h-3 rounded-full" style={{backgroundColor: m.color}}/> {m.name}
                                 </button>
                             ))}
                             <button onClick={() => finalizeDrink()} className="col-span-2 p-3 bg-blue-600 rounded-xl font-bold mt-2">Skip / Neat</button>
                         </div>
                    )}

                    {/* Finalize Button */}
                    {(drinkType === 'wine' || selectedMixer) && (
                        <button 
                            onClick={() => finalizeDrink()}
                            className="w-full py-4 mt-6 rounded-[24px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xl shadow-[0_0_30px_rgba(37,99,235,0.3)] active:scale-95 transition-transform flex-shrink-0"
                        >
                            Log Drink
                        </button>
                    )}
                </div>
            )}
        </div>
      )}

    </div>
  );
};
