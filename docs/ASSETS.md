# 素材来源与使用记录

## 恐龙角色

用户提供：/Users/kafufu/Desktop/黄金矿工/dinoCharactersVersion1.1.zip。

导入 sheets/DinoSprites - doux.png、mort.png、tard.png、vita.png 到 public/assets/dino/。未改像素数据；按 24×24 帧读取，整数帧切换、最近邻显示。doux 为玩家、mort 为采集站同事，另外两套保留用于后续换装。

归档包没有独立许可文件，作者/商用条款尚未核验；正式发行前补齐来源和授权记录。

## UI

来源：用户素材目录 已整理_工坊018/CompleteUI/Complete_UI_Essential_Pack_Free/01_Flat_Theme/Sprites。

作者：Crusenho Agus Hennihuno。作者主页：https://crusenho.itch.io 。许可 CC BY 4.0：https://creativecommons.org/licenses/by/4.0/ 。原许可随资源保存到 public/assets/ui/LICENSE.txt；游戏“档案与鸣谢”显示署名和链接。

| 项目文件 | 原文件 | 使用 |
| --- | --- | --- |
| panel.png | UI_Flat_Frame02a.png | 合同/图鉴/弹窗面板，CSS 九宫格边框与调色 |
| button.png | UI_Flat_Frame03a.png | 主按钮，缩放并降低饱和度 |
| key.png / key-pressed.png | UI_Flat_Button01a_1/2.png | 按键与方向控制背景 |
| arrow.png | UI_Flat_ButtonArrow01a.png | 备用方向图标 |
| bar.png | UI_Flat_Bar01a.png | 备用进度条 |
| slot.png | UI_Flat_FrameSlot01a.png | 备用槽位 |

源文件复制不改像素，界面通过 CSS 缩放/调色。未整体搬入用户其他游戏素材目录。

## 地下植物

public/assets/food/underground-food-atlas.png：内置 imagegen 生成的原创透明 RGBA 图集，1254×1254。四类植物以源矩形方式在 Canvas 取样，未修改原生成图像。提示词与生成方式见 IMAGEGEN.md。

用户提供的“土地和其中的藻类.png”“环境中植物.jpeg”等截图为环境与植物造型参考，没有作为游戏贴图复制入发行资源。

地表陨石余烬、采集站设备、岩层裂隙和管线为项目 Canvas 绘制；食物使用生成图，恐龙和 UI 使用用户素材。
