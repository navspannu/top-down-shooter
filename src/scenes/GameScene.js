import { CANVAS_W, CANVAS_H, PALETTE } from '../config.js';
import { switchScene } from '../core/SceneManager.js';
import Player from '../entities/Player.js';
import WaveSystem from '../systems/WaveSystem.js';
import ParticleSystem from '../systems/ParticleSystem.js';
import { resolveCollisions } from '../systems/CollisionSystem.js';
import Renderer from '../rendering/Renderer.js';
import HUD, { drawPixelText } from '../rendering/HUD.js';
import EventBus from '../core/EventBus.js';

const WAVE_PAUSE = 2.0;
const DEATH_SCENE_DELAY = 1.5;

export default {
  player: null,
  enemies: [],
  waveSystem: null,
  particles: null,
  renderer: null,
  hud: null,
  score: 0,
  level: 1,
  wavePauseTimer: 0,
  wavePauseActive: false,
  wavePauseText: '',
  deathTimer: 0,
  gameOverTriggered: false,
  prevHp: 100,

  init(data) {
    this.level = data.level || 1;
    this.score = data.score || 0;
    this.enemies = [];
    this.player = new Player();
    this.waveSystem = new WaveSystem();
    this.waveSystem.init(this.level);
    this.particles = new ParticleSystem();
    this.renderer = new Renderer(null);
    this.hud = new HUD();
    this.hud.displayedHp = this.player.hp;
    this.hud.displayedScore = this.score;
    this.wavePauseActive = false;
    this.wavePauseTimer = 0;
    this.deathTimer = 0;
    this.gameOverTriggered = false;
    this.prevHp = this.player.hp;
    EventBus.clear();
  },

  update(dt) {
    const player = this.player;
    const particles = this.particles;
    const ws = this.waveSystem;

    // Player update
    player.update(dt);
    player.updateBullets(dt);

    // Detect player taking damage this frame
    if (player.hp < this.prevHp) {
      this.renderer.flash('rgba(220,0,0,0.3)', 0.2);
      this.renderer.shake(7);
    }
    this.prevHp = player.hp;

    // Game over delay
    if (!player.alive) {
      this.deathTimer += dt;
      particles.update(dt);
      this.renderer.update(dt);
      this.hud.update(dt, player, this.score);
      if (this.deathTimer >= DEATH_SCENE_DELAY && !this.gameOverTriggered) {
        this.gameOverTriggered = true;
        const hs = parseInt(localStorage.getItem('highScore') || '0', 10);
        const newHs = Math.max(this.score, hs);
        if (this.score > hs) localStorage.setItem('highScore', String(this.score));
        switchScene('gameover', { score: this.score, level: this.level, highScore: newHs });
      }
      return;
    }

    // Wave pause between waves
    if (this.wavePauseActive) {
      this.wavePauseTimer -= dt;
      if (this.wavePauseTimer <= 0) {
        this.wavePauseActive = false;
        ws.nextWave(this.enemies);
        if (ws.done) {
          switchScene('levelcomplete', { level: this.level, score: this.score });
          return;
        }
      }
      particles.update(dt);
      this.renderer.update(dt);
      this.hud.update(dt, player, this.score);
      return;
    }

    // Spawn enemies
    ws.update(dt, this.enemies, player.x, player.y);

    // Update enemies
    for (const enemy of this.enemies) {
      if (enemy.setTarget) enemy.setTarget(player.x, player.y);
      enemy.update(dt);
      if (enemy.bullets) {
        enemy.bullets.forEach(b => b.update(dt));
        enemy.bullets = enemy.bullets.filter(b => b.active);
      }
    }

    // Score newly dead enemies
    for (const enemy of this.enemies) {
      if (enemy.dead && !enemy._scoredDeath) {
        enemy._scoredDeath = true;
        this.score += enemy.scoreValue;
        const colorMap = { runner: 'RED', tank: 'STEEL', shooter: 'PURPLE' };
        particles.spawnDeathBurst(enemy.x, enemy.y, colorMap[enemy.spriteKey] || 'ORANGE', 14);
        particles.spawnScoreFloat(enemy.x, enemy.y - 20, enemy.scoreValue);
        this.renderer.shake(3);
      }
    }

    this.enemies = this.enemies.filter(e => e.active);

    // Collision
    resolveCollisions(player, this.enemies, particles);

    // Check wave complete
    if (ws.isWaveComplete(this.enemies) && !this.wavePauseActive) {
      this.wavePauseActive = true;
      this.wavePauseTimer = WAVE_PAUSE;
      const nextIdx = ws.waveIndex + 1;
      const totalWaves = ws.totalWaves;
      this.wavePauseText = nextIdx >= totalWaves ? 'LEVEL CLEAR!' : 'WAVE ' + (ws.currentWave) + ' CLEAR!';
    }

    particles.update(dt);
    this.renderer.update(dt);
    this.hud.update(dt, player, this.score);
  },

  render(ctx) {
    this.renderer.ctx = ctx;
    this.renderer.beginFrame();

    // Enemy bullets
    for (const enemy of this.enemies) {
      if (enemy.bullets) enemy.bullets.forEach(b => b.draw(ctx));
    }

    // Enemies
    for (const enemy of this.enemies) enemy.draw(ctx);

    // Player bullets
    this.player.drawBullets(ctx);

    // Player
    this.player.draw(ctx);

    // Particles
    this.particles.draw(ctx);

    // Wave pause banner
    if (this.wavePauseActive) {
      const alpha = Math.min(1, (WAVE_PAUSE - this.wavePauseTimer) * 5);
      ctx.globalAlpha = alpha;
      const text = this.wavePauseText;
      drawPixelText(ctx, text, CANVAS_W / 2 - text.length * 9, CANVAS_H / 2 - 12, 3, PALETTE.YELLOW);
      ctx.globalAlpha = 1;
    }

    this.renderer.endFrame();

    // HUD (on top of post-processing)
    const ws = this.waveSystem;
    const player = this.player;
    const reloadPct = player.reloading && player.reloadTimer > 0
      ? 1 - player.reloadTimer / 1.4
      : 0;
    this.hud.draw(ctx, player, this.score, this.level,
      ws.currentWave, ws.totalWaves, player.reloading, Math.max(0, Math.min(1, reloadPct)));
  },

  destroy() {
    EventBus.clear();
  },
};
