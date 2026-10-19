# 地底打工龙 · Dino Food Co.

陨石撞击后，恐龙被迫住进地下。你是恐龙食物公司的采集员：用能转弯的机械管深入岩缝，每天工作 60 秒，每三天交齐食物额度。没交齐，就会被遣返致命的地表。

## 开始试玩

Node.js 22.12 或以上。

```sh
npm install
npm run dev
```

打开终端的本地地址，点击签到。

| 操作 | 行为 |
| --- | --- |
| W / A / S / D 或方向键 | 抓手逐格移动；按住连续伸管，松开停止 |
| 反方向 | 退回上一节管线 |
| 空格 / 收回管线 | 整条沿原路径回收 |
| 碰到食物 | 自动夹取，回收到入口后入库 |
| Esc / 暂停按钮 | 暂停或继续；切后台自动暂停 |
| 触屏方向键 | 支持点击与按住，手机无需键盘 |
| 提前下班 | 立即结算当天，未回收食物丢失 |

岩石、边界和自己的管线都不可穿过。黏液藻团 80、荧光丝藻 140、紫叶块根 260、琥珀巨蕨 400 食物币；重植物回收更慢。第一期三天交 900，之后每期加 500，余粮留存。只保存最高累计采集纪录，关闭游戏后当前挑战重新开始。

```sh
npm run check
npm run android:sync
npm run android:open
```

Android 工程已生成。正式编译需配置 Java（可用 Android Studio 内置 JBR）与模板要求的 API 36 SDK；本机已安装的 API 37 不能替代 API 36。正式包名暂沿用 com.pocketprospector.game，尚未核验发行唯一性。release 签名和真机验证仍待完成。

## 项目文件

- [Mission](MISSION.md)：世界、机制和范围。
- [Roadmap / Skill road](ROADMAP.md)：开发阶段和能力路线。
- [开发 Skill](skills/miner-development/SKILL.md)：供后续编码助手复用。
- [素材来源](docs/ASSETS.md)、[生图提示词](docs/IMAGEGEN.md)。
- [验证记录](docs/VALIDATION.md)、[TapTap 发布清单](docs/TAPTAP_RELEASE.md)。

规则 src/game.js；配置 src/config.js；绘图 src/render.js；资源 src/assets.js；界面与输入 index.js。public/assets 中的文件会打包到 dist，并同步到 Android，运行时无需联网获取素材。
