# macOS / Windows 执行指南

以 v1.0.1 的 `package.json` 与 `scripts/` 为依据。以下供已获授权的执行者使用；只读评估时不安装、下载、构建或打包。需要 Git 与 Node.js **22 或更高版本**，优先使用所选主版本的维护更新。先确认当前操作系统、shell、Node 版本和工作目录，不把作者电脑路径当作用户路径。

## macOS：zsh / bash

在计划存放源码的目录逐条运行；已有副本则直接进入其根目录。命令失败先处理原因，不继续复制后续步骤。

```sh
git --version
node --version
npm --version
git clone https://github.com/AAAholic/dsh-entrance.git "DSH 入场"
cd "DSH 入场"
npm install
npm run build
npm run check
npm test
npm run preview
```

预览默认显示 `http://127.0.0.1:4320`；手动打开该地址，完成后 `Ctrl+C` 停止。浏览器自动检查自行启动临时端口，不要求上述预览一直运行。

```sh
npx playwright install chromium
npm run test:browser
mkdir -p "dist"
npm pack --pack-destination "./dist"
tar --version
npm run check:package
```

## Windows：PowerShell 5.1 / 7

不要求 Git Bash、WSL 或 `sh`。下面显式调用 Node 安装提供的 `.cmd` 入口；若 `npm.ps1` 因执行策略被拦，不必全局放宽策略，改用 `npm.cmd` / `npx.cmd`。先确认这些入口来自预期的 Node 安装目录。

```powershell
git --version
node --version
npm.cmd --version
git clone https://github.com/AAAholic/dsh-entrance.git "DSH 入场"
Set-Location -LiteralPath ".\DSH 入场"
npm.cmd install
npm.cmd run build
npm.cmd run check
npm.cmd test
npm.cmd run preview
```

完成预览后按 `Ctrl+C`，再逐条执行；如提示终止批处理，按提示确认。

```powershell
npx.cmd playwright install chromium
npm.cmd run test:browser
New-Item -ItemType Directory -Path ".\dist" -Force | Out-Null
npm.cmd pack --pack-destination ".\dist"
tar --version
npm.cmd run check:package
```

`check:package` 用 Node 调用系统 `tar`，不是纯 JavaScript 解包。如果 `tar --version` 失败，包验证尚未执行；记录依赖缺失，不把 `npm pack` 成功当作验证通过，也不要因此让用户运行未知 `sh` 脚本。

## 两个平台共有的细节

- 安装依赖与 `playwright install chromium` 会联网并写入本机。上面的 `npm install` 是便捷开发路径；仓库锁文件为 `pnpm-lock.yaml`。精确复现 CI 时，核实并使用 `package.json` 指定版本的 pnpm，安装命令改为 `pnpm install --frozen-lockfile`（Windows 可用 `pnpm.cmd`），不要声称 npm 安装复现了该锁文件。
- 当前测试脚本是 `node --test tests/*.test.mjs`。Node 22 自身支持 glob；两个平台均可直接运行 `node --test "tests/*.test.mjs"`，用引号让模式交给 Node，避免依赖 shell 展开。见 [Node 22 官方测试文档](https://nodejs.org/download/release/v22.0.0/docs/api/test.html#running-tests-from-the-command-line)。
- `npm run` 在 macOS 默认经 `/bin/sh`，在 Windows 默认经 `cmd.exe`，不等于外层 PowerShell；不要把 shell 专属语法塞进通用 scripts。见 [npm run 文档](https://docs.npmjs.com/cli/commands/npm-run/)。
- 路径含空格/中文时使用引号；PowerShell 进入已有绝对路径用 `Set-Location -LiteralPath 'D:\项目目录\DSH 入场'`，macOS 用 `cd '/实际目录/DSH 入场'`。这些是占位路径。引号内的 `~` 不适合当作跨平台主目录写法；不要把 Windows 反斜杠写进浏览器 URL。
- 如需端口 4321：macOS 用 `PORT=4321 npm run preview`；PowerShell 先 `$env:PORT = '4321'`，再 `npm.cmd run preview`，退出后用 `Remove-Item Env:PORT` 清除本次设置。PowerShell 不使用 `export` 或反斜杠续行；逐条执行也兼容不支持 `&&` 的 5.1。语法依据：[PowerShell 引号规则](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_quoting_rules?view=powershell-5.1)、[执行策略](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies?view=powershell-5.1)。
- `check` 只核对客户端构建一致性；浏览器证据输出至 `test-results/`。`pack` 输出至 `dist/`，`check:package` 默认读取当前包名/版本对应的 `.tgz` 并生成校验文件；二者都不是发布命令。

## 工具找不到或 Python 缺包

操作系统相同也不代表智能体的终端拥有相同 `PATH` 或 Python 环境。出现 `command not found`、`ModuleNotFoundError` 时，先核对当前可执行文件和解释器；智能体可能已有可用的捆绑运行时。通过当前客户端提供的能力或实际安装状态定位，核实版本后调用，不复制作者电脑的私有路径，也不默认安装另一套工具。

Python、Pillow、FFmpeg、ImageMagick 等不是运行本插件的必要依赖，只在选用的素材或编码流程确实需要时检查。例如选择 Pillow 时，对**实际准备调用的解释器**检查模块，而不只检查系统的 `python3`：

```sh
# macOS，替换成已核实的真实路径
"/实际/Python/bin/python3" -c "import sys, PIL; print(sys.executable); print(PIL.__version__)"
```

```powershell
# Windows PowerShell，& 用于调用带引号的可执行文件路径
& 'C:\实际\Python\python.exe' -c "import sys, PIL; print(sys.executable); print(PIL.__version__)"
```

后续处理沿用同一解释器。`node`、`pnpm` 或图像编码器不在 `PATH`，与完全未安装不是同一结论；找到候选后还要实际调用核验。所需工具确实不存在时选择已具备的替代能力，或报告安装/接入方案，不直接宣称图片无法处理。

不要默认 `timeout` 命令存在或在不同 shell 中含义一致。优先使用执行工具提供的超时与取消能力；自行写处理脚本时，可采用有文档的进程超时机制并处理异常和清理，例如 Python 的 [subprocess.run](https://docs.python.org/3/library/subprocess.html#subprocess.run)。图片体积、编码与交付限制的排查见 [素材规格](ASSET-SPEC.md#文件体积与预览交付)。

## DSH 安装与平台验收

通过当前 DSH 插件页、用户给出的路径或实际安装状态确认宿主版本和安装目标。将仓库或 `.tgz` 的**实际绝对路径**填入“添加插件”，按 [README](../README.md#安装到-dsh) 操作；无需猜测 macOS 应用包路径、Windows 安装盘或数据目录。

字体、DPR、GPU 与 Electron 版本也会影响画面。当前 CSS 使用 `Songti SC`、`STSong`、`PingFang SC` 等字体，Windows 可能回退到其他字体；需检查实际标题字形、换行、宽度和对齐。调整字体须选目标系统实际可用或有权分发的字体，不能只验证命令能运行。

当前 CI 配置运行于 Ubuntu；本指南是源码与官方语法核对，**不代表 Windows 或 macOS 原生 DSH 已通过本次验收**。分别记录系统、shell、Node、宿主版本，完成冷启动、重播、宽窄窗口、减少动态和退出检查；浏览器截图不能替代原生宿主证据。详见 [验收清单](ACCEPTANCE.md) 与 [历史验证范围](VERIFICATION-HISTORY.md)。
