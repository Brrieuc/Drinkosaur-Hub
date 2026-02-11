
import React, { useMemo } from 'react';
import { BacStatus } from '../types';
import { Clock, Zap, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

interface DashboardProps {
  status: BacStatus;
  historyData: { time: number; bac: number }[];
  language?: 'en' | 'fr';
}

export const Dashboard: React.FC<DashboardProps> = ({ status, historyData, language = 'en' }) => {
  const isFrench = language === 'fr';

  const t = {
    bacLevel: isFrench ? 'Taux Alcool' : 'BAC Level',
    soberAt: isFrench ? 'Sobre à' : 'Sober At',
    limitLoad: isFrench ? 'Charge Limite' : 'Limit Load',
    unitDesc: isFrench ? 'Grammes par Litre' : 'g/100ml',
    drivingWarning: 'Ne prenez pas le volant'
  };

  // Logic for display value and unit
  // EN: Uses % (g/100ml). FR: Uses g/L.
  // Conversion: 1% = 10 g/L.
  const displayValue = isFrench ? status.currentBac * 10 : status.currentBac;
  const displayUnit = isFrench ? 'g/L' : '%';
  const displayDecimals = isFrench ? 2 : 3; // 0.50 g/L vs 0.050 %

  // Warning Logic: France limit is 0.5 g/L
  const showDrivingWarning = isFrench && displayValue >= 0.5;

  const soberTimeStr = useMemo(() => {
    if (!status.soberTimestamp) return null;
    return new Date(status.soberTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [status.soberTimestamp]);

  // Visual scaling: Assume 0.20% (or 2.0 g/L) is max for full visual height
  const liquidHeight = Math.min((status.currentBac / 0.20) * 100, 100);
  
  // Dynamic gradient based on status
  const liquidGradient = status.currentBac > 0.08 
    ? 'from-red-500 via-rose-500 to-purple-600'
    : status.currentBac > 0.05 
      ? 'from-orange-400 via-pink-500 to-rose-500'
      : 'from-cyan-400 via-blue-500 to-indigo-500';

  return (
    <div className="w-full h-full flex flex-col p-6 animate-fade-in relative overflow-hidden">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4 z-10 pt-2">
        <div>
           <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-lg">
             Drinkosaur
           </h1>
        </div>
        <div className={`px-4 py-2 rounded-2xl glass-panel-3d flex items-center gap-2 border border-white/10`}>
           <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${status.color.split(' ')[1].replace('to-', 'text-')} animate-pulse`} />
           <span className="text-white font-semibold text-xs uppercase tracking-widest">{status.statusMessage}</span>
        </div>
      </div>

      {/* Main 3D Sphere Gauge */}
      <div className="flex-1 flex flex-col items-center justify-center relative -mt-4">
        
        {/* Driving Warning Banner (Specific to French limit) */}
        {showDrivingWarning && (
            <div className="absolute top-0 z-50 animate-bounce-slow">
                <div className="px-5 py-3 bg-red-600/90 border border-red-400/50 rounded-2xl backdrop-blur-xl shadow-[0_0_30px_rgba(220,38,38,0.5)] flex items-center gap-3">
                    <AlertTriangle className="text-white fill-white/20" size={20} />
                    <span className="text-white font-bold uppercase tracking-wider text-sm">
                        {t.drivingWarning}
                    </span>
                </div>
            </div>
        )}

        {/* Glow behind the sphere */}
        <div className={`absolute w-64 h-64 rounded-full blur-[80px] opacity-40 bg-gradient-to-tr ${liquidGradient} animate-pulse`} />

        {/* The Sphere Container */}
        <div className="relative w-72 h-72 md:w-80 md:h-80 glass-sphere rounded-full overflow-hidden flex items-center justify-center transform transition-transform duration-500 hover:scale-[1.02]">
          
          {/* Specular Highlight (Reflection) Top Left */}
          <div className="absolute top-[10%] left-[10%] w-[40%] h-[25%] bg-gradient-to-b from-white/40 to-transparent rounded-[100%] rotate-[-45deg] blur-[2px] z-20 pointer-events-none" />
          
          {/* Liquid Container */}
          <div className="absolute bottom-0 left-0 right-0 z-0 transition-all duration-1000 ease-in-out w-full" style={{ height: `${liquidHeight}%`, maxHeight: '100%' }}>
             {/* The Liquid Surface (Wave) */}
             <div className="absolute -top-4 left-0 w-[200%] h-8 bg-white/30 rounded-[100%] animate-[liquid-wave_6s_linear_infinite]" />
             <div className="absolute -top-4 left-[-10%] w-[200%] h-8 bg-white/20 rounded-[100%] animate-[liquid-wave_9s_linear_infinite_reverse]" />
             
             {/* The Liquid Body */}
             <div className={`w-full h-full bg-gradient-to-t ${liquidGradient} opacity-90 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]`}></div>
             
             {/* Bubbles */}
             <div className="absolute bottom-0 w-full h-full overflow-hidden">
                <div className="absolute bottom-[-10px] left-[20%] w-2 h-2 bg-white/40 rounded-full animate-[float_4s_infinite]" />
                <div className="absolute bottom-[-10px] left-[50%] w-3 h-3 bg-white/30 rounded-full animate-[float_6s_infinite_0.5s]" />
                <div className="absolute bottom-[-10px] left-[80%] w-1 h-1 bg-white/50 rounded-full animate-[float_3s_infinite_1s]" />
             </div>
          </div>

          {/* Inner Shadow Overlay for Volume */}
          <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.6)] z-10 pointer-events-none border border-white/5"></div>

          {/* Value Display */}
          <div className="relative z-20 text-center flex flex-col items-center drop-shadow-2xl">
            <div className="flex items-baseline justify-center">
                <span className="text-7xl font-black text-white tracking-tighter" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                  {displayValue.toFixed(displayDecimals)}
                </span>
                <span className="text-2xl font-bold text-white/50 ml-1">{displayUnit}</span>
            </div>
            
            <div className="flex flex-col items-center mt-2">
                <span className="text-white/90 text-sm font-bold tracking-[0.2em] uppercase backdrop-blur-sm px-3 py-1 rounded-full bg-black/20 border border-white/5">
                {t.bacLevel}
                </span>
                <span className="text-white/40 text-[10px] font-mono mt-1 tracking-wider opacity-60">
                {t.unitDesc}
                </span>
            </div>
          </div>
        </div>

        {/* Data Pills */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs mt-10">
           <div className="glass-panel-3d p-4 rounded-[24px] flex flex-col items-center justify-center group hover:bg-white/5 transition-colors">
              <div className="text-blue-300 mb-2 p-2 bg-blue-500/20 rounded-full"><Clock size={16} /></div>
              <div className="text-white font-bold text-lg">{soberTimeStr || '--:--'}</div>
              <div className="text-[10px] text-blue-200/60 uppercase tracking-wider font-semibold">{t.soberAt}</div>
           </div>
           <div className="glass-panel-3d p-4 rounded-[24px] flex flex-col items-center justify-center group hover:bg-white/5 transition-colors">
              <div className="text-pink-300 mb-2 p-2 bg-pink-500/20 rounded-full"><Zap size={16} /></div>
              <div className="text-white font-bold text-lg">{Math.round(liquidHeight)}%</div>
              <div className="text-[10px] text-pink-200/60 uppercase tracking-wider font-semibold">{t.limitLoad}</div>
           </div>
        </div>
      </div>

      {/* Mini Chart - Styled */}
      {historyData.length > 1 && (
        <div className="h-24 w-full mt-4 rounded-3xl overflow-hidden glass-input p-2 opacity-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="colorBac" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="bac" stroke="#c084fc" strokeWidth={3} fillOpacity={1} fill="url(#colorBac)" />
              <YAxis domain={[0, 0.15]} hide />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
