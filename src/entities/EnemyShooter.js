import EnemyBase from './EnemyBase.js';
import { ENEMIES, BULLET } from '../config.js';
import Bullet from './Bullet.js';

export default class EnemyShooter extends EnemyBase {
  constructor(x, y, speedMult = 1) {
    super(x, y, ENEMIES.SHOOTER, 'shooter');
    this.speed = ENEMIES.SHOOTER.SPEED * speedMult;
    this.chargeTimer = 0;
    this.charging = false;
    this.fireCooldown = 1.0; // initial delay
    this.frameDuration = 0.3;
    this.targetX = 0;
    this.targetY = 0;
  }

  setTarget(x, y) {
    this.targetX = x;
    this.targetY = y;
  }

  update(dt) {
    super.update(dt);
  }

  _move(dt) {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy);
    this.angle = Math.atan2(dy, dx);

    if (dist > ENEMIES.SHOOTER.STOP_RANGE) {
      // Move toward player
      this.charging = false;
      this.animState = 'idle';
      this.x += (dx / dist) * this.speed * dt;
      this.y += (dy / dist) * this.speed * dt;
      this.fireCooldown = Math.max(0, this.fireCooldown - dt);
    } else {
      // In range: charge and fire
      this.fireCooldown -= dt;
      if (this.fireCooldown <= 0 && !this.charging) {
        this.charging = true;
        this.chargeTimer = ENEMIES.SHOOTER.CHARGE_TIME;
        this.animState = 'charge';
      }
      if (this.charging) {
        this.chargeTimer -= dt;
        if (this.chargeTimer <= 0) {
          this._shoot();
          this.charging = false;
          this.fireCooldown = ENEMIES.SHOOTER.FIRE_COOLDOWN;
          this.animState = 'idle';
        }
      }
    }
  }

  _shoot() {
    const angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
    this.bullets.push(new Bullet(this.x, this.y, angle, BULLET.ENEMY_SPEED, BULLET.ENEMY_DAMAGE, 'enemy'));
  }
}
