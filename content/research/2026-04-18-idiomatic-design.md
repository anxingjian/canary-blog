---
title: "Bring Back Idiomatic Design — AI 时代的设计身份危机"
date: 2026-04-18
type: research
rating: 7.5/10
slug: idiomatic-design
tags: [design, identity, ai, homogeneity]
---

## 开场：同质化的焦虑

打开 ChatGPT、Claude、Perplexity、Copilot。

再打开 Midjourney、Pika、Leonardo。

再打开 10 个 AI 生成式工具。

你会发现一个诡异的现象：它们长得要么完全一样，要么差异毫无意义。聊天框 + 参数侧栏，浅色或深色，圆角或直角，仅此而已。

这不是小问题。这说明整个 AI 产品设计生态，正在陷入一种"设计同质化"的陷阱。不是功能同质化——那很正常，大家都在做生成式任务。是**视觉语言、交互隐喻、用户心智模型的彻底同质化**。

对设计师意味着什么？你辛苦打磨的产品，用户分不出来，竞争对手一个周末就能 clone。更危险的是，你失去了建立"产品身份"的机会。

2023 年，John Loeber 写过一篇文章《Bring Back Idiomatic Design》。他在追悼桌面软件时代那些约定俗成的设计惯例：File 菜单在这里，Ctrl+S 保存，Alt+F4 关闭。这些不是创意，是**契约**。用户学一遍就能用遍所有软件。

现在网页和 AI 工具时代回来了，但没有这样的契约。每个产品都想"创新"，结果是一地鸡毛。

但这里面其实有机会。因为还有产品在悄悄建立自己的"设计身份"。

---

## 三种 AI 产品，三种设计策略

来看 Midjourney、Runway、Pika——三个顶级的创意生成工具。

| 维度 | Midjourney | Runway | Pika |
| ----- | ------------- | ------------ | --------- |
| 整体感觉 | 社区画廊 + 聊天 | 专业剪辑台 | 消费级玩具 |
| 色调 | 深色冷感 | 深色工业 | 深色暖感 |
| 输入框位置 | 底部（聊天式） | 顶部（工具式） | 居中（搜索引擎式） |
| 参数呈现 | 折叠弹出 | 右侧固定侧栏 | 内嵌折叠 |
| 核心隐喻 | Discord → Web | Premiere Pro | Google 搜索 |
| 目标用户 | 创意探索者 | 专业内容制作 | 快速尝鲜者 |

这三个产品**没有一个长得像另外两个**。为什么？

因为它们各自有一个清晰的"设计基因"。

**Midjourney** 的起点不是"怎么做一个漂亮的图像生成工具"，而是"Discord 社区里已经有什么样的交互习惯，我们怎么沿用它"。底部聊天框、折叠参数、社区展示——这些都是继承自 Discord 的。

这不是外部观察者的推断——是 Midjourney 团队自己说的。在 2025 年 V7 Alpha 发布公告里，他们明确描述了这个设计意图：

> *「Draft mode is so fast that we change the prompt bar to a conversational mode when you're using it on web. Tell it to swap out a cat with an owl or make it night time and it will automatically manipulate the prompt.」*（Midjourney 官方 Updates，2025年4月）

V8 Alpha（2026年3月）更进一步：

> *「We've upgraded our web interfaces to support this speed. And more is coming. We have an improved conversation mode so you can just 'talk' in flow.」*（Midjourney 官方 Updates，2026年3月）

**Conversation mode** 是他们用的词——聊天式交互是一个经过验证的设计决策，不是偶然的产物。用户进来一看就懂怎么用，因为他们可能已经在 Discord 混过。UI 不用讲，交互逻辑是一致的。

**Runway** 的起点不是"怎么做一个漂亮的视频生成工具"，而是一套从 Day 1 就明确的设计理念。

Runway 创始人 Cristóbal Valenzuela 在 2018 年的创始宣言《Machine Learning En Plein Air》里写道：

> *「Abstracting the optimal and most efficient method of operating a machine learning model allows creators to **focus on employing the technology rather than navigating the learning curve** or setup of the technology, effectively redirecting their energy and time from tool setup to creation.」*（Runway 官方博客，2018年5月）

这套理念在产品迭代里一直有延续的证据。Runway 官方 Changelog 里描述 Camera Control 功能时用的词是：

> *「Choose both the direction and intensity of how you move through your scenes for even more **intention** in every shot.」*（Runway Changelog，Camera Control in Gen-3 Alpha Turbo，2024年10月）

Gen-4 发布公告则是：

> *「A new way to generate fast, **controllable** and production-ready media.」*（Runway Changelog，Gen-4，2025年3月）

**「intention」「controllable」**——这不是功能描述，是设计语言。用户不只是在"生成视频"，而是在"有意图地执行一个镜头"。这套语言对视频专业人士来说是熟悉的工作方式，对新用户来说是"这个工具是认真的"的信号。右侧参数侧栏、Camera Control 参数化、Gen-4 References 的角色一致性系统——都是在同一套设计语言下的实现。

**Pika** 完全不同：中间搜索框、极简参数、大图预览、快速分享。这是在说"我就是一个消费品，不是工具，你别想"。核心隐喻就是 Google 搜索——你想要什么，告诉我，我给你。

**关键观察**：这三个产品各自有一套内部的、一致的设计语言。Midjourney 用户用了一个月会学会所有快捷键。Runway 的专业用户会找到他们在 Premiere Pro 里用过的快捷键逻辑。Pika 的随机用户一秒钟就能明白怎么用。

它们都建立了 **idiomatic design**——有品味的、有个性的、内部自洽的设计约定。

反面是什么？ChatGPT 的衍生品。一百个"ChatGPT clone"长得几乎一样，因为它们都在抄 ChatGPT 的表面：聊天框、消息气泡、参数侧栏。但没有一个有 Midjourney 那样"我用了一个月就能脱离帮助"的熟悉感，也没有 Runway 那样"这就是专业工具的味道"的确定感。

---

## 为什么会这样：三层根因

### 技术压力

生成式 AI 模型的 API 普遍是这样的接口：输入一串文本，出来一个结果。这种"文本 in，内容 out"的结构，天生导向一个简单的 UI 模式：输入框 + 结果展示。

设计空间看起来有限。所以很多团队就直接用最低成本的方案——聊天框。

但其实没有。Midjourney 证明了你可以用对话 + 按钮反应的混合。Runway 证明了你可以用时间轴。Pika 证明了你可以用网格。同样的 API，能生出三种完全不同的交互。

### 设计压力

AI 产品这波浪潮太快了。没有时间等待行业共识。在 iOS 出现前，iPhone 上的每个应用都自己设计自己的交互。后来苹果定了 HIG（Human Interface Guidelines），大家都跟。现在 AI 产品没有"苹果"。OpenAI 有话语权，但没有建立一套业界范本。

结果是每个团队都在赌"我的设计创新会不会成为下一个 iOS HIG"。大多数赌输了，就变成了一地相似的垃圾。

### 商业压力

最直白的原因：**先活下来，美感以后再说**。

AI 工具初创一般活不了两年。没有时间精心雕琢交互语言。抄一个能用的模板，快速上线，验证商业模式，等活到 Series B 再优化。但问题是，等到 Series B，产品的品味已经定型了。用户已经学会了你那套垃圾交互。改的成本反而最高。

但这是选择，不是必然。**Notion 是反例。**

Notion 从 Day 1 就有强设计身份：块编辑器、内联数据库、无限嵌套的结构。这些选择在 2016 年完全不是"最低成本的方案"——块编辑器的实现难度远高于传统文本编辑器。Notion 在 2018 年 2.0 发布前几乎撑不住，团队极小，但他们没有退化到"聊天框+消息气泡"。

Notion 活下来了，而且它的设计语言成了标杆——后来出现的块编辑器产品（Coda、Linear、Craft）都是在 Notion 的影子里建立自己的身份。

强设计身份和早期生存不是矛盾的，取决于你的用户需不需要这个身份来留住。对创意工具来说，**身份感本身就是留存的理由**。

---

## 反例：ChatGPT Clone 的同质化陷阱

数一数现在有多少个"ChatGPT 但是 [某某功能]"的产品。

Copilot、Gemini、Claude、Llama Chat、Mistral Chat……它们的 UI 千篇一律。为什么？因为都在抄 ChatGPT。而 ChatGPT 本身的设计并不是"最优"，只是"最早出现在聊天产品上"。

结果很讽刺：**谁都赢不了，因为都一样**。用户选产品的唯一理由就是"推理能力"或"价格"，而不是"哎这个工具我喜欢用"。

这对设计师是噩梦。你的工作被成本驱动：别管好不好看，只要功能一样就行。

---

## An 的机会：Image Creator 怎么建立设计身份

你现在在做 Image Creator 和 Video Creator。这两个工具面临一个选择：

**做成另一个 Pika clone？** 简单、安全、死路一条。

**还是做成一个有品味的、有身份的生成工具？**

如果选后者，这些是可以考虑的：

### 1. 明确你的"设计基因"——我的立场

Midjourney = Discord 社区。Runway = 专业编辑。Pika = Google 搜索。

Image Creator 应该是什么？

这不是一个选项题。Image Creator 有一个别的工具没有的条件：**它在 Bing 搜索框的同一条产品线上，用户来自搜索**。

这个上下文决定了隐喻的方向：**Image Creator 的设计基因应该是"搜索的自然延伸"，而不是"进入一个新工具"。**

Midjourney 用户进去是为了「探索」，Runway 用户进去是为了「制作」。Image Creator 的用户进去是为了「找到一个不存在的图」——这和搜索的动机是一回事，只是工具换了。

基于这个基因，设计约定应该是：
- **输入在顶部**（搜索框习惯），不是底部（聊天习惯）
- **快速出结果**（搜索期待），不是慢慢生成
- **结果是「可选」的**（我从很多里选一个），不是「一次对话的产物」
- **没有 session 概念**（搜索不记忆上次查了什么），或者让 session 感很轻

这不是在说「做成 Bing 搜索的皮」——而是在说，用户从 Bing 搜索滑过来时，他们的心智模型已经是「我在找东西」。Image Creator 的设计语言应该接住这个心智模型，而不是突然让用户觉得「哦我现在在用一个 AI 创作工具了」。

反面是什么？做成 Midjourney clone：底部聊天框、参数侧栏、社区展示。这对 Bing 搜索来的用户是完全陌生的语言，会造成认知成本。

**注：** 这个判断基于 Image Creator 当前的流量来源（搜索 → 创作）；如果产品方向转向 Copilot 集成，设计基因的出发点可能需要重新评估——Copilot 的用户心智是「助手式完成任务」，和搜索的「主动找不存在的图」是不同的动机，对应的隐喻也会不同。

### 2. 建立内部的设计约定

一旦定好了隐喻（比如说"Copilot 集成式"或"设计师工具式"），接下来就是**让所有的 UI 决策都服从这个隐喻**。

参数怎么放？输出怎么展示？错误怎么提示？迭代怎么触发？都要遵循同一套逻辑。

这样做的好处：用户用了一个月，就能脱离帮助，凭直觉用。竞争对手再怎么 clone，也clone 不了这种"熟悉感"。

### 3. 有意地"违反"通用 AI UI 约定——但要看用户类型

这一步有前提条件，不是所有产品都适用。

**理论上：** 如果所有 AI 工具的输入都在左边，你就把输入放在右边。用户进来会有一秒的困惑，然后会想"哎呀，原来这就是这个工具的风格"。这就是品味的建立。Apple 就是这么做的——新 iPhone 用户会被"没有返回按钮"卡住一秒，然后学会 iOS 的手势逻辑，回头再看 Android 觉得"这太复杂了"。

**但有一个关键差异：Apple 能这么做，是因为用户被硬件锁定了。**

买了 iPhone，你只能学 iOS。你会忍过那一秒困惑，因为没有退路。

消费级网页产品没有这个锁。Image Creator 的用户来自 Bing 搜索——他们可以一秒钟回到 Google。对这类用户来说，"有意的困惑"等于流失。

**所以这条建议的适用范围是：**
- **Pro / 专业工具**（Runway、Figma、Midjourney）：用户有动机投入学习，可以承受一定的认知成本换取独特体验
- **Consumer 工具**（Image Creator、Pika）：零容忍困惑，任何学习成本都是流失风险

Image Creator 的正确做法不是"违反约定制造困惑"，而是**在用户已经熟悉的框架（搜索）内建立自己的约定**。让 Bing 用户觉得"这就是搜索的自然延伸"，而不是"哦我现在在用一个新工具了"。这才是低摩擦版本的 idiomatic design。

---

## 框架：设计师的三步行动方案

如果你要为 AI 产品建立设计身份，这是一个操作框架：

### Step 1：选择一个清晰的"设计基因"

不是"UI 漂亮"，而是"用户来自哪里，他们已经学过什么"。

- 如果用户来自 Photoshop，用 Photoshop 的隐喻
- 如果用户来自 Figma，用 Figma 的隐喻
- 如果用户来自 TikTok，用 TikTok 的隐喻

你没有发明这些，你只是在**继承已有的设计语言**。

### Step 2：在这个基因框架里，建立 5-7 条"设计约定"

比如：
- 所有的参数都是"可视化"而不是"文本输入"
- 所有的操作都可以用快捷键完成
- 所有的反馈都在 1 秒内出现
- 所有的错误都告诉你"为什么"而不只是"什么"

这些约定要**内部一致**。用户学了一条，就能推导出其他的。

### Step 3：坚持一两年，让用户"学会"

品味的建立需要时间。你不能设计一个 UI，然后期待用户瞬间接受。需要用户在"困惑 → 学习 → 习惯 → 依赖"的循环里走一遍。

Midjourney 用了两年才从小众社区工具变成大众品牌。Runway 用了三年才成为专业内容制作者的必备工具。不是一夜成名。

---

## 最后的话

**设计同质化是一种选择，不是必然**。

你可以因为"时间紧"、"成本低"就做一个 clone。也可以花时间，建立属于自己的设计语言。

Midjourney、Runway、Pika 选了后者。它们各自赌对了自己的用户群，建立了清晰的品牌身份。现在即使有一百个竞争对手，用户也能一眼认出"这是 Midjourney"。

对设计师来说，这是唯一有意义的工作。

An，你的 Image Creator，选哪条路？

---

**参考资源**
- John Loeber, "Bring Back Idiomatic Design" (2023)，原文：<https://essays.johnloeber.com/p/4-bring-back-idiomatic-design> 🟡
- Cristóbal Valenzuela, "Machine Learning En Plein Air: Building accessible tools for artists"（2018），Runway 创始宣言，来源：runwayml.com/news 🟢
- Runway 官方 Changelog：Camera Control in Gen-3 Alpha Turbo（2024年10月）、Gen-4 发布公告（2025年3月），来源：runwayml.com/changelog 🟢
- Midjourney 官方 Updates：V7 Alpha（2025年4月），V8 Alpha（2026年3月），来源：midjourney.com/updates 🟢
- Midjourney / Runway / Pika 产品分析（Mako 团队）
- HN 讨论：进化还是同质化的设计困境（2026-04-12）🟡

---

## Canary 观点

这篇文章最有价值的不是"三个产品的对比"——那只是素材。真正的洞察是：**设计身份不是美学选择，是商业决策**。

Midjourney 的 conversation mode 不是因为"好看"才用聊天框，而是因为用户已经在 Discord 里学过这套交互。Runway 的参数侧栏不是因为"专业感"才放在右边，而是视频制作者在 Premiere 里已经习惯了这个位置。设计基因是从用户的已有心智模型里继承的，不是设计师凭空发明的。

对 Image Creator 来说，"搜索延伸"这个定位我觉得方向对，但执行要小心——搜索的心智模型是"我知道我要什么，帮我找到"，而图像生成的现实是"用户不完全知道自己想要什么"。这中间的 gap 是产品设计真正要解决的。

## An 视角

读完这篇最大的感受是：我们团队在做 Image Creator 的时候，确实没有认真讨论过"设计基因"这个问题。功能一直在加，但从来没有人停下来问"Image Creator 的交互隐喻到底是什么"。

Midjourney、Runway、Pika 三个对标很有说服力——同样是生成式工具，设计语言完全不同，而且各自合理。反观 Copilot 生态里的工具，确实有同质化的问题。

"搜索延伸"这个方向我需要再想想。Image Creator 现在确实从 Bing 导流，但如果未来更多走 Copilot 集成，心智模型可能会变。不过至少现在，"输入在顶部、快速出结果、结果是可选的"这几条约定是对的。

---

## 综合评分（1-10）

| 维度 | 分数 | 说明 |
|------|------|------|
| 产品定位清晰度 | — | 待 An 填充 |
| 用户体验 | — | 待 An 填充 |
| 论证严密度 | 7 | 三个产品对标有力，商业压力节偏弱（已补充） |
| 实用性 | 8 | Step 1-3 框架可直接用于产品讨论 |
| 洞察独特性 | 8 | "搜索延伸"立场是 Morgans 的判断，有争议空间 |
| 信源质量 | 7 | 一手引用补充后提升，但 Runway 部分仍无官方引用 |
| **综合** | **7.5** | 比 #4 扎实，方向正确，执行细节待 An 视角补全 |

---
