import React from 'react';
import { EventBus } from '../services/eventBus';

interface RPMGaugeProps {
  rpm: number;
  gear: number;
  feedback: string;
}

export const RPMGauge: React.FC<RPMGaugeProps> = ({ rpm, gear, feedback }) => {
  const pct = Math.min(100, (rpm / 8000) * 100);

  return (
    <div className="pointer-events-auto absolute bottom-6 right-6 bg-slate-900/95 border border-slate-800 p-5 rounded-2xl shadow-2xl flex flex-col items-center w-80 backdrop-blur text-white">
      <div className="flex justify-between w-full mb-1 text-xs text-slate-400 font-bold">
        <span>MARCHA: <span className="text-2xl text-amber-400 font-black ml-1">{gear}</span></span>
        <span className="text-xs font-black text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg">{feedback || 'LARGADA'}</span>
      </div>

      <div className="relative w-full h-9 bg-slate-950 rounded-xl overflow-hidden border-2 border-slate-800 my-2">
        <div className="absolute top-0 bottom-0 left-[81%] w-[12%] bg-green-500/40 border-x-2 border-green-400 animate-pulse" />
        <div className="absolute top-0 bottom-0 right-0 w-[7%] bg-red-600/60" />
        <div className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-red-500 transition-all duration-75" style={{ width: `${pct}%` }} />
      </div>

      <div className="text-xs font-mono text-slate-400">
        <span className="text-xl font-black text-white">{rpm}</span> RPM
      </div>

      <button onClick={() => EventBus.emit('PLAYER_SHIFT_INPUT')} className="mt-3 w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black py-3 rounded-xl shadow-lg active:scale-95 transition-all text-sm uppercase tracking-wide">
        ⚙️ Trocar Marcha (ESPAÇO)
      </button>
    </div>
  );
};
