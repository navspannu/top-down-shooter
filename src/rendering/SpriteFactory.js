import { PALETTE, PIXEL } from '../config.js';
import AssetStore from '../core/AssetStore.js';

function makeCanvas(cols, rows) {
  const c = new OffscreenCanvas(cols * PIXEL, rows * PIXEL);
  return c;
}

function renderGrid(grid, tintColor) {
  const rows = grid.length;
  const cols = grid[0].length;
  const c = makeCanvas(cols, rows);
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  grid.forEach((row, y) => {
    row.forEach((key, x) => {
      if (!key) return;
      ctx.fillStyle = tintColor || PALETTE[key];
      ctx.fillRect(x * PIXEL, y * PIXEL, PIXEL, PIXEL);
    });
  });
  return c;
}

// Draw a circle-based sprite
function makeCircleSprite(radius, bodyColor, shadowColor, details) {
  const size = (radius * 2 + 2);
  const c = new OffscreenCanvas(size * PIXEL, size * PIXEL);
  const ctx = c.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;

  // Shadow
  ctx.fillStyle = PALETTE[shadowColor];
  for (let px = 0; px < size; px++) {
    for (let py = 0; py < size; py++) {
      const dx = px - cx + 0.5;
      const dy = py - cy + 0.5;
      if (dx * dx + dy * dy <= (radius - 0.5) * (radius - 0.5)) {
        if (dx + dy > 1) {
          ctx.fillRect(px * PIXEL, py * PIXEL, PIXEL, PIXEL);
        }
      }
    }
  }

  // Main body
  ctx.fillStyle = PALETTE[bodyColor];
  for (let px = 0; px < size; px++) {
    for (let py = 0; py < size; py++) {
      const dx = px - cx + 0.5;
      const dy = py - cy + 0.5;
      if (dx * dx + dy * dy <= (radius - 0.5) * (radius - 0.5)) {
        if (dx + dy <= 1) {
          ctx.fillRect(px * PIXEL, py * PIXEL, PIXEL, PIXEL);
        }
      }
    }
  }

  // Extra details
  if (details) details(ctx, cx, cy, size);
  return c;
}

// Player frames: 16x16 grid
const PLAYER_BODY = [
  [null,null,null,null,null,'TAN','TAN',null,null,null,null,null,null,null,null,null],
  [null,null,null,null,'TAN','TAN','TAN','TAN',null,null,null,null,null,null,null,null],
  [null,null,null,'TAN','TAN','TAN','TAN','TAN','TAN',null,null,null,null,null,null,null],
  [null,null,null,'TAN','TAN','WHITE','TAN','TAN','TAN',null,null,null,null,null,null,null],
  [null,null,null,'TAN','TAN','TAN','TAN','TAN',null,null,null,null,null,null,null,null],
  [null,null,'DARK_GREEN','GREEN','GREEN','GREEN','GREEN','GREEN','DARK_GREEN',null,null,null,null,null,null,null],
  [null,'DARK_GREEN','GREEN','GREEN','GREEN','GREEN','GREEN','GREEN','GREEN','DARK_GREEN',null,null,null,null,null,null],
  [null,'DARK_GREEN','GREEN','GREEN','GREEN','GREEN','GREEN','GREEN','GREEN','DARK_GREEN',null,null,null,null,null,null],
  [null,'DARK_GREEN','GREEN','GREEN','GREEN','GREEN','GREEN','GREEN','GREEN','DARK_GREEN',null,null,null,null,null,null],
  [null,null,'DARK_GREEN','GREEN','GREEN','GREEN','GREEN','GREEN','DARK_GREEN',null,null,null,null,null,null,null],
  [null,null,'DARK_GREEN','GREEN',null,null,null,'GREEN','DARK_GREEN',null,null,null,null,null,null,null],
  [null,null,'GREEN','GREEN',null,null,null,'GREEN','GREEN',null,null,null,null,null,null,null],
  [null,null,'DARK_GREEN','TAN',null,null,null,'TAN','DARK_GREEN',null,null,null,null,null,null,null],
  [null,null,'TAN','TAN',null,null,null,'TAN','TAN',null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
];

const PLAYER_WALK_1 = JSON.parse(JSON.stringify(PLAYER_BODY));
PLAYER_WALK_1[11] = [null,null,'GREEN','GREEN',null,null,null,null,'GREEN',null,null,null,null,null,null,null];
PLAYER_WALK_1[12] = [null,null,'DARK_GREEN','TAN',null,null,null,null,'DARK_GREEN',null,null,null,null,null,null,null];
PLAYER_WALK_1[13] = [null,null,'TAN','TAN',null,null,null,null,'TAN',null,null,null,null,null,null,null];

const PLAYER_WALK_2 = JSON.parse(JSON.stringify(PLAYER_BODY));
PLAYER_WALK_2[11] = [null,null,null,'GREEN',null,null,null,'GREEN','GREEN',null,null,null,null,null,null,null];
PLAYER_WALK_2[12] = [null,null,null,'DARK_GREEN',null,null,null,'TAN','DARK_GREEN',null,null,null,null,null,null,null];
PLAYER_WALK_2[13] = [null,null,null,'TAN',null,null,null,'TAN','TAN',null,null,null,null,null,null,null];

// Gun arm (drawn separately, rotated toward mouse) — horizontal pointing right
const GUN_ARM = [
  [null,null,null,null,null,null,null],
  [null,null,null,'TAN','TAN',null,null],
  [null,'MID_GREY','LIGHT_GREY','LIGHT_GREY','LIGHT_GREY','LIGHT_GREY','WHITE'],
  [null,null,null,'TAN','TAN',null,null],
  [null,null,null,null,null,null,null],
];

// Death frame
const PLAYER_DEATH = JSON.parse(JSON.stringify(PLAYER_BODY));
for (let r = 0; r < PLAYER_DEATH.length; r++)
  for (let c2 = 0; c2 < PLAYER_DEATH[r].length; c2++)
    if (PLAYER_DEATH[r][c2]) PLAYER_DEATH[r][c2] = 'RED';

function makePlayerGun(frame) {
  // frame 0 = normal, frame 1 = firing (lighter muzzle)
  const g = JSON.parse(JSON.stringify(GUN_ARM));
  if (frame === 1) g[2][6] = 'YELLOW';
  return renderGrid(g);
}

// Runner: small red circle with eyes
function makeRunnerFrame(eyeOpen) {
  const R = 6;
  const size = R * 2 + 4;
  const c = new OffscreenCanvas(size * PIXEL, size * PIXEL);
  const ctx = c.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;

  // Body
  for (let px = 0; px < size; px++) {
    for (let py = 0; py < size; py++) {
      const dx = px - cx + 0.5;
      const dy = py - cy + 0.5;
      const dist2 = dx * dx + dy * dy;
      if (dist2 <= R * R) {
        ctx.fillStyle = (dx + dy > 0.5) ? PALETTE.DARK_RED : PALETTE.RED;
        ctx.fillRect(px * PIXEL, py * PIXEL, PIXEL, PIXEL);
      }
    }
  }

  // Eyes
  if (eyeOpen) {
    ctx.fillStyle = PALETTE.WHITE;
    ctx.fillRect((cx - 1.5) * PIXEL, (cy - 1) * PIXEL, PIXEL, PIXEL);
    ctx.fillRect((cx + 0.5) * PIXEL, (cy - 1) * PIXEL, PIXEL, PIXEL);
    ctx.fillStyle = PALETTE.BLACK;
    ctx.fillRect((cx - 1.5) * PIXEL, (cy - 1) * PIXEL, PIXEL / 2, PIXEL);
    ctx.fillRect((cx + 0.5) * PIXEL, (cy - 1) * PIXEL, PIXEL / 2, PIXEL);
  } else {
    ctx.fillStyle = PALETTE.DARK_RED;
    ctx.fillRect((cx - 1.5) * PIXEL, (cy - 1) * PIXEL, PIXEL, PIXEL / 2);
    ctx.fillRect((cx + 0.5) * PIXEL, (cy - 1) * PIXEL, PIXEL, PIXEL / 2);
  }

  // Spiky top
  ctx.fillStyle = PALETTE.RED;
  ctx.fillRect((cx - 0.5) * PIXEL, (cy - R - 1) * PIXEL, PIXEL, PIXEL);

  return c;
}

// Tank: dark chunky square-ish
function makeTankFrame(frame) {
  const R = 9;
  const size = R * 2 + 4;
  const c = new OffscreenCanvas(size * PIXEL, size * PIXEL);
  const ctx = c.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;
  const half = R;

  // Main body square
  for (let px = cx - half; px < cx + half; px++) {
    for (let py = cy - half; py < cy + half; py++) {
      const edge = px <= cx - half + 1 || px >= cx + half - 2 || py <= cy - half + 1 || py >= cy + half - 2;
      ctx.fillStyle = edge ? PALETTE.MID_GREY : PALETTE.STEEL;
      ctx.fillRect(px * PIXEL, py * PIXEL, PIXEL, PIXEL);
    }
  }

  // Tread marks
  ctx.fillStyle = PALETTE.DARK_GREY;
  for (let i = 0; i < 4; i++) {
    const tx = (frame === 0) ? (cx - half + 0.5) : (cx + half - 1.5);
    ctx.fillRect(tx * PIXEL, (cy - half + 2 + i * 2) * PIXEL, PIXEL, PIXEL);
  }

  // Eyes / visor
  ctx.fillStyle = PALETTE.CYAN;
  ctx.fillRect((cx - 1.5) * PIXEL, (cy - 1) * PIXEL, 3 * PIXEL, PIXEL);

  // Gun barrel
  ctx.fillStyle = PALETTE.LIGHT_GREY;
  ctx.fillRect((cx + half - 1) * PIXEL, (cy - 0.5) * PIXEL, 3 * PIXEL, PIXEL);

  return c;
}

// Shooter: medium purple circle with gun
function makeShooterFrame(charging) {
  const R = 7;
  const size = R * 2 + 4;
  const c = new OffscreenCanvas(size * PIXEL, size * PIXEL);
  const ctx = c.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;

  for (let px = 0; px < size; px++) {
    for (let py = 0; py < size; py++) {
      const dx = px - cx + 0.5;
      const dy = py - cy + 0.5;
      if (dx * dx + dy * dy <= R * R) {
        ctx.fillStyle = (dx + dy > 0.5) ? PALETTE.DARK_PURPLE : PALETTE.PURPLE;
        ctx.fillRect(px * PIXEL, py * PIXEL, PIXEL, PIXEL);
      }
    }
  }

  // Eye
  ctx.fillStyle = charging ? PALETTE.ORANGE : PALETTE.YELLOW;
  ctx.fillRect((cx - 0.5) * PIXEL, (cy - 0.5) * PIXEL, PIXEL, PIXEL);

  // Gun
  ctx.fillStyle = PALETTE.MID_GREY;
  ctx.fillRect((cx + R - 1) * PIXEL, (cy - 0.5) * PIXEL, 3 * PIXEL, PIXEL);

  return c;
}

// Explosion/death burst sprite (single large flash)
function makeExplosion(color, size) {
  const c = new OffscreenCanvas(size * PIXEL, size * PIXEL);
  const ctx = c.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;
  ctx.fillStyle = PALETTE[color];
  // random-looking pixel scatter
  const pixels = [
    [cx,cy],[cx-1,cy],[cx+1,cy],[cx,cy-1],[cx,cy+1],
    [cx-2,cy],[cx+2,cy],[cx,cy-2],[cx,cy+2],
    [cx-1,cy-1],[cx+1,cy-1],[cx-1,cy+1],[cx+1,cy+1],
  ];
  for (const [px, py] of pixels) {
    ctx.fillRect(px * PIXEL, py * PIXEL, PIXEL, PIXEL);
  }
  return c;
}

// Muzzle flash
function makeMuzzleFlash() {
  const size = 6;
  const c = new OffscreenCanvas(size * PIXEL, size * PIXEL);
  const ctx = c.getContext('2d');
  ctx.fillStyle = PALETTE.YELLOW;
  ctx.fillRect(2 * PIXEL, 2 * PIXEL, 2 * PIXEL, 2 * PIXEL);
  ctx.fillStyle = PALETTE.ORANGE;
  ctx.fillRect(1 * PIXEL, 2 * PIXEL, PIXEL, PIXEL);
  ctx.fillRect(2 * PIXEL, 1 * PIXEL, PIXEL, PIXEL);
  ctx.fillRect(3 * PIXEL, 2 * PIXEL, 2 * PIXEL, PIXEL);
  ctx.fillRect(2 * PIXEL, 3 * PIXEL, PIXEL, PIXEL);
  return c;
}

export function generateAll() {
  // Player
  AssetStore.sprites.player = {
    idle:   [renderGrid(PLAYER_BODY), renderGrid(PLAYER_BODY)],
    walk:   [
      renderGrid(PLAYER_BODY),
      renderGrid(PLAYER_WALK_1),
      renderGrid(PLAYER_BODY),
      renderGrid(PLAYER_WALK_2),
    ],
    shoot:  [renderGrid(PLAYER_BODY), renderGrid(PLAYER_BODY)],
    death:  (() => {
      const frames = [];
      for (let i = 0; i < 5; i++) {
        const d = JSON.parse(JSON.stringify(PLAYER_BODY));
        const t = i / 4;
        frames.push(renderGrid(d, null));
      }
      // final death is red tinted
      frames[4] = renderGrid(PLAYER_DEATH);
      return frames;
    })(),
    gun:    [makePlayerGun(0), makePlayerGun(1)],
  };

  // Enemies
  AssetStore.sprites.runner = {
    idle:  [makeRunnerFrame(true), makeRunnerFrame(false)],
    death: [
      makeExplosion('RED', 10),
      makeExplosion('ORANGE', 8),
      makeExplosion('YELLOW', 6),
    ],
  };

  AssetStore.sprites.tank = {
    idle:  [makeTankFrame(0), makeTankFrame(1)],
    death: [
      makeExplosion('STEEL', 14),
      makeExplosion('ORANGE', 12),
      makeExplosion('YELLOW', 10),
      makeExplosion('RED', 8),
    ],
  };

  AssetStore.sprites.shooter = {
    idle:   [makeShooterFrame(false), makeShooterFrame(false)],
    charge: [makeShooterFrame(true), makeShooterFrame(true), makeShooterFrame(true)],
    death:  [
      makeExplosion('PURPLE', 12),
      makeExplosion('DARK_PURPLE', 10),
      makeExplosion('YELLOW', 8),
    ],
  };

  // FX
  AssetStore.sprites.muzzleFlash = makeMuzzleFlash();
  AssetStore.sprites.bulletPlayer = (() => {
    const c = new OffscreenCanvas(3 * PIXEL, 2 * PIXEL);
    const ctx = c.getContext('2d');
    ctx.fillStyle = PALETTE.YELLOW;
    ctx.fillRect(0, 0, 3 * PIXEL, 2 * PIXEL);
    ctx.fillStyle = PALETTE.WHITE;
    ctx.fillRect(0, 0, PIXEL, PIXEL);
    return c;
  })();
  AssetStore.sprites.bulletEnemy = (() => {
    const c = new OffscreenCanvas(3 * PIXEL, 3 * PIXEL);
    const ctx = c.getContext('2d');
    ctx.fillStyle = PALETTE.ORANGE;
    ctx.fillRect(PIXEL, 0, PIXEL, 3 * PIXEL);
    ctx.fillRect(0, PIXEL, 3 * PIXEL, PIXEL);
    return c;
  })();
}
