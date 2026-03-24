import { CANVAS_W, CANVAS_H } from '../config.js';
import AssetStore from '../core/AssetStore.js';

export default class Bullet {
  constructor(x, y, angle, speed, damage, owner) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.angle = angle;
    this.damage = damage;
    this.owner = owner; // 'player' | 'enemy'
    this.lifetime = 2.0;
    this.radius = owner === 'player' ? 4 : 5;
    this.active = true;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.lifetime -= dt;
    if (
      this.lifetime <= 0 ||
      this.x < -20 || this.x > CANVAS_W + 20 ||
      this.y < -20 || this.y > CANVAS_H + 20
    ) {
      this.active = false;
    }
  }

  draw(ctx) {
    const sprite = this.owner === 'player'
      ? AssetStore.sprites.bulletPlayer
      : AssetStore.sprites.bulletEnemy;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
    ctx.restore();
  }
}
