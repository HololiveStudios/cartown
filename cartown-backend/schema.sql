CREATE TABLE Players (
  id TEXT PRIMARY KEY,
  username TEXT,
  level INTEGER,
  xp INTEGER,
  coins INTEGER,
  cash INTEGER,
  garageValue INTEGER
);

CREATE TABLE Player_Cars (
  id TEXT PRIMARY KEY,
  player_id TEXT,
  model_id TEXT,
  color_hex TEXT,
  is_equipped BOOLEAN
);

CREATE TABLE Player_Bays (
  id INTEGER,
  player_id TEXT,
  status TEXT,
  job_id TEXT,
  start_time INTEGER,
  finish_time INTEGER,
  PRIMARY KEY(id, player_id)
);

INSERT INTO Players (id, username, level, xp, coins, cash, garageValue) VALUES ('usr_001', 'Piloto #1', 1, 120, 1500, 10, 12000);
INSERT INTO Player_Cars (id, player_id, model_id, color_hex, is_equipped) VALUES ('car_inst_01', 'usr_001', 'car_hatch_98', '0xef4444', true);
INSERT INTO Player_Bays (id, player_id, status, job_id, start_time, finish_time) VALUES (1, 'usr_001', 'IDLE', NULL, NULL, NULL);
