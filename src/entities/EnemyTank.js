import EnemyBase from './EnemyBase.js';
import { ENEMIES } from '../config.js';

export default class EnemyTank extends EnemyBase {
  constructor(x, y, speedMult = 1) {
    super(x, y, ENEMIES.TANK, 'tank');
    this.speed = ENEMIES.TANK.SPEED * speedMult;
    this.contactCooldown = 0;
    this.frameDuration = 0.35;
    this.targetX = 0;
    this.targetY = 0;
  }

  setTarget(x, y) {
    this.targetX = x;
    this.targetY = y;
  }

  update(dt) {
    this.contactCooldown = Math.max(0, this.contactCooldown - dt);
    super.update(dt);
  }

  _move(dt) {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 1) {
      this.angle = Math.atan2(dy, dx);
      this.x += (dx / dist) * this.speed * dt;
      this.y += (dy / dist) * this.speed * dt;
    }
  }

  canContact() {
    return this.contactCooldown <= 0;
  }

  applyContact() {
    this.contactCooldown = ENEMIES.TANK.CONTACT_COOLDOWN;
  }
}
