import React, { useState, useEffect, useCallback } from 'react';
import { Background } from './components/Background';
import { Settings } from './components/Settings';
import { Dashboard } from './components/Dashboard';
import { AddDrink } from './components/AddDrink';
import { DrinkList } from './components/DrinkList';
import { AppView, Drink, UserProfile, BacStatus } from './types';
import { calculateBac } from './services/bacService';
import { LayoutDashboard, PlusCircle, History, Settings as SettingsIcon } from 'lucide-react';

const App: React.FC = () => {
  // -- State --
  const [view, setView] = useState<AppView>(AppView.SETTINGS);
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('drinkosaur_user');
    return saved ? JSON.parse(saved) : { weightKg: 0, gender: 'male', isSetup: false };
  });
  
  const [drinks, setDrinks] = useState<Drink[]>(() => {
    const saved = localStorage.getItem('drinkosaur_drinks');
    return saved ? JSON.parse(saved) : [];
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
  // Note: This is a simplified projection for the visualizer.
  // Real history would require sampling BAC at historical intervals.
  const getHistoryData = useCallback(() => {
     if (drinks.length === 0) return [];
     
     const points = [];
     const now = Date.now();
     // Create 5 points covering last 4 hours
     for(let i = 4; i >= 0; i--) {
        const t = now - (i * 60 * 60 * 1000);
        // Placeholder for future implementation of historical BAC calculation
        points.push({ time: t, bac: 0 }); 
     }
     return points;
  }, [drinks]);


  // -- Navigation Bar --
  const NavButton = ({ target, icon: Icon, label }: { target: AppView, icon: any, label: string }) => (
    <button 
      onClick={() => setView(target)}
      className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 ${view === target ? 'text-white scale-110' : 'text-white/40 hover:text-white/70'}`}
    >
      <Icon 
        size={24} 
        strokeWidth={view === target ? 2.5 : 2} 
        className={view === target ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : ''}
      />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  return (
    <div className="relative w-full h-screen text-white overflow-hidden flex flex-col">
      <Background />

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
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

      {/* Bottom Navigation (Glass Dock) */}
      {user.isSetup && (
        <div className="px-6 pb-6 pt-2 z-50">
          <div className="glass-panel rounded-[32px] h-20 px-6 flex items-center justify-between shadow-2xl">
            <NavButton target={AppView.HISTORY} icon={History} label="History" />
            <div className="relative -top-6">
              <button 
                onClick={() => setView(AppView.ADD_DRINK)}
                className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all"
              >
                <PlusCircle size={32} />
              </button>
            </div>
            <NavButton target={AppView.DASHBOARD} icon={LayoutDashboard} label="Monitor" />
            {/* Settings is hidden in main nav, accessible via Dashboard or special logic if needed. 
                For this demo, let's put it on the right to allow re-config */}
            <NavButton target={AppView.SETTINGS} icon={SettingsIcon} label="Profile" />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;