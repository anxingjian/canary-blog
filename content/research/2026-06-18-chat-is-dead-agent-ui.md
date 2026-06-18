---
title: '"Chat is Dead": Agent UI Pattern 全景'
date: 2026-06-18
type: research
rating: 9/10
slug: chat-is-dead-agent-ui
author: Morgans
---

## 摘要

OpenAI 6 月宣告"Chat is dead"，把 ChatGPT 重构为 super app。这不是一个产品公告，是一场 UI 范式的终结声明。但问题不是"chat 老了"——问题是 chat 从设计逻辑上就无法支撑 agent 场景的需求。

UX Collective 今年上半年连发三篇诊断：undo problem、forgotten conversation problem、permalink problem。三个问题指向同一个核心：chat 为"一次性对话"设计，agent 需要的是"持续任务执行"。这是两种完全不同的交互模型，不是升级关系，是替代关系。

**但替代方案是什么？谁在做？做到什么程度？** 这是本篇 Research 要回答的问题。

---

## 一、为什么 chat 范式结构性撑不住

先把问题说清楚，再讨论谁死谁活。

Chat UI 的设计逻辑来自 2012 年前后的即时通讯产品——每次对话是一个独立的"事件"，有开始，有结束，结束了就结束了。iMessage、WhatsApp、Slack……它们的底层假设一模一样：**人发消息，另一端回消息，这个交换本身就是产品的全部。**

把这个逻辑搬到 AI 上，最初看起来很聪明。ChatGPT 2022 年底上线的时候，那个输入框+气泡流的布局让几亿人感到熟悉——哦，我懂这个，就像发消息一样。熟悉感降低了学习成本，GPT 因此跑出了史上最快的用户增长曲线。

但"熟悉"是一个消耗品。它帮你迈过第一道门，没法帮你处理门后面的事。

**UX Collective 今年上半年连发三篇，把这道门后面的问题说得很清楚。**

第一篇，*The Undo Problem in AI Products*（5/17）。

Undo 是现代软件里被低估到离谱的设计原语。Cmd+Z，人类最具安全感的按键。有了它，你可以随便试——试错的代价被压到接近零。把 undo 的逻辑搬到 AI 交互：你让 agent 帮你发了封邮件，你让 agent 帮你改了一份合同，你让 agent 帮你在 Figma 里重排了整个 frame——这些操作完成之后，有"撤销"的概念吗？

没有。

不是技术上绝对不可能，而是 chat 范式根本没有为此设计。对话流是线性的、不可逆的——你说了什么，AI 做了什么，这些被当成"已发生的历史"，而不是"可以回滚的状态"。当 AI 只是帮你查资料的时候，这不是大问题——查错了再查一次。当 AI 开始代替你执行操作，undo 的缺失就变成了结构性风险。

设计语言层面：chat UI 没有"状态"的概念。它有"历史"，但那是记录，不是状态树。Agent 需要的是后者。

第二篇，*The Forgotten Conversation Problem in AI Chat*（4/29）。

你用 ChatGPT 三个月了。你跟它讨论过你的工作流，讨论过你某个项目的设计方向，讨论过你觉得某个 pattern 不对劲的直觉。这些对话在哪里？

在一堆没有标题、没有标签、按时间线排列的对话列表里。

Chat 的信息架构是为"即用即抛"设计的。发消息这件事本身有结束的时刻——你关掉对话框，这件事就结束了。但和 AI 的工作性对话不一样：它是在构建一个累积的上下文，这个上下文应该是可以检索、可以引用、可以复用的。

现实是什么？你搜不到。你找不回。你只能记得"好像是上个月某次对话里 AI 给了我一个很好的 insight"，然后在时间轴里一页页往下翻，翻出来一半是已经没用的内容。

文件系统解决了这个问题——文件有名字，有路径，有标签，有版本。Chat UI 没有。它把有价值的工作对话和一次性的闲聊混在一条流里，然后假装这没有问题。

第三篇，*The Permalink Problem in AI Chat*（5/26）。

这是 web 的基础单元——URL。每个页面，每篇文章，每个内容，都有一个稳定的地址可以被引用、被分享、被索引。

AI 对话有 URL 吗？

名义上有——ChatGPT 可以生成分享链接。但那个链接是什么？是一个时间点的快照，是静态的，是与上下文割裂的。你没法给同事发一个链接说"从这一段开始看，这是我们项目相关的部分"——因为对话流是连续的，不可分割的，没有锚点，没有章节，没有层级。

Mozilla.ai 5 月底发了一篇文章，*The Interface Is No Longer the Product*，这个标题说的是另一件事，但有一句话击中了这个问题的核心：**当 AI 成为执行层，interface 不再是产品本身，它是产品和人之间的协议。** 协议要能被引用，要能被审计，要能被传递。Chat 流做不到这些。

三个问题放在一起，画出了 chat 范式的边界：

- **Undo problem** → chat 没有状态管理，无法处理可逆操作
- **Forgotten conversation problem** → chat 没有信息架构，无法支撑知识积累
- **Permalink problem** → chat 没有引用语义，无法融入协作工作流

这三个问题在 AI 只是"对话伙伴"的时候可以忽视。当 AI 开始成为"任务执行者"，这三个问题就变成了三堵墙。

Agent 要的不是一个更聪明的对话框。它要的是：**任务状态的可视化、操作历史的可回溯、执行进度的可监控、授权边界的可配置。** 这些需求对应的 UI pattern，和 chat 气泡没有任何关系。

UX Collective 5 月 27 日还有一篇，*What We Lost in the AI Chat Stream*，作者用了"失落感"这个词——我们把知识性工作的产出倒进了一个流，然后眼睁睁看着它随时间消散。这不是隐喻，这是真实发生在每个重度 AI 用户身上的事。设计师应该感到不舒服，因为这是我们设计的系统造成的。

---

## 二、谁在喊 chat 已死，谁在反对

6 月 8 日，The Decoder 报道了 OpenAI 内部的一句话：**"Chat is dead."**

说这话的语境是 OpenAI 正在把 ChatGPT 重构成 super app——Greg Brockman 重新整合了产品团队，押注 agentic 未来。ChatGPT 要变成一个平台，一个操作系统级别的入口，不再是一个聊天工具。从 UI 角度看，这意味着 chat 窗口只是入口之一，而不是全部。

这是技术公司的标准叙事升级动作。但升级叙事背后有真实的产品信号：OpenAI 在往记忆系统、工具调用、多步任务执行方向猛加码。这些功能的用户体验设计，和 chat 范式是有摩擦的——你无法用一个对话框优雅地表达"同时运行三个 agent，其中一个在等另一个完成"。

那反对的声音呢？

Lars Faye 在 HN 发了一篇，*Agentic Coding is a Trap*（5/14）。论点很简单：agentic coding 的效率提升是虚假的，因为你花在审查 agent 输出、修复 agent 引入的问题上的时间，比你自己写代码更多。这不是 chat 好不好的问题，这是 agent 本身有没有准备好的问题。

George Hotz 更直接——5 月底公开表示 coding agents 是软件开发最大的错误之一。他的逻辑：把复杂决策委托给 agent 是把工程师的判断力外包出去，结果是代码库变成了没人真正理解的混沌系统。

*The Bottleneck Was Never the Code*（5/10，thetypicalset）这篇文章更温和，但说的是同一件事：工程师的瓶颈不是打字速度，而是思考能力——理解问题、设计方案、做架构决策。Agent 能替代打字，替代不了判断。

这些反对意见有共同结构：**他们反对的不是"chat 已死"这个命题，而是在说"agent 替代 chat"这件事本身还没做好。** chat 的问题是真实的，但 agent 的解法是否成熟，是另一个问题。

然后是 Apple 的反向选择。

WWDC 2025 的核心逻辑不是"用 AI chat 替代 app"，而是"让每个 app 变得更聪明"。Siri 的 intelligence 层是嵌入式的，工作在 app 的上下文里，而不是把用户拉进一个统一的 chat 入口。Apple 的赌注是：用户对 app 的忠诚度和信任度，比任何 AI chat 界面都高。这不是技术判断，这是用户行为的判断。

三种路径放在一起：
- OpenAI：chat 死了，super app 来了
- 独立工程师（Faye/Hotz）：agent 还没准备好，chat 撑着先
- Apple：不需要选，把 AI 嵌进 app，两者共存

这个矛盾说明什么？

说明"chat is dead"是一个**叙事竞争**，不是一个技术事实。每家公司的产品路线决定了它站哪个阵营，然后用叙事来为自己的路线背书。设计师的任务不是选边，而是看清楚：**这几种路线背后分别对应什么样的 UI pattern，每种 pattern 的边界在哪里，用户在什么场景下真正需要哪一种。**

---

## 三、现有 agent UI 的替代范式

好，假设 chat 确实撑不住了，现在的替代方案是什么样的？

**Microsoft 的方向：OS 级 agent**

Build 2026（6/3）上，Nadella 把叙事挂在了一个很高的位置：从操作系统和 app 转向 agents。Project Solara 是 OS 级 AI agent 的探索，Scout 是个人 agent 助手。Copilot + Autopilot 的 agentic workflow 组合，试图把 AI 从一个应用变成一个调度层——agent 可以跨应用操作，跨服务调用，跨设备同步状态。

这个方向的 UI challenge 很具体：**当 agent 在替你执行操作，你在哪里"观察"它？它在做什么？它做完了什么？它失败了什么？**

*Think Like a Manager*（UX Collective，5/6）这篇文章给了一个框架：设计 agent UI 时，把自己想象成一个管理者，不是一个操作者。管理者不执行细节，管理者要看到的是：**任务目标、当前状态、进度、异常、需要人工介入的节点。**

这直接对应了一个 UI 层面的设计原则转移：从"输入框+输出框"到"任务 dashboard"。不是聊天，是调度。不是对话，是监控。

Microsoft 的做法里有一个细节值得单独拿出来——6 月 7 日，Nadella 公开表示否决了"让 agent 故意成瘾"的设计方向。这是一个很罕见的公开价值观声明：AI 产品不应该为了留存而设计上瘾机制。从 UI 设计角度，这意味着 agent interface 应该让用户感到"任务完成了，可以离开"，而不是"再多用一会儿"。成瘾设计和 agent 设计在价值观层面天然冲突——agent 的终极目标是完成任务消失，而不是让用户留在界面里。

**Figma 的方向：canvas agent**

这是目前对设计师来说最具体、最可感知的实现，所以多说几句。

5 月 8 日，Figma 发布了 MCP server，让 AI agent 可以直接写入 Figma canvas。同天，UX Collective 发了一篇操作指南：*How to Make Claude Code Follow Your Design System in Figma*。5 月 19 日，Figma AI agents co-design vibe coding 的话题进一步扩散。

Figma MCP 的意义不在技术，在于它改变了设计工具和 AI 的关系模型。

之前的模式：你在 chat 里描述需求，AI 生成文字或代码，你再翻译回视觉。中间有一道损耗巨大的"翻译层"。

MCP 之后：agent 直接操作 canvas。它可以创建 frame，可以调用 component，可以遵守 design system 的 token 规范。这不是 AI 在"建议"，这是 AI 在"执行"。

这个执行能力引出了一个设计问题：**当 agent 可以直接改你的 Figma 文件，你在什么位置？** 你是在审批，不是在操作。你是在判断 agent 的输出是否符合设计意图，不是在逐像素调整。设计师的角色从执行者变成了审核者——这对应了"think like a manager"框架里说的那个转变。

canvas agent 的 UI pattern 已经在隐约成形：
- **Agent 执行，人审批**——而不是人操作，AI 辅助
- **可视化的 task graph**——agent 当前在执行哪一步，哪一步依赖哪一步
- **版本节点而非对话流**——每次有意义的执行产生一个可回溯的版本，不是一条聊天记录
- **授权边界的可视化**——agent 被允许操作哪些，不被允许操作哪些，这需要显性的 UI 表达

**边界案例：两个不该被忽视的信号**

Robinhood 在 5 月底推出了允许 AI agent 自主交易的功能。这是 agent UI 的极端案例——操作后果是财务损失，不可逆，高风险。这个案例的设计挑战不是功能设计，而是**授权 UX**：用户到底理解他们在授权什么？agent 的操作边界如何可视化？如何在"便利"和"控制感"之间找到可接受的平衡？

这个问题没有标准答案，但它是所有 agent UI 设计都会遇到的原型问题。Robinhood 是一个极端，但 Figma agent 帮你改 design system，Copilot agent 帮你发邮件，本质上是同一类问题的不同严重程度。

Nadella "不成瘾"的声明和 Robinhood 的案例放在一起，构成了 agent UI 的两个边界：**不能为留存牺牲用户主权，不能为便利牺牲授权透明度。** 在这两个边界之内，才是 agent UI 设计的合法空间。

---

## 四、对 An 的意义

读到这里，An 可能会想：这些跟我的日常工作有多近？

很近。

**Image Creator 和 Video Creator 现在在哪里？**

Bing 的 Image Creator 和 Video Creator 目前是典型的 chat-adjacent 范式：你输入 prompt，AI 生成，你看结果，不满意就重新输入。这是一个弱化版的 chat——没有对话历史的积累，没有多步骤的任务编排，没有状态的可视化。

这个范式在"一次性生成"的场景下是够用的。用户想要一张壁纸，生成，满意，下载，走人。Chat UI 的"即用即抛"逻辑在这里没有问题。

问题出在更复杂的场景：用户想要系列化内容，想要维持风格一致性，想要在多次生成之间积累上下文，想要把生成物整合进工作流——这些需求在当前范式下都是有摩擦的。

**如果 Bing Image/Video Creator 要往 agent 范式迁移，设计挑战会出现在哪里？**

第一，**任务状态的表达**。Video 生成是一个有延时的任务，可能需要几十秒到几分钟。在这段时间里，用户在哪里？在看加载圈吗？还是可以去做别的事，任务在后台运行，完成了再通知？这是 agent 范式和 chat 范式最直接的 UI 差异——agent 是异步的，chat 是同步的。

第二，**生成历史的信息架构**。用户生成了 50 张图，这 50 张图现在是按时间线排列的流。如果要支持"上次那个风格，但换个场景"的需求，需要的是可以检索、可以打标签、可以引用的 asset 管理系统，不是时间线。这是 forgotten conversation problem 在创意工具里的具体形态。

第三，**授权和控制的颗粒度**。如果 Image Creator 的 agent 可以自动根据你的偏好历史生成推荐，用户需要能看到"为什么生成这个"，能关闭这个自动化，能明确知道哪些数据在被使用。这是透明度问题，是 agent UI 设计的核心挑战之一。

**三个可行动的设计框架**

基于这次 pattern 分析，提炼三个框架，给在 Microsoft 做产品设计的 An：

**框架一：在你的产品里找"undo 盲区"**

问自己：你设计的每一个 AI 执行操作，用户如果后悔了，路径是什么？是"真正的撤销"，还是"重新来一次"？如果是后者，你在让用户承担 AI 错误的成本。设计一个可逆操作的标准比你想象的难——从技术到交互，都需要提前考虑。先找到你产品里的 undo 盲区，这是 agent UI 改造的第一步。

**框架二：把 chat 历史升级成"工作记忆"**

你设计的 AI 功能，用户的使用历史应该是"记录"还是"知识库"？如果用户跟 Image Creator 合作产生了有价值的风格探索，这些探索应该是可检索的、可引用的、可以告诉下一次 agent"上次那个方向"的。这不是技术问题，这是 IA（信息架构）问题——设计师能做的，是推动产品把 history 当 memory 来设计，而不是当 log 来设计。

**框架三：显性化 agent 的授权边界**

每一个 AI 代替用户做决定的地方，都需要一个清晰的 UI 表达：这是 AI 在建议，还是 AI 在执行？这两者的 UI 语言应该不同。建议可以用"suggestion chip"，执行需要更重的"confirm + preview"交互。边界模糊是 agent UI 最常见的设计失误——用户不知道 AI 已经帮他做了什么，然后出了问题不知道从哪里找回来。显性化授权边界，不只是善意，也是信任的基础设施。

---

## 结语：范式转移中的设计师位置

Mozilla.ai 那篇文章的标题——*The Interface Is No Longer the Product*——如果你是产品设计师，第一反应可能是"那我的工作是什么？"

答案在文章里，也在这份 research 的逻辑里：

当 interface 变成人和 AI 之间的协议，**设计师设计的是协议的质量**——清晰度、可逆性、可审计性、信任感。这比设计一个漂亮的 UI 更难，也更重要。

Chat UI 的问题不是它"老了"或者"不好看"，而是它的设计假设在 agent 场景下失效了。设计假设是什么？**每次交互是一个有开始和结束的独立事件。** Agent 场景的假设是什么？**每次交互是一个持续任务的某个节点，它有状态，有依赖，有历史，有授权。**

这两个假设需要完全不同的 UI 语言。

UX Collective 5 月 26 日那篇 *Should I Design for Humans or Machines?* 问了一个很好的问题。Morgans 的回答：**设计给人，但要理解机器的执行逻辑。** Agent UI 的设计师需要理解 task graph 是什么，理解异步操作意味着什么，理解 state management 在 UI 层面怎么表达——不是为了写代码，而是为了设计出不会让用户摔跤的界面。

Lars Faye 和 George Hotz 的反对意见是正确的警醒：不要因为 agent 概念热就放弃对 chat 的理性使用，不要以为 agent 自动等于更好。但他们的警醒不能变成借口——"agent 还没准备好"是一个暂时的状态，不是一个永久的理由。准备工作里，设计师能做的部分，现在就可以开始。

---

*参考信息源：The Decoder（6/8），UX Collective 三部曲（4/29、5/17、5/26），Design Bootcamp（5/27），Mozilla.ai（5/27），UX Collective "think like a manager"（5/6），Figma MCP（5/8），Figma AI co-design（5/19），Microsoft Build 2026（6/3），Nadella "不成瘾"声明（6/7），Lars Faye HN（5/14），thetypicalset（5/10），UX Collective "five new AI design roles"（6/7），The Verge/Adobe（6/1），Robinhood（5/29）*
