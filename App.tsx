
import React, { useState, useEffect, useCallback } from 'react';
import { Background } from './components/Background';
import { Settings } from './components/Settings';
import { Dashboard } from './components/Dashboard';
import { AddDrink } from './components/AddDrink';
import { DrinkList } from './components/DrinkList';
import { AppView, Drink, UserProfile, BacStatus } from './types';
import { calculateBac } from './services/bacService';
import { LayoutDashboard, PlusCircle, History, Settings as SettingsIcon, User } from 'lucide-react';

const App: React.FC = () => {
  // -- State --
  const [view, setView] = useState<AppView>(AppView.SETTINGS);
  
  // Safe parsing for localStorage
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('drinkosaur_user');
      // Default to 'en' if not present
      return saved ? { language: 'en', ...JSON.parse(saved) } : { weightKg: 0, gender: 'male', isSetup: false, language: 'en' };
    } catch (e) {
      console.error("Failed to parse user profile", e);
      return { weightKg: 0, gender: 'male', isSetup: false, language: 'en' };
    }
  });
  
  const [drinks, setDrinks] = useState<Drink[]>(() => {
    try {
      const saved = localStorage.getItem('drinkosaur_drinks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse drinks", e);
      return [];
    }
  });

  const [bacStatus, setBacStatus] = useState<BacStatus>({ 
    currentBac: 0, 
    soberTimestamp: null, 
    statusMessage: 'Ready', 
    color: 'from-emerald-400 to-cyan-400' 
  });

  // -- Effects --
  useEffect(() => {
    localStorage.setItem('drinkosaur_user', JSON.stringify(user));
    if (user.isSetup && view === AppView.SETTINGS) {
        setView(AppView.DASHBOARD);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('drinkosaur_drinks', JSON.stringify(drinks));
  }, [drinks]);

  // Periodic BAC update
  useEffect(() => {
    const updateBac = () => {
      if (user.isSetup) {
        setBacStatus(calculateBac(drinks, user));
      }
    };
    
    updateBac(); // Initial
    const interval = setInterval(updateBac, 60000); // Every minute
    return () => clearInterval(interval);
  }, [drinks, user]);

  // -- Handlers --
  const handleAddDrink = (drink: Drink) => {
    setDrinks(prev => [...prev, drink]);
    setView(AppView.DASHBOARD);
  };

  const handleRemoveDrink = (id: string) => {
    setDrinks(prev => prev.filter(d => d.id !== id));
  };

  // Generate simple history data for chart based on current list
  const getHistoryData = useCallback(() => {
     if (drinks.length === 0) return [];
     
     const points = [];
     const now = Date.now();
     // Create 5 points covering last 4 hours
     for(let i = 4; i >= 0; i--) {
        const t = now - (i * 60 * 60 * 1000);
        points.push({ time: t, bac: 0 }); 
     }
     return points;
  }, [drinks]);


  // -- Navigation Bar --
  const NavButton = ({ target, icon: Icon, label }: { target: AppView, icon: any, label: string }) => (
    <button 
      onClick={() => setView(target)}
      className={`relative group flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${
        view === target 
          ? 'text-white bg-white/10 shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] border border-white/20' 
          : 'text-white/40 hover:text-white/80 hover:bg-white/5'
      }`}
    >
      <Icon 
        size={24} 
        strokeWidth={view === target ? 2.5 : 2} 
        className={`transition-transform duration-300 ${view === target ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]' : ''}`}
      />
      {/* Active Dot indicator */}
      {view === target && (
        <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-white shadow-[0_0_5px_white]" />
      )}
    </button>
  );

  return (
    <div className="relative w-full h-screen text-white overflow-hidden flex flex-col font-sans selection:bg-fuchsia-500/30">
      <Background />

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {view === AppView.SETTINGS && (
          <Settings user={user} onSave={setUser} />
        )}
        
        {view === AppView.DASHBOARD && (
          <Dashboard status={bacStatus} historyData={getHistoryData()} />
        )}

        {view === AppView.ADD_DRINK && (
          <AddDrink onAdd={handleAddDrink} onClose={() => setView(AppView.DASHBOARD)} />
        )}

        {view === AppView.HISTORY && (
          <DrinkList drinks={drinks} onRemove={handleRemoveDrink} />
        )}
      </main>

      {/* Floating Bottom Navigation (Island Dock) */}
      {user.isSetup && (
        <div className="absolute bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
          <div className="glass-panel-3d rounded-[32px] p-2 flex items-center gap-2 shadow-2xl backdrop-blur-xl pointer-events-auto">
            <NavButton target={AppView.HISTORY} icon={History} label="History" />
            
            {/* Floating Action Button */}
            <div className="mx-2">
              <button 
                onClick={() => setView(AppView.ADD_DRINK)}
                className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-white to-gray-200 text-black flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all border-4 border-white/10"
              >
                <PlusCircle size={32} className="text-black/80" strokeWidth={2.5} />
              </button>
            </div>
            
            <NavButton target={AppView.DASHBOARD} icon={LayoutDashboard} label="Monitor" />
            
            {/* Profile Button */}
             <button 
              onClick={() => setView(AppView.SETTINGS)}
              className={`relative group flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${
                view === AppView.SETTINGS
                  ? 'text-white bg-white/10 shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] border border-white/20' 
                  : 'text-white/40 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <User 
                size={24} 
                strokeWidth={view === AppView.SETTINGS ? 2.5 : 2} 
                className={`transition-transform duration-300 ${view === AppView.SETTINGS ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]' : ''}`}
              />
               {view === AppView.SETTINGS && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-white shadow-[0_0_5px_white]" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
