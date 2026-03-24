import { CANVAS_W, CANVAS_H, PALETTE } from '../config.js';
import { switchScene } from '../core/SceneManager.js';
import { consumeClick } from '../core/InputHandler.js';
import { drawPixelText } from '../rendering/HUD.js';

const AUTO_ADVANCE = 4.0;

export default {
  level: 1,
  score: 0,
  timer: 0,
  colorTimer: 0,

  init(data) {
    this.level = data.level || 1;
    this.score = data.score || 0;
    this.timer = 0;
    this.colorTimer = 0;
  },

  update(dt) {
    this.timer += dt;
    this.colorTimer += dt;
    if (this.timer >= AUTO_ADVANCE || consumeClick()) {
      switchScene('game', { level: this.level + 1, score: this.score });
    }
  },

  render(ctx) {
    ctx.fillStyle = PALETTE.BLACK;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Palette flash background
    const flash = Math.abs(Math.sin(this.colorTimer * 3));
    ctx.fillStyle = `rgba(0, 180, 216, ${flash * 0.06})`;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Grid
    ctx.strokeStyle = PALETTE.CYAN;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.15;
    for (let x = 0; x <= CANVAS_W; x += 32) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_H; y += 32) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Title
    const alpha = Math.min(1, this.timer * 4);
    ctx.globalAlpha = alpha;
    drawPixelText(ctx, 'LEVEL ' + this.level, CANVAS_W / 2 - ('LEVEL ' + this.level).length * 15, 100, 5, PALETTE.CYAN);
    drawPixelText(ctx, 'COMPLETE!', CANVAS_W / 2 - 9 * 15, 160, 5, PALETTE.GREEN);
    ctx.globalAlpha = 1;

    // Score
    const scoreStr = String(this.score).padStart(6, '0');
    drawPixelText(ctx, 'SCORE: ' + scoreStr, CANVAS_W / 2 - 7 * 12, 280, 2, PALETTE.YELLOW);

    // Next level
    drawPixelText(ctx, 'NEXT: LEVEL ' + (this.level + 1), CANVAS_W / 2 - 12 * 12, 315, 2, PALETTE.WHITE);

    // Countdown
    const remaining = Math.max(0, AUTO_ADVANCE - this.timer);
    const countStr = remaining.toFixed(1);
    drawPixelText(ctx, 'STARTING IN ' + countStr, CANVAS_W / 2 - 13 * 12, 380, 2, PALETTE.LIGHT_GREY);

    // Skip prompt
    if (Math.floor(this.timer * 2) % 2 === 0) {
      drawPixelText(ctx, 'CLICK TO CONTINUE', CANVAS_W / 2 - 17 * 12, 440, 2, PALETTE.YELLOW);
    }

    // Scanlines + vignette
    ctx.fillStyle = 'rgba(0,0,0,0.07)';
    for (let y = 0; y < CANVAS_H; y += 2) ctx.fillRect(0, y, CANVAS_W, 1);
    const grad = ctx.createRadialGradient(CANVAS_W/2, CANVAS_H/2, CANVAS_H*0.3, CANVAS_W/2, CANVAS_H/2, CANVAS_H*0.75);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  },

  destroy() {},
};
