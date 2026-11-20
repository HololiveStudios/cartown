import React, { useEffect, useState } from 'react';
import Phaser from 'phaser';
import { config } from './phaser/gameConfig';
import { EventBus } from './services/eventBus';
import { PlayerStateData, ServiceJobData } from './types/game';
import { fetchPlayerData, fetchServiceJobs, startWorkBayJob, claimWorkBayJob, finishRace, customizeCar } from './services/api';
import { HUD } from './components/HUD';
import { WorkBayModal } from './components/WorkBayModal';
import { CustomizerModal } from './components/CustomizerModal';
import { RPMGauge } from './components/RPMGauge';
import { NotificationBanner } from './components/NotificationBanner';
import { Car3DViewer } from './components/Car3DViewer';
import { Palette, Flag } from 'lucide-react';

const FALLBACK_JOBS: Record<string, ServiceJobData> = {
  wash_car: {
    id: 'wash_car',
    name: 'Lavar Carro',
    minLevel: 1,
    cost: 50,
    durationSec: 10,
    rewardCoins: 120,
    rewardXP: 15
  },
  oil_change: {
    id: 'oil_change',
    name: 'Trocar Óleo',
    minLevel: 1,
    cost: 120,
    durationSec: 30,
    rewardCoins: 280,
    rewardXP: 35
  },
  tune_up: {
    id: 'tune_up',
    name: 'Ajustar Freios',
    minLevel: 2,
    cost: 300,
    durationSec: 60,
    rewardCoins: 650,
    rewardXP: 80
  },
  alignment: {
    id: 'alignment',
    name: 'Alinhamento 3D',
    minLevel: 3,
    cost: 600,
    durationSec: 120,
    rewardCoins: 1350,
    rewardXP: 160
  }
};

export const App: React.FC = () => {
  const [player, setPlayer] = useState<PlayerStateData>({
    id: 'usr_001',
    username: 'Piloto #1',
    level: 1,
    xp: 120,
    coins: 1500,
    cash: 10,
    garageValue: 12000,
    carColor: 0xef4444,
    workBays: []
  });
  const [jobs, setJobs] = useState<Record<string, ServiceJobData>>(FALLBACK_JOBS);
  const [isWorkBayOpen, setIsWorkBayOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [showRpmGauge, setShowRpmGauge] = useState(false);
  const [rpmData, setRpmData] = useState({ rpm: 1000, gear: 1, feedback: '' });
  const [notif, setNotif] = useState({ title: '', subtitle: '' });
  const [currentScene, setCurrentScene] = useState<'GarageScene' | 'DragRaceScene'>('GarageScene');
  const [phaserGame, setPhaserGame] = useState<Phaser.Game | null>(null);

  useEffect(() => {
    console.log('[App] Initializing Phaser Game');
    const game = new Phaser.Game(config);
    setPhaserGame(game);

    fetchPlayerData().then(p => { 
      if (p) {
        setPlayer(p);
        EventBus.emit('CHANGE_CAR_COLOR', p.carColor);
        if (p.workBays && p.workBays.length > 0) {
          const bay = p.workBays[0];
          if (bay.status === 'BUSY' && bay.finishTime) {
            const remaining = bay.finishTime - Date.now();
            EventBus.emit('SYNC_WORKBAY_STATE', { status: 'BUSY', remainingTimeMs: remaining });
          }
        }
      } 
    });

    fetchServiceJobs().then(j => { 
      if (j && Object.keys(j).length > 0) {
        setJobs(j); 
      }
    });

    const onOpenWorkbay = () => {
      console.log('[App] OPEN_WORKBAY_MODAL received. Setting state to true.');
      setIsWorkBayOpen(true);
    };
    const onShowRpmGauge = (show: boolean) => setShowRpmGauge(show);
    const onUpdateRpmUi = (data: { rpm: number; gear: number }) => setRpmData(prev => ({ ...prev, rpm: data.rpm, gear: data.gear }));
    const onShiftFeedback = (data: { gear: number; feedback: string }) => setRpmData(prev => ({ ...prev, gear: data.gear, feedback: data.feedback }));
    const onShowNotification = (data: { title: string; subtitle: string }) => {
      setNotif(data);
      setTimeout(() => setNotif({ title: '', subtitle: '' }), 3500);
    };

    EventBus.on('OPEN_WORKBAY_MODAL', onOpenWorkbay);
    EventBus.on('SHOW_RPM_GAUGE', onShowRpmGauge);
    EventBus.on('UPDATE_RPM_UI', onUpdateRpmUi);
    EventBus.on('SHIFT_FEEDBACK', onShiftFeedback);
    EventBus.on('SHOW_NOTIFICATION', onShowNotification);
    
    // Listen for race completion
    const onAddRewards = async (data: { coins: number; xp: number }) => {
      setPlayer(prev => ({ ...prev, coins: prev.coins + data.coins, xp: prev.xp + data.xp }));
      const res = await finishRace();
      if (res.success && res.player) setPlayer(res.player);
    };
    EventBus.on('ADD_PLAYER_REWARDS', onAddRewards);

    // Listen for bay claim
    const onClaimWorkbay = async (data: { bayId: number }) => {
      const res = await claimWorkBayJob(data.bayId);
      if (res.success && res.player) {
        setPlayer(res.player);
        EventBus.emit('WORKBAY_CLAIMED');
        EventBus.emit('SHOW_NOTIFICATION', { title: '💰 RECOMPENSA RESGATADA!', subtitle: `+${res.rewards.coins} Moedas` });
      } else {
        setPlayer(prev => ({ ...prev, coins: prev.coins + 150, xp: prev.xp + 25 }));
        EventBus.emit('WORKBAY_CLAIMED');
        EventBus.emit('SHOW_NOTIFICATION', { title: '💰 SERVIÇO CONCLUÍDO!', subtitle: '+150 Moedas' });
      }
    };
    EventBus.on('CLAIM_WORKBAY', onClaimWorkbay);

    return () => { 
      game.destroy(true); 
      EventBus.off('OPEN_WORKBAY_MODAL', onOpenWorkbay);
      EventBus.off('SHOW_RPM_GAUGE', onShowRpmGauge);
      EventBus.off('UPDATE_RPM_UI', onUpdateRpmUi);
      EventBus.off('SHIFT_FEEDBACK', onShiftFeedback);
      EventBus.off('SHOW_NOTIFICATION', onShowNotification);
      EventBus.off('ADD_PLAYER_REWARDS', onAddRewards);
      EventBus.off('CLAIM_WORKBAY', onClaimWorkbay);
    };
  }, []);

  const handleSelectJob = async (jobId: string) => {
    setIsWorkBayOpen(false);
    const selectedJob = jobs[jobId] || FALLBACK_JOBS[jobId];
    if (!selectedJob) return;

    // Check if player has enough coins
    if (player.coins < selectedJob.cost) {
      EventBus.emit('SHOW_NOTIFICATION', { 
        title: '❌ MOEDAS INSUFICIENTES', 
        subtitle: `Você precisa de ${selectedJob.cost} moedas para este serviço!` 
      });
      return;
    }

    // Deduct cost optimistically
    setPlayer(prev => ({
      ...prev,
      coins: prev.coins - selectedJob.cost
    }));

    EventBus.emit('WORKBAY_JOB_STARTED', { bayId: 1, durationSec: selectedJob.durationSec });
    EventBus.emit('SHOW_NOTIFICATION', { 
      title: '🔧 SERVIÇO INICIADO!', 
      subtitle: `${selectedJob.name} — Conclusão em ${selectedJob.durationSec}s` 
    });

    const res = await startWorkBayJob(1, jobId);
    if (res.success && res.player) {
      setPlayer(res.player);
    }
  };

  const handleSelectColor = async (hex: number) => {
    EventBus.emit('CHANGE_CAR_COLOR', hex);
    setPlayer(prev => ({ ...prev, carColor: hex }));
    await customizeCar(hex);
  };

  const toggleScene = () => {
    if (!phaserGame) return;
    if (currentScene === 'GarageScene') {
      phaserGame.scene.stop('GarageScene');
      phaserGame.scene.start('DragRaceScene');
      setCurrentScene('DragRaceScene');
    } else {
      phaserGame.scene.stop('DragRaceScene');
      phaserGame.scene.start('GarageScene');
      setCurrentScene('GarageScene');
      setShowRpmGauge(false);
      // Resync color when going back
      EventBus.emit('CHANGE_CAR_COLOR', player.carColor);
      if (player.workBays && player.workBays.length > 0) {
        const bay = player.workBays[0];
        if (bay.status === 'BUSY' && bay.finishTime) {
          const remaining = bay.finishTime - Date.now();
          EventBus.emit('SYNC_WORKBAY_STATE', { status: 'BUSY', remainingTimeMs: remaining });
        }
      }
    }
  };

  console.log(`[App] render. isWorkBayOpen=${isWorkBayOpen}, isCustomizerOpen=${isCustomizerOpen}`);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      <div id="game-container" className="absolute inset-0 z-10 w-full h-full" />

      {currentScene === 'GarageScene' && (
        <Car3DViewer color={player.carColor} onClick={() => EventBus.emit('CAR_MODEL_CLICKED')} />
      )}

      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-4">
        <HUD player={player} />

        <NotificationBanner title={notif.title} subtitle={notif.subtitle} />

        <footer className="flex flex-wrap justify-center gap-3 pointer-events-auto mb-2">
          {currentScene === 'GarageScene' && (
            <button 
              onClick={() => {
                console.log('[App] Button Serviços & Oficina clicked');
                setIsWorkBayOpen(true);
              }} 
              className="bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black py-2.5 px-6 rounded-2xl shadow-2xl transform active:scale-95 transition-all border-2 border-amber-200/60 flex items-center gap-2 text-sm uppercase tracking-wide cursor-pointer">
              <span className="text-lg">🔧</span> Serviços & Oficina
            </button>
          )}

          <button 
            onClick={() => setIsCustomizerOpen(true)} 
            className="bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white font-black py-2.5 px-6 rounded-2xl shadow-2xl transform active:scale-95 transition-all border-2 border-blue-300/40 flex items-center gap-2 text-sm uppercase tracking-wide cursor-pointer">
            <Palette className="w-4 h-4" /> Pintura do Carro
          </button>

          <button 
            onClick={toggleScene} 
            className="bg-gradient-to-b from-emerald-500 to-green-700 hover:from-emerald-400 hover:to-green-600 text-white font-black py-2.5 px-7 rounded-2xl shadow-2xl transform active:scale-95 transition-all border-2 border-green-200/40 flex items-center gap-2 text-sm uppercase tracking-wide cursor-pointer">
            <Flag className="w-4 h-4" /> {currentScene === 'GarageScene' ? '🏁 Pista de Arrancada' : '🏠 Voltar p/ Garagem'}
          </button>
        </footer>

        {showRpmGauge && <RPMGauge rpm={rpmData.rpm} gear={rpmData.gear} feedback={rpmData.feedback} />}
      </div>

      {isWorkBayOpen && (
        <WorkBayModal 
          jobs={jobs} 
          onSelectJob={handleSelectJob} 
          onClose={() => setIsWorkBayOpen(false)} 
        />
      )}

      {isCustomizerOpen && (
        <CustomizerModal 
          onSelectColor={handleSelectColor} 
          onClose={() => setIsCustomizerOpen(false)} 
        />
      )}
    </div>
  );
};
