export const CANVAS_W = 800;
export const CANVAS_H = 600;

export const PALETTE = {
  BLACK:       '#0a0a0f',
  DARK_GREY:   '#1a1a2e',
  MID_GREY:    '#3d3d5c',
  LIGHT_GREY:  '#a0a0b8',
  WHITE:       '#e8e8f0',
  RED:         '#e63946',
  DARK_RED:    '#7d1c23',
  GREEN:       '#4ecb71',
  DARK_GREEN:  '#1f6b38',
  YELLOW:      '#f4d35e',
  ORANGE:      '#f77f00',
  PURPLE:      '#9b5de5',
  DARK_PURPLE: '#4a1a7a',
  CYAN:        '#00b4d8',
  STEEL:       '#4a4e69',
  TAN:         '#c9a96e',
};

export const PLAYER = {
  SPEED: 180,
  MAX_HP: 100,
  BULLET_SPEED: 600,
  SHOOT_COOLDOWN: 0.18,
  MAG_SIZE: 12,
  RELOAD_TIME: 1.4,
  GUN_LENGTH: 22,
  RADIUS: 14,
  INVINCIBLE_TIME: 0.4,
};

export const BULLET = {
  LIFETIME: 2.0,
  RADIUS: 4,
  DAMAGE: 20,
  ENEMY_SPEED: 160,
  ENEMY_RADIUS: 5,
  ENEMY_DAMAGE: 15,
};

export const ENEMIES = {
  RUNNER: {
    HP: 20, SPEED: 220, RADIUS: 10,
    SCORE: 10, COLOR: 'RED', SHADOW: 'DARK_RED',
  },
  TANK: {
    HP: 120, SPEED: 60, RADIUS: 18,
    SCORE: 50, COLOR: 'STEEL', SHADOW: 'MID_GREY',
    KNOCKBACK_DAMAGE: 30, CONTACT_COOLDOWN: 1.0,
  },
  SHOOTER: {
    HP: 60, SPEED: 90, RADIUS: 12,
    SCORE: 30, COLOR: 'PURPLE', SHADOW: 'DARK_PURPLE',
    STOP_RANGE: 200, CHARGE_TIME: 1.4, FIRE_COOLDOWN: 2.5,
  },
};

// Wave definitions per level
// Each level has an array of waves; each wave has spawn entries
export const LEVELS = [
  // Level 1
  [
    { spawns: [{ type: 'RUNNER', count: 5, interval: 1.2 }] },
    { spawns: [{ type: 'RUNNER', count: 8, interval: 0.9 }] },
    { spawns: [{ type: 'RUNNER', count: 6, interval: 0.8 }, { type: 'SHOOTER', count: 1, delay: 4.0 }] },
  ],
  // Level 2
  [
    { spawns: [{ type: 'RUNNER', count: 8, interval: 0.9 }, { type: 'TANK', count: 1, delay: 3.0 }] },
    { spawns: [{ type: 'RUNNER', count: 10, interval: 0.7 }, { type: 'SHOOTER', count: 2, delay: 3.0 }] },
    { spawns: [{ type: 'RUNNER', count: 8, interval: 0.6 }, { type: 'TANK', count: 2, delay: 4.0 }, { type: 'SHOOTER', count: 2, delay: 5.0 }] },
  ],
  // Level 3
  [
    { spawns: [{ type: 'RUNNER', count: 10, interval: 0.7 }, { type: 'SHOOTER', count: 3, delay: 2.0 }] },
    { spawns: [{ type: 'RUNNER', count: 12, interval: 0.6 }, { type: 'TANK', count: 2, delay: 2.0 }, { type: 'SHOOTER', count: 2, delay: 4.0 }] },
    { spawns: [{ type: 'RUNNER', count: 15, interval: 0.5 }, { type: 'TANK', count: 3, delay: 3.0 }, { type: 'SHOOTER', count: 4, delay: 5.0 }] },
  ],
  // Level 4 (loops infinitely after this with scaling)
  [
    { spawns: [{ type: 'RUNNER', count: 15, interval: 0.5 }, { type: 'TANK', count: 3, delay: 2.0 }, { type: 'SHOOTER', count: 4, delay: 3.0 }] },
    { spawns: [{ type: 'RUNNER', count: 18, interval: 0.4 }, { type: 'TANK', count: 4, delay: 2.0 }, { type: 'SHOOTER', count: 5, delay: 3.0 }] },
    { spawns: [{ type: 'RUNNER', count: 20, interval: 0.35 }, { type: 'TANK', count: 4, delay: 1.5 }, { type: 'SHOOTER', count: 6, delay: 2.5 }] },
  ],
];

export const DIFFICULTY = {
  COUNT_SCALE: 0.35,
  INTERVAL_SCALE: 0.12,
  SPEED_SCALE: 0.08,
  SPEED_CAP: 1.5,
};

export const PIXEL = 3; // base pixel size for sprites (3x scale)
