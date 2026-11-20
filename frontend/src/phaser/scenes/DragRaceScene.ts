import Phaser from 'phaser';
import { EventBus } from '../../services/eventBus';

export class DragRaceScene extends Phaser.Scene {
  private playerCar!: Phaser.GameObjects.Container;
  private rivalCar!: Phaser.GameObjects.Container;
  private playerCarSprite!: Phaser.GameObjects.Image;
  private y1!: Phaser.GameObjects.Arc;
  private y2!: Phaser.GameObjects.Arc;
  private y3!: Phaser.GameObjects.Arc;
  private green!: Phaser.GameObjects.Arc;

  private raceState: 'IDLE' | 'COUNTDOWN' | 'GREEN' | 'RACING' | 'FOUL' | 'FINISHED' = 'IDLE';
  private greenTime = 0;
  private currentRPM = 1000;
  private currentGear = 1;
  private rivalSpeed = 160;

  constructor() {
    super('DragRaceScene');
  }

  preload() {
    this.load.image('drag_strip', '/assets/drag_strip.jpg');
    this.load.image('car_side', '/assets/car_side.png');
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    // 1. Background Car Town Drag Strip
    const bg = this.add.image(w / 2, h / 2, 'drag_strip');
    const scale = Math.max(w / bg.width, h / bg.height);
    bg.setScale(scale).setScrollFactor(0);

    // 2. Asphalt track strip overlay for racing lane
    const trackY = h - 90;
    const rivalY = h - 160;

    // 3. Rival Car (Blue Chibi)
    this.rivalCar = this.add.container(100, rivalY);
    const rivalSprite = this.add.image(0, 0, 'car_side');
    rivalSprite.setScale(0.22);
    rivalSprite.setTint(0x3b82f6); // Rival is blue
    this.rivalCar.add([rivalSprite]);

    // 4. Player Car (Chibi with customizable tint)
    this.playerCar = this.add.container(100, trackY);
    this.playerCarSprite = this.add.image(0, 0, 'car_side');
    this.playerCarSprite.setScale(0.24);
    this.playerCar.add([this.playerCarSprite]);

    // Ouve troca de cor
    EventBus.on('CHANGE_CAR_COLOR', (color: number) => {
      this.playerCarSprite.setTint(color);
    });

    // 5. Semáforo (Christmas Tree)
    const treeX = 180;
    const treeY = 160;
    this.add.rectangle(treeX, treeY, 56, 170, 0x0f172a, 0.9).setStrokeStyle(3, 0xfacc15);
    this.y1 = this.add.circle(treeX, treeY - 50, 14, 0x334155);
    this.y2 = this.add.circle(treeX, treeY - 15, 14, 0x334155);
    this.y3 = this.add.circle(treeX, treeY + 20, 14, 0x334155);
    this.green = this.add.circle(treeX, treeY + 58, 16, 0x334155);

    // Keyboard & UI Shift triggers
    this.input.keyboard?.on('keydown-SPACE', () => this.handleAction());
    EventBus.on('PLAYER_SHIFT_INPUT', () => this.handleAction());

    this.startRaceSequence();
  }

  startRaceSequence() {
    this.raceState = 'COUNTDOWN';
    EventBus.emit('SHOW_NOTIFICATION', { title: '🚦 PREPARE-SE...', subtitle: 'Acelere no sinal VERDE!' });

    this.time.delayedCall(600, () => { if (this.raceState === 'COUNTDOWN') this.y1.setFillStyle(0xeab308); });
    this.time.delayedCall(1200, () => { if (this.raceState === 'COUNTDOWN') this.y2.setFillStyle(0xeab308); });
    this.time.delayedCall(1800, () => { if (this.raceState === 'COUNTDOWN') this.y3.setFillStyle(0xeab308); });
    this.time.delayedCall(2400, () => {
      if (this.raceState === 'COUNTDOWN') {
        this.raceState = 'GREEN';
        this.green.setFillStyle(0x22c55e);
        this.greenTime = this.time.now;
        EventBus.emit('SHOW_NOTIFICATION', { title: '🔥 ACELERE! (GO!)', subtitle: 'Pressione ESPAÇO para arrancar!' });
      }
    });
  }

  handleAction() {
    if (this.raceState === 'COUNTDOWN') {
      this.raceState = 'FOUL';
      this.y1.setFillStyle(0xef4444);
      this.y2.setFillStyle(0xef4444);
      this.y3.setFillStyle(0xef4444);
      EventBus.emit('SHOW_NOTIFICATION', { title: '❌ QUEIMOU A LARGADA!', subtitle: 'Você acelerou antes do verde!' });
      return;
    }
    if (this.raceState === 'GREEN') {
      this.raceState = 'RACING';
      const rx = ((this.time.now - this.greenTime) / 1000).toFixed(3);
      EventBus.emit('SHOW_NOTIFICATION', { title: `🟢 LARGADA! (${rx}s)`, subtitle: 'Troque de marcha na faixa verde!' });
      EventBus.emit('SHOW_RPM_GAUGE', true);
      return;
    }
    if (this.raceState === 'RACING') {
      this.shiftGear();
    }
  }

  shiftGear() {
    if (this.currentGear >= 4) return;
    const rpm = this.currentRPM;
    let boost = 1.0;
    let msg = 'TROCA NORMAL';

    if (rpm >= 6500 && rpm <= 7500) {
      boost = 1.45;
      msg = '⚡ PERFECT SHIFT!';
    } else if (rpm < 6500) {
      boost = 0.85;
      msg = '⚠️ TROCOU CEDO';
    } else {
      boost = 0.75;
      msg = '❌ TROCA TARDIA';
    }

    this.currentGear++;
    this.currentRPM = 3600;
    this.playerCar.x += 80 * boost;

    // Small cartoon hop/shake on gear change
    this.tweens.add({
      targets: this.playerCar,
      y: this.playerCar.y - 12,
      duration: 100,
      yoyo: true
    });

    EventBus.emit('SHIFT_FEEDBACK', { gear: this.currentGear, feedback: msg });

    if (this.currentGear === 4 || this.playerCar.x > this.scale.width - 180) {
      this.finishRace();
    }
  }

  update(_time: number, delta: number) {
    if (this.raceState !== 'RACING') return;

    // Player RPM progression
    this.currentRPM += (35 / this.currentGear);
    if (this.currentRPM >= 8000) this.currentRPM = 7800;

    // Player movement
    this.playerCar.x += (this.currentGear * 75 + this.currentRPM / 70) * (delta / 1000);

    // Rival AI movement
    this.rivalCar.x += this.rivalSpeed * (delta / 1000);

    EventBus.emit('UPDATE_RPM_UI', { rpm: Math.floor(this.currentRPM), gear: this.currentGear });

    if (this.playerCar.x >= this.scale.width - 140) {
      this.finishRace();
    }
  }

  finishRace() {
    if (this.raceState === 'FINISHED') return;
    this.raceState = 'FINISHED';

    const playerWon = this.playerCar.x >= this.rivalCar.x;

    EventBus.emit('SHOW_RPM_GAUGE', false);
    if (playerWon) {
      EventBus.emit('SHOW_NOTIFICATION', { 
        title: '🏆 VITÓRIA NA ARRANCADA!', 
        subtitle: '+200 Moedas | +50 XP Recompensas' 
      });
      EventBus.emit('ADD_PLAYER_REWARDS', { coins: 200, xp: 50 });
    } else {
      EventBus.emit('SHOW_NOTIFICATION', { 
        title: '🥈 2º LUGAR!', 
        subtitle: '+50 Moedas de consolo' 
      });
      EventBus.emit('ADD_PLAYER_REWARDS', { coins: 50, xp: 15 });
    }
  }
}
