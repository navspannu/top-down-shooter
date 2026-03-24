import EnemyBase from './EnemyBase.js';
import { ENEMIES } from '../config.js';

export default class EnemyRunner extends EnemyBase {
  constructor(x, y, targetX, targetY, speedMult = 1) {
    super(x, y, ENEMIES.RUNNER, 'runner');
    this.speed = ENEMIES.RUNNER.SPEED * speedMult;
    const dist = Math.hypot(targetX - x, targetY - y);
    this.vx = (dist > 0) ? (targetX - x) / dist : 0;
    this.vy = (dist > 0) ? (targetY - y) / dist : 1;
    this.angle = Math.atan2(this.vy, this.vx);
    this.frameDuration = 0.2;
  }

  _move(dt) {
    this.x += this.vx * this.speed * dt;
    this.y += this.vy * this.speed * dt;
  }
}
