import React, { useMemo } from 'react';
import { BacStatus } from '../types';
import { Droplets, Clock, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

interface DashboardProps {
  status: BacStatus;
  historyData: { time: number; bac: number }[];
}

export const Dashboard: React.FC<DashboardProps> = ({ status, historyData }) => {
  // Format sober time
  const soberTimeStr = useMemo(() => {
    if (!status.soberTimestamp) return null;
    return new Date(status.soberTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [status.soberTimestamp]);

  // Calculate liquid height percentage (clamped 0-100)
  // Assume max visual scale is 0.20 BAC
  const liquidHeight = Math.min((status.currentBac / 0.20) * 100, 100);

  return (
    <div className="w-full h-full flex flex-col p-6 animate-fade-in relative overflow-hidden">
      
      {/* Header Status */}
      <div className="flex justify-between items-start mb-4 z-10">
        <div>
           <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Drinkosaur</h1>
           <p className="text-white/50 text-sm">Real-time Monitor</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full border border-white/10 glass-panel backdrop-blur-md flex items-center gap-2`}>
           <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${status.color} animate-pulse`} />
           <span className="text-white/90 font-medium text-xs uppercase tracking-wider">{status.statusMessage}</span>
        </div>
      </div>

      {/* Main Liquid Gauge */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Glass Container */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-[60px] glass-panel border-2 border-white/20 shadow-2xl overflow-hidden flex items-center justify-center">
          
          {/* Liquid Background */}
          <div 
            className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-in-out bg-gradient-to-t ${status.color} opacity-80`}
            style={{ height: `${liquidHeight}%` }}
          >
             {/* Wave decoration SVG could go here for extra polish */}
             <div className="absolute top-0 left-0 right-0 h-4 bg-white/20 blur-xl transform -translate-y-1/2"></div>
          </div>

          {/* Value Display */}
          <div className="relative z-10 text-center flex flex-col items-center">
            <span className="text-6xl md:text-7xl font-bold text-white drop-shadow-md tracking-tighter">
              {status.currentBac.toFixed(3)}
            </span>
            <span className="text-white/60 text-lg font-medium tracking-widest mt-1">BAC %</span>
          </div>
        </div>

        {/* Info Pills */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs mt-8">
           <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center border border-white/5">
              <div className="text-white/40 mb-1"><Clock size={18} /></div>
              <div className="text-white font-semibold">{soberTimeStr || '--:--'}</div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Sober At</div>
           </div>
           <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center border border-white/5">
              <div className="text-white/40 mb-1"><Droplets size={18} /></div>
              <div className="text-white font-semibold">{liquidHeight > 0 ? `${Math.round(liquidHeight)}%` : '0%'}</div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Load</div>
           </div>
        </div>
      </div>

      {/* Mini Chart Area */}
      {historyData.length > 1 && (
        <div className="h-24 w-full mt-6 rounded-2xl overflow-hidden opacity-50">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="colorBac" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#fff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="bac" stroke="#fff" strokeWidth={2} fillOpacity={1} fill="url(#colorBac)" />
              <YAxis domain={[0, 0.15]} hide />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {status.currentBac > 0.08 && (
        <div className="mt-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center gap-3 animate-pulse">
           <AlertTriangle className="text-red-400 w-5 h-5 flex-shrink-0" />
           <p className="text-xs text-red-100 leading-tight">You are likely over the legal driving limit in many regions. Do not drive.</p>
        </div>
      )}

    </div>
  );
};