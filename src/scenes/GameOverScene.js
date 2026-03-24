import { CANVAS_W, CANVAS_H, PALETTE } from '../config.js';
import { switchScene } from '../core/SceneManager.js';
import { consumeClick, isKeyDown } from '../core/InputHandler.js';
import { drawPixelText } from '../rendering/HUD.js';

export default {
  score: 0,
  level: 1,
  highScore: 0,
  timer: 0,
  newHigh: false,

  init(data) {
    this.score = data.score || 0;
    this.level = data.level || 1;
    this.highScore = data.highScore || 0;
    this.newHigh = this.score >= this.highScore && this.score > 0;
    this.timer = 0;
  },

  update(dt) {
    this.timer += dt;
    if (this.timer < 0.5) return; // brief lockout

    const clicked = consumeClick();

    if (clicked || isKeyDown('KeyR')) {
      switchScene('game', { level: this.level, score: 0 });
    }
    if (isKeyDown('KeyM')) {
      switchScene('menu');
    }
  },

  render(ctx) {
    ctx.fillStyle = PALETTE.BLACK;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Grid
    ctx.strokeStyle = PALETTE.DARK_GREY;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.2;
    for (let x = 0; x <= CANVAS_W; x += 32) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_H; y += 32) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Title
    const alpha = Math.min(1, this.timer * 3);
    ctx.globalAlpha = alpha;
    drawPixelText(ctx, 'GAME OVER', CANVAS_W / 2 - 9 * 15, 110, 5, PALETTE.RED);
    ctx.globalAlpha = 1;

    // Score
    const scoreStr = String(this.score).padStart(6, '0');
    drawPixelText(ctx, 'SCORE: ' + scoreStr, CANVAS_W / 2 - 7 * 12, 230, 2, PALETTE.YELLOW);

    // Level reached
    drawPixelText(ctx, 'LEVEL REACHED: ' + this.level, CANVAS_W / 2 - 15 * 12, 260, 2, PALETTE.CYAN);

    // High score
    if (this.newHigh) {
      if (Math.floor(this.timer * 2) % 2 === 0) {
        drawPixelText(ctx, 'NEW BEST!', CANVAS_W / 2 - 9 * 12, 295, 2, PALETTE.GREEN);
      }
    } else {
      const hsStr = String(this.highScore).padStart(6, '0');
      drawPixelText(ctx, 'BEST: ' + hsStr, CANVAS_W / 2 - 6 * 12, 295, 2, PALETTE.LIGHT_GREY);
    }

    // Buttons
    this._drawButton(ctx, '[R] RETRY', CANVAS_W / 2 - 120, 380, PALETTE.GREEN);
    this._drawButton(ctx, '[M] MENU', CANVAS_W / 2 + 20, 380, PALETTE.CYAN);

    // Tip
    if (Math.floor(this.timer * 1.5) % 2 === 0) {
      drawPixelText(ctx, 'CLICK TO RETRY', CANVAS_W / 2 - 14 * 12, 450, 2, PALETTE.LIGHT_GREY);
    }

    // Scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.07)';
    for (let y = 0; y < CANVAS_H; y += 2) ctx.fillRect(0, y, CANVAS_W, 1);
  },

  _drawButton(ctx, text, x, y, color) {
    ctx.fillStyle = PALETTE.DARK_GREY;
    ctx.fillRect(x - 4, y - 4, text.length * 12 + 8, 22 + 8);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 4, y - 4, text.length * 12 + 8, 22 + 8);
    drawPixelText(ctx, text, x, y, 2, color);
  },

  destroy() {},
};
