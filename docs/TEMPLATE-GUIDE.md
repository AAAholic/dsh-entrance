# 换成你自己的入场模板

维护者已确认将当前自用的完整效果作为示例模板公开。先运行原版，理解每个图层的职责，再逐一替换；不需要更改 DSH 主程序。

准备素材前先看 [通用创作流程](CREATIVE-WORKFLOW.md) 和 [素材规格](ASSET-SPEC.md)，本文说明代码中要改哪些位置。

## 换插图

图片位于 `lib/assets/entrance/20261006/`：

| 文件 | 内容 | 替换要求 |
| --- | --- | --- |
| `yoimiya-welcome.png` | 透明背景主体 | 当前逻辑坐标为 1122 × 1402；同比例高清源可映射回来，不同姿势需要重设关节 |
| `yoimiya-expression.png` | 对齐的表情帧 | 与主体同画布比例、注册位置，建议同源像素规格；眼嘴覆盖区需匹配 |
| `festival-ribbon-v1.png` | 左侧飘带 | 保留真实 alpha，顶端为固定点 |
| `koi-emblem-v1.png` | 左上静态鱼饰 | 透明背景；与底部跳跃鱼群不是同一层 |

底部跳跃鱼群是 `welcome-river.mjs` 中的 SVG，可修改身体、尾鳍路径和颜色。折扇、背景和底部水纹是 `welcome-ornaments.mjs` 中的矢量装饰。

代码 MIT 与插图授权分开：四张示例 PNG 与 `docs/media/demo.gif` 不在 MIT 范围内，本仓库不授予素材权利，参见 [LICENSE-ASSETS](../LICENSE-ASSETS)、[素材说明](ASSETS-LICENSE.md) 和 [NOTICE](../NOTICE.md)。发布衍生版本时，替换为你能够公开分发的图片与演示媒体，或另行确认素材使用依据。

换图前请确认：

1. 示例画面经 AI 生成或编辑；公开图片或动画录屏时应声明其中的 AI 生成画面。
2. 保留原始 PNG 与其内嵌 C2PA 记录，不要删除或伪造 AI 来源标识；同时保留实际制作记录。修改后的图片不能直接照搬原图的清单，应准确记录新的编辑流程。
3. **换人物不只是替换文件名**。逻辑画布、腕/肘枢轴、裁切与表情区域按示例姿态写死；画布比例、构图、留白或姿态变化时需要重新标定。仅提高同比例源图分辨率且位置对齐时，可以保留逻辑坐标。

## 换人物与局部动作

在控制器调用 `mountWelcomeScene()` 的选项中设置 `blink: false`、`handAmplitude: 0`、`handSpeed: 0`，先检查静态构图。然后在 `welcome-character.mjs` 按需要调整逻辑画布、腕/肘枢轴、手臂/手掌裁切、局部画布 bounds 和眼嘴遮罩，更新无障碍说明。

幅度设为零只停止关节旋转，原裁切仍然存在。完全不同的人物轮廓应先将角色模块改成单张静态 `<img>`，再按新角色制作裁切；不要照搬宵宫的手臂轮廓。关节附近留裁切重叠，表情帧须与基础图对齐。

## 换文案、配色和分镜

在 `welcome-scene.mjs` 修改欢迎文案、字体、背景色及布局；在 `welcome-ornaments.mjs` 修改装饰。先保留主时间轴的错峰关系，再调各层开始/结束时间。

水波退出通过 `welcomeWaterWaves()` 同时驱动水纹和擦除遮罩。调整扩散节奏时，保持两者共用几何，避免水纹过去后画面仍停留。

## 验证与分发

```sh
npm run build
npm test
npm run preview
```

检查宽屏、手机宽度、最大动作幅度、系统减少动态、重播与长按退出。确认新图片成功加载，关闭再启用插件没有残留按钮或重复资源路由。

更改插件包名时，同步 `package.json`、`cordis.patch.yml`、两个入口的 `name`、构建脚本 ModuleLoader 的 `id`。资源前缀在 `lib/src/routes.mjs`，存储键与外部事件在 `controller.mjs`；另起插件时一并更名，避免与原模板冲突。

最后执行 `npm pack`，或将含预构建 `lib/client.js` 的仓库地址填入 DSH 添加插件界面。
