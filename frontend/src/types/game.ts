export interface PlayerStateData {
  id: string;
  username: string;
  level: number;
  xp: number;
  coins: number;
  cash: number;
  garageValue: number;
  carColor: number;
  workBays: WorkBayData[];
}

export interface WorkBayData {
  id: number;
  status: 'IDLE' | 'BUSY';
  currentJob: string | null;
  startTime: number | null;
  finishTime: number | null;
  expireTime: number | null;
}

export interface ServiceJobData {
  id: string;
  name: string;
  minLevel: number;
  cost: number;
  durationSec: number;
  rewardCoins: number;
  rewardXP: number;
}
