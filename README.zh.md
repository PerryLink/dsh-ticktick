# dsh-ticktick

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![DSH plugin](https://img.shields.io/badge/dsh--plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![dsh-doctor](https://raw.githubusercontent.com/PerryLink/dsh-plugin-doctor/main/badges/PerryLink__dsh-ticktick.svg)](https://github.com/PerryLink/dsh-plugin-doctor#verified-徽章)
[![Gitee](https://img.shields.io/badge/Gitee-mirror-c71d23?logo=gitee)](https://gitee.com/perrylink/dsh-ticktick)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-ticktick/ci.yml?branch=main&label=CI)](https://github.com/PerryLink/dsh-ticktick/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-ticktick?label=version)](https://github.com/PerryLink/dsh-ticktick/releases)
[![npm version](https://img.shields.io/npm/v/%40perrylink%2Fdsh-ticktick)](https://www.npmjs.com/package/@perrylink/dsh-ticktick)
[![npm downloads](https://img.shields.io/npm/dm/%40perrylink%2Fdsh-ticktick)](https://www.npmjs.com/package/@perrylink/dsh-ticktick)

[English](README.md) | **中文** | [Español](README.es.md) | [Português](README.pt.md) | [हिन्दी](README.hi.md)

面向 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的滴答清单（TickTick / Dida365）任务桥：会话头部任务面板（清单筛选、快速添加、完成、删除、截止日期、拖拽排序）、11 个精选 agent 工具、插件设置卡片，以及类型化的 Remote 服务——全部走官方滴答 MCP 端点。

## 兼容性

| 方面 | 状态 |
|---|---|
| Harness | DeepSeek Harness **dsh-v0.1.5-rc.1**（GitHub tag）。npm 依赖线钉在 `@deepseek-ai/dsh` **0.1.5-rc.1**（peers `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0`）。已于 2026-09-10 对照 dsh-v0.1.5-rc.1 master checkout 核验（完整门禁链 + profile 安装冒烟）。 |

## 功能

- **会话头部面板**：会话头部的 `ticktick` 按钮打开弹窗——按清单筛选（全部 + 各清单）、未完成/已完成视图切换、全文搜索、带可选日期的快速添加、勾选完成、确认删除、设置/清除截止日期（过期/今天/明天高亮 chip）、单清单未完成视图内拖拽排序。常驻连接状态圆点；未配置令牌时面板内直接一步粘贴保存。
- **11 个 agent 工具**：`ticktick_status`、`ticktick_lists`、`ticktick_tasks`、`ticktick_add`、`ticktick_complete`、`ticktick_delete`、`ticktick_due`、`ticktick_reorder`、`ticktick_completed`、`ticktick_search`、`ticktick_batch_add`；Code Mode 免费获得 `await tools.ticktick_*(args)`。
- **设置卡片**：设置 → 插件 → TickTick：API 口令（secret）、令牌文件、端点预设（国内/国际版未实测/自定义）、受保护任务 id、一键**测试连接**与**清除凭据**。
- **令牌热重读**：Bearer 令牌每次请求重读（卡片 secret 优先于令牌文件，默认 `$DSH_HOME/.ticktick-token`）；401 会重置客户端，轮换令牌无需重启。
- **实测绕行**：滴答 MCP 对真实项目内任务调用 `update_task` 会服务端崩溃（"Expecting value: line 1 column 1"）——桥自动走「移到收件箱 → 更新 → 移回」绕行；服务端校验失败的清单（历史 `repeatFrom: ''` 数据）跳过并以警告透传，绝不静默丢弃。
- **受保护任务**：变更操作在任何网络调用前拒绝受保护 id 列表中的任务。
- **多端同步**：所有写入落在滴答云端账号，手机/电脑/网页版都能看到；每次读取都是当前状态。

## 安装

```sh
# npm（发布产物含 lib/，无需构建许可）
dsh plugin --profile web add @perrylink/dsh-ticktick

# git 源码（钉住 commit；pnpm 首次会请你放行 prepare 构建）
dsh plugin --profile web add "github:PerryLink/dsh-ticktick#<sha>"

# 本地开发
dsh plugin --profile web add link:/path/to/dsh-ticktick
```

重启 `dsh web`（bundle 插件重启生效）。`ticktick` 按钮出现在会话头部；设置卡片出现在 设置 → 插件。

## 配置

1. 在滴答网页版获取 API 口令（`dp_` 开头）：头像 → 设置 → 账户与安全 → API 口令。
2. 三种令牌来源任选其一（优先级从高到低）：设置 → 插件 → TickTick 卡片的 secret 字段、`DIDA365_TOKEN` 环境变量、令牌文件（默认 `$DSH_HOME/.ticktick-token`，一行）。写文件即生效，无需任何配置变更。
3. 用卡片上的**测试连接**按钮验证令牌，**清除凭据**按钮一键抹除。

| 配置键 | 默认 | 含义 |
|---|---|---|
| `tokenFile` | `''` | 存放令牌的文本文件路径；留空 = `$DSH_HOME/.ticktick-token` |
| `mcpUrl` | `https://mcp.dida365.com` | 滴答 MCP 端点（国际版端点未实测——见下文） |
| `toolCallTimeoutMs` | `30000` | 单次 tools/call 截止时间（毫秒） |
| `protectedTaskIds` | `[]` | 所有变更操作拒绝的任务 id |
| `tools.*` | 各自 `''` | 原始 MCP 工具名钉住（projects/tasks/create/complete/remove/update/move）；`''` = 按模式发现 |

## Agent 工具

| 工具 | 用途 |
|---|---|
| `ticktick_status` | 连接状态：令牌已配置、客户端已连接、端点、最近错误 |
| `ticktick_lists` | 全部清单（含虚拟收件箱） |
| `ticktick_tasks` | 未完成任务：单个清单或全部聚合，附带逐清单警告 |
| `ticktick_add` | 创建任务（清单、可选 ISO 截止日期） |
| `ticktick_complete` | 完成任务（任务 id + 清单 id） |
| `ticktick_delete` | 删除任务（任务 id + 清单 id） |
| `ticktick_due` | 设置/清除截止日期（省略日期 = 清除） |
| `ticktick_reorder` | 赋新整数 sortOrder（清单按 sortOrder 降序排列） |
| `ticktick_completed` | 时间窗内已完成任务（默认近 30 天），可选单清单 |
| `ticktick_search` | 任务全文搜索（官方 search 工具） |
| `ticktick_batch_add` | 一次调用批量创建任务 |

## 架构

```
浏览器面板 ── ctx.remote.ticktick.* ──▶ TicktickService（Typert Remote）
设置卡片 ──── ctx.settingsScope ──────▶ settings 命名空间 "ticktick"
agent 工具 ── ctx.tools（ticktick_*）──▶ 同一服务
                    │
                    ▼
        迷你 streamable-HTTP MCP 客户端
        （session id、协议版本、Retry-After）
                    │
                    ▼
        https://mcp.dida365.com（官方滴答 MCP）
```

## 已知限制

- 国际版 TickTick 端点**未实测**：`mcpUrl` 默认国内端点，国际版 MCP URL 尚未探测。
- 已完成视图、搜索与批量添加走官方 MCP 的 `list_completed_tasks_by_date`、`search`、`batch_add_tasks` 工具；其线上契约来自已发布目录（dida365-sdk 存根），**对真实端点的复验待做**——先用真实令牌跑 `probes/probe-queries.mjs`，再宣称已核验。
- 实测到的 `update_task` 崩溃与清单校验失败是服务端行为；发布前用 `probes/` 对真实端点复验（导出 `DIDA365_TOKEN` 后运行）。
- 面板使用的 `/api` 面是 harness 标准 Typert 网关；令牌仅存本地（设置文档或令牌文件）且只发给滴答自己的服务器。不要把 `dsh web` 实例暴露到公网。

## 对真实端点验证

```sh
# PowerShell
$env:DIDA365_TOKEN='dp_...'
node probes/probe-bootstrap.mjs      # 握手 + 工具目录
node probes/probe-crud.mjs           # 创建/完成/删除往返
node probes/probe-due.mjs            # 截止日期（带 PROJECT_ID 可测绕行）
node probes/probe-reorder.mjs        # sortOrder 语义
node probes/probe-queries.mjs        # P2 查询工具契约探测
```

## 卸载

```sh
dsh plugin --profile web remove @perrylink/dsh-ticktick
```

重启 `dsh web`。工具、面板、设置卡、系统提示等全部运行态注册随插件卸载一并撤销。唯一静态残留是用户设置文档里的令牌——卸载前用卡片的**清除凭据**按钮抹掉（或删除令牌文件 / `DIDA365_TOKEN` 变量）即可彻底断开。想保留安装但暂时停用，改禁用该行：

```yaml
- id: ticktick
  disabled: true
```

### 从 DSH Desktop 市场安装

所有 PerryLink 插件均可在 DSH Desktop 内置市场中浏览：**市场 → 来源 → 添加来源 → 粘贴** `https://perrylink-dsh-catalog.perrylink.workers.dev/catalog-source.json` **→ 选中**。安装仍需通过市场的 npm 身份校验与你的确认。

## PerryLink DSH Plugin Family

这是 [PerryLink](https://github.com/PerryLink) 维护的 [37 个 DeepSeek Harness 插件](https://github.com/PerryLink) 之一。如果它能帮到你，其他的也会：

| Plugin | One-liner |
|---|---|
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** | 审批链上的第二模型自动审查，默认失败关闭 | |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | 带 Web UI 侧栏、消息与中断的持久后台子代理 | |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | DeepSeek Harness 的成本治理：预算、碳排与延迟一屏呈现。 | |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** | Claude Code /rewind 等价：快照、会话 fork、一次性恢复 | |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | 把 Claude Code 会话、记忆、技能与 CLAUDE.md 迁入 DSH | |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** | 跨平台原生桌面控制（DeepSeek Harness），Windows 优先。 | |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Web 输入框的终端式历史：方向键、Ctrl+R 搜索 | |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** | 数据集质量检查与引文核查（本插件可选消费的数字核查桥） | |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | DeepSeek Harness 的提示注入、越狱与密钥泄露防护。 | |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** | 工程纪律守卫：需求质询、测试门禁、对手评审 | |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | DeepSeek Harness 的统一静态图像生成路由。 | |
| **[dsh-fast](https://github.com/PerryLink/dsh-fast)** | DeepSeek Harness 只读性能诊断。 | |
| **[dsh-fund-research](https://github.com/PerryLink/dsh-fund-research)** | 面向中国公募基金的确定性研究报告 | |
| **[dsh-github](https://github.com/PerryLink/dsh-github)** | 面向 DSH 的 GitHub PR/issues 集成，每次写入经审批门控 | |
| **[dsh-industry-research](https://github.com/PerryLink/dsh-industry-research)** | 行业研究编排，经本插件的 `ctx.researchReport.assemble` 封存交付物 | |
| **[dsh-library](https://github.com/PerryLink/dsh-library)** | DeepSeek Harness 的本地文档知识库。 | |
| **[dsh-local-ai](https://github.com/PerryLink/dsh-local-ai)** | DeepSeek Harness 的本地模型（Ollama）接入。 | |
| **[dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions)** | 通过语言服务器的 LSP 诊断、格式化、补全、代码操作与重命名 | |
| **[dsh-mask](https://github.com/PerryLink/dsh-mask)** | PII 脱敏中间件：模型边界匿名化、展示层还原 | |
| **[dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel)** | 只读 MCP 运行时面板：/mcp 命令 + 带状态、工具与错误的 Settings 标签页 | |
| **[dsh-memento](https://github.com/PerryLink/dsh-memento)** | 审批门控的跨会话记忆：ctx.memory 接缝 + SQLite + 记忆工具 | |
| **[dsh-observe](https://github.com/PerryLink/dsh-observe)** | DeepSeek Harness 的 OpenTelemetry 与 Langfuse 可观测导出器。 | |
| **[dsh-output-styles](https://github.com/PerryLink/dsh-output-styles)** | Claude Code outputStyles 等价的运行时风格切换 | |
| **[dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules)** | Claude Code 风格声明式 allow/deny/ask 权限规则，带审计 | |
| **[dsh-personal-directive](https://github.com/PerryLink/dsh-personal-directive)** | 个人指令注入器:顶栏开关(框架版) |
| **[dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide)** | 作为按需代理技能的插件开发知识库 | |
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | 多渠道审批/提问桥接:微信/Telegram/飞书,会话控制台 |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** | 可验证研究报告引擎：内容寻址证据账本与封存版本 | |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** | DeepSeek Harness 插件的多维质量评分。 | |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | 在 Web 侧栏置顶会话，带持久排序 | |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** | DeepSeek Harness 的跨设备会话同步——会话存储的专用 git 镜像。 | |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** | 安全审计技能包：密钥扫描、依赖与供应链审查 | |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** | DeepSeek Harness 的语音优先会话闭环：对它说，听它答。 | |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** | DeepSeek Harness 插件的隔离试装冒烟。 | |
| **[dsh-translate](https://github.com/PerryLink/dsh-translate)** | DeepSeek Harness 的厂商参数翻译与确定性 JSON 修复。 | |
| **[dsh-wechat](https://github.com/PerryLink/dsh-wechat)** | 微信 ↔ DSH 桥接(Tencent iLink 机器人):文本/图片/文件/语音,聊天内审批卡片 |


## License

[Apache-2.0](LICENSE)
