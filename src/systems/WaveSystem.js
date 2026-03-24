import { LEVELS, DIFFICULTY, CANVAS_W, CANVAS_H } from '../config.js';
import EnemyRunner from '../entities/EnemyRunner.js';
import EnemyTank from '../entities/EnemyTank.js';
import EnemyShooter from '../entities/EnemyShooter.js';

export default class WaveSystem {
  constructor() {
    this.level = 1;
    this.waveIndex = 0;
    this.spawnQueue = [];
    this.timer = 0;
    this.done = false;
    this.waveActive = false;
  }

  init(level) {
    this.level = level;
    this.waveIndex = 0;
    this.done = false;
    this._loadWave(0);
  }

  get totalWaves() {
    const levelData = LEVELS[Math.min(this.level - 1, LEVELS.length - 1)];
    return levelData.length;
  }

  get currentWave() { return this.waveIndex + 1; }

  _loadWave(idx) {
    const levelData = LEVELS[Math.min(this.level - 1, LEVELS.length - 1)];
    const wave = levelData[idx];
    this.spawnQueue = [];
    this.timer = 0;
    this.waveActive = true;

    const n = this.level - 1;
    const countMult = 1 + n * DIFFICULTY.COUNT_SCALE;
    const intervalMult = Math.max(0.3, 1 - n * DIFFICULTY.INTERVAL_SCALE);
    const speedMult = Math.min(DIFFICULTY.SPEED_CAP, 1 + n * DIFFICULTY.SPEED_SCALE);

    for (const entry of wave.spawns) {
      const count = Math.ceil(entry.count * countMult);
      const interval = (entry.interval || 1.0) * intervalMult;
      const baseDelay = entry.delay || 0;
      for (let i = 0; i < count; i++) {
        this.spawnQueue.push({
          type: entry.type,
          time: baseDelay + i * interval,
          speedMult,
        });
      }
    }

    this.spawnQueue.sort((a, b) => a.time - b.time);
  }

  update(dt, enemies, playerX, playerY) {
    if (!this.waveActive) return;

    this.timer += dt;

    while (this.spawnQueue.length > 0 && this.spawnQueue[0].time <= this.timer) {
      const entry = this.spawnQueue.shift();
      this._spawnEnemy(entry.type, entry.speedMult, enemies, playerX, playerY);
    }
  }

  isWaveComplete(enemies) {
    return this.waveActive && this.spawnQueue.length === 0 &&
      enemies.filter(e => e.active).length === 0;
  }

  nextWave(enemies) {
    this.waveIndex++;
    const levelData = LEVELS[Math.min(this.level - 1, LEVELS.length - 1)];
    if (this.waveIndex >= levelData.length) {
      this.waveActive = false;
      this.done = true;
    } else {
      this._loadWave(this.waveIndex);
    }
  }

  _spawnEnemy(type, speedMult, enemies, playerX, playerY) {
    const { x, y } = this._randomEdgePoint();
    let enemy;
    switch (type) {
      case 'RUNNER':
        enemy = new EnemyRunner(x, y, playerX, playerY, speedMult);
        break;
      case 'TANK':
        enemy = new EnemyTank(x, y, speedMult);
        break;
      case 'SHOOTER':
        enemy = new EnemyShooter(x, y, speedMult);
        break;
      default:
        enemy = new EnemyRunner(x, y, playerX, playerY, speedMult);
    }
    enemies.push(enemy);
  }

  _randomEdgePoint() {
    const margin = 30;
    const edge = Math.floor(Math.random() * 4);
    switch (edge) {
      case 0: return { x: Math.random() * CANVAS_W, y: -margin };
      case 1: return { x: Math.random() * CANVAS_W, y: CANVAS_H + margin };
      case 2: return { x: -margin, y: Math.random() * CANVAS_H };
      case 3: return { x: CANVAS_W + margin, y: Math.random() * CANVAS_H };
    }
  }
}
