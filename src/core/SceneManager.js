const scenes = {};
let current = null;
let next = null;
let nextData = null;

export function registerScene(name, scene) {
  scenes[name] = scene;
}

export function switchScene(name, data = {}) {
  next = name;
  nextData = data;
}

export function update(dt) {
  if (next !== null) {
    if (current) current.destroy?.();
    current = scenes[next];
    next = null;
    current.init(nextData || {});
    nextData = null;
  }
  current?.update(dt);
}

export function render(ctx) {
  current?.render(ctx);
}

export function getCurrentScene() { return current; }
