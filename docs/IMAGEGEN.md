# 地下食物生图记录

方式：内置 imagegen 工具，transparent_background=true。未使用 CLI 或外部 API Key。

成品：public/assets/food/underground-food-atlas.png，1254×1254 RGBA。四格图集包含黏液藻团、荧光丝藻、紫叶块根、琥珀巨蕨。原图复制入项目，透明通道保留。

生成原文件：/Users/kafufu/.codex/generated_images/01a14ed1-fb0f-7f22-ad86-55dd03eafe4b/exec-bfd430cd-b8ed-4033-8724-f962f5c5335b.png。

## 实际提示词

Use case: stylized-concept. Asset type: one production game sprite atlas, square 1024x1024 PNG with genuinely transparent background. Create a 2 by 2 sheet of FOUR separate original underground edible alien plant sprites for a darkly humorous dinosaur survival mining game. Hand-painted 2D side-view cartoon survival colony aesthetic reminiscent of Oxygen Not Included: bold irregular near-black outlines, chunky organic silhouettes, flattened cel shading, muted swamp colors with luminous highlights, slightly gross but cute. No characters. TOP LEFT quadrant center (256,256): low squat olive-lime green gelatinous algae sludge pile, irregular lumpy wet blobs and tiny bubbles like a slime/vomit-like algal biomass, no bowl, no rock. TOP RIGHT center (768,256): a clump of luminous mint-cyan filament algae, branching dangling broad ribbon strands and plump teal sacs, edible and juicy. BOTTOM LEFT center (256,768): large purple and dusty pink underground root plant with three broad curled leaves and a cream bulb with short roots, rare valuable food. BOTTOM RIGHT center (768,768): big golden amber cave fern/kelp, 5 curling fronds and honey-yellow edible seed pods, highest-value food. Each sprite entirely contained within its own 440x440 quadrant safe area with at least 40px transparent margin from quadrant edges; sprites do not overlap, consistent scale and lighting from upper left, centered on transparent alpha. A sprite sheet only: no panels, labels, text, numbers, grid lines, ground, cast shadow outside sprite, background, checkerboard pattern, UI or watermark. Preserve individual silhouettes; especially make the algae slime mound visibly sticky and organic. The plant art is original, not copied game screenshots.

## 使用说明

工具实际返回 1254×1254，未严格遵循请求尺寸。src/render.js 按实际宽度归一化源矩形，适配四格图集的非等宽留白；Canvas 图鉴与游戏采集物使用同一图源。
