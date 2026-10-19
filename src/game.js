import { WORLD, SHIFT, FOODS, DIRECTIONS, cellKey, quotaForCycle } from './config.js';

function seeded(seed) { return () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; }; }
export function reachableCells(rocks, origin = WORLD.origin) {
  const queue = [{ ...origin }], seen = new Set([cellKey(origin)]);
  for (let i = 0; i < queue.length; i++) {
    for (const direction of Object.values(DIRECTIONS)) {
      const cell = { col: queue[i].col + direction.col, row: queue[i].row + direction.row }, key = cellKey(cell);
      if (cell.col < 0 || cell.col >= WORLD.cols || cell.row < 0 || cell.row >= WORLD.rows || rocks.has(key) || seen.has(key)) continue;
      seen.add(key); queue.push(cell);
    }
  }
  return queue;
}
export function createCave(day) {
  const rocks = new Set();
  const add = (col, row) => rocks.add(cellKey({ col, row }));
  for (let row = 0; row < WORLD.rows; row++) { add(0, row); add(23, row); }
  for (let col = 0; col < WORLD.cols; col++) add(col, 11);
  // Staggered shelves create connected rock crevices, with two-cell openings.
  for (const [start, end, row] of [[2, 8, 3], [12, 18, 3], [5, 13, 6], [17, 21, 7], [2, 7, 9], [11, 15, 9]]) {
    for (let col = start; col <= end; col++) if (col !== (day % 3) + start + 2) add(col, row);
  }
  for (let row = 1; row < 5; row++) add(19, row);
  for (let row = 6; row < 9; row++) add(3, row);
  for (let row = 8; row < 11; row++) add(17, row);
  const random = seeded(day * 817 + 23);
  const reachable = reachableCells(rocks);
  const candidates = reachable.filter(cell => cell.row >= 1 && Math.abs(cell.col - WORLD.origin.col) + cell.row > 3);
  // Shuffle deterministically so tests and saved day numbers reproduce the same map.
  for (let i = candidates.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [candidates[i], candidates[j]] = [candidates[j], candidates[i]]; }
  const selected = [];
  for (const candidate of candidates) {
    if (selected.every(cell => Math.abs(cell.col - candidate.col) + Math.abs(cell.row - candidate.row) >= 3)) selected.push(candidate);
    if (selected.length === 17) break;
  }
  // One visible starter plant just below the port teaches movement and auto-return.
  selected.unshift({ col: 11, row: 2 });
  const foods = selected.map((cell, id) => {
    const kind = id === 0 ? 'slime' : cell.row > 7 ? ['bulb', 'fern'][id % 2] : ['slime', 'ribbon', 'bulb'][id % 3];
    return { ...cell, id, kind, ...FOODS[kind], collected: false };
  });
  return { rocks, foods };
}
export class DinoGame {
  constructor() { this.newRun(); this.phase = 'ready'; }
  get cycle() { return Math.floor((this.day - 1) / SHIFT.daysPerContract) + 1; }
  get contractDay() { return (this.day - 1) % SHIFT.daysPerContract + 1; }
  get target() { return quotaForCycle(this.cycle); }
  get head() { return this.pipe[this.pipe.length - 1]; }
  newRun() {
    this.day = 1; this.bank = 0; this.total = 0; this.contracts = 0; this.lastSettlement = null; this.startDay();
  }
  startDay() {
    const cave = createCave(this.day);
    this.rocks = cave.rocks; this.foods = cave.foods;
    this.pipe = [{ ...WORLD.origin }]; this.cargo = null; this.mode = 'extend'; this.remaining = SHIFT.seconds;
    this.daily = 0; this.notice = ''; this.blocked = null; this.returnClock = 0; this.phase = 'playing';
  }
  move(directionName) {
    if (this.phase !== 'playing' || this.mode !== 'extend' || !DIRECTIONS[directionName]) return false;
    const d = DIRECTIONS[directionName], next = { col: this.head.col + d.col, row: this.head.row + d.row }, key = cellKey(next);
    if (next.col < 0 || next.col >= WORLD.cols || next.row < 0 || next.row >= WORLD.rows || this.rocks.has(key)) {
      this.blocked = next; this.notice = '岩层不可穿过 · 换个方向绕行'; return false;
    }
    if (this.pipe.length > 1 && cellKey(this.pipe[this.pipe.length - 2]) === key) { this.pipe.pop(); this.blocked = null; return true; }
    if (this.pipe.some(cell => cellKey(cell) === key)) { this.blocked = next; this.notice = '管线不能交叉 · 反方向可逐格退回'; return false; }
    if (this.pipe.length >= SHIFT.maxSegments) { this.notice = '管线已到极限 · 空格收管'; return false; }
    this.pipe.push(next); this.blocked = null;
    const food = this.foods.find(item => !item.collected && cellKey(item) === key);
    if (food) { this.cargo = food; this.recall(); this.notice = `已夹住${food.label} · 正沿原路回收`; }
    return true;
  }
  recall() {
    if (this.phase !== 'playing' || this.mode === 'return' || this.pipe.length <= 1) return false;
    this.mode = 'return'; this.returnClock = 0; this.blocked = null; return true;
  }
  pause() { if (this.phase === 'playing') this.phase = 'paused'; }
  resume() { if (this.phase === 'paused') this.phase = 'playing'; }
  update(dt) {
    if (this.phase !== 'playing' || !Number.isFinite(dt) || dt <= 0) return;
    const elapsed = Math.min(dt, this.remaining);
    if (this.mode === 'return') {
      this.returnClock += elapsed;
      const interval = SHIFT.returnSeconds * (this.cargo?.weight ?? 0.8);
      while (this.returnClock >= interval && this.mode === 'return') {
        this.returnClock -= interval; this.pipe.pop();
        if (this.pipe.length === 1) {
          if (this.cargo) {
            this.cargo.collected = true; this.daily += this.cargo.value; this.bank += this.cargo.value; this.total += this.cargo.value;
            this.notice = `${this.cargo.label}入库 +${this.cargo.value} 食物币`; this.cargo = null;
          }
          this.mode = 'extend'; this.returnClock = 0;
        }
      }
    }
    this.remaining = Math.max(0, this.remaining - elapsed);
    if (this.remaining < 1e-7 || this.foods.every(food => food.collected)) this.endDay();
  }
  endDay() {
    if (this.phase !== 'playing') return false;
    // Unreturned food is lost. Only the warehouse balance counts toward the contract.
    this.cargo = null; this.mode = 'extend'; this.pipe = [{ ...WORLD.origin }];
    this.lastSettlement = { day: this.day, daily: this.daily, bank: this.bank, quota: this.target };
    if (this.contractDay < SHIFT.daysPerContract) this.phase = 'dayEnd';
    else if (this.bank >= this.target) { this.bank -= this.target; this.contracts += 1; this.phase = 'contract'; }
    else this.phase = 'failed';
    return true;
  }
  nextDay() {
    if (!['dayEnd', 'contract'].includes(this.phase)) return false;
    this.day += 1; this.startDay(); return true;
  }
}
