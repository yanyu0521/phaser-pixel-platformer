import Phaser from 'phaser';
import PlatformerScene from './scenes/PlatformerScene.js';
import './style.css';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#c7f0ee',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1100 },
      debug: false,
    },
  },
  scale: {
    width: 960,
    height: 540,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [PlatformerScene],
});
