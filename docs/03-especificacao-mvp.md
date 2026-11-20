# Especificação do MVP (Produto Mínimo Viável)

## 1. Escopo das Cenas
- **GarageScene (2.5D Isométrica):**
  - Grid de garagem com elevador funcional (#1).
  - Clique no elevador aciona o timer de serviço e concessão de moedas/XP.
  - Carro interativo na garagem com suporte a troca de cor em tempo real.

- **DragRaceScene (2D Lateral):**
  - Pista de arrancada com linha de partida e chegada.
  - Semáforo sequencial (Amarelos -> Verde).
  - Detecção de tempo de reação (< 0.150s = Perfect Launch).
  - Conta-giros de RPM com troca de marcha (Espaço) na zona verde (6500 a 7500 RPM).

## 2. Comunicação de Estado
- EventBus bidirecional entre Phaser 3 e a UI em React/HTML.
