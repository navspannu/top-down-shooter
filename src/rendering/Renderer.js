import { CANVAS_W, CANVAS_H, PALETTE } from '../config.js';

export default class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeMag = 0;
    this.shakeDecay = 10;
    this.flashTimer = 0;
    this.flashColor = 'rgba(255,0,0,0.25)';
  }

  shake(magnitude) {
    this.shakeMag = Math.max(this.shakeMag, magnitude);
  }

  flash(color = 'rgba(255,0,0,0.25)', duration = 0.15) {
    this.flashTimer = duration;
    this.flashColor = color;
  }

  update(dt) {
    if (this.shakeMag > 0) {
      this.shakeMag = Math.max(0, this.shakeMag - this.shakeDecay * dt);
      this.shakeX = (Math.random() * 2 - 1) * this.shakeMag;
      this.shakeY = (Math.random() * 2 - 1) * this.shakeMag;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }
    this.flashTimer = Math.max(0, this.flashTimer - dt);
  }

  beginFrame() {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(this.shakeX, this.shakeY);

    // Background
    ctx.fillStyle = PALETTE.BLACK;
    ctx.fillRect(-2, -2, CANVAS_W + 4, CANVAS_H + 4);

    // Grid
    ctx.strokeStyle = PALETTE.DARK_GREY;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.35;
    const grid = 32;
    for (let x = 0; x <= CANVAS_W; x += grid) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_H; y += grid) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  endFrame() {
    const ctx = this.ctx;

    // Screen flash
    if (this.flashTimer > 0) {
      ctx.fillStyle = this.flashColor;
      ctx.globalAlpha = this.flashTimer / 0.15;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.globalAlpha = 1;
    }

    // Scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.07)';
    for (let y = 0; y < CANVAS_H; y += 2) {
      ctx.fillRect(0, y, CANVAS_W, 1);
    }

    // Vignette
    const grad = ctx.createRadialGradient(
      CANVAS_W / 2, CANVAS_H / 2, CANVAS_H * 0.3,
      CANVAS_W / 2, CANVAS_H / 2, CANVAS_H * 0.75
    );
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.restore();
  }
}
