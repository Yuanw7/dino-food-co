import test from 'node:test';
import assert from 'node:assert/strict';
import { DinoGame, createCave, reachableCells } from '../src/game.js';
import { WORLD, SHIFT, DIRECTIONS, cellKey, quotaForCycle } from '../src/config.js';
import { readBest, writeBest, clearSave } from '../src/storage.js';

function play() { const game = new DinoGame(); game.newRun(); return game; }
function pathTo(game, target) {
  const queue = [{ ...game.head, route: [] }], seen = new Set([cellKey(game.head)]);
  for (const cell of queue) {
    if (cellKey(cell) === cellKey(target)) return cell.route;
    for (const [name, dir] of Object.entries(DIRECTIONS)) {
      const next = { col: cell.col + dir.col, row: cell.row + dir.row }, key = cellKey(next);
      if (next.col < 0 || next.col >= WORLD.cols || next.row < 0 || next.row >= WORLD.rows || game.rocks.has(key) || seen.has(key)) continue;
      seen.add(key); queue.push({ ...next, route: [...cell.route, name] });
    }
  }
  throw Error('Food unreachable');
}
function collect(game, food) {
  for (const direction of pathTo(game, food)) {
    game.move(direction); game.update(SHIFT.stepSeconds);
    if (game.mode === 'return' || game.phase !== 'playing') break;
  }
  while (game.mode === 'return' && game.phase === 'playing') game.update(1 / 60);
}

test('30 daily cave layouts are deterministic and every plant is reachable with finite pipe', () => {
  for (let day = 1; day <= 30; day++) {
    const game = play(); game.day = day; game.startDay();
    assert.deepEqual(createCave(day), createCave(day));
    const reachable = new Set(reachableCells(game.rocks).map(cellKey));
    assert.equal(new Set(game.foods.map(cellKey)).size, game.foods.length);
    for (const food of game.foods) { assert.ok(reachable.has(cellKey(food))); assert.ok(pathTo(game, food).length < SHIFT.maxSegments); }
    assert.ok(game.foods.reduce((sum, food) => sum + food.value, 0) > quotaForCycle(3));
  }
});
test('WASD directions build a bent pipe one cell at a time; reversing removes one segment', () => {
  const game = play(); game.foods = [];
  game.move('down'); game.move('right'); game.move('down');
  assert.deepEqual(game.pipe, [{ col: 11, row: 0 }, { col: 11, row: 1 }, { col: 12, row: 1 }, { col: 12, row: 2 }]);
  game.move('up'); assert.equal(game.pipe.length, 3); assert.deepEqual(game.head, { col: 12, row: 1 });
});
test('rock, boundary and self collision do not change the pipe', () => {
  const game = play(); game.foods = [];
  assert.equal(game.move('up'), false); assert.equal(game.pipe.length, 1);
  game.rocks.add('11,1'); assert.equal(game.move('down'), false); assert.equal(game.pipe.length, 1);
  game.rocks.delete('11,1'); game.move('down'); game.move('right'); game.move('up');
  const before = structuredClone(game.pipe); assert.equal(game.move('left'), false); assert.deepEqual(game.pipe, before);
});
test('food attaches at contact and only credits after the full path returns', () => {
  const game = play(); game.move('down'); game.move('down');
  assert.equal(game.cargo.kind, 'slime'); assert.equal(game.mode, 'return'); assert.equal(game.bank, 0);
  assert.equal(game.move('left'), false); game.update(0.045); assert.equal(game.bank, 0);
  game.update(0.046); assert.equal(game.bank, 80); assert.equal(game.daily, 80); assert.equal(game.total, 80);
  assert.equal(game.pipe.length, 1); assert.equal(game.cargo, null); assert.equal(game.foods[0].collected, true);
});
test('manual recall exactly follows every previous bend and empty pipe earns nothing', () => {
  const game = play(); game.move('right'); game.move('down'); game.move('right');
  assert.equal(game.recall(), true); game.update(0.037); assert.deepEqual(game.head, { col: 12, row: 1 });
  game.update(1); assert.deepEqual(game.head, WORLD.origin); assert.equal(game.bank, 0); assert.equal(game.mode, 'extend');
});
test('pause freezes timer and transport and blocks directional actions', () => {
  const game = play(); game.move('down'); game.move('down'); game.pause();
  const before = structuredClone(game.pipe); game.update(30); assert.equal(game.remaining, 60); assert.deepEqual(game.pipe, before); assert.equal(game.move('right'), false);
  game.resume(); game.update(0.2); assert.equal(game.bank, 80); assert.ok(game.remaining < 60);
});
test('a plant not delivered by the bell is lost and cannot count next day', () => {
  const game = play(); game.move('down'); game.move('down'); game.remaining = 0.01; game.update(0.1);
  assert.equal(game.phase, 'dayEnd'); assert.equal(game.bank, 0); assert.equal(game.cargo, null);
  game.nextDay(); assert.equal(game.day, 2); assert.equal(game.bank, 0); assert.equal(game.daily, 0); assert.equal(game.remaining, 60);
});
test('no quota penalty on days one and two; third day misses quota and is terminal', () => {
  const game = play(); game.update(60); assert.equal(game.phase, 'dayEnd'); game.nextDay();
  game.endDay(); assert.equal(game.phase, 'dayEnd'); game.nextDay(); game.endDay();
  assert.equal(game.phase, 'failed'); assert.equal(game.nextDay(), false); assert.equal(game.move('down'), false);
  game.newRun(); assert.equal(game.phase, 'playing'); assert.equal(game.day, 1); assert.equal(game.bank, 0);
});
test('exact quota passes, charges once, and next cycle raises the quota', () => {
  const game = play(); game.day = 3; game.bank = 900; game.endDay();
  assert.equal(game.phase, 'contract'); assert.equal(game.bank, 0); assert.equal(game.contracts, 1);
  assert.equal(game.endDay(), false); assert.equal(game.bank, 0); game.nextDay();
  assert.equal(game.day, 4); assert.equal(game.cycle, 2); assert.equal(game.contractDay, 1); assert.equal(game.target, 1400);
});
test('surplus is retained after handing food over', () => {
  const game = play(); game.day = 3; game.bank = 1200; game.endDay(); assert.equal(game.bank, 300); game.nextDay(); assert.equal(game.bank, 300);
});
test('an actual three-day route can fulfill the first contract within real movement/return budgets', () => {
  const game = play();
  for (let day = 1; day <= 3; day++) {
    for (let attempt = 0; attempt < 10 && game.phase === 'playing' && game.daily < 400; attempt++) {
      const foods = game.foods.filter(food => !food.collected).sort((a, b) => pathTo(game, a).length / a.value - pathTo(game, b).length / b.value);
      collect(game, foods[0]);
    }
    assert.ok(game.remaining > 0); assert.ok(game.daily >= 400);
    game.endDay(); if (day < 3) game.nextDay();
  }
  assert.equal(game.phase, 'contract'); assert.equal(game.contracts, 1);
});
test('large return steps and small return steps produce the same score and pipe', () => {
  const a = play(), b = play(); for (const game of [a, b]) { game.move('down'); game.move('down'); }
  a.update(1); for (let i = 0; i < 100; i++) b.update(0.01);
  assert.equal(a.bank, b.bank); assert.deepEqual(a.pipe, b.pipe); assert.ok(Math.abs(a.remaining - b.remaining) < 1e-8);
});
test('a heavier food travels more slowly along the same pipe', () => {
  const a = play(), b = play(); for (const game of [a, b]) { game.move('down'); game.move('down'); }
  b.cargo.weight = 3; a.update(0.1); b.update(0.1); assert.equal(a.bank, 80); assert.equal(b.bank, 0);
});
test('local records reject damaged data and tolerate storage denial', () => {
  let raw = null; const storage = { getItem: () => raw, setItem: (_, value) => { raw = value; }, removeItem: () => { raw = null; } };
  assert.equal(readBest(storage), 0); assert.equal(writeBest(600, storage), 600); assert.equal(writeBest(10, storage), 600);
  raw = '{broken'; assert.equal(readBest(storage), 0); raw = '{"version":1,"best":-1}'; assert.equal(readBest(storage), 0);
  clearSave(storage); assert.equal(raw, null);
  const denied = { getItem() { throw Error(); }, setItem() { throw Error(); }, removeItem() { throw Error(); } };
  assert.equal(writeBest(80, denied), 80); clearSave(denied);
});
