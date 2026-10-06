# Notices

## Code

This independent entrance plugin was extracted from a local extension of
[vlln/whale-girl](https://github.com/vlln/whale-girl), based on upstream commit
`4fe5792c6f873c6b3a29dd12198ba47a397e17f3`.

The upstream MIT notice is preserved in [LICENSE](LICENSE), with an additional
notice for the downstream contributions:

```text
Copyright (c) 2026 Sam Gao (vlln)
Portions Copyright (c) 2026 Aholic
```

The MIT license applies to the software and its code documentation. The example
artwork and demo GIF are excluded; [LICENSE-ASSETS](LICENSE-ASSETS) defines that
boundary. Preserve the
upstream copyright and permission notice when redistributing substantial portions
of the software. This project is an independent community adaptation, not an
official release by the upstream author or DeepSeek.

## PNG artwork and fan-art example

The four PNG files under `lib/assets/entrance/20261006/` are bundled as a
non-official fan-art and visual-style example:

- `yoimiya-welcome.png` — the example character image.
- `yoimiya-expression.png` — the aligned expression image.
- `koi-emblem-v1.png` — the red/gold decorative fish emblem.
- `festival-ribbon-v1.png` — the left decorative ribbon.

These PNG assets and `docs/media/demo.gif` are **excluded from the MIT code
license**, and this repository grants no artwork license in them. The character,
reference artwork, logos and other third-party rights remain with their respective
rights holders. The existing creation notes do not establish a blanket license to
redistribute or commercialize all underlying visual material. This repository does
not grant those rights or imply endorsement.

### AI tool records and reference-based workflow

All four bundled PNG files contain an embedded C2PA record in a `caBX` chunk.
Inspection of those records identifies `ChatGPT` / `gpt-image`, the claim generator
`OpenAI Media Service API`, and the digital source type `trainedAlgorithmicMedia`.
The recorded creation times are on 2026-10-05 UTC. The records contain no
ingredient assertions.

**No ingredient assertion does not mean no reference image was used.** The local
generation call records and saved prompts for the koi and ribbon explicitly show
a supplied festival-artwork reference and requests to isolate/redraw its elements.
AI generation and reference-based editing are compatible descriptions of that
workflow. The manifest records selected provenance assertions; it does not prove
the absence of other inputs, identify every underlying author, or clear rights.
Reading these fields is not a claim that the signatures or certificate trust
chains have been independently validated. See the
[C2PA explainer](https://spec.c2pa.org/specifications/specifications/2.2/explainer/Explainer.html)
for the scope of Content Credentials.

Preserve the embedded C2PA records in these original PNGs, and retain the creation
notes. When publishing the artwork or recordings containing it, disclose the AI
generated artwork and use the platform's applicable AI labeling controls. The
browser-rendered GIF does not automatically carry the source PNGs' C2PA records.

The illustration workflow used user-provided references and image generation or
editing. That provenance does not make pre-existing characters or reference
artwork public domain. Treat the bundled visuals as an example for personal study
and demonstration; use artwork you are entitled to use when adapting,
redistributing, or publishing your own project. Commercial use of the code is
governed by MIT; any use of the PNG art requires its own rights assessment.

中文说明：代码开放用于学习和改造；示例 PNG 为非官方二创展示素材，不随代码一并授予
MIT 权利，本仓库也不另行授予素材权利；不表示官方授权，也不自动获得原角色、参考图或
商标的再分发及商用许可。示例图经 AI 生成或编辑；清单未记录输入素材，不代表没有参考图。
请保留原 PNG 的 C2PA 记录，发布图片或动画录屏时声明其中的 AI 生成画面。
发布自己的版本时请替换成有权使用的素材，并保留准确来源与署名。

See [ASSETS-LICENSE.md](docs/ASSETS-LICENSE.md) for the asset record and replacement
requirements.

维护者已确认将当前自用的完整图片与演示 GIF 作为可替换的示例模板公开。该确认不改变上述代码与第三方角色权利的区分。

## 非官方声明 / Unofficial

本项目不是 `vlln/whale-girl` 作者、DeepSeek 或米哈游 / HoYoverse 的官方发布，
与上述主体无隶属、赞助或背书关系。出现的名称用于说明兼容对象或示例角色，不表示获得
商标或角色授权。

This is an independent community adaptation, unaffiliated with DeepSeek, the
upstream author and the depicted character's rights holders. Names and marks
remain with their respective owners; no official status or endorsement is implied.
