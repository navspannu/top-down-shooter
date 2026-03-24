import { CANVAS_W, CANVAS_H, PALETTE } from '../config.js';
import { switchScene } from '../core/SceneManager.js';
import { consumeClick, isKeyDown } from '../core/InputHandler.js';
import { drawPixelText } from '../rendering/HUD.js';

const TITLE = ['TOP-DOWN', 'SHOOTER'];

export default {
  timer: 0,
  highScore: 0,

  init() {
    this.timer = 0;
    this.highScore = parseInt(localStorage.getItem('highScore') || '0', 10);
  },

  update(dt) {
    this.timer += dt;
    if (this.timer < 0.3) return; // brief lockout to prevent immediate skip
    if (consumeClick()) {
      switchScene('game', { level: 1, score: 0 });
    }
  },

  render(ctx) {
    // Background
    ctx.fillStyle = PALETTE.BLACK;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Grid
    ctx.strokeStyle = PALETTE.DARK_GREY;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    for (let x = 0; x <= CANVAS_W; x += 32) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_H; y += 32) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Title — color-cycle effect
    const colors = [PALETTE.CYAN, PALETTE.GREEN, PALETTE.YELLOW, PALETTE.ORANGE, PALETTE.RED, PALETTE.PURPLE];
    for (let li = 0; li < TITLE.length; li++) {
      const line = TITLE[li];
      const lineWidth = line.length * 6 * 5;
      const startX = (CANVAS_W - lineWidth) / 2;
      const y = 100 + li * 60;
      for (let ci = 0; ci < line.length; ci++) {
        const colorIdx = Math.floor((this.timer * 2 + ci + li * 3)) % colors.length;
        drawPixelText(ctx, line[ci], startX + ci * 6 * 5, y, 5, colors[colorIdx]);
      }
    }

    // Subtitle
    drawPixelText(ctx, 'RETRO ARENA', CANVAS_W / 2 - 66, 230, 2, PALETTE.LIGHT_GREY);

    // Controls info
    drawPixelText(ctx, 'WASD - MOVE', 60, 310, 2, PALETTE.MID_GREY);
    drawPixelText(ctx, 'MOUSE - AIM', 60, 334, 2, PALETTE.MID_GREY);
    drawPixelText(ctx, 'CLICK - SHOOT', 60, 358, 2, PALETTE.MID_GREY);
    drawPixelText(ctx, 'HOLD CLICK - AUTO', CANVAS_W - 240, 310, 2, PALETTE.MID_GREY);
    drawPixelText(ctx, 'SURVIVE ALL WAVES', CANVAS_W - 240, 334, 2, PALETTE.MID_GREY);
    drawPixelText(ctx, 'TO ADVANCE LEVELS', CANVAS_W - 240, 358, 2, PALETTE.MID_GREY);

    // Blink start prompt
    if (Math.floor(this.timer * 2) % 2 === 0) {
      drawPixelText(ctx, 'CLICK OR PRESS ENTER TO START', CANVAS_W / 2 - 87 * 2, 430, 2, PALETTE.WHITE);
    }

    // High score
    if (this.highScore > 0) {
      const hs = String(this.highScore).padStart(6, '0');
      drawPixelText(ctx, 'BEST: ' + hs, CANVAS_W / 2 - 36 * 2, 470, 2, PALETTE.YELLOW);
    }

    // Scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.07)';
    for (let y = 0; y < CANVAS_H; y += 2) ctx.fillRect(0, y, CANVAS_W, 1);

    // Vignette
    const grad = ctx.createRadialGradient(CANVAS_W/2, CANVAS_H/2, CANVAS_H*0.3, CANVAS_W/2, CANVAS_H/2, CANVAS_H*0.75);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  },

  destroy() {},
};
