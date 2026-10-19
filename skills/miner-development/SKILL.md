---
name: miner-development
description: 继续开发本仓库的地底打工龙，包括恐龙地下采食、分段管线、岩石碰撞、三日合同、移动交互及 Android 打包准备。
---

先读仓库根目录 MISSION.md 和 ROADMAP.md。改发行流程时再读 docs/TAPTAP_RELEASE.md；新增或替换素材时读 docs/ASSETS.md。Skill 目录向上两级为仓库根目录。

使用 JavaScript ES modules、Canvas 2D、Vite 与 Capacitor。index.js 是 UI、输入与生命周期入口；src/game.js 保持纯逻辑；src/config.js 集中数值；src/render.js 绘图；src/assets.js 载入图集；src/storage.js 保存纪录。

当前规则已由用户改为 WASD 分段管状抓手，不能恢复为旧版自动摆钩。管线不能穿岩石或自身，反方向退一格，空格原路收回；接触食物自动回收，带回入口才计数。每游戏日 60 秒，每三天统一交额度，不足则遣返地表并结束挑战。余粮可结转。若用户继续改变规则，同步 Mission 与测试。

方向按住支持连续移动，释放或切后台立即清理输入。回前台保持暂停，玩家手动继续。地图食物需从入口可达，不能超出管长；帧率变化不能让回收跳过入库或重复结算。

规则修改运行 npm run check；交互与画面修改需要浏览器试玩。修改 Android 配置后运行 android:sync，区分同步成功、Gradle 编译通过与真机验证通过。

资源优先复用用户提供的 dino 和 UI；生图食物需保存到 public/assets/food 并更新生成记录。UI 素材按 CC BY 4.0 保留作者和许可链接。Dino 包内未附许可文本，不把“用户提供文件”描述为已完成商用授权核验。参考截图不作为正式发行贴图。
