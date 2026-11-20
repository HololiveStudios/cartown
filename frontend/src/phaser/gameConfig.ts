import Phaser from 'phaser';
import { GarageScene } from './scenes/GarageScene';
import { DragRaceScene } from './scenes/DragRaceScene';

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  backgroundColor: '#020617',
  scene: [GarageScene, DragRaceScene]
};
