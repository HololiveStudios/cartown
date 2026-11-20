import Phaser from 'phaser';
import { EventBus } from '../../services/eventBus';

export class GarageScene extends Phaser.Scene {
  private carShadow!: Phaser.GameObjects.Ellipse;
  private bayBadgeContainer!: Phaser.GameObjects.Container;
  private badgeText!: Phaser.GameObjects.Text;
  private badgeIcon!: Phaser.GameObjects.Text;
  private badgeBg!: Phaser.GameObjects.Arc;
  private bayState: 'IDLE' | 'BUSY' | 'FINISHED' = 'IDLE';
  private carBaseY = 0;
  private carBaseX = 0;

  constructor() {
    super('GarageScene');
  }

  preload() {
    this.load.image('garage_bg', '/assets/garage_cartown.jpg');
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    // 1. Background Car Town Isometric Garage
    const bg = this.add.image(w / 2, h / 2, 'garage_bg');
    const scale = Math.max(w / bg.width, h / bg.height);
    bg.setScale(scale).setScrollFactor(0);

    // Coordinate of Bay #1 (First yellow lift)
    this.carBaseX = w * 0.38;
    this.carBaseY = h * 0.56;

    // 2. Car Shadow
    this.carShadow = this.add.ellipse(this.carBaseX, this.carBaseY + 45, 120, 50, 0x000000, 0.35);

    // 4. Car Town Style Floating Service Badge
    this.bayBadgeContainer = this.add.container(this.carBaseX - 30, this.carBaseY - 95);

    this.badgeBg = this.add.circle(0, 0, 38, 0x2563eb, 0.95);
    this.badgeBg.setStrokeStyle(3, 0xffffff);

    this.badgeIcon = this.add.text(0, -6, '🔧', { fontSize: '24px' }).setOrigin(0.5);
    this.badgeText = this.add.text(0, 24, 'SERVIÇO', { 
      fontSize: '11px', 
      fontStyle: 'bold', 
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.bayBadgeContainer.add([this.badgeBg, this.badgeIcon, this.badgeText]);

    // Floating bounce animation (Classic Car Town feel)
    this.tweens.add({
      targets: this.bayBadgeContainer,
      y: this.bayBadgeContainer.y - 8,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 5. RELIABLE HITBOXES USING PHASER ZONES (Directly in world coordinates)
    // Badge clickable area:
    const badgeHitZone = this.add.zone(this.carBaseX - 30, this.carBaseY - 95, 100, 100);
    badgeHitZone.setOrigin(0.5);
    badgeHitZone.setInteractive({ useHandCursor: true });
    badgeHitZone.on('pointerdown', () => this.handleBayClick());

    // Elevator & Car clickable area:
    const carHitZone = this.add.zone(this.carBaseX, this.carBaseY, 180, 180);
    carHitZone.setOrigin(0.5);
    carHitZone.setInteractive({ useHandCursor: true });
    carHitZone.on('pointerdown', () => this.handleBayClick());

    const onCarModelClick = () => this.handleBayClick();
    EventBus.on('CAR_MODEL_CLICKED', onCarModelClick);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off('CAR_MODEL_CLICKED', onCarModelClick);
    });

    // Event listeners
    EventBus.on('WORKBAY_JOB_STARTED', (data: { bayId: number; durationSec: number }) => {
      this.startJobTimer(data.durationSec);
    });

    EventBus.on('WORKBAY_CLAIMED', () => {
      this.setBayIdle();
    });

    EventBus.on('SYNC_WORKBAY_STATE', (data: { status: string; remainingTimeMs: number }) => {
      if (data.status === 'BUSY') {
        if (data.remainingTimeMs <= 0) {
          this.markFinished();
        } else {
          this.startJobTimer(Math.ceil(data.remainingTimeMs / 1000));
        }
      } else {
        this.setBayIdle();
      }
    });

    this.setBayIdle();
  }

  handleBayClick() {
    console.log('[GarageScene] Bay clicked, state:', this.bayState);
    if (this.bayState === 'BUSY') {
      EventBus.emit('SHOW_NOTIFICATION', { title: '⏳ AGUARDE', subtitle: 'Serviço em andamento no elevador...' });
    } else if (this.bayState === 'FINISHED') {
      EventBus.emit('CLAIM_WORKBAY', { bayId: 1 });
    } else {
      EventBus.emit('OPEN_WORKBAY_MODAL', { bayId: 1 });
    }
  }

  setBayIdle() {
    this.bayState = 'IDLE';
    this.badgeBg.setFillStyle(0x2563eb, 0.95);
    this.badgeIcon.setText('🔧');
    this.badgeText.setText('SERVIÇO');

    // Lower the car back down
    EventBus.emit('CAR_LIFT_STATE', false);
    this.tweens.add({
      targets: this.carShadow,
      scaleX: 1,
      scaleY: 1,
      alpha: 0.35,
      duration: 600
    });
  }

  startJobTimer(durationSec: number) {
    this.bayState = 'BUSY';
    this.badgeBg.setFillStyle(0xeab308, 0.95);
    this.badgeIcon.setText('⏱️');
    this.badgeText.setText(`${durationSec}s`);

    // Raise the car on the lift! (Real mechanic animation)
    EventBus.emit('CAR_LIFT_STATE', true);
    this.tweens.add({
      targets: this.carShadow,
      scaleX: 0.7,
      scaleY: 0.7,
      alpha: 0.2,
      duration: 800
    });

    let remaining = durationSec;
    this.time.addEvent({
      delay: 1000,
      repeat: durationSec - 1,
      callback: () => {
        remaining--;
        if (remaining > 0) {
          this.badgeText.setText(`${remaining}s`);
        } else {
          this.markFinished();
        }
      }
    });
  }

  markFinished() {
    this.bayState = 'FINISHED';
    this.badgeBg.setFillStyle(0x16a34a, 0.95);
    this.badgeIcon.setText('💰');
    this.badgeText.setText('COLETAR');

    // Celebration pulse on badge
    this.tweens.add({
      targets: this.bayBadgeContainer,
      scaleX: 1.25,
      scaleY: 1.25,
      duration: 400,
      yoyo: true,
      repeat: 3
    });

    EventBus.emit('SHOW_NOTIFICATION', { 
      title: '✅ SERVIÇO CONCLUÍDO!', 
      subtitle: 'Clique no elevador ou no selo para recolher suas Moedas e XP!' 
    });
  }
}
