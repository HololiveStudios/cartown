const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

const SERVICE_JOBS = {
  'wash_car': { id: 'wash_car', name: 'Lavar Carro', minLevel: 1, cost: 50, durationSec: 10, rewardCoins: 120, rewardXP: 15 },
  'oil_change': { id: 'oil_change', name: 'Trocar Óleo', minLevel: 1, cost: 120, durationSec: 300, rewardCoins: 280, rewardXP: 35 },
  'brake_check': { id: 'brake_check', name: 'Ajustar Freios', minLevel: 2, cost: 300, durationSec: 900, rewardCoins: 650, rewardXP: 80 },
  'alignment': { id: 'alignment', name: 'Alinhamento', minLevel: 3, cost: 600, durationSec: 1800, rewardCoins: 1350, rewardXP: 160 },
  'belt_replacement': { id: 'belt_replacement', name: 'Trocar Correia', minLevel: 5, cost: 1200, durationSec: 3600, rewardCoins: 2800, rewardXP: 320 }
};

let dbData = {
  player: {
    id: "usr_001", username: "Piloto #1", level: 1, xp: 120, coins: 1500, cash: 10, garageValue: 12000,
    workBays: [{ id: 1, status: "IDLE", currentJob: null, startTime: null, finishTime: null, expireTime: null }],
    cars: [{ instanceId: "car_inst_01", modelId: "car_hatch_98", colorHex: "0xef4444", equippedWheels: "wheel_stock" }]
  }
};

function loadDatabase() {
  if (fs.existsSync(DB_FILE)) {
    try { dbData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch (err) {}
  } else { saveDatabase(); }
}
function saveDatabase() { fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf8'); }
loadDatabase();

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/player' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, player: dbData.player }));
  }
  if (url.pathname === '/api/jobs' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, jobs: SERVICE_JOBS }));
  }
  if (url.pathname === '/api/workbay/start' && req.method === 'POST') {
    parseJsonBody(req, (body) => {
      const { bayId, jobId } = body;
      const job = SERVICE_JOBS[jobId];
      const bay = dbData.player.workBays.find(b => b.id === Number(bayId));
      if (!job || !bay || bay.status !== 'IDLE' || dbData.player.coins < job.cost) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Ação inválida ou moedas insuficientes.' }));
      }
      dbData.player.coins -= job.cost;
      const now = Date.now();
      bay.status = 'BUSY'; bay.currentJob = job.id; bay.startTime = now;
      bay.finishTime = now + (job.durationSec * 1000); bay.expireTime = bay.finishTime + (job.durationSec * 1000);
      saveDatabase();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, player: dbData.player }));
    });
    return;
  }
  res.writeHead(404); res.end();
});

function parseJsonBody(req, callback) {
  let body = ''; req.on('data', chunk => { body += chunk; });
  req.on('end', () => { try { callback(JSON.parse(body || '{}')); } catch (e) { callback({}); } });
}

server.listen(PORT, () => { console.log(`🚀 SERVIDOR CAR TOWN RODANDO NA PORTA ${PORT}`); });
