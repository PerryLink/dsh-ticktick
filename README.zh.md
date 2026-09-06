# dsh-ticktick

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![DSH plugin](https://img.shields.io/badge/dsh-plugin-✅-green)](https://github.com/topics/dsh-plugin)
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
| Harness | DeepSeek Harness **dsh-v0.1.3-alpha.1**（GitHub tag）。npm 依赖线钉在 `@deepseek-ai/dsh` **0.1.2-rc.1**（peers `>=0.1.2-rc.1 <0.2.0`）。已于 2026-09-06 对照 dsh-v0.1.3-alpha.1 master checkout 核验（完整门禁链 + profile 安装冒烟）。 |

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

## License

[Apache-2.0](LICENSE)
