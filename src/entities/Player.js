import { CANVAS_W, CANVAS_H, PLAYER, BULLET, PALETTE, PIXEL } from '../config.js';
import { getMoveVector, getMouse, consumeClick } from '../core/InputHandler.js';
import AssetStore from '../core/AssetStore.js';
import Bullet from './Bullet.js';

const ANIM_CONFIG = {
  idle:  { frameDuration: 0.4, loop: true },
  walk:  { frameDuration: 0.12, loop: true },
  shoot: { frameDuration: 0.08, loop: false },
  death: { frameDuration: 0.15, loop: false },
};

export default class Player {
  constructor() {
    this.x = CANVAS_W / 2;
    this.y = CANVAS_H / 2;
    this.angle = 0; // gun angle toward mouse
    this.moveAngle = 0; // body facing direction
    this.hp = PLAYER.MAX_HP;
    this.maxHp = PLAYER.MAX_HP;
    this.alive = true;

    this.shootCooldown = 0;
    this.ammo = PLAYER.MAG_SIZE;
    this.reloading = false;
    this.reloadTimer = 0;

    this.invincibleTimer = 0;

    // Animation
    this.animState = 'idle';
    this.frameIndex = 0;
    this.frameTimer = 0;
    this.gunFrame = 0;
    this.gunTimer = 0;

    // Screen shake (managed by GameScene but stored here)
    this.shakeMag = 0;
    this.shakeDecay = 8;

    this.bullets = [];
    this.justFired = false;
  }

  takeDamage(amt) {
    if (this.invincibleTimer > 0 || !this.alive) return;
    this.hp = Math.max(0, this.hp - amt);
    this.invincibleTimer = PLAYER.INVINCIBLE_TIME;
    if (this.hp <= 0) {
      this.alive = false;
      this._setAnim('death');
    }
  }

  _setAnim(name) {
    if (this.animState === name) return;
    this.animState = name;
    this.frameIndex = 0;
    this.frameTimer = 0;
  }

  update(dt) {
    if (!this.alive) {
      this._advanceAnim(dt);
      return;
    }

    this.invincibleTimer = Math.max(0, this.invincibleTimer - dt);
    this.shootCooldown = Math.max(0, this.shootCooldown - dt);
    this.justFired = false;

    // Movement
    const { dx, dy } = getMoveVector();
    if (dx !== 0 || dy !== 0) {
      this.x = Math.max(20, Math.min(CANVAS_W - 20, this.x + dx * PLAYER.SPEED * dt));
      this.y = Math.max(20, Math.min(CANVAS_H - 20, this.y + dy * PLAYER.SPEED * dt));
      this.moveAngle = Math.atan2(dy, dx);
      this._setAnim('shoot' === this.animState ? 'shoot' : 'walk');
    } else {
      if (this.animState === 'walk') this._setAnim('idle');
    }

    // Aim toward mouse
    const mouse = getMouse();
    this.angle = Math.atan2(mouse.y - this.y, mouse.x - this.x);

    // Reload
    if (this.reloading) {
      this.reloadTimer -= dt;
      if (this.reloadTimer <= 0) {
        this.reloading = false;
        this.ammo = PLAYER.MAG_SIZE;
      }
    }

    // Shoot
    if (!this.reloading) {
      const shooting = mouse.down || consumeClick();
      if (shooting && this.shootCooldown <= 0 && this.ammo > 0) {
        this._fire();
      }
      if (this.ammo <= 0 && !this.reloading) this._startReload();
    }

    // Gun flash
    this.gunTimer -= dt;
    if (this.gunTimer <= 0) this.gunFrame = 0;

    this._advanceAnim(dt);
  }

  _fire() {
    const gx = this.x + Math.cos(this.angle) * PLAYER.GUN_LENGTH;
    const gy = this.y + Math.sin(this.angle) * PLAYER.GUN_LENGTH;
    this.bullets.push(new Bullet(gx, gy, this.angle, PLAYER.BULLET_SPEED, BULLET.DAMAGE, 'player'));
    this.shootCooldown = PLAYER.SHOOT_COOLDOWN;
    this.ammo--;
    this.justFired = true;
    this.gunFrame = 1;
    this.gunTimer = 0.12;
    this._setAnim('shoot');
  }

  _startReload() {
    this.reloading = true;
    this.reloadTimer = PLAYER.RELOAD_TIME;
  }

  _advanceAnim(dt) {
    const cfg = ANIM_CONFIG[this.animState];
    this.frameTimer += dt;
    const frames = AssetStore.sprites.player[this.animState];
    if (this.frameTimer >= cfg.frameDuration) {
      this.frameTimer -= cfg.frameDuration;
      if (cfg.loop) {
        this.frameIndex = (this.frameIndex + 1) % frames.length;
      } else {
        if (this.frameIndex < frames.length - 1) this.frameIndex++;
        else if (this.animState === 'shoot') {
          // Return to walk or idle after shoot anim
          const { dx, dy } = getMoveVector();
          this._setAnim((dx !== 0 || dy !== 0) ? 'walk' : 'idle');
        }
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Blink when invincible
    if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer * 10) % 2 === 0) {
      ctx.globalAlpha = 0.3;
    }

    // Body (rotated to movement direction)
    ctx.save();
    ctx.rotate(this.moveAngle + Math.PI / 2);
    const bodyFrame = AssetStore.sprites.player[this.animState]?.[this.frameIndex]
      || AssetStore.sprites.player.idle[0];
    ctx.drawImage(bodyFrame, -bodyFrame.width / 2, -bodyFrame.height / 2);
    ctx.restore();

    // Gun arm (rotated toward mouse)
    ctx.save();
    ctx.rotate(this.angle);
    const gunFrame = AssetStore.sprites.player.gun[this.gunFrame];
    ctx.drawImage(gunFrame, 4, -gunFrame.height / 2);
    // Muzzle flash
    if (this.gunFrame === 1) {
      const mf = AssetStore.sprites.muzzleFlash;
      ctx.drawImage(mf, PLAYER.GUN_LENGTH - 4, -mf.height / 2);
    }
    ctx.restore();

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  updateBullets(dt) {
    this.bullets.forEach(b => b.update(dt));
    this.bullets = this.bullets.filter(b => b.active);
  }

  drawBullets(ctx) {
    this.bullets.forEach(b => b.draw(ctx));
  }
}
