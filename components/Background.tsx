import React from 'react';

export const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-black">
      {/* Abstract Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vh] h-[60vh] rounded-full bg-purple-600/30 mix-blend-screen filter blur-[80px] animate-blob" />
      <div className="absolute top-[20%] right-[-10%] w-[50vh] h-[50vh] rounded-full bg-blue-600/30 mix-blend-screen filter blur-[80px] animate-blob animation-delay-2000" />
      <div className="absolute bottom-[-10%] left-[20%] w-[60vh] h-[60vh] rounded-full bg-pink-600/30 mix-blend-screen filter blur-[80px] animate-blob animation-delay-4000" />
      
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
    </div>
  );
};