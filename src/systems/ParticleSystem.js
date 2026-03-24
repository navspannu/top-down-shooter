import { PALETTE } from '../config.js';

class Particle {
  constructor(x, y, vx, vy, color, lifetime, size) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.lifetime = lifetime;
    this.maxLifetime = lifetime;
    this.size = size;
  }
  get active() { return this.lifetime > 0; }
}

export default class ParticleSystem {
  constructor() {
    this.particles = [];
    this.scoreFloats = [];
  }

  spawnHitSpark(x, y) {
    const colors = ['YELLOW', 'ORANGE', 'WHITE'];
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 100;
      this.particles.push(new Particle(
        x, y,
        Math.cos(angle) * speed, Math.sin(angle) * speed,
        PALETTE[colors[Math.floor(Math.random() * colors.length)]],
        0.25 + Math.random() * 0.15,
        2 + Math.random() * 2
      ));
    }
  }

  spawnDeathBurst(x, y, colorKey, count = 12) {
    const colors = [colorKey, 'ORANGE', 'YELLOW', 'WHITE'];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 40 + Math.random() * 120;
      this.particles.push(new Particle(
        x, y,
        Math.cos(angle) * speed, Math.sin(angle) * speed,
        PALETTE[colors[Math.floor(Math.random() * colors.length)]],
        0.4 + Math.random() * 0.3,
        3 + Math.random() * 3
      ));
    }
  }

  spawnScoreFloat(x, y, text) {
    this.scoreFloats.push({ x, y, text, timer: 1.0, vy: -40 });
  }

  update(dt) {
    for (const p of this.particles) {
      if (!p.active) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 80 * dt; // gravity
      p.lifetime -= dt;
    }
    this.particles = this.particles.filter(p => p.active);

    for (const sf of this.scoreFloats) {
      sf.y += sf.vy * dt;
      sf.timer -= dt;
    }
    this.scoreFloats = this.scoreFloats.filter(sf => sf.timer > 0);
  }

  draw(ctx) {
    for (const p of this.particles) {
      if (!p.active) continue;
      ctx.globalAlpha = Math.min(1, p.lifetime / p.maxLifetime);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    // Score floats
    ctx.font = 'bold 14px monospace';
    for (const sf of this.scoreFloats) {
      ctx.globalAlpha = Math.min(1, sf.timer / 0.5);
      ctx.fillStyle = PALETTE.YELLOW;
      ctx.fillText('+' + sf.text, sf.x, sf.y);
    }
    ctx.globalAlpha = 1;
  }

  clear() {
    this.particles = [];
    this.scoreFloats = [];
  }
}
