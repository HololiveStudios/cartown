import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ServiceJobData } from '../types/game';
import { Wrench, Clock, Coins, Star, X } from 'lucide-react';

interface WorkBayModalProps {
  jobs: Record<string, ServiceJobData>;
  onSelectJob: (jobId: string) => void;
  onClose: () => void;
}

export const WorkBayModal: React.FC<WorkBayModalProps> = ({ jobs, onSelectJob, onClose }) => {
  useEffect(() => {
    console.log('[WorkBayModal] MOUNTED via Portal! jobs available:', Object.keys(jobs).length);
  }, []);

  const jobList = Object.values(jobs || {});

  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-auto" style={{ zIndex: 2147483647 }}>
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-slate-900 border-2 border-blue-500/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative text-white z-10">
        <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
          <h3 className="text-xl font-extrabold flex items-center gap-2 text-blue-400">
            <Wrench className="w-6 h-6 text-amber-400" /> Catálogo de Serviços — Elevador #1
          </h3>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {jobList.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <p>Carregando serviços da oficina...</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1 relative z-20">
            {jobList.map((job) => (
              <div 
                key={job.id} 
                className="bg-slate-950/90 border border-slate-800 hover:border-blue-400/60 rounded-2xl p-4 flex justify-between items-center transition-all hover:bg-slate-900/60">
                <div>
                  <div className="font-black text-base flex items-center gap-2 text-white">
                    {job.name}
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" /> Nível {job.minLevel}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-1.5">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-blue-400" /> {job.durationSec}s</span>
                    <span className="flex items-center gap-1 text-amber-400 font-bold"><Coins className="w-3.5 h-3.5" /> +{job.rewardCoins}</span>
                    <span className="text-indigo-400 font-bold">+{job.rewardXP} XP</span>
                  </div>
                </div>

                <button 
                  onClick={() => onSelectJob(job.id)} 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold py-2 px-5 rounded-xl text-xs active:scale-95 transition-all border border-blue-300/30 shadow-lg relative z-30">
                  Iniciar (${job.cost})
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
