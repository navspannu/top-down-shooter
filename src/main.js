import { CANVAS_W, CANVAS_H } from './config.js';
import { initInput } from './core/InputHandler.js';
import * as SceneManager from './core/SceneManager.js';
import { generateAll } from './rendering/SpriteFactory.js';

import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import LevelCompleteScene from './scenes/LevelCompleteScene.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Size canvas, keep aspect ratio on small screens
function resize() {
  const scale = Math.min(window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H);
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  canvas.style.width = Math.floor(CANVAS_W * scale) + 'px';
  canvas.style.height = Math.floor(CANVAS_H * scale) + 'px';
}
resize();
window.addEventListener('resize', resize);

// Init subsystems
initInput(canvas);
generateAll(); // pre-render all sprite frames

// Register scenes
SceneManager.registerScene('menu', MenuScene);
SceneManager.registerScene('game', GameScene);
SceneManager.registerScene('gameover', GameOverScene);
SceneManager.registerScene('levelcomplete', LevelCompleteScene);

SceneManager.switchScene('menu');

let last = 0;
const MAX_DT = 0.05;

function loop(ts) {
  const dt = Math.min((ts - last) / 1000, MAX_DT);
  last = ts;

  SceneManager.update(dt);
  SceneManager.render(ctx);

  requestAnimationFrame(loop);
}

requestAnimationFrame(ts => { last = ts; requestAnimationFrame(loop); });
