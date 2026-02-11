import React, { useState } from 'react';
import { Drink } from '../types';
import { PRESET_DRINKS } from '../constants';
import { parseDrinkWithGemini } from '../services/geminiService';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface AddDrinkProps {
  onAdd: (drink: Drink) => void;
  onClose: () => void;
}

export const AddDrink: React.FC<AddDrinkProps> = ({ onAdd, onClose }) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'ai'>('presets');
  const [customName, setCustomName] = useState('');
  const [customVol, setCustomVol] = useState(330);
  const [customAbv, setCustomAbv] = useState(5.0);
  
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAddPreset = (preset: typeof PRESET_DRINKS[0]) => {
    onAdd({
      id: uuidv4(),
      timestamp: Date.now(),
      ...preset
    });
    onClose();
  };

  const handleAddCustom = () => {
    if (!customName) return;
    onAdd({
      id: uuidv4(),
      name: customName,
      volumeMl: Number(customVol),
      abv: Number(customAbv),
      timestamp: Date.now(),
      icon: '🥤'
    });
    onClose();
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiLoading(true);
    const result = await parseDrinkWithGemini(aiPrompt);
    setIsAiLoading(false);

    if (result) {
      onAdd({
        id: uuidv4(),
        timestamp: Date.now(),
        ...result
      });
      onClose();
    } else {
      alert("Could not understand drink. Try 'Pint of Lager' or 'Glass of Red Wine'");
    }
  };

  return (
    <div className="flex flex-col h-full p-6 animate-slide-up">
      <h2 className="text-2xl font-bold text-white mb-6">Log Drink</h2>

      {/* Tabs */}
      <div className="flex p-1 bg-white/10 rounded-2xl mb-8">
        {(['presets', 'custom', 'ai'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab 
                ? 'bg-white/20 text-white shadow-lg' 
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {tab === 'ai' ? <span className="flex items-center justify-center gap-1"><Sparkles size={14} /> AI Magic</span> : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {activeTab === 'presets' && (
          <div className="grid grid-cols-2 gap-4">
            {PRESET_DRINKS.map((drink, idx) => (
              <button
                key={idx}
                onClick={() => handleAddPreset(drink)}
                className="glass-panel p-5 rounded-3xl flex flex-col items-center gap-3 hover:bg-white/20 transition-all active:scale-95 group"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{drink.icon}</span>
                <div className="text-center">
                  <div className="text-white font-semibold">{drink.name}</div>
                  <div className="text-white/40 text-xs">{drink.volumeMl}ml • {drink.abv}%</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="space-y-5">
            <div>
              <label className="text-white/60 text-xs uppercase tracking-wider pl-2 mb-1 block">Name</label>
              <input 
                type="text" 
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="e.g. Craft IPA"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-white/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider pl-2 mb-1 block">Volume (ml)</label>
                <input 
                  type="number" 
                  value={customVol}
                  onChange={e => setCustomVol(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider pl-2 mb-1 block">ABV (%)</label>
                <input 
                  type="number" 
                  value={customAbv}
                  onChange={e => setCustomAbv(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
            <button
              onClick={handleAddCustom}
              className="w-full mt-4 bg-white text-black py-4 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-colors"
            >
              Add Drink
            </button>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="flex flex-col h-full justify-center">
            <div className="text-center mb-6">
               <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 mb-4 animate-pulse">
                 <Sparkles className="text-white w-8 h-8" />
               </div>
               <h3 className="text-white font-semibold text-lg">Describe it naturally</h3>
               <p className="text-white/40 text-sm mt-2 px-8">Gemini will estimate the alcohol content and volume for you.</p>
            </div>
            
            <form onSubmit={handleAiSubmit} className="relative">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. A large glass of Merlot"
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl py-5 pl-6 pr-14 text-white placeholder-white/30 focus:outline-none focus:bg-white/20 transition-all shadow-xl"
                autoFocus
              />
              <button 
                type="submit"
                disabled={isAiLoading || !aiPrompt}
                className="absolute right-2 top-2 bottom-2 aspect-square bg-white rounded-2xl flex items-center justify-center text-black disabled:opacity-50 disabled:cursor-not-allowed hover:scale-95 transition-transform"
              >
                {isAiLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>
            </form>
            
            <div className="mt-8 flex flex-wrap justify-center gap-2">
               {['Double Gin & Tonic', 'Pint of Guinness', 'Long Island Iced Tea'].map(ex => (
                 <button key={ex} onClick={() => setAiPrompt(ex)} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-white/40 text-xs hover:bg-white/10 hover:text-white transition-colors">
                   {ex}
                 </button>
               ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};