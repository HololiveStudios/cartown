# Especificação Backend & WebSockets Anti-Cheat

## 1. Arquitetura do Servidor (Node.js)
- **HTTP REST API:** Endpoints para consultar dados do jogador (`GET /api/player`), listar serviços (`GET /api/jobs`) e gerenciar elevadores (`POST /api/workbay/start`, `POST /api/workbay/claim`).
- **WebSockets Engine:** Validação server-side da largada da corrida de arrancada. O servidor registra o timestamp Unix da luz verde e valida a diferença de tempo no clique do jogador para prevenir cheats locais.
- **Banco de Dados JSON:** Persistência leve e estruturada em `database.json`.
