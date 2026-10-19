# 开发路线与 Skill road

当前方向：恐龙地下采食 + 分段管线操作 + 每三天生存合同。0.2 替换了 0.1 的自动摆钩五关方案。

| 阶段 | 状态 | 交付与验收 |
| --- | --- | --- |
| M0 地基 | 已实现 | Mission、Skill、Canvas/Vite/Capacitor 分层、Android 原生目录 |
| M1 新玩法原型 | 已实现 | 恐龙动画、素材包 UI、生成食物、WASD/触屏管线、岩石阻挡、每日 60 秒、三日额度与遣返结局 |
| M2 手感与平衡 | 待玩家验证 | 连续完成三天；核对植物分布、管长、回收速度与递增额度；增加音效/震动与结局演出 |
| M3 Android 验收 | 待真机构建 | 配置 Java/API 36 SDK、构建、自有 release 签名、离线启动、返回键/后台/旋转/触控、性能测试 |
| M4 发布准备 | 待完成 | 正式名称、包名、适用资质、素材许可、原创应用图标、隐私政策、截图与录屏 |
| M5 TapTap 测试与发行 | 待申请 | 按当前官方条件申请测试、完成反馈整改，再推进正式发行 |

## 建议下一步

先运行 npm run dev 体验完整三天。输入、碰撞和交粮规则已测试，程序路径验证不能代替人类操作难度判断。先调整 src/config.js 中食物价值、移动/回收速度和 quotaForCycle，再扩充地图、天气、设备或技能。

原生目录已生成；修改后 npm run android:sync，再通过 npm run android:open 打开 Android Studio。不要重复运行 android:add，除非确实重新初始化平台。

## Skill road

| 能力 | 实践位置 | 验收点 |
| --- | --- | --- |
| 网格与路径 | src/game.js | 相邻格移动、自碰撞、反向退格、沿路径回收 |
| 地图与可达性 | createCave / reachableCells | 不把食物放进岩石、封闭空间或超长路线 |
| 时间与状态机 | DinoGame | 60 秒、前两天结算、第三天扣额、续约/失败只执行一次 |
| 美术与资源 | src/assets.js / src/render.js | 像素恐龙逐帧动画、透明植物图集、可辨识的障碍边界 |
| 输入与生命周期 | index.js | WASD 按住/松开、触屏取消、暂停/失焦不残留输入 |
| 发行与记录 | docs/TAPTAP_RELEASE.md | 版本、签名、真机与平台资料一致 |

后续编码约定：skills/miner-development/SKILL.md。
