import { PALETTE, PLAYER, CANVAS_W } from '../config.js';

// 5x7 pixel font (each char is a 5-wide, 7-tall bit array, row by row)
const FONT = {
  '0': [0b01110,0b10001,0b10011,0b10101,0b11001,0b10001,0b01110],
  '1': [0b00100,0b01100,0b00100,0b00100,0b00100,0b00100,0b01110],
  '2': [0b01110,0b10001,0b00001,0b00010,0b00100,0b01000,0b11111],
  '3': [0b11111,0b00010,0b00100,0b00010,0b00001,0b10001,0b01110],
  '4': [0b00010,0b00110,0b01010,0b10010,0b11111,0b00010,0b00010],
  '5': [0b11111,0b10000,0b11110,0b00001,0b00001,0b10001,0b01110],
  '6': [0b00110,0b01000,0b10000,0b11110,0b10001,0b10001,0b01110],
  '7': [0b11111,0b00001,0b00010,0b00100,0b01000,0b01000,0b01000],
  '8': [0b01110,0b10001,0b10001,0b01110,0b10001,0b10001,0b01110],
  '9': [0b01110,0b10001,0b10001,0b01111,0b00001,0b00010,0b01100],
  'A': [0b01110,0b10001,0b10001,0b11111,0b10001,0b10001,0b10001],
  'B': [0b11110,0b10001,0b10001,0b11110,0b10001,0b10001,0b11110],
  'C': [0b01110,0b10001,0b10000,0b10000,0b10000,0b10001,0b01110],
  'D': [0b11110,0b10001,0b10001,0b10001,0b10001,0b10001,0b11110],
  'E': [0b11111,0b10000,0b10000,0b11110,0b10000,0b10000,0b11111],
  'F': [0b11111,0b10000,0b10000,0b11110,0b10000,0b10000,0b10000],
  'G': [0b01110,0b10001,0b10000,0b10111,0b10001,0b10001,0b01111],
  'H': [0b10001,0b10001,0b10001,0b11111,0b10001,0b10001,0b10001],
  'I': [0b01110,0b00100,0b00100,0b00100,0b00100,0b00100,0b01110],
  'J': [0b00111,0b00010,0b00010,0b00010,0b10010,0b10010,0b01100],
  'K': [0b10001,0b10010,0b10100,0b11000,0b10100,0b10010,0b10001],
  'L': [0b10000,0b10000,0b10000,0b10000,0b10000,0b10000,0b11111],
  'M': [0b10001,0b11011,0b10101,0b10001,0b10001,0b10001,0b10001],
  'N': [0b10001,0b11001,0b10101,0b10011,0b10001,0b10001,0b10001],
  'O': [0b01110,0b10001,0b10001,0b10001,0b10001,0b10001,0b01110],
  'P': [0b11110,0b10001,0b10001,0b11110,0b10000,0b10000,0b10000],
  'Q': [0b01110,0b10001,0b10001,0b10001,0b10101,0b10010,0b01101],
  'R': [0b11110,0b10001,0b10001,0b11110,0b10100,0b10010,0b10001],
  'S': [0b01111,0b10000,0b10000,0b01110,0b00001,0b00001,0b11110],
  'T': [0b11111,0b00100,0b00100,0b00100,0b00100,0b00100,0b00100],
  'U': [0b10001,0b10001,0b10001,0b10001,0b10001,0b10001,0b01110],
  'V': [0b10001,0b10001,0b10001,0b10001,0b01010,0b01010,0b00100],
  'W': [0b10001,0b10001,0b10001,0b10101,0b10101,0b11011,0b10001],
  'X': [0b10001,0b01010,0b00100,0b00100,0b00100,0b01010,0b10001],
  'Y': [0b10001,0b10001,0b01010,0b00100,0b00100,0b00100,0b00100],
  'Z': [0b11111,0b00001,0b00010,0b00100,0b01000,0b10000,0b11111],
  ':': [0b00000,0b00100,0b00000,0b00000,0b00100,0b00000,0b00000],
  '-': [0b00000,0b00000,0b00000,0b11111,0b00000,0b00000,0b00000],
  '/': [0b00001,0b00010,0b00100,0b00100,0b01000,0b10000,0b00000],
  '+': [0b00000,0b00100,0b00100,0b11111,0b00100,0b00100,0b00000],
  ' ': [0b00000,0b00000,0b00000,0b00000,0b00000,0b00000,0b00000],
};

export function drawPixelText(ctx, text, x, y, scale = 2, color = PALETTE.WHITE) {
  ctx.fillStyle = color;
  const s = scale;
  let cx = x;
  for (const ch of text.toUpperCase()) {
    const bitmap = FONT[ch] || FONT[' '];
    for (let row = 0; row < 7; row++) {
      const bits = bitmap[row];
      for (let col = 0; col < 5; col++) {
        if (bits & (1 << (4 - col))) {
          ctx.fillRect(cx + col * s, y + row * s, s, s);
        }
      }
    }
    cx += 6 * s;
  }
}

export default class HUD {
  constructor() {
    this.displayedHp = 100;
    this.displayedScore = 0;
  }

  update(dt, player, score) {
    // Lerp health bar
    this.displayedHp += (player.hp - this.displayedHp) * Math.min(1, 8 * dt);
    this.displayedScore += (score - this.displayedScore) * Math.min(1, 6 * dt);
  }

  draw(ctx, player, score, level, waveNum, totalWaves, reloading, reloadPct) {
    const barW = 180;
    const barH = 16;
    const barX = 14;
    const barY = 14;

    // HP bar background
    ctx.fillStyle = PALETTE.MID_GREY;
    ctx.fillRect(barX, barY, barW, barH);

    // HP bar fill
    const pct = Math.max(0, this.displayedHp / PLAYER.MAX_HP);
    const fillColor = pct > 0.6 ? PALETTE.GREEN : pct > 0.3 ? PALETTE.YELLOW : PALETTE.RED;
    ctx.fillStyle = fillColor;
    ctx.fillRect(barX, barY, barW * pct, barH);

    // HP bar border
    ctx.strokeStyle = PALETTE.LIGHT_GREY;
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    // HP label
    drawPixelText(ctx, 'HP', barX, barY + 19, 2, PALETTE.LIGHT_GREY);

    // Score
    const scoreStr = String(Math.floor(this.displayedScore)).padStart(6, '0');
    drawPixelText(ctx, 'SCORE:' + scoreStr, CANVAS_W / 2 - 72, 16, 2, PALETTE.YELLOW);

    // Level / Wave
    drawPixelText(ctx, 'LVL:' + level + '  WAVE:' + waveNum + '/' + totalWaves, CANVAS_W - 220, 16, 2, PALETTE.CYAN);

    // Ammo bar
    this._drawAmmo(ctx, player, reloading, reloadPct);
  }

  _drawAmmo(ctx, player, reloading, reloadPct) {
    const px = CANVAS_W - 14;
    const py = 44;
    const size = 8;
    const gap = 4;
    const total = PLAYER.MAG_SIZE;

    for (let i = 0; i < total; i++) {
      const bx = px - (total - i) * (size + gap);
      const filled = i < player.ammo && !reloading;
      ctx.fillStyle = filled ? PALETTE.YELLOW : PALETTE.MID_GREY;
      ctx.fillRect(bx, py, size, size);
      ctx.strokeStyle = PALETTE.LIGHT_GREY;
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, py, size, size);
    }

    if (reloading) {
      drawPixelText(ctx, 'RELOAD', px - total * (size + gap) - 4, py, 2, PALETTE.ORANGE);
      // Reload arc
      const arcX = px - 5;
      const arcY = py + size / 2;
      ctx.beginPath();
      ctx.arc(arcX, arcY, 8, -Math.PI / 2, -Math.PI / 2 + reloadPct * Math.PI * 2);
      ctx.strokeStyle = PALETTE.ORANGE;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}
