import React from 'react';
import { PlayerStateData } from '../types/game';
import { Coins, Gem, Car, Trophy } from 'lucide-react';

interface HUDProps {
  player: PlayerStateData;
}

export const HUD: React.FC<HUDProps> = ({ player }) => {
  const reqXp = player.level * 300;
  const xpPct = Math.min(100, (player.xp / reqXp) * 100);

  return (
    <header className="flex flex-wrap justify-between items-center bg-slate-900/90 backdrop-blur border border-slate-800 p-3.5 rounded-2xl shadow-2xl pointer-events-auto max-w-5xl mx-auto w-full gap-4">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center font-black border-2 border-white/20 text-lg shadow-md text-white">
          {player.level}
        </div>
        <div>
          <div className="text-xs text-slate-400 font-medium">Piloto de Garagem</div>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            {player.username}
            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md border border-blue-500/30 font-semibold">
              Nível {player.level}
            </span>
          </div>
          <div className="w-36 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700 mt-1">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full transition-all duration-300" style={{ width: `${xpPct}%` }} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-amber-500/30">
          <Coins className="w-5 h-5 text-amber-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Moedas</span>
            <span className="font-extrabold text-amber-400 text-sm">{player.coins.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-blue-500/30">
          <Gem className="w-5 h-5 text-blue-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Cash</span>
            <span className="font-extrabold text-blue-300 text-sm">{player.cash}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-purple-500/30">
          <Car className="w-5 h-5 text-purple-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Garage Value</span>
            <span className="font-extrabold text-purple-300 text-sm">${player.garageValue.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
