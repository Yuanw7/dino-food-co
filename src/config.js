export const WORLD = { width: 960, height: 660, cell: 40, cols: 24, rows: 12, top: 170, origin: { col: 11, row: 0 } };
export const SHIFT = { seconds: 60, daysPerContract: 3, stepSeconds: 0.12, returnSeconds: 0.045, maxSegments: 64 };
export const FOODS = {
  slime: { label: '黏液藻团', value: 80, weight: 1, atlas: 0, color: '#b9cc68', description: '岩缝里的基础口粮' },
  ribbon: { label: '荧光丝藻', value: 140, weight: 1.15, atlas: 1, color: '#79d5bf', description: '潮湿矿层的发光藻' },
  bulb: { label: '紫叶块根', value: 260, weight: 1.5, atlas: 2, color: '#d7a0cb', description: '大块、饱腹、难搬运' },
  fern: { label: '琥珀巨蕨', value: 400, weight: 1.8, atlas: 3, color: '#efbb65', description: '深层裂隙里的高价植物' }
};
export const DIRECTIONS = { up: { col: 0, row: -1 }, left: { col: -1, row: 0 }, down: { col: 0, row: 1 }, right: { col: 1, row: 0 } };
export const KEY_DIRECTIONS = { KeyW: 'up', ArrowUp: 'up', KeyA: 'left', ArrowLeft: 'left', KeyS: 'down', ArrowDown: 'down', KeyD: 'right', ArrowRight: 'right' };
export const quotaForCycle = cycle => 900 + (cycle - 1) * 500;
export const cellKey = cell => `${cell.col},${cell.row}`;
export const cellCenter = cell => ({ x: cell.col * WORLD.cell + WORLD.cell / 2, y: WORLD.top + cell.row * WORLD.cell + WORLD.cell / 2 });
