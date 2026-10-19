import { WORLD, cellCenter, cellKey } from './config.js';
const TAU = Math.PI * 2;
export function drawFood(ctx, image, food, x, y, size) {
  // The generated atlas has slightly asymmetric gutters. Source rectangles keep each plant isolated.
  const boxes = [[0, 0, 640, 610], [640, 0, 640, 630], [0, 610, 640, 670], [640, 630, 640, 650]];
  const [sx, sy, sw, sh] = boxes[food.atlas];
  const scale = image.width / 1280;
  ctx.drawImage(image, sx * scale, sy * scale, sw * scale, sh * scale, x - size / 2, y - size / 2, size, size);
}
export function drawDino(ctx, image, x, y, scale = 3, time = 0, moving = false) {
  const frame = (moving ? 4 : 0) + Math.floor(time * (moving ? 8 : 4)) % 4;
  ctx.save(); ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, frame * 24, 0, 24, 24, x - 12 * scale, y - 24 * scale, 24 * scale, 24 * scale); ctx.restore();
}
export function render(ctx, game, assets, time) {
  const { width: w, height: h, cell, top } = WORLD;
  ctx.clearRect(0, 0, w, h);
  // Ash-choked surface above the underground employee station.
  const sky = ctx.createLinearGradient(0, 0, 0, 100); sky.addColorStop(0, '#241e25'); sky.addColorStop(1, '#935943');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, 100);
  ctx.fillStyle = '#c7895d'; ctx.beginPath(); ctx.arc(750, 54, 32, 0, TAU); ctx.fill();
  ctx.fillStyle = '#382d2d'; ctx.beginPath(); ctx.moveTo(0, 90);
  for (let x = 0; x <= w; x += 25) ctx.lineTo(x, 61 + Math.sin(x * 0.021) * 14 + Math.cos(x * 0.083) * 9);
  ctx.lineTo(w, 103); ctx.lineTo(0, 103); ctx.fill();
  ctx.strokeStyle = '#d3916433'; ctx.lineWidth = 1;
  for (let i = 0; i < 24; i++) { const x = (i * 79 + time * 9) % w, y = (i * 17 + time * 12) % 81; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 5); ctx.stroke(); }
  ctx.font = '10px monospace'; ctx.fillStyle = '#dfb69a'; ctx.fillText('地表 / 禁止通行 · 陨石纪元 001', 20, 24);
  ctx.fillStyle = '#191f20'; ctx.fillRect(0, 94, w, top - 94);
  ctx.strokeStyle = '#414c45'; ctx.lineWidth = 2; ctx.strokeRect(20, 110, 290, 45); ctx.strokeRect(668, 110, 272, 45);
  ctx.font = 'bold 13px sans-serif'; ctx.fillStyle = '#c5c9ab'; ctx.fillText('DINO FOOD CO.   地下采集站', 37, 130);
  ctx.font = '10px sans-serif'; ctx.fillStyle = '#79877b'; ctx.fillText('工作使恐龙免于灭绝。—— 员工手册第 1 条', 37, 147);
  ctx.fillStyle = '#65735b'; ctx.fillRect(668, 148, 272 * Math.min(game.bank / game.target, 1), 4);
  ctx.fillStyle = '#aeb9a5'; ctx.fillText(`仓库 ${game.bank} / ${game.target}    ·    第 ${game.contractDay} / 3 天`, 685, 135);
  drawDino(ctx, assets.dino, 393, 162, 3.4, time, game.mode === 'return');
  drawDino(ctx, assets.colleague, 602, 158, 2.4, time + 1);
  const origin = cellCenter(WORLD.origin);
  ctx.fillStyle = '#5f6b5c'; ctx.fillRect(432, 124, 58, 43); ctx.fillStyle = '#b6b28b'; ctx.fillRect(437, 129, 48, 6);
  ctx.fillStyle = '#1c2929'; ctx.fillRect(440, 141, 28, 18); ctx.fillStyle = game.mode === 'return' ? '#d7b870' : '#a0cd94'; ctx.fillRect(443, 145, 12, 9);
  ctx.strokeStyle = '#899482'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(origin.x, 163); ctx.lineTo(origin.x, origin.y); ctx.stroke();
  // Cave floor, subtly tiled to make the segment-based movement readable.
  const cave = ctx.createLinearGradient(0, top, 0, h); cave.addColorStop(0, '#253a34'); cave.addColorStop(0.5, '#22342e'); cave.addColorStop(1, '#182a27');
  ctx.fillStyle = cave; ctx.fillRect(0, top, w, h - top);
  ctx.strokeStyle = '#b5cca709'; ctx.lineWidth = 1;
  for (let col = 0; col <= WORLD.cols; col++) { ctx.beginPath(); ctx.moveTo(col * cell, top); ctx.lineTo(col * cell, h); ctx.stroke(); }
  for (let row = 0; row <= WORLD.rows; row++) { ctx.beginPath(); ctx.moveTo(0, top + row * cell); ctx.lineTo(w, top + row * cell); ctx.stroke(); }
  for (let i = 0; i < 65; i++) {
    const x = (i * 117 + 29) % w, y = top + (i * 61 + Math.sin(time * 0.3 + i) * 5) % (h - top);
    ctx.fillStyle = i % 5 === 0 ? '#a9c47c50' : '#9baa7c17'; ctx.fillRect(x, y, 2, 2);
  }
  for (const key of game.rocks) {
    const [col, row] = key.split(',').map(Number), x = col * cell, y = top + row * cell;
    ctx.fillStyle = '#101c1c'; ctx.fillRect(x, y, cell, cell);
    const n = (col * 13 + row * 7) % 9;
    ctx.beginPath(); ctx.moveTo(x + 2, y + 6); ctx.lineTo(x + 8, y + 2); ctx.lineTo(x + 32, y + 3 + n / 2); ctx.lineTo(x + 38, y + 11); ctx.lineTo(x + 36, y + 35); ctx.lineTo(x + 8, y + 38); ctx.lineTo(x + 3, y + 26); ctx.closePath();
    ctx.fillStyle = ['#3c4742', '#414b44', '#36443e'][n % 3]; ctx.fill();
    ctx.strokeStyle = '#64705b80'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 4, y + 8); ctx.lineTo(x + 9, y + 4); ctx.lineTo(x + 30, y + 5); ctx.stroke();
    ctx.strokeStyle = '#182823'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + 29, y + 5); ctx.lineTo(x + 21, y + 20); ctx.lineTo(x + 31, y + 30); ctx.stroke();
    if (!game.rocks.has(cellKey({ col, row: row - 1 })) && row > 0) { ctx.fillStyle = '#83935c'; ctx.fillRect(x + 5, y + 1, 25, 3); }
  }
  for (const food of game.foods) if (!food.collected && game.cargo !== food) {
    const p = cellCenter(food), size = food.atlas > 1 ? 55 : 43;
    ctx.fillStyle = `${food.color}12`; ctx.beginPath(); ctx.ellipse(p.x, p.y + 8, 24, 12, 0, 0, TAU); ctx.fill();
    drawFood(ctx, assets.food, food, p.x, p.y - 3 + Math.sin(time * 1.4 + food.id) * 1.2, size);
    ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = food.color; ctx.fillText(`${food.value}`, p.x, p.y + 24); ctx.textAlign = 'left';
  }
  // The hose retains every bend. Its tip can only move to an adjacent empty cell.
  const points = game.pipe.map(cellCenter);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  for (const [width, color] of [[18, '#101c20'], [13, '#758f8d'], [8, '#a1b8aa'], [3, '#d4e0bc']]) {
    ctx.lineWidth = width; ctx.strokeStyle = color; ctx.beginPath(); ctx.moveTo(origin.x, top - 1); points.forEach(p => ctx.lineTo(p.x, p.y)); ctx.stroke();
  }
  ctx.strokeStyle = '#3d5a5b'; ctx.lineWidth = 2;
  points.forEach((p, i) => { if (!i) return; const prev = points[i - 1]; const dx = p.x - prev.x, dy = p.y - prev.y; const mx = (p.x + prev.x) / 2, my = (p.y + prev.y) / 2; ctx.beginPath(); ctx.moveTo(mx + (dy ? 6 : 0), my + (dx ? 6 : 0)); ctx.lineTo(mx - (dy ? 6 : 0), my - (dx ? 6 : 0)); ctx.stroke(); });
  const head = points[points.length - 1];
  if (game.cargo) drawFood(ctx, assets.food, game.cargo, head.x, head.y + 3, 35);
  ctx.strokeStyle = '#e3c588'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(head.x - 10, head.y - 7); ctx.lineTo(head.x - 11, head.y + 7); ctx.lineTo(head.x - 5, head.y + 11); ctx.moveTo(head.x + 10, head.y - 7); ctx.lineTo(head.x + 11, head.y + 7); ctx.lineTo(head.x + 5, head.y + 11); ctx.stroke();
  if (game.blocked) { const p = cellCenter(game.blocked); ctx.strokeStyle = '#e2946970'; ctx.lineWidth = 2; ctx.strokeRect(p.x - 17, p.y - 17, 34, 34); }
  const vignette = ctx.createRadialGradient(w / 2, 390, 180, w / 2, 390, 580); vignette.addColorStop(0, '#0000'); vignette.addColorStop(1, '#07111299'); ctx.fillStyle = vignette; ctx.fillRect(0, top, w, h - top);
  if (game.phase === 'failed') { ctx.fillStyle = '#6e241955'; ctx.fillRect(0, 0, w, h); }
}
