import { CANVAS_W, CANVAS_H } from '../config.js';

const keys = {};
const mouse = { x: CANVAS_W / 2, y: CANVAS_H / 2, down: false, clicked: false };

export function initInput(canvas) {
  window.addEventListener('keydown', e => {
    keys[e.code] = true;
    e.preventDefault();
  });
  window.addEventListener('keyup', e => {
    keys[e.code] = false;
  });

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    mouse.x = (e.clientX - rect.left) * scaleX;
    mouse.y = (e.clientY - rect.top) * scaleY;
  });

  canvas.addEventListener('mousedown', e => {
    if (e.button === 0) { mouse.down = true; mouse.clicked = true; }
  });
  canvas.addEventListener('mouseup', e => {
    if (e.button === 0) mouse.down = false;
  });

  // Enter / Space as alternate confirm
  window.addEventListener('keydown', e => {
    if (e.code === 'Enter' || e.code === 'Space') {
      mouse.clicked = true;
    }
  });
}

export function isKeyDown(code) { return !!keys[code]; }

export function isMoving() {
  return keys['ArrowUp'] || keys['ArrowDown'] || keys['ArrowLeft'] || keys['ArrowRight'] ||
         keys['KeyW'] || keys['KeyS'] || keys['KeyA'] || keys['KeyD'];
}

export function getMoveVector() {
  let dx = 0, dy = 0;
  if (keys['ArrowLeft']  || keys['KeyA']) dx -= 1;
  if (keys['ArrowRight'] || keys['KeyD']) dx += 1;
  if (keys['ArrowUp']    || keys['KeyW']) dy -= 1;
  if (keys['ArrowDown']  || keys['KeyS']) dy += 1;
  if (dx !== 0 && dy !== 0) {
    const inv = 1 / Math.sqrt(2);
    dx *= inv; dy *= inv;
  }
  return { dx, dy };
}

export function getMouse() { return mouse; }

export function consumeClick() {
  const c = mouse.clicked;
  mouse.clicked = false;
  return c;
}
