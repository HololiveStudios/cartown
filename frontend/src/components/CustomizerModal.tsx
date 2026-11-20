import React from 'react';
import { createPortal } from 'react-dom';
import { Palette, X } from 'lucide-react';

interface CustomizerModalProps {
  onSelectColor: (colorHex: number) => void;
  onClose: () => void;
}

const PALETTE = [
  { name: 'Vermelho Turbo', hex: 0xef4444, bg: 'bg-red-500' },
  { name: 'Azul Nitro', hex: 0x3b82f6, bg: 'bg-blue-500' },
  { name: 'Verde Pistão', hex: 0x22c55e, bg: 'bg-green-500' },
  { name: 'Amarelo Ouro', hex: 0xeab308, bg: 'bg-yellow-500' },
  { name: 'Roxo Neon', hex: 0xa855f7, bg: 'bg-purple-500' },
  { name: 'Rosa V8', hex: 0xec4899, bg: 'bg-pink-500' },
  { name: 'Laranja Flame', hex: 0xf97316, bg: 'bg-orange-500' },
  { name: 'Cinza Asfalto', hex: 0x64748b, bg: 'bg-slate-500' },
];

export const CustomizerModal: React.FC<CustomizerModalProps> = ({ onSelectColor, onClose }) => {
  const content = (
    <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-auto" style={{ zIndex: 2147483647 }}>
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-white z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-extrabold flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-400" /> Pintura da Lataria
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-5">Selecione a cor desejada (pintura 3D em tempo real):</p>

        <div className="grid grid-cols-4 gap-3 mb-6 relative z-20">
          {PALETTE.map((c) => (
            <button key={c.hex} onClick={() => onSelectColor(c.hex)} className={`w-14 h-14 rounded-2xl ${c.bg} border-2 border-white/20 hover:scale-110 active:scale-95 transition-all shadow-lg relative z-30`} />
          ))}
        </div>

        <button onClick={onClose} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-2xl transition-colors text-sm relative z-20">
          Concluir
        </button>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
