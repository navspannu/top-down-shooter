import { ENEMIES } from '../config.js';

function circlesOverlap(ax, ay, ar, bx, by, br) {
  const dx = ax - bx, dy = ay - by;
  const minDist = ar + br;
  return dx * dx + dy * dy < minDist * minDist;
}

export function resolveCollisions(player, enemies, particleSystem) {
  if (!player.alive) return;

  // Player bullets vs enemies
  for (const bullet of player.bullets) {
    if (!bullet.active) continue;
    for (const enemy of enemies) {
      if (!enemy.active || enemy.dead) continue;
      if (circlesOverlap(bullet.x, bullet.y, bullet.radius, enemy.x, enemy.y, enemy.radius)) {
        enemy.takeDamage(bullet.damage);
        bullet.active = false;
        particleSystem?.spawnHitSpark(bullet.x, bullet.y);
        break;
      }
    }
  }

  // Enemy bullets vs player
  for (const enemy of enemies) {
    if (!enemy.bullets) continue;
    for (const bullet of enemy.bullets) {
      if (!bullet.active) continue;
      if (circlesOverlap(bullet.x, bullet.y, bullet.radius, player.x, player.y, player.radius || 14)) {
        player.takeDamage(bullet.damage);
        bullet.active = false;
        particleSystem?.spawnHitSpark(bullet.x, bullet.y);
      }
    }
  }

  // Enemies vs player (contact)
  for (const enemy of enemies) {
    if (!enemy.active || enemy.dead) continue;
    if (circlesOverlap(enemy.x, enemy.y, enemy.radius, player.x, player.y, player.radius || 14)) {
      if (enemy.constructor.name === 'EnemyTank') {
        if (enemy.canContact?.()) {
          player.takeDamage(ENEMIES.TANK.KNOCKBACK_DAMAGE);
          // Knockback player away from tank
          const dx = player.x - enemy.x;
          const dy = player.y - enemy.y;
          const dist = Math.hypot(dx, dy) || 1;
          player.x += (dx / dist) * 40;
          player.y += (dy / dist) * 40;
          enemy.applyContact?.();
        }
      } else {
        // Runners push player but don't deal damage on contact alone
        // (damage happens via separate logic — here just separate them)
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.hypot(dx, dy) || 1;
        const overlap = (enemy.radius + 14) - dist;
        if (overlap > 0) {
          player.x += (dx / dist) * overlap * 0.5;
          player.y += (dy / dist) * overlap * 0.5;
        }
      }
    }
  }

  // Enemy-enemy separation (prevent stacking)
  for (let i = 0; i < enemies.length; i++) {
    for (let j = i + 1; j < enemies.length; j++) {
      const a = enemies[i], b = enemies[j];
      if (!a.active || !b.active || a.dead || b.dead) continue;
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.hypot(dx, dy) || 1;
      const minDist = a.radius + b.radius;
      if (dist < minDist) {
        const push = (minDist - dist) * 0.3;
        a.x += (dx / dist) * push;
        a.y += (dy / dist) * push;
        b.x -= (dx / dist) * push;
        b.y -= (dy / dist) * push;
      }
    }
  }
}
