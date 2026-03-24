# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Game

```bash
cd top-down-shooter
python3 -m http.server 8765
# Open http://localhost:8765
```

No build step, bundler, or package manager. Pure ES modules served as static files.

## Architecture

### Entry Point & Game Loop
`src/main.js` bootstraps everything: resizes the canvas, calls `SpriteFactory.generateAll()` to pre-render all sprites, registers scenes, and runs the `requestAnimationFrame` loop with delta time clamped to 50ms.

### Scene System
`src/core/SceneManager.js` is a minimal state machine. Each scene object implements `init(data)`, `update(dt)`, `render(ctx)`, and `destroy()`. Scene transitions queue via `switchScene(name, data)` and execute at the top of the next `update` call. Data flows between scenes as plain objects (e.g. `{ level, score }`).

### Rendering Pipeline (per frame in GameScene)
1. `Renderer.beginFrame()` — clears canvas, draws background grid, applies screen shake via `ctx.save/translate`
2. Enemy bullets → enemies → player bullets → player → particles
3. Wave-complete banner (if active)
4. `Renderer.endFrame()` — screen flash, scanline pass, vignette, `ctx.restore()`
5. `HUD.draw()` — drawn after `endFrame` so it's never shaken or flashed

### Sprite System
All sprites are pre-rendered to `OffscreenCanvas` objects at startup by `src/rendering/SpriteFactory.js` and stored in `src/core/AssetStore.js`. Pixel art is defined as 2D arrays of palette color keys (see `PALETTE` in `config.js`), rendered at 3× scale (16×16 logical → 48×48px). Per-frame draw cost is a single `ctx.drawImage()` call. The gun arm is a separate sprite drawn with `ctx.rotate(mouseAngle)` on top of the body (which rotates to movement direction).

### Entity Structure
- `EnemyBase` handles health, hit flash, death animation, and health bar drawing. Subclasses (`EnemyRunner`, `EnemyTank`, `EnemyShooter`) override `_move(dt)`.
- `EnemyShooter` owns its own `bullets[]` array; enemy bullets are updated and drawn by `GameScene`, not the collision system.
- `Player` owns its `bullets[]` array. Reload state is managed internally (`reloading`, `reloadTimer`).

### Wave & Difficulty Scaling
`src/systems/WaveSystem.js` reads level definitions from `LEVELS` in `config.js`. Each level is an array of wave objects with spawn entries (`type`, `count`, `interval`, `delay`). On `init(level)`, the wave is expanded into a time-sorted `spawnQueue`. Difficulty multipliers (`DIFFICULTY` in `config.js`) scale count, spawn interval, and enemy speed based on level number.

### Collision
`src/systems/CollisionSystem.js` runs circle-circle tests each frame: player bullets vs enemies, enemy bullets vs player, and enemy-player contact. Tank contact applies knockback and damage; other enemies just push the player away via a separation vector. Enemy separation from each other is also resolved here.

### Config-Driven Design
`src/config.js` is the single source of truth for all tunable values: palette, player stats, per-enemy-type stats, wave definitions, and difficulty scaling constants. Tweak here first before touching entity logic.

### Pixel Font
`src/rendering/HUD.js` contains a hand-defined 5×7 bitfield font for all uppercase letters, digits, and common symbols. Use `drawPixelText(ctx, text, x, y, scale, color)` — exported as a named export — anywhere in the codebase. Centering formula: `startX = targetCenterX - (text.length * 6 * scale) / 2`.
