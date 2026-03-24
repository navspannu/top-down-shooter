import AssetStore from '../core/AssetStore.js';

export default class EnemyBase {
  constructor(x, y, config, spriteKey) {
    this.x = x;
    this.y = y;
    this.hp = config.HP;
    this.maxHp = config.HP;
    this.speed = config.SPEED;
    this.radius = config.RADIUS;
    this.scoreValue = config.SCORE;
    this.spriteKey = spriteKey;
    this.active = true;
    this.dead = false;

    this.angle = 0;
    this.hitFlash = 0;

    // Animation
    this.animState = 'idle';
    this.frameIndex = 0;
    this.frameTimer = 0;
    this.frameDuration = 0.25;

    // Death animation
    this.deathTimer = 0;
    this.deathDuration = 0.45;
    this.deathFrameIndex = 0;
    this.deathFrameTimer = 0;

    this.bullets = []; // for shooter type
  }

  takeDamage(amt) {
    if (this.dead) return;
    this.hp -= amt;
    this.hitFlash = 0.12;
    if (this.hp <= 0) this._die();
  }

  _die() {
    this.dead = true;
    this.animState = 'death';
    this.deathFrameIndex = 0;
    this.deathFrameTimer = 0;
  }

  update(dt) {
    this.hitFlash = Math.max(0, this.hitFlash - dt);

    if (this.dead) {
      this.deathFrameTimer += dt;
      const frames = AssetStore.sprites[this.spriteKey]?.death || [];
      const dur = this.deathDuration / Math.max(1, frames.length);
      if (this.deathFrameTimer >= dur) {
        this.deathFrameTimer -= dur;
        this.deathFrameIndex++;
        if (this.deathFrameIndex >= frames.length) {
          this.active = false;
        }
      }
      return;
    }

    this._updateAnim(dt);
    this._move(dt);
  }

  _move(dt) {} // Override in subclasses

  _updateAnim(dt) {
    const frames = AssetStore.sprites[this.spriteKey]?.[this.animState] || [];
    if (frames.length === 0) return;
    this.frameTimer += dt;
    if (this.frameTimer >= this.frameDuration) {
      this.frameTimer -= this.frameDuration;
      this.frameIndex = (this.frameIndex + 1) % frames.length;
    }
  }

  draw(ctx) {
    const sprites = AssetStore.sprites[this.spriteKey];
    if (!sprites) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    if (this.dead) {
      const frames = sprites.death || [];
      const frame = frames[Math.min(this.deathFrameIndex, frames.length - 1)];
      if (frame) {
        const alpha = 1 - this.deathFrameIndex / Math.max(1, frames.length - 1);
        ctx.globalAlpha = alpha;
        ctx.drawImage(frame, -frame.width / 2, -frame.height / 2);
      }
    } else {
      const frames = sprites[this.animState] || sprites.idle;
      const frame = frames?.[this.frameIndex];
      if (frame) {
        ctx.drawImage(frame, -frame.width / 2, -frame.height / 2);
      }

      // Hit flash overlay — white circle at reduced opacity
      if (this.hitFlash > 0) {
        ctx.globalAlpha = (this.hitFlash / 0.12) * 0.75;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    ctx.restore();

    // Health bar (only when alive and damaged)
    if (!this.dead && this.hp < this.maxHp) {
      this._drawHealthBar(ctx);
    }
  }

  _drawHealthBar(ctx) {
    const w = this.radius * 2.5;
    const h = 4;
    const x = this.x - w / 2;
    const y = this.y - this.radius - 10;
    const pct = this.hp / this.maxHp;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = pct > 0.6 ? '#4ecb71' : pct > 0.3 ? '#f4d35e' : '#e63946';
    ctx.fillRect(x, y, w * pct, h);
  }
}
