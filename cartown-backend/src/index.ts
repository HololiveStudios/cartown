import { Hono } from 'hono';
import { cors } from 'hono/cors';

export interface Env {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Env }>();

app.use('/api/*', cors());

const SERVICE_JOBS = {
  'wash_car': { id: 'wash_car', name: 'Lavar Carro', minLevel: 1, cost: 50, durationSec: 10, rewardCoins: 120, rewardXP: 15 },
  'oil_change': { id: 'oil_change', name: 'Trocar Óleo', minLevel: 1, cost: 120, durationSec: 300, rewardCoins: 280, rewardXP: 35 },
  'brake_check': { id: 'brake_check', name: 'Ajustar Freios', minLevel: 2, cost: 300, durationSec: 900, rewardCoins: 650, rewardXP: 80 },
  'alignment': { id: 'alignment', name: 'Alinhamento', minLevel: 3, cost: 600, durationSec: 1800, rewardCoins: 1350, rewardXP: 160 },
  'belt_replacement': { id: 'belt_replacement', name: 'Trocar Correia', minLevel: 5, cost: 1200, durationSec: 3600, rewardCoins: 2800, rewardXP: 320 }
};

async function getFullPlayer(db: D1Database, playerId: string) {
  const player = await db.prepare('SELECT * FROM Players WHERE id = ?').bind(playerId).first();
  const bays = await db.prepare('SELECT * FROM Player_Bays WHERE player_id = ?').bind(playerId).all();
  const cars = await db.prepare('SELECT * FROM Player_Cars WHERE player_id = ?').bind(playerId).all();

  if (!player) return null;

  return {
    ...player,
    workBays: bays.results.map((b: any) => ({
      id: b.id,
      status: b.status,
      currentJob: b.job_id,
      startTime: b.start_time,
      finishTime: b.finish_time,
      expireTime: b.finish_time
    })),
    cars: cars.results.map((c: any) => ({
      instanceId: c.id,
      modelId: c.model_id,
      colorHex: c.color_hex,
      equippedWheels: 'wheel_stock'
    }))
  };
}

app.get('/api/player', async (c) => {
  const fullPlayer = await getFullPlayer(c.env.DB, 'usr_001');
  if (!fullPlayer) return c.json({ success: false, error: 'Player not found' }, 404);
  
  // Transform colorHex string '0xef4444' back to number for frontend compatibility
  if (fullPlayer.cars[0] && typeof fullPlayer.cars[0].colorHex === 'string') {
     fullPlayer.carColor = parseInt(fullPlayer.cars[0].colorHex, 16);
  } else {
     fullPlayer.carColor = 0xef4444;
  }

  return c.json({ success: true, player: fullPlayer });
});

app.get('/api/jobs', (c) => {
  return c.json({ success: true, jobs: SERVICE_JOBS });
});

app.post('/api/workbay/start', async (c) => {
  const { bayId, jobId } = await c.req.json();
  const playerId = 'usr_001';
  const job = (SERVICE_JOBS as any)[jobId];
  if (!job) return c.json({ success: false, error: 'Invalid job' }, 400);

  const player = await c.env.DB.prepare('SELECT coins FROM Players WHERE id = ?').bind(playerId).first();
  if (!player || (player.coins as number) < job.cost) return c.json({ success: false, error: 'Not enough coins' }, 400);

  const now = Date.now();
  const finishTime = now + (job.durationSec * 1000);

  await c.env.DB.prepare('UPDATE Players SET coins = coins - ? WHERE id = ?').bind(job.cost, playerId).run();
  await c.env.DB.prepare('UPDATE Player_Bays SET status = ?, job_id = ?, start_time = ?, finish_time = ? WHERE id = ? AND player_id = ?')
    .bind('BUSY', jobId, now, finishTime, bayId, playerId).run();

  const updatedPlayer = await getFullPlayer(c.env.DB, playerId);
  return c.json({ success: true, player: updatedPlayer });
});

app.post('/api/workbay/claim', async (c) => {
  const { bayId } = await c.req.json();
  const playerId = 'usr_001';

  const bay = await c.env.DB.prepare('SELECT * FROM Player_Bays WHERE id = ? AND player_id = ?').bind(bayId, playerId).first();
  if (!bay || bay.status !== 'BUSY') return c.json({ success: false, error: 'Bay not busy' }, 400);

  const now = Date.now();
  if (now < (bay.finish_time as number)) return c.json({ success: false, error: 'Job not finished' }, 400);

  const job = (SERVICE_JOBS as any)[bay.job_id as string];
  
  await c.env.DB.prepare('UPDATE Players SET coins = coins + ?, xp = xp + ? WHERE id = ?').bind(job.rewardCoins, job.rewardXP, playerId).run();
  
  // check level up logic (simplified: 300 xp per level)
  const player = await c.env.DB.prepare('SELECT level, xp, cash FROM Players WHERE id = ?').bind(playerId).first();
  const reqXp = (player.level as number) * 300;
  if ((player.xp as number) >= reqXp) {
    await c.env.DB.prepare('UPDATE Players SET level = level + 1, xp = xp - ?, cash = cash + 2 WHERE id = ?').bind(reqXp, playerId).run();
  }

  await c.env.DB.prepare('UPDATE Player_Bays SET status = ?, job_id = NULL, start_time = NULL, finish_time = NULL WHERE id = ? AND player_id = ?')
    .bind('IDLE', bayId, playerId).run();

  const updatedPlayer = await getFullPlayer(c.env.DB, playerId);
  return c.json({ success: true, player: updatedPlayer, rewards: { coins: job.rewardCoins, xp: job.rewardXP } });
});

app.post('/api/race/finish', async (c) => {
  // simple mock verification
  const playerId = 'usr_001';
  const rewardCoins = 200;
  const rewardXP = 50;

  await c.env.DB.prepare('UPDATE Players SET coins = coins + ?, xp = xp + ? WHERE id = ?').bind(rewardCoins, rewardXP, playerId).run();
  
  const player = await c.env.DB.prepare('SELECT level, xp, cash FROM Players WHERE id = ?').bind(playerId).first();
  const reqXp = (player.level as number) * 300;
  if ((player.xp as number) >= reqXp) {
    await c.env.DB.prepare('UPDATE Players SET level = level + 1, xp = xp - ?, cash = cash + 2 WHERE id = ?').bind(reqXp, playerId).run();
  }

  const updatedPlayer = await getFullPlayer(c.env.DB, playerId);
  return c.json({ success: true, player: updatedPlayer });
});

app.post('/api/car/customize', async (c) => {
  const { colorHex } = await c.req.json();
  const playerId = 'usr_001';
  // convert number like 15680580 to hex string '0xef4444' if needed, or just store as string
  const hexStr = typeof colorHex === 'number' ? '0x' + colorHex.toString(16) : colorHex;
  await c.env.DB.prepare('UPDATE Player_Cars SET color_hex = ? WHERE player_id = ?').bind(hexStr, playerId).run();
  return c.json({ success: true });
});

export default app;
