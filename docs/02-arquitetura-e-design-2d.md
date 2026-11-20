# Arquitetura Híbrida: Cenário 2D e Carro 3D

## 1. Cenário e veículos
O cenário da garagem continua sendo uma ilustração isométrica 2D carregada no Phaser. O carro do jogador é uma cena 3D leve, renderizada pelo Three.js em um canvas transparente sobre a vaga. A câmera ortográfica mantém a perspectiva de brinquedo estilizado, enquanto luzes e geometria facetada dão volume.

O primeiro carro é montado com primitivas low-poly no próprio código e recebe a cor via material do Three.js. Arrastar o carro gira o modelo; clicar nele abre as ações do elevador. A troca de cena via EventBus comunica cor e estado do elevador ao visual 3D. O renderizador é liberado ao desmontar o componente.

Este protótipo estabelece o fluxo 3D sem depender de um arquivo GLB externo. A próxima etapa visual pode substituir a geometria provisória por um modelo autoral GLB e adicionar UVs, decalques, carrocerias e peças intercambiáveis.

## 2. UI Híbrida: Canvas + HTML/Tailwind
- **Canvas (Phaser 3):** Cenário e fluxo de cenas do jogo, semáforo da corrida, zonas de clique e timers (`z-index: 10`).
- **Canvas (Three.js):** Carro 3D transparente sobre a garagem (`z-index: 15`), com interação encaminhada ao Phaser pelo EventBus.
- **Overlay HTML/Tailwind:** HUD de moedas, modais, formulários e botão de troca de marcha (`z-index: 20` com `pointer-events: none` no container geral).
