import React from 'react';
import { RacketData } from '../types';
import { StatBar } from './StatBar';
import { PixelCanvas } from './PixelCanvas';

interface RacketCardProps {
  data: RacketData;
  detailed?: boolean;
  onClick?: () => void;
}

export const RacketCard: React.FC<RacketCardProps> = ({ data, detailed = false, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        relative bg-retro-card border-4 border-gray-700 p-4 shadow-[8px_8px_0_0_rgba(0,0,0,0.5)]
        ${!detailed ? 'cursor-pointer hover:border-retro-accent transition-colors' : ''}
        flex flex-col
      `}
    >
      {/* Image Area with Overlay UI */}
      <div className="relative w-full aspect-square bg-retro-bg border-2 border-gray-600 mb-4 overflow-hidden flex items-center justify-center group">
        
        {/* Pixel Effect Layer - Reduced pixelSize for clearer image (2 for detail, 3 for list) */}
        <PixelCanvas src={data.originalImage} pixelSize={detailed ? 2 : 3} className="w-full h-full object-cover" />
        
        {/* Scanline overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30" />
        
        {/* Top Left Badge: Brand */}
        <div className="absolute top-2 left-2 z-10">
          <div className="bg-retro-pop text-white text-xs font-black px-2 py-1 border border-white shadow-sm transform skew-x-[-10deg]">
            {data.brand.toUpperCase()}
          </div>
        </div>

        {/* Model Name Overlay (Bottom of Image) */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2 pt-8">
          <h3 className="text-white font-bold font-mono text-sm tracking-wide drop-shadow-md">
            {data.model}
          </h3>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        {detailed && (
          <div className="mb-4">
            <p className="text-retro-yellow text-xs mb-2 font-bold uppercase tracking-wider border-b border-gray-700 pb-1">
              Analysis
            </p>
            <p className="text-gray-300 text-sm leading-relaxed font-mono">
              {data.description}
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="space-y-2 mt-2 bg-gray-900/50 p-3 border border-gray-800 rounded">
          <StatBar label="进攻" value={data.stats.attack} colorClass="bg-retro-pop" />
          <StatBar label="速度" value={data.stats.speed} colorClass="bg-retro-green" />
          <StatBar label="防守" value={data.stats.defense} colorClass="bg-retro-accent" />
        </div>
      </div>

      {/* Corner Decos */}
      <div className="absolute top-2 right-2 text-[10px] text-gray-600 font-mono">
        DATA-ID:{data.id.slice(-4)}
      </div>
    </div>
  );
};