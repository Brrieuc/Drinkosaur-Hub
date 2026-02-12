
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Background } from './components/Background';
import { Settings } from './components/Settings';
import { Dashboard } from './components/Dashboard';
import { AddDrink } from './components/AddDrink';
import { DrinkList } from './components/DrinkList';
import { AppView, Drink, UserProfile, BacStatus } from './types';
import { calculateBac } from './services/bacService';
import { LayoutDashboard, PlusCircle, History, User, CheckCircle, AlertOctagon } from 'lucide-react';

const Toast = ({ message, type = 'success' }: { message: string, type?: 'success' | 'warning' }) => (
    <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[200] px-6 py-4 rounded-2xl backdrop-blur-xl border shadow-2xl animate-bounce-in flex items-center gap-3 ${
        type === 'warning' ? 'bg-red-500/20 border-red-500/30 text-red-100' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-100'
    }`}>
        {type === 'warning' ? <AlertOctagon size={20}/> : <CheckCircle size={20}/>}
        <span className="font-bold text-sm text-center">{message}</span>
    </div>
);

const App: React.FC = () => {
  // -- State --
  const [view, setView] = useState<AppView>(AppView.SETTINGS);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'warning'} | null>(null);
  const prevStatusRef = useRef<string>("");

  // Safe parsing for localStorage
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('drinkosaur_user');
      const parsed = saved ? JSON.parse(saved) : null;
      
      const defaultProfile: UserProfile = { 
        weightKg: 0, 
        gender: 'male', 
        isSetup: false, 
        language: 'en', 
        drinkingSpeed: 'average' 
      };

      if (parsed) {
        return { ...defaultProfile, ...parsed };
      }
      return defaultProfile;
    } catch (e) {
      console.error("Failed to parse user profile", e);
      return { 
        weightKg: 0, 
        gender: 'male', 
        isSetup: false, 
        language: 'en', 
        drinkingSpeed: 'average' 
      };
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
    peakBac: 0,
    peakTime: null,
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

  // Periodic BAC update & Status Change Detection
  useEffect(() => {
    const updateBac = () => {
      if (user.isSetup) {
        const newStatus = calculateBac(drinks, user);
        setBacStatus(newStatus);
        
        // Check for status change for notification (only if BAC is increasing or high)
        if (prevStatusRef.current && prevStatusRef.current !== newStatus.statusMessage && newStatus.currentBac > 0.05) {
             // Avoid spamming on minor fluctuations down, mostly care about going UP tiers
             // Logic: Simple check if message changed
             let nextStage = "";
             // Determine next stage roughly
             if (newStatus.statusMessage === (user.language === 'fr' ? 'Pompette' : 'Buzzy')) nextStage = user.language === 'fr' ? 'Éméché' : 'Tipsy';
             else if (newStatus.statusMessage === (user.language === 'fr' ? 'Éméché' : 'Tipsy')) nextStage = user.language === 'fr' ? 'Chargé' : 'Loaded';
             else if (newStatus.statusMessage === (user.language === 'fr' ? 'Chargé' : 'Loaded')) nextStage = user.language === 'fr' ? 'Ivre' : 'Drunk';
             else nextStage = user.language === 'fr' ? 'Coma' : 'Blackout';

             const msg = user.language === 'fr' 
                ? `Il n'y a pas de quoi être fier, vous êtes "${newStatus.statusMessage}" et vous risquez de finir "${nextStage}".`
                : `Nothing to be proud of, you are "${newStatus.statusMessage}" and might end up "${nextStage}".`;
             
             setToast({ msg, type: 'warning' });
             setTimeout(() => setToast(null), 5000);
        }
        prevStatusRef.current = newStatus.statusMessage;
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
    
    // Success Toast
    const msg = user.language === 'fr' ? 'Consommation ajoutée !' : 'Drink logged!';
    setToast({ msg, type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRemoveDrink = (id: string) => {
    setDrinks(prev => prev.filter(d => d.id !== id));
  };

  const getHistoryData = useCallback(() => {
     if (drinks.length === 0) return [];
     const points = [];
     const now = Date.now();
     for(let i = 4; i >= 0; i--) {
        const t = now - (i * 60 * 60 * 1000);
        points.push({ time: t, bac: 0 }); 
     }
     return points;
  }, [drinks]);


  // -- Navigation Bar --
  const t = {
    history: user.language === 'fr' ? 'Historique' : 'History',
    monitor: user.language === 'fr' ? 'Moniteur' : 'Monitor',
    add: user.language === 'fr' ? 'Ajouter' : 'Add Drink',
    settings: user.language === 'fr' ? 'Paramètres' : 'Settings'
  };

  const NavButton = ({ target, icon: Icon, label }: { target: AppView, icon: any, label: string }) => (
    <button 
      onClick={() => setView(target)}
      aria-label={label}
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
      {view === target && (
        <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-white shadow-[0_0_5px_white]" />
      )}
    </button>
  );

  return (
    <div className="relative w-full h-screen text-white overflow-hidden flex flex-col font-sans selection:bg-fuchsia-500/30">
      <Background />

      {/* TOAST NOTIFICATION */}
      {toast && <Toast message={toast.msg} type={toast.type} />}

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {view === AppView.SETTINGS && (
          <Settings user={user} onSave={setUser} />
        )}
        
        {view === AppView.DASHBOARD && (
          <Dashboard 
             status={bacStatus} 
             historyData={getHistoryData()} 
             language={user.language} 
             drinks={drinks} 
             user={user} 
          />
        )}

        {view === AppView.ADD_DRINK && (
          <AddDrink onAdd={handleAddDrink} onClose={() => setView(AppView.DASHBOARD)} language={user.language} />
        )}

        {view === AppView.HISTORY && (
          <DrinkList drinks={drinks} onRemove={handleRemoveDrink} language={user.language} />
        )}
      </main>

      {/* Floating Bottom Navigation */}
      {user.isSetup && (
        <div className="absolute bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
          <div className="glass-panel-3d rounded-[32px] p-2 flex items-center gap-2 shadow-2xl backdrop-blur-xl pointer-events-auto">
            <NavButton target={AppView.HISTORY} icon={History} label={t.history} />
            
            <div className="mx-2">
              <button 
                onClick={() => setView(AppView.ADD_DRINK)}
                aria-label={t.add}
                className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-white to-gray-200 text-black flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all border-4 border-white/10"
              >
                <PlusCircle size={32} className="text-black/80" strokeWidth={2.5} />
              </button>
            </div>
            
            <NavButton target={AppView.DASHBOARD} icon={LayoutDashboard} label={t.monitor} />
            
             <button 
              onClick={() => setView(AppView.SETTINGS)}
              aria-label={t.settings}
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
