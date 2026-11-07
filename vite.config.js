import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  // GitHub Pages hosts this project below /<repository-name>/.
  base: command === 'build' ? '/phaser-pixel-platformer/' : '/',
}));
