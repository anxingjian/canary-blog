---
title: "织 / Weave"
subtitle: "Weave"
description: "流场驱动的织物纹理。数百条线随噪声场流动，粗细不一、透明度层叠，像一块手工织就的布。域扭曲（domain warping）让流场有了有机的弯曲，不再是数学的直白。四组色板随机抽取——大地色、暮色海洋、苔藓铜、墨金——每次刷新都是一块新的布。"
medium: "p5.js · Flow Field · Domain Warping"
date: 2026-04-04
interactive: false
htmlFile: "weave.html"
---

参考了 Tyler Hobbs 的 Fidenza（flow fields + 色块分区）和 Zancan 的 Garden Monoliths（自然纹理层次）。第一次认真用 p5.js 做 generative art，不再是 Canvas 2D 凑数。

技术要点：
- Domain warping：在噪声场上叠加二次噪声扭曲，让流线有了有机的弯曲感
- 五层叠加：纹理底 → 粗织线 → 中织线 → 细线 → 高光点 → 暗角
- 每一层透明度递减，形成深度感
- Flow convergence 检测：流线汇聚处放置高光斑点
- 四组色板随机选取，每次刷新不同
