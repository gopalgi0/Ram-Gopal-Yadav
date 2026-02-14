
import React from 'react';

interface GaugeProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  color?: string;
}

const Gauge: React.FC<GaugeProps> = ({ label, value, min, max, unit, color = "text-emerald-500" }) => {
  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
  
  return (
    <div className="glass p-4 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group">
      <div className="absolute top-0 left-0 h-1 bg-white/10 w-full">
        <div 
          className={`h-full transition-all duration-500 ease-out ${color.replace('text', 'bg')}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold mono ${color}`}>{value.toFixed(0)}</span>
        <span className="text-sm text-slate-400 font-medium">{unit}</span>
      </div>
      <div className="mt-2 w-full flex justify-between text-[10px] text-slate-600 font-mono">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

export default Gauge;
