import React from 'react';

interface StatBarProps {
  label: string;
  value: number;
  colorClass: string;
}

export const StatBar: React.FC<StatBarProps> = ({ label, value, colorClass }) => {
  return (
    <div className="flex flex-col mb-2">
      <div className="flex justify-between text-xs mb-1 font-bold uppercase tracking-wider text-gray-400">
        <span>{label}</span>
        <span>{value}/100</span>
      </div>
      <div className="h-4 w-full bg-gray-800 border-2 border-gray-700 relative overflow-hidden skew-x-[-10deg]">
        <div 
          className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
          style={{ width: `${value}%` }}
        >
          {/* Scanline effect on the bar */}
          <div className="w-full h-full bg-gradient-to-b from-transparent via-white/20 to-transparent bg-[length:4px_4px]" />
        </div>
      </div>
    </div>
  );
};