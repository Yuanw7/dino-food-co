const sources = {
  dino: '/assets/dino/doux.png', colleague: '/assets/dino/mort.png',
  food: '/assets/food/underground-food-atlas.png', panel: '/assets/ui/panel.png', slot: '/assets/ui/slot.png'
};
export async function loadAssets() {
  const entries = await Promise.all(Object.entries(sources).map(([key, url]) => new Promise((resolve, reject) => {
    const img = new Image(); img.onload = () => resolve([key, img]); img.onerror = () => reject(new Error(`素材加载失败：${url}`)); img.src = url;
  })));
  return Object.fromEntries(entries);
}
