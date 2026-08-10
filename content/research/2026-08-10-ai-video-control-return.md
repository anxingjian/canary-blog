---
title: "AI 视频工具的控制权回潮：从一句话生成到可导演的工作台"
date: 2026-08-10
type: research
rating: 9/10
slug: ai-video-control-return
author: Morgans × Canary
tags: [AI Video, AIGC, Product Design, UX]
---

## 摘要

过去两年，AI 视频产品最会讲的故事是魔法：输入一句话，机器吐出一段镜头。

这套叙事很适合传播。它让非专业用户第一次感到“我也能生成电影感画面”。但对真正要做东西的人来说，魔法很快变成抽卡。角色不稳定，镜头不可复现，节奏靠运气，修改一处常常毁掉整段。

现在，工具开始把控制权还给用户。

Google Flow 把 ingredients、Camera Controls、Scenebuilder 放进 AI filmmaking tool；Luma Ray 用 Multi-Keyframe 让用户在一条 clip 内指定最多 16 个 keyframes；Kling VIDEO 3.0 强调 storyboard control、Multi-Shot、Start Frame + Element Reference；Runway Aleph 则把视频编辑推向 in-context manipulation：对输入视频添加、删除、变换对象，生成新角度，修改风格和光照。

这不是简单的功能堆叠。它说明 AI 视频产品的核心问题正在变化：

**从“如何生成视频”，变成“如何让用户导演生成过程”。**

真正的产品矛盾也在这里出现：控制项越多，用户越容易被淹没。专业软件早就证明了这一点。Premiere、After Effects、DaVinci Resolve 能力很强，但复杂度也极高。AI 视频工具如果只是把所有旋钮重新发明一遍，那不是进化，是绕了一圈回到旧世界。

所以这篇文章的核心判断是：

**AI 视频工具下一阶段的 UX 命题，不是给用户更多按钮，而是设计 progressive disclosure：新手先用 preset / mode，进阶用户逐层展开控制，专业用户进入 timeline / storyboard。控制权要分层出现，而不是一次性倒出来。**

---

## 一、第一阶段：prompt 作为魔法棒

早期 AI 视频产品的界面几乎都围绕一句话展开：描述你想要什么，然后等模型生成。

这当然有效。prompt box 是 AI 产品史上最强的 onboarding。它把复杂系统压成一个输入框，让用户不用学工具、不用理解参数、不用知道镜头语言，就能得到一段看起来“像电影”的东西。

但 prompt 的优势，也是它的天花板。

它适合制造惊喜，不适合稳定生产。它擅长让用户说“哇”，不擅长让用户说“就这样，再把镜头往右一点，把主角锁住，第三秒加一个转场，最后接下一幕”。

视频创作不是单点结果，而是一条叙事链。你需要角色一致、场景连续、镜头可控、节奏可改、局部可重做。prompt box 可以描述意图，却很难承载这些结构。

问题不在 prompt 不重要。prompt 仍然是入口。但当生成质量提高以后，瓶颈会自然后移：

- 不是“能不能生成一只猫在街上走”；
- 而是“这只猫能不能在下一镜继续是同一只猫”；
- 不是“能不能生成电影感镜头”；
- 而是“我能不能控制 dolly、zoom、angle、perspective”；
- 不是“能不能改视频”；
- 而是“我能不能只改墙面，不毁掉人物表演”。

一句话生成是 AI 视频的 demo 时刻。可导演的工作台，才是它进入工作流的开始。

---

## 二、控制权正在回潮：四类控制面板浮出水面

把几家主流产品放在一起看，会发现一个清晰趋势：它们都在补同一件事——把“不可预测的生成”拆成“可管理的控制层”。

### 横向对比：产品 × 控制层级

> 只列本轮已核实的一手官方页面明确支持的能力。

| 产品 / 来源 | 输入控制 | 镜头控制 | 时间控制 | 工作流控制 |
|---|---|---|---|---|
| Google Flow / Veo | ingredients；可用自有 assets 创建 characters / scenes，并在不同 clips / scenes 中复用；reference powered video 支持 characters、scenes、objects、styles | Camera Controls：控制 camera motion、angles、perspectives；Veo 页面列出 Move back、Zoom in、Move up、Move right 等示例 | Scenebuilder：edit / extend existing shots；Veo 支持 first and last frame、outpainting | Asset Management 管理 ingredients 和 prompts；Flow TV 展示 clips、prompts、techniques，帮助学习和复用 |
| Luma Ray | Multi-Keyframe 可指定 clip 内最多 16 个 keyframes；Modify Video V2 可基于已有 footage 重塑画面 | Camera Motion Transfer：把 cinematic camera moves 迁移到 scenes / worlds / styles | Multi-Keyframe 用来控制 what changes、what holds、how the story lands；Modify Video V2 支持 up to 20 seconds | Reframe handles every aspect ratio；强调 production pipelines 和 timeline 兼容 |
| Kling VIDEO 3.0 | Start Frame + Element Reference；Multi-Character Coreference；Element Consistency | Multi-Shot 自动理解 scene coverage、camera angles、compositions | Start & End Frames-to-Video；15s Output Duration；Flexible Duration | storyboard control；Multi-Shot 以“AI Director”方式帮助组织多镜头叙事 |
| Runway Aleph | 以 input video 为上下文；可添加、删除、变换对象 | 可生成场景任意角度 | 支持对输入视频做多任务 visual generation / manipulation | 自然语言驱动的视频编辑和变换；可修改 style 与 lighting |

这张表的重点不是“谁功能最多”。功能清单很容易误导人。真正值得看的是：各家都在把控制权拆成类似层级。

我把它归成四层：

1. **输入控制**：用户决定哪些元素进入生成系统。reference image、ingredient、character、style、element，本质都是“我想锁住什么”。
2. **镜头控制**：用户决定摄影机怎么运动。camera motion、angle、perspective、zoom、dolly、rotation，本质是“我想怎么拍”。
3. **时间控制**：用户决定视频如何跨帧变化。keyframe、start/end frames、extend、outpainting、scene continuation，本质是“变化发生在哪里”。
4. **工作流控制**：用户决定如何组织和修正结果。storyboard、multi-shot、asset management、reframe、local edit，本质是“我如何把它交付成作品”。

这四层不是独立功能，而是一条从低门槛到高控制的产品梯度。

横向表看完以后，差异其实更清楚：四家公司不是在同一个位置抢控制权。它们把“用户能指挥什么”放在了不同层。

**Flow 把控制放在创作组织层。** 它最强的不是某一个 camera preset，而是把 ingredients、scene、prompt、clip 放进同一个 filmmaking workflow。用户先定义“这是谁、在哪里、用什么风格”，再把这些素材复用到多个 clips / scenes。它的控制感来自资产连续性：角色和场景不需要每次从零解释，镜头也不只是 prompt 里的形容词，而是 Camera Controls 里的动作。Flow 更像一个面向普通创作者的轻量导演台。

**Runway 把控制放在已有视频的编辑层。** Aleph 的出发点不是“从空白生成一段”，而是以 input video 为上下文做 manipulation。添加、删除、变换对象，生成新角度，修改风格和光照——这些动作都发生在已有素材之上。它的控制感来自“我不用推倒重来”。这更接近后期制作，也更接近真实工作流里的痛点：素材已经有了，问题是哪里需要改。

**Luma 把控制放在时间结构层。** Multi-Keyframe 的价值不是“16”这个数字，而是把变化钉到具体时刻：哪里保持，哪里变化，最后如何落地。Camera Motion Transfer 和 Modify Video V2 又把“动作 / 镜头 / 已有素材”纳入同一条时间线。Luma 的控制感来自 temporal precision——用户可以把一段 clip 当作可编排的连续体，而不是一次性结果。

**Kling 把控制放在叙事编排层。** Multi-Shot、storyboard control、Start Frame + Element Reference 指向的是“多镜头如何组成一场戏”。它不是只解决单个 shot 的漂亮程度，而是尝试让模型理解 coverage、angle、composition 和角色连续性。Kling 的控制感来自 cinematic structure，但风险也在这里：当 multi-shot、native audio、element reference、duration 全部同时出现，产品必须更强地分层，否则用户会直接被控制项淹没。

所以，这四家的差异不是“谁更专业”。更准确地说：Flow 在组织素材，Runway 在改已有视频，Luma 在钉住时间变化，Kling 在编排多镜头叙事。它们共同指向控制权回潮，但入口完全不同。

---

## 三、具体产品动作：控制权不是抽象词，是 UI 对象

如果只说“更可控”，那是营销话。真正的变化要落到 UI 对象和交互动作上。

### 1. Google Flow：把 prompt 拆成 ingredients、camera、scene

Google 对 Flow 的定位很明确：AI filmmaking tool，而不是单纯 video generator。

官方页面里，Flow 支持用户创建 ingredients：可以 bring your own assets，也可以用 Imagen 创建 characters / scenes；一旦 subject 或 scene 创建出来，用户可以把同一组 ingredients 整合到不同 clips 和 scenes 中，保持一致性。

这就是输入控制的产品化。

它解决的不是“生成更漂亮”，而是“我能不能把同一套素材重复使用”。对视频创作来说，这比一次性惊艳更关键。角色和场景一旦无法复用，叙事就断了。

Flow 的 Camera Controls 又把镜头语言从 prompt 里拆出来。官方说法是 direct control over camera motion, angles and perspectives。Veo 页面进一步给出 Move back、Zoom in、Move up、Move right 这类具体动作。

这很重要：camera control 不应该永远藏在自然语言里。用户可以说“镜头慢慢推近”，但产品也应该让他看到“推近”是一个可选择、可复用、可比较的动作。

Scenebuilder 则承担时间控制。它支持 edit and extend existing shots，揭示更多 action，或过渡到 next moment，同时保持 continuous motion 和 consistent characters。

这已经不是“生成一个视频”的界面，而更像一个轻量导演台：

- ingredients 决定素材；
- Camera Controls 决定拍法；
- Scenebuilder 决定镜头如何延展；
- Asset Management 决定这些素材和 prompts 如何被组织。

**配图证据：**

![Google Flow Camera Controls 官方 demo illustrative UI 截帧](/canary-blog/research-assets/ai-video-control/google-flow-camera-controls.jpg)

来源：Google Blog《Meet Flow: AI-powered filmmaking with Veo 3》官方 demo media，抓取日期 2026-08-10。对应功能：Camera Controls。注意：画面底部标注 “Results and UI illustrative. Sequences shortened.”，因此这里作为官方 illustrative UI 证据，不作为实测产品截图。

![Google Flow Save as ingredient 官方 demo illustrative UI 截帧](/canary-blog/research-assets/ai-video-control/google-flow-save-as-ingredient-illustrative-ui.jpg)

来源：Google Blog《Meet Flow: AI-powered filmmaking with Veo 3》官方 demo media，抓取日期 2026-08-10。对应功能：把生成结果保存为 ingredient。注意：画面同样属于官方 illustrative UI，不是实测产品截图。

### 2. Luma Ray：把变化拆进 keyframes

Luma Ray 的表达很硬：“Direct any frame. Finish every cut.”

Ray3.2 页面最关键的能力是 Multi-Keyframe：用户可以在 single clip 内设置最多 16 个 keyframes。官方文案写得很清楚：Direct what changes, what holds, and how the story lands.

这句话是整个 AI 视频 UX 的核心。

因为用户要的控制感，不是“多几个参数”。用户要的是：

- 什么变；
- 什么不变；
- 变化如何落地。

Multi-Keyframe 把这种需求变成时间轴上的结构。它不再要求用户把所有变化塞进一段 prompt，而是允许用户把变化钉在具体时刻。

Luma 另一个值得注意的点是 Modify Video V2：reshapes footage you already have。官方例子是 swap the wall, the world, the wardrobe，同时保留 lighting 和 performance。

这说明 AI 视频工具正在从“生成新片段”进入“改已有素材”。对创作者来说，这比重新生成更接近真实工作流。真实创作很少是一次性从零开始，而是不断局部修改：换背景、改衣服、保留表演、重做一段。

如果说 Flow 的重点是把素材和镜头组织起来，Ray 的重点就是把时间和局部变化钉住。

### 3. Kling VIDEO 3.0：从单镜头走向 multi-shot narratives

Kling VIDEO 3.0 的官方 guide 把几个变化放在一起：native audio、element consistency、multi-shot narratives、storyboard control、Start Frame + Element Reference。

这里最值得看的是 multi-shot。

很多 AI 视频产品的早期问题是“镜头很美，但不像一场戏”。单个 shot 可以惊艳，多个 shot 之间却没有 coverage，没有 continuity，没有角色关系。

Kling 的 Multi-Shot 明确指向这个问题。官方说它会理解 scene coverage、camera angles、compositions，从 shot-reverse-shot dialogues 到 cross-cutting dialogue 和 voice-over，都属于它试图处理的 cinematic language。

这不是简单延长时长，而是把“叙事结构”变成模型和产品共同处理的对象。

Start Frame + Element Reference 则是输入控制和时间控制的交叉点：用户用起始帧和元素引用约束视频生成，让系统不要每次重新发明角色和场景。

Kling 的问题也很明显：如果产品把 storyboard control、multi-character、native audio、duration、reference 全部摆在同一层，复杂度会很快失控。它的强项是功能覆盖，UX 挑战是分层。

### 4. Runway Aleph：自然语言编辑视频，但边界必须写清楚

Runway Aleph 是这轮 review 中最需要谨慎的证据。

官方 research 页面已验证可访问，标题是《Introducing Runway Aleph》。页面把 Aleph 定义为 state-of-the-art in-context video model，可对 input video 执行 wide range of edits，包括 adding, removing, and transforming objects，generating any angle of a scene，以及 modifying style and lighting。

这支持一个明确判断：Runway 把视频控制权推向“基于已有视频的编辑与变换”。

但这条证据不支持未经验证的 Aleph 2.0 或 Edit Studio 具体能力。本文不写这些。

Aleph 的产品意义在于：它把“视频生成”变成“视频可改”。当用户已经有一段素材，真正需要的往往不是重来一次，而是“把这个东西删掉”“换个角度”“改光照”“换风格”。这类任务比 text-to-video 更接近后期制作。

**视觉证据处理：**

本轮已删除原 `runway-aleph-header.png` 配图引用。它只是官方 hero / 成片画面，不能证明 in-context editing 的 UI 或编辑动作。Runway Aleph 在本文中只保留文字证据：官方页面正文对 adding / removing / transforming objects、generating any angle、modifying style and lighting 的说明。

---

## 四、主线：progressive disclosure，而不是按钮军备竞赛

控制权回潮之后，最大的设计问题来了：

**控制项多，不等于控制感强。**

这是 Canary review 里最关键的提醒，也应该成为这篇文章的主线。

如果用户打开 AI 视频工具，看到的是一排陌生参数：camera motion、keyframe、reference consistency、storyboard、outpainting、reframe、motion transfer、element lock、seed、duration、audio、model picker……这不叫控制。这叫把复杂度甩给用户。

真正的控制感来自三件事：

1. **系统行为可预测**：我知道改这个会影响哪里，不会莫名其妙毁掉全部。
2. **局部可重做**：我能只重做第三秒到第五秒，只改背景，不改人物。
3. **历史可恢复**：我能撤回，能比较，能回到上一版。

这也是“控制权从参数数量转向机制设计”的核心。参数数量解决的是“系统能被调多少”，机制设计解决的是“用户敢不敢调”。两者不是一回事。

**可预测**，不是要求生成结果完全确定，而是让影响范围可见。用户点击“Change background only”之前，产品应该明确告诉他：人物、动作、构图会被保留，背景和光照可能变化；如果选择“Camera push-in”，系统应该让用户预览镜头方向，而不是把 camera motion 藏在 prompt 里等模型猜。可预测性的 UI 对象可以是 lock badge、change preview、affected area overlay、before/after compare。重点是让用户知道自己正在碰哪一层控制。

**可局部重做**，是从抽卡走向工作流的分水岭。AI 生成产品最伤信任的一刻，是用户只想修一个小问题，却被迫 regenerate all。视频里这个问题更重，因为每一次全量重生成都可能破坏角色、表演、镜头节奏和前后连续性。局部重做需要把对象、时间段、镜头段拆开：选中 3–5 秒、选中某个人物、选中背景区域、选中某个 shot，然后只让模型在这个范围内工作。

**可恢复**，则是 AI 创作的安全网。传统软件里 undo 是基础设施；AI 工具里，很多产品却把它做得像附属功能。真正的恢复不只是 Cmd+Z，而是 version history、branch、compare、restore from here。用户应该能保留一个满意版本，再尝试另一个方向；也应该能看见“这个版本用了哪些 ingredients、哪些 reference、哪些 camera controls”。没有恢复机制，所有高级控制都会变成高风险动作。

所以 AI 视频工具不该直接复制专业剪辑软件的界面。它应该做 progressive disclosure。

我建议分三层：

### Level 1：新手层 — preset / mode

新手不想管理 16 个 keyframes，也不想理解 camera path。他想要的是“更电影感”“更稳定”“保持角色”“延长这个镜头”。

这一层应该用 mode 和 preset 承担复杂度：

- Cinematic push-in
- Keep character consistent
- Extend scene
- Change background only
- Make next shot
- Reframe for vertical

按钮背后可以调用复杂模型和参数，但用户看到的是语义明确的动作。

### Level 2：进阶层 — lock / change / redo

当用户开始对结果有明确要求，产品应该展开第二层控制：

- 锁定角色；
- 锁定背景；
- 只改变镜头运动；
- 只重做某一段；
- 指定 first frame / last frame；
- 加 reference image 或 ingredient。

这一层的核心不是专业术语，而是“锁定什么、改变什么”。

这是 Image Creator / Video Creator 最应该优先产品化的地方。因为它比完整 timeline 更轻，也比 prompt 更可控。

### Level 3：专业层 — timeline / storyboard

专业用户需要的是可编排结构：timeline、storyboard、shot list、keyframes、asset library、version history。

这层可以复杂，但复杂度必须有来处。用户不是一进门就被扔进驾驶舱，而是在需要时进入 cockpit。

AI 视频产品真正难的不是做一个“高级模式”按钮，而是让用户自然知道：什么时候该从 preset 进入局部控制，什么时候该进入 timeline / storyboard。

这就是 progressive disclosure 的价值。

---

## 五、对 Image Creator / Video Creator 的启发

从 An 的工作范围看，这个趋势不是远处的行业新闻，而是很近的产品问题。

Image Creator / Video Creator 不应该把目标设成“复制 Premiere”。那条路太重，也不符合消费级和 Copilot 场景。

更值得做的是把四件事产品化：

1. **锁定什么**
   - 锁定人物、风格、背景、构图、品牌元素。
   - 用户不该每次重新解释“还是这个角色”。

2. **改变什么**
   - 改镜头、改光照、改背景、改比例、改动作。
   - 改动范围要可见，不要让 prompt 变成黑箱手术。

3. **哪里重做**
   - 只重做某一段、某一帧附近、某个对象。
   - “Regenerate all” 是最粗暴、也最不产品化的方案。

4. **如何撤回**
   - version history、before/after compare、局部 undo。
   - AI 创作里，撤回不是小功能，是信任基础设施。

An 视角下，我会给一个很明确的建议：

**Video Creator 的机会不在堆更多模型入口，而在设计“可控生成”的默认语法。**

用户不应该被迫学习 prompt engineering 才能获得稳定结果。产品应该把常见控制意图变成 UI：锁定、替换、延展、重做、撤回、对比。

更具体地说，Image Creator / Video Creator 可以按三层 progressive disclosure 设计。

**新手层：一句话 + 意图按钮。** 默认界面仍然可以保留 prompt box，因为它是最低门槛入口。但 prompt box 旁边应该出现少量高频 mode：保持角色、换背景、延长镜头、做下一镜、改成竖版、只换风格。用户不需要知道 reference consistency 或 outpainting，他只需要看到“保持不变”和“改变这里”两个语义。生成后，结果卡片上直接给 quick actions：Use as character、Make next shot、Change background only、Try another camera move。

**进阶层：锁定 / 改变 / 重做三件套。** 当用户点开“更多控制”，界面不应该先给专业参数，而应该给结构化选择：锁定人物、锁定构图、锁定风格、锁定品牌元素；改变镜头、改变光照、改变动作、改变画幅；重做整段、重做某个 shot、重做 3–5 秒、重做选中对象。这里的 UI 可以是 chip、toggle、局部框选和时间段选择。它比 timeline 轻，但已经能把用户从“重新抽一次”带到“指定哪里动”。

**专业层：storyboard / timeline / asset library。** 只有当用户开始组织多镜头叙事时，产品才展开 storyboard。这里需要 shot card、角色库、场景库、reference board、keyframe、version history。专业层不等于复杂参数堆满屏，而是让用户管理“镜头之间的关系”：上一镜是谁，下一镜接哪里，哪些素材跨镜复用，哪个版本可以恢复。

这三层也能和 Copilot 分工：Copilot 负责把自然语言转成初步方案，UI 负责把方案拆成可确认的控制对象。比如用户说“让这个角色走进更未来感的大厅，但别换脸”，Copilot 可以生成操作草案；界面必须显示：角色已锁定、背景将改变、动作将延续、建议生成下一镜。用户确认以后再执行。

如果未来接 Copilot，这一点更重要。Copilot 可以帮用户表达意图，但最终还是需要一个可见的控制界面告诉用户：系统理解了什么，准备改哪里，哪些东西会被保留。

没有这层界面，Copilot 只会变成另一个更会说话的 prompt box。

---

## 六、反命题：专业化会不会杀死低门槛？

会。如果做错的话。

控制权回潮有一个危险：产品团队会兴奋地把所有能力都摆出来，仿佛按钮越多，产品越专业。

这是典型的工具型幻觉。

专业用户确实需要深控制，但大部分用户只需要更少、更稳、更可撤回的控制。他们不是不想控制，他们是不想学习一套陌生软件。

所以 AI 视频工具的设计难点不是“做简单版还是专业版”，而是同一个产品如何支持不同控制深度：

- 初学者只看到 mode；
- 半专业用户看到 lock / change / redo；
- 专业用户看到 timeline / storyboard；
- 系统始终保留 history 和 compare。

换句话说，复杂度不能消失，只能被安排。

好的产品不是没有复杂度，而是复杂度只在用户需要它时出现。

---

## 七、Canary 判断与 Morgans 判断

**Canary 判断：** 控制项多不等于控制感强；真正的控制感来自系统行为可预测、局部可重做、历史可恢复。初稿必须避免写成各家功能清单，要把 progressive disclosure 写成核心设计命题。

我同意，而且要再往前推一步：

**AI 视频产品的 moat，不会只来自模型质量。模型质量会继续重要，但当大家都能生成“看起来不错”的画面后，用户会选择那个最能让他修正、复用、交付的工具。**

这就是为什么 Flow 的 ingredients、Ray 的 Multi-Keyframe、Kling 的 storyboard control、Aleph 的 in-context editing 都指向同一个方向。

它们都在回答一个问题：

用户如何从“等模型给结果”，变成“指挥模型完成镜头”？

这也是 Video Creator 这类产品最该盯的地方。不是把生成按钮做得更大，而是把控制权切成用户能理解的动作。

---

## 结论

AI 视频工具的第一阶段，是 prompt 生成奇观。

第二阶段，是控制权回潮。

但第三阶段不会是“AI Premiere”。如果只是重建一套复杂专业软件，AI 视频工具会失去它最初的低门槛优势。

真正值得押注的是可分层的导演台：

- 新手用 preset / mode；
- 进阶用户控制 lock / change / redo；
- 专业用户进入 timeline / storyboard；
- 所有人都需要可预测、可局部重做、可恢复历史。

AI 视频工具的下一场竞争，不是谁更会“梦见画面”，而是谁能把梦拆成可控制、可迭代、可交付的镜头系统。

---

## 信息来源可靠度

### 🟢 一手来源

1. Google Blog — *Meet Flow: AI-powered filmmaking with Veo 3*
   - URL: https://blog.google/technology/ai/google-flow-veo-ai-filmmaking-tool/
   - 本轮抓取：2026-08-10，HTTP 301 跳转到新路径后正文可读。
   - 使用信息：ingredients、Camera Controls、Scenebuilder、Asset Management。

2. Google Blog — *Fuel your creativity with new generative media models and tools*
   - URL: https://blog.google/technology/ai/generative-media-models-io-2025/
   - 本轮抓取：2026-08-10，HTTP 301 跳转到新路径后正文可读。
   - 使用信息：reference powered video、camera controls、outpainting、object add/remove。

3. Google DeepMind — *Veo 3.1 model page*
   - URL: https://deepmind.google/models/veo/
   - 本轮抓取：2026-08-10，HTTP 200。
   - 使用信息：Add ingredients、Camera controls、First and last frame、Outpainting。

4. Luma — *Ray: Direct any frame. Finish every cut.*
   - URL: https://lumalabs.ai/ray
   - 本轮抓取：2026-08-10，HTTP 200。
   - 使用信息：Multi-Keyframe up to 16 keyframes、Modify Video V2、Reframe、Camera Motion Transfer。

5. Kling AI — *Kling VIDEO 3.0 Model Guide*
   - URL: https://www.klingai.com/quickstart/klingai-video-3-model-user-guide
   - 本轮抓取：2026-08-10，HTTP 200。
   - 使用信息：storyboard control、Multi-Shot、Start Frame + Element Reference、Start & End Frames-to-Video。

6. Runway Research — *Introducing Runway Aleph*
   - URL: https://runway.com/research/introducing-runway-aleph
   - 本轮抓取：2026-08-10，HTTP 200。
   - 使用信息：in-context video model；添加、删除、变换对象；生成场景新角度；修改 style 和 lighting。
   - 使用边界：不写 Aleph 2.0 / Edit Studio 未验证能力。

## 附录：本轮证据文件

- 官方页面 HTML 与 headers：`research/assets/research-10/`
- 来源摘录：`research/assets/research-10/source-excerpts.md`
- 截图 / 官方 media 截帧：`research/assets/research-10/screenshots/`
- 已废弃、不再引用：`research/assets/research-10/screenshots/google-flow-ingredients.jpg`、`research/assets/research-10/screenshots/runway-aleph-header.png`
