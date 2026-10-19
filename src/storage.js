const KEY = 'dino-food.save.v1';
export function readBest(storage) {
  try {
    const data = JSON.parse((storage ?? globalThis.localStorage).getItem(KEY));
    return data?.version === 1 && Number.isSafeInteger(data.best) && data.best >= 0 ? data.best : 0;
  } catch { return 0; }
}
export function writeBest(score, storage) {
  const best = Math.max(readBest(storage), Number.isSafeInteger(score) && score >= 0 ? score : 0);
  try { (storage ?? globalThis.localStorage).setItem(KEY, JSON.stringify({ version: 1, best })); } catch { /* Storage denial must not interrupt gameplay. */ }
  return best;
}
export function clearSave(storage) { try { (storage ?? globalThis.localStorage).removeItem(KEY); } catch { /* Optional local persistence. */ } }
