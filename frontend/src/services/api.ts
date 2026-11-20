import { PlayerStateData, ServiceJobData } from '../types/game';

const API_BASE = 'https://cartown-backend.ca88321499.workers.dev/api';

export async function fetchPlayerData(): Promise<PlayerStateData | null> {
  try {
    const res = await fetch(`${API_BASE}/player`);
    const data = await res.json();
    return data.success ? data.player : null;
  } catch (e) {
    return null;
  }
}

export async function fetchServiceJobs(): Promise<Record<string, ServiceJobData> | null> {
  try {
    const res = await fetch(`${API_BASE}/jobs`);
    const data = await res.json();
    return data.success ? data.jobs : null;
  } catch (e) {
    return null;
  }
}

export async function startWorkBayJob(bayId: number, jobId: string) {
  try {
    const res = await fetch(`${API_BASE}/workbay/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bayId, jobId })
    });
    return await res.json();
  } catch (e) {
    return { success: false, error: 'Erro de conexão com o servidor.' };
  }
}

export async function claimWorkBayJob(bayId: number) {
  try {
    const res = await fetch(`${API_BASE}/workbay/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bayId })
    });
    return await res.json();
  } catch (e) {
    return { success: false };
  }
}

export async function finishRace() {
  try {
    const res = await fetch(`${API_BASE}/race/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return await res.json();
  } catch (e) {
    return { success: false };
  }
}

export async function customizeCar(colorHex: number) {
  try {
    const res = await fetch(`${API_BASE}/car/customize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ colorHex })
    });
    return await res.json();
  } catch (e) {
    return { success: false };
  }
}
