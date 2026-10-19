import './src/style.css';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { DinoGame } from './src/game.js';
import { FOODS, SHIFT, KEY_DIRECTIONS, WORLD } from './src/config.js';
import { render, drawFood } from './src/render.js';
import { loadAssets } from './src/assets.js';
import { readBest, writeBest, clearSave } from './src/storage.js';

const $ = id => document.getElementById(id);
const game = new DinoGame(), canvas = $('mine'), ctx = canvas.getContext('2d');
let assets, previousPhase, last = performance.now(), best = readBest(), toastTimer, repeatClock = 0;
const heldKeys = new Map(); let touchDirection = null;
function clearInput() { heldKeys.clear(); touchDirection = null; repeatClock = 0; document.querySelectorAll('[data-dir]').forEach(button => button.classList.remove('pressed')); }
function resize() {
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = WORLD.width * ratio; canvas.height = WORLD.height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}
resize(); window.addEventListener('resize', resize);
function actionButton(label, action, primary = true) {
  const button = document.createElement('button'); button.textContent = label; button.className = primary ? 'primary' : 'secondary';
  button.addEventListener('click', () => { clearInput(); action(); updateUI(); if (game.phase === 'playing') canvas.focus({ preventScroll: true }); }); return button;
}
function showOverlay(title, text, actions, eyebrow = 'DINO FOOD CO.', variant = '') {
  const overlay = $('overlay'); overlay.replaceChildren(); overlay.className = `overlay ${variant}`;
  const card = document.createElement('div'); card.className = 'overlay-card';
  const portrait = document.createElement('div'); portrait.className = 'card-dino';
  const tag = document.createElement('p'); tag.className = 'eyebrow'; tag.textContent = eyebrow;
  const heading = document.createElement('h2'); heading.textContent = title;
  const paragraph = document.createElement('p'); paragraph.textContent = text;
  card.append(portrait, tag, heading, paragraph, ...actions); overlay.append(card); overlay.hidden = false;
}
function updateUI() {
  $('day').textContent = String(game.day).padStart(2, '0');
  $('cycle').textContent = `合同 ${String(game.cycle).padStart(2, '0')} · 第 ${game.contractDay} / 3 天`;
  $('daily').replaceChildren(document.createTextNode(`${game.daily} `), Object.assign(document.createElement('small'), { textContent: '币' }));
  $('time').replaceChildren(document.createTextNode(`${Math.ceil(game.remaining)} `), Object.assign(document.createElement('small'), { textContent: '秒' }));
  $('time').classList.toggle('urgent', game.remaining <= 10);
  $('time-fill').style.width = `${game.remaining / SHIFT.seconds * 100}%`;
  $('bank').textContent = game.bank; $('target').textContent = game.target;
  $('quota-fill').style.width = `${Math.min(game.bank / game.target, 1) * 100}%`;
  $('contract-number').textContent = `#${String(game.cycle).padStart(3, '0')}`;
  [...$('day-dots').children].forEach((el, i) => { el.classList.toggle('current', i + 1 === game.contractDay); el.classList.toggle('done', i + 1 < game.contractDay); });
  $('contract-tip').textContent = game.phase === 'contract' ? '本期额度已上交。余粮留存，迎接下一份合同。' : game.bank >= game.target ? '本期额度已备齐。继续采集，余粮可带到下一期。' : `还差 ${game.target - game.bank} 食物币。${game.contractDay === 3 ? '今天是交粮日。' : '第三天下班时统一结算。'}`;
  $('best').textContent = `最高累计采集 ${best} 币`;
  $('pipe-length').textContent = `管线 ${game.pipe.length - 1} / ${SHIFT.maxSegments - 1}`;
  $('recall').disabled = game.phase !== 'playing' || game.mode === 'return' || game.pipe.length <= 1;
  $('end-day').disabled = game.phase !== 'playing';
  $('pause').disabled = !['playing', 'paused'].includes(game.phase);
  $('pause').textContent = game.phase === 'paused' ? '▶' : 'Ⅱ';
  $('pause').setAttribute('aria-label', game.phase === 'paused' ? '继续游戏' : '暂停游戏');
  document.querySelectorAll('[data-dir]').forEach(el => { el.disabled = game.phase !== 'playing' || game.mode === 'return'; });
  $('status').textContent = game.phase === 'playing' ? game.mode === 'return' ? game.cargo ? `回收入库中 · ${game.cargo.label}` : '空管回收中' : game.blocked ? '前方受阻 · 换个方向绕行' : '抓手就绪 · WASD / 方向键移动' : game.phase === 'paused' ? '休息时间 · 计时已暂停' : '等待员工签到';
  if (previousPhase === game.phase) return;
  previousPhase = game.phase; clearInput();
  if (game.phase === 'playing') { $('overlay').hidden = true; return; }
  if (game.phase === 'ready') showOverlay('欢迎入职，打工龙。', '陨石摧毁了地表。你受雇于恐龙食物公司，在岩缝中寻找藻类。每天工作 60 秒，每三天交一次额度；交不齐，就被送回致命的地表。', [actionButton('签到 · 开始第 1 天  →', () => game.newRun())], '员工编号 042 / 地下采集员');
  if (game.phase === 'paused') showOverlay('喘口气，再继续。', '管线和计时都已暂停。WASD 控制方向，接触植物会自动原路回收；空格可以收回空管。', [actionButton('回到岗位  →', () => game.resume())], '临时休息 / 不扣工时');
  if (['dayEnd', 'contract', 'failed'].includes(game.phase)) {
    best = writeBest(game.total); $('best').textContent = `最高累计采集 ${best} 币`;
    if (game.phase === 'dayEnd') showOverlay('今天，活着下班了。', `本日入库 ${game.daily} 币，仓库累计 ${game.bank} 币。距离第 3 天交粮还剩 ${3 - game.contractDay} 天，额度为 ${game.target} 币。明天是新的岩缝。`, [actionButton(`开始第 ${game.day + 1} 天  →`, () => game.nextDay())], `第 ${game.day} 天 / 下班结算`);
    if (game.phase === 'contract') showOverlay('床位保住了。', `已上交 ${game.lastSettlement.quota} 食物币，剩余 ${game.bank} 币。公司批准你继续留在地下；下一期额度 ${game.target + 500} 币。`, [actionButton('签下续约合同  →', () => game.nextDay())], `第 ${game.cycle} 期合同 / 已履约`, 'success');
    if (game.phase === 'failed') showOverlay('地表没有明天。', `第三天到期：只交得出 ${game.bank} / ${game.target} 食物币。公司取消了你的地下居住权，将你扔回被陨石灼烧的地表。这只打工龙的故事结束了。`, [actionButton('换一只恐龙 · 重新入职', () => game.newRun())], `解雇通知 / 生存 ${game.day} 天`, 'failure');
  }
}
function pause() { clearInput(); game.pause(); updateUI(); }
$('recall').addEventListener('click', () => { clearInput(); game.recall(); canvas.focus({ preventScroll: true }); });
$('end-day').addEventListener('click', () => { clearInput(); game.endDay(); updateUI(); });
$('pause').addEventListener('click', () => { clearInput(); game.phase === 'paused' ? game.resume() : game.pause(); updateUI(); });
window.addEventListener('keydown', event => {
  if ($('privacy-dialog').open || event.target.closest('input, textarea, select')) return;
  const direction = KEY_DIRECTIONS[event.code];
  if (direction && game.phase === 'playing') {
    event.preventDefault();
    if (!event.repeat) { heldKeys.set(event.code, direction); repeatClock = 0; game.move(direction); }
  }
  if (event.code === 'Space' && game.phase === 'playing' && !event.target.closest('button')) { event.preventDefault(); if (!event.repeat) { clearInput(); game.recall(); } }
  if (event.code === 'Escape' && !event.repeat) { clearInput(); game.phase === 'paused' ? game.resume() : game.pause(); updateUI(); }
});
window.addEventListener('keyup', event => heldKeys.delete(event.code));
window.addEventListener('blur', pause);
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
for (const button of document.querySelectorAll('[data-dir]')) {
  button.addEventListener('pointerdown', event => { event.preventDefault(); button.setPointerCapture(event.pointerId); touchDirection = button.dataset.dir; repeatClock = 0; button.classList.add('pressed'); game.move(touchDirection); });
  const release = () => { if (touchDirection === button.dataset.dir) touchDirection = null; button.classList.remove('pressed'); };
  button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release); button.addEventListener('lostpointercapture', release);
}
if (Capacitor.isNativePlatform()) {
  App.addListener('appStateChange', ({ isActive }) => { if (!isActive) pause(); });
  App.addListener('backButton', () => { if ($('privacy-dialog').open) $('privacy-dialog').close(); else if (game.phase === 'playing') pause(); else App.exitApp(); });
}
$('privacy').addEventListener('click', () => { pause(); $('privacy-dialog').showModal(); });
$('close-privacy').addEventListener('click', () => $('privacy-dialog').close());
$('clear-save').addEventListener('click', () => { clearSave(); best = 0; $('best').textContent = '最高累计采集 0 币'; });
let uiClock = 0;
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.25); last = now;
  if (game.phase === 'playing') {
    const direction = touchDirection ?? [...heldKeys.values()].at(-1);
    if (direction && game.mode === 'extend') { repeatClock += dt; while (repeatClock >= SHIFT.stepSeconds) { repeatClock -= SHIFT.stepSeconds; game.move(direction); } }
    else repeatClock = 0;
    game.update(dt);
  }
  render(ctx, game, assets, now / 1000); uiClock += dt;
  if (uiClock > 0.08 || game.phase !== previousPhase) { updateUI(); uiClock = 0; }
  if (game.notice) {
    $('toast').textContent = game.notice; game.notice = ''; $('toast').classList.add('visible');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 1600);
  }
  requestAnimationFrame(frame);
}
try {
  assets = await loadAssets();
  for (const food of Object.values(FOODS)) {
    const row = document.createElement('div'); row.className = 'food-row';
    const icon = document.createElement('canvas'); icon.width = 96; icon.height = 96; icon.setAttribute('aria-hidden', 'true'); drawFood(icon.getContext('2d'), assets.food, food, 48, 48, 86);
    const label = document.createElement('div'); const name = document.createElement('strong'); name.textContent = food.label; const desc = document.createElement('small'); desc.textContent = food.description; label.append(name, desc);
    const price = document.createElement('b'); price.textContent = food.value; price.style.color = food.color; row.append(icon, label, price); $('food-list').append(row);
  }
  last = performance.now(); updateUI(); requestAnimationFrame(frame);
} catch (error) { $('loading').textContent = `${error.message}。请刷新重试。`; }
