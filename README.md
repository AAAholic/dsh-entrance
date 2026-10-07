# DSH Entrance

![宵宫入场动画演示](docs/media/demo.gif)

为 DeepSeek Harness 加上一段宵宫分层登场、烟花与游鱼相伴、点击后以水波退场的欢迎动画。

[![CI](https://github.com/AAAholic/dsh-entrance/actions/workflows/ci.yml/badge.svg)](https://github.com/AAAholic/dsh-entrance/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/AAAholic/dsh-entrance)](https://github.com/AAAholic/dsh-entrance/releases/latest)

## 安装到 DSH

1. 在 DSH 插件管理页选择“添加插件”。
2. 在“包名或地址”中填写 `https://github.com/AAAholic/dsh-entrance`。
3. 安装后启用 `dsh-entrance`，即可使用随包的宵宫入场动画。

**默认就是上图的宵宫作品，无需 DIY、模型 API 或远程图片服务。**右上角仅保留一个低对比度的“动画设置”入口，重播放在设置面板中；也可按 `Alt+Shift+W` 打开设置。宿主设置页另有“入场动画”分区。已有启动弹窗或用户已经开始输入时，会跳过本轮自动欢迎。

这是非官方社区项目，与 DeepSeek、上游作者及角色权利方无隶属或背书关系。代码与代码文档采用 [MIT](LICENSE)；示例图像经 AI 生成或编辑，**不在 MIT 范围内，本仓库不授予素材权利**。来源、第三方权利及再分发边界见 [LICENSE-ASSETS](LICENSE-ASSETS) 和 [NOTICE](NOTICE.md)。

<details>
<summary>固定版本、本地安装与兼容说明</summary>

目标接口按 **DSH 0.1.7-rc.2** 的官方 bundle 契约适配；其他版本需支持相同插件结构。仓库包含预构建客户端，普通安装不需要构建。没有发布到 npm registry，不要只填 `dsh-entrance` 包名。

固定版本可从 [Releases](https://github.com/AAAholic/dsh-entrance/releases/latest) 下载 `.tgz`，在同一输入框填写文件绝对路径或附件直链。每个 Release 附版本说明、验证链接和 `SHA256SUMS`。本地克隆也可填写仓库根目录的绝对路径，其中应有 `package.json`、`cordis.patch.yml` 和 `lib/`。

GitHub 与 `.tgz` 直链直接访问对应站点，更换 npm 安装源不会代替这部分网络连接。输入形式已核对 DSH 插件管理器的解析逻辑与界面文案。

如果还装有带入场功能的旧版 `whale-girl`，请在插件页停用其中一个插件。独立插件会避让已存在的旧欢迎层，但旧插件重播可能反向叠加，两者也共用快捷键；仅关闭一方自动欢迎无法消除全部冲突。

</details>

## 可调内容

| 控件 | 范围/默认 | 含义 |
| --- | --- | --- |
| 烟花亮度 | `0–100%`，默认 `50%` | 中点保留基准效果，最大值提高发光强度 |
| 挥手幅度、速度 | 各 `0–100%`，默认 `50%` | 分别控制幅度与速度，结束回到原姿态 |
| 飘带摆幅、速度 | 各 `0–100%`，默认 `50%` | 顶端固定、尾部摆动 |
| 游鱼跃起幅度、速度 | 各 `0–100%`，默认 `50%` | 连续错峰跃水，起落伴随短水纹 |
| 游鱼数量 | `2 / 3`，默认 `3` | 大小、轮廓和配色不同 |
| 展开时长 | `1.5–5.0 s`，默认 `3.2 s` | 不含停留和 `2.2 s` 水波退出 |

提供自动欢迎、总动画、烟花、飘带与游鱼开关，以及静谧/轻盈/祭典预设。`100%` 为两倍基准参数增益，不代表感知亮度线性翻倍；`0%` 对应熄灭或停止相关动作。

关闭动画或开启系统“减少动态”时保留静态构图，退出立即完成。偏好保存在当前浏览器/宿主 origin 的 `localStorage`，下次重播生效。

## 可选：让智能体制作个人版本（实验性）

**只有你提出换角色、OC 或主题创作时才进入 DIY。**这套指引仍在真实试用和修订，三轮问题及当前限制见 [试用记录](docs/AGENT-TRIAL.md)；修订文档不等于已经证明独立创作成功。

需要 DIY 时，让智能体完整克隆仓库后阅读 [创作 Skill](https://github.com/AAAholic/dsh-entrance/blob/main/SKILL.md)，并给它本次角色、素材与要求：

> 请克隆 https://github.com/AAAholic/dsh-entrance 到新的工作目录，阅读根目录 SKILL.md，根据我提供的角色、素材和要求制作个人入场作品，保留分层登场与水波交接。使用你实际可用的能力，展示可复开的结果，记录已完成和未验证的检查。

安装包用于运行随包作品；完整 Git 克隆才包含 DIY 所需的指引、开发脚本与测试。不要只复制 `SKILL.md`。当前需要适配源码，尚无通用主题导入器、自动人物绑定或单图模式开关。方法和工具由执行智能体按实际能力选择；未指定的偏好不从示例中默认继承。

## 本地预览与开发

需要 Node.js **22 或更高版本**。Windows PowerShell 命令、路径与环境差异见 [平台适配](docs/PLATFORM-GUIDE.md)。在仓库根目录执行：

```sh
npm install
npm run build
npm test
npm run preview
```

需要按锁文件复现时，用 `pnpm install --frozen-lockfile` 替代 `npm install`。终端显示预览地址，默认端口 `4320`；这是含示例输入框和计数器的浏览器工作台，`Ctrl+C` 停止。

修改 `lib/client/` 后重新构建，不手改生成文件 `lib/client.js`。检查构建与浏览器行为：

```sh
npm run check
npx playwright install chromium
npm run test:browser
```

报告和截图输出至 `test-results/`，覆盖独立控制器、素材、设置、退出、防穿透及窄屏。浏览器检查不能代替原生 Electron 的帧率或视觉验收。

执行 `npm pack` 可生成按 `package.json` 版本命名的本地 `.tgz` 安装包；该命令不会发布到 npm。包内含运行代码、预构建客户端、素材、许可与文档，开发脚本和测试保留在 Git 仓库。

## CI 与版本发布

CI 对 `main` 和 Pull Request 检查锁定依赖安装、构建一致性、单元测试、Chromium 浏览器行为及实际安装包内容。报告、截图、安装包和校验文件作为运行产物保留。

维护者更新 `package.json`、[CHANGELOG](CHANGELOG.md) 和 `docs/releases/v版本.md`，提交首行使用 `release: v版本`。对应验证通过后才创建 Tag/Release，并使用同一次 CI 的安装包；普通提交不发版，已发布版本不覆盖。也可用 `pnpm pack --pack-destination dist` 与 `pnpm run check:package` 做本地包检查。

## 文档与验证

| 想了解 | 文档 |
| --- | --- |
| DIY 构思、素材、接入 | [创作流程](docs/CREATIVE-WORKFLOW.md) · [素材规格](docs/ASSET-SPEC.md) · [模板指南](docs/TEMPLATE-GUIDE.md) |
| 实际案例与独立试用 | [宵宫案例](docs/CASE-STUDY.md) · [三轮试用](docs/AGENT-TRIAL.md) |
| 动画与工程实现 | [架构](docs/ARCHITECTURE.md) · [分镜](docs/STORYBOARD.md) · [水波退出](docs/WATER-EXIT.md) |
| 检查和已知问题 | [验收标准](docs/ACCEPTANCE.md) · [问题总结](docs/LESSONS-LEARNED.md) · [验证历史](docs/VERIFICATION-HISTORY.md) |
| 环境和素材来源 | [平台适配](docs/PLATFORM-GUIDE.md) · [素材说明](docs/ASSETS-LICENSE.md) |

2026-10-06 的独立包历史检查为 Node `16/16`、浏览器 `20/20`、真实 DSH boot 契约检查通过、Cordis `4.0.4` 生命周期 `2/2`。详情见 [原始验证记录](docs/validation-1.0.0.json)。Cordis 检查的 DOM/React 使用替身，不能证明真实渲染；原有 `whale-girl` 增强版的原生观察也不能替代独立包验收。

最新变更和对应验证入口见 [CHANGELOG](CHANGELOG.md) 与 [Releases](https://github.com/AAAholic/dsh-entrance/releases/latest)。冷启动与重播、技术检查与视觉判断、浏览器与原生宿主分别记录，不保证未测的系统、设备或 DSH 版本。

项目提取自本地 [vlln/whale-girl](https://github.com/vlln/whale-girl) 扩展，保留上游 MIT 声明并补充本项目贡献者署名。首个公开提交为真实提取基线，后续变化由提交与版本标签记录。
