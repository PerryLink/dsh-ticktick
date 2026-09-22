# dsh-ticktick

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![DSH plugin](https://img.shields.io/badge/dsh--plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![dsh-doctor](https://raw.githubusercontent.com/PerryLink/dsh-plugin-doctor/main/badges/PerryLink__dsh-ticktick.svg)](https://github.com/PerryLink/dsh-plugin-doctor#verified-徽章)
[![DSH Market](https://raw.githubusercontent.com/2BingLing/dsh-market/master/assets/readme/badge-listed-en.svg)](https://dsh.market/)
[![Gitee](https://img.shields.io/badge/Gitee-mirror-c71d23?logo=gitee)](https://gitee.com/perrylink/dsh-ticktick)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-ticktick/ci.yml?branch=main&label=CI)](https://github.com/PerryLink/dsh-ticktick/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-ticktick?label=version)](https://github.com/PerryLink/dsh-ticktick/releases)
[![npm version](https://img.shields.io/npm/v/%40perrylink%2Fdsh-ticktick)](https://www.npmjs.com/package/@perrylink/dsh-ticktick)
[![npm downloads](https://img.shields.io/npm/dm/%40perrylink%2Fdsh-ticktick)](https://www.npmjs.com/package/@perrylink/dsh-ticktick)

[English](README.md) | [简体中文](README-zh.md) | [Español](README-es.md) | [Português](README-pt.md) | **हिन्दी**

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) के लिए TickTick / Dida365 (滴答清单) टास्क ब्रिज: सत्र-हेडर टास्क पैनल (सूची फ़िल्टर, त्वरित जोड़, पूर्ण करना, हटाना, नियत तिथियाँ, ड्रैग पुनःक्रम), ग्यारह एजेंट टूल, प्लगइन पृष्ठ पर एक कॉन्फ़िगरेशन पृष्ठ और एक टाइप्ड Remote सेवा — सब कुछ आधिकारिक TickTick MCP एंडपॉइंट के ऊपर।

## संगतता

| सतह | स्थिति |
|---|---|
| Harness | DeepSeek Harness **dsh-v0.1.7-alpha.1** (GitHub tag)। npm डिपेंडेंसी लाइन: `@deepseek-ai/dsh` **0.1.7-alpha.1** (peers `>=0.1.7-alpha.1 <0.2.0`)। dsh-v0.1.7-alpha.1 checkout के विरुद्ध सत्यापित (पूर्ण gate chain + profile install smoke)। |
| Node | `^22.19.0 \|\| >=24.0.0` |

## विशेषताएँ

- **सत्र-हेडर पैनल** — हेडर में `ticktick` क्रिया एक पॉपअप खोलती है: सूची के अनुसार फ़िल्टर (सभी + हर सूची), लंबित/पूर्ण दृश्य टॉगल, पूर्ण-पाठ खोज, वैकल्पिक नियत तिथि के साथ कार्य जोड़ना, पूर्ण करना, हटाना (पुष्टि के साथ), अतिदेय/आज/कल चिप्स के साथ नियत तिथियाँ सेट/साफ़ करना, और ड्रैग पुनःक्रम (लंबित, एकल-सूची दृश्य)। एक स्थिति बिंदु कनेक्शन दिखाता है; जब टोकन कॉन्फ़िगर नहीं होता, पैनल एक-चरणीय टोकन सेटअप देता है।
- **ग्यारह एजेंट टूल** — `ticktick_status`, `ticktick_lists`, `ticktick_tasks`, `ticktick_add`, `ticktick_complete`, `ticktick_delete`, `ticktick_due`, `ticktick_reorder`, `ticktick_completed`, `ticktick_search`, `ticktick_batch_add`; Code Mode को `await tools.ticktick_*(args)` मुफ़्त मिलता है।
- **कॉन्फ़िगरेशन पृष्ठ** — प्लगइन पृष्ठ → TickTick पंक्ति → **Configure**: API टोकन (गुप्त), टोकन फ़ाइल, CN/अंतर्राष्ट्रीय प्रीसेट के साथ MCP एंडपॉइंट, संरक्षित कार्य ids (चारों लाइव लागू होते हैं, पुनः आरंभ की आवश्यकता नहीं), एक कनेक्शन-परीक्षण बटन और एक क्रेडेंशियल-साफ़ बटन।
- **लाइव टोकन पुनःपठन** — Bearer टोकन हर अनुरोध पर फिर पढ़ा जाता है (कार्ड गुप्त > फ़ाइल, डिफ़ॉल्ट `$DSH_HOME/.ticktick-token`); 401 क्लाइंट को रीसेट करता है ताकि घुमाया गया टोकन बिना पुनरारंभ सक्रिय हो जाए।
- **मापे गए कामकाज** — TickTick MCP सामान्य प्रोजेक्टों के कार्यों के लिए `update_task` अस्वीकार करता है ("Expecting value: line 1 column 1"); ब्रिज इनबॉक्स-में-ले-जाओ → अपडेट → वापस-ले-आओ के रास्ते से फिर कोशिश करता है। सर्वर-साइड सत्यापन में विफल सूचियाँ (ऐतिहासिक `repeatFrom: ''` डेटा) छोड़ दी जाती हैं और चेतावनी के रूप में सूचित होती हैं, चुपचाप कभी नहीं गिराई जातीं।
- **संरक्षित ids** — उत्परिवर्तन क्रियाएँ किसी भी वायर कॉल से पहले संरक्षित-सूची के कार्यों को मना करती हैं।
- **बहु-डिवाइस सिंक** — हर लेखन TickTick क्लाउड खाते पर जाता है, इसलिए फ़ोन/डेस्कटॉप/वेब ऐप उसे देखते हैं; हर पठन वर्तमान स्थिति लाता है।

## इंस्टॉल

```sh
dsh plugin --profile web add @perrylink/dsh-ticktick   # npm (lib/ शामिल)
dsh plugin --profile web add "github:PerryLink/dsh-ticktick#<sha>"   # git
dsh plugin --profile web add link:/path/to/dsh-ticktick              # local
```

`dsh web` पुनः आरंभ करें (bundle प्लगइन पुनरारंभ पर सक्रिय होते हैं)। `ticktick` क्रिया सत्र हेडर में दिखती है; इसका कॉन्फ़िगरेशन पृष्ठ प्लगइन पृष्ठ की TickTick पंक्ति पर **Configure** नियंत्रण से खुलता है।

## कॉन्फ़िगरेशन

1. Dida365/TickTick वेब ऐप से एक API 口令 टोकन (`dp_`-उपसर्ग वाला) लें: प्रोफ़ाइल → सेटिंग्स → खाता और सुरक्षा → API 口令।
2. तीन टोकन स्रोतों में से एक चुनें (प्राथमिकता क्रम): TickTick कॉन्फ़िगरेशन पृष्ठ का गुप्त क्षेत्र (प्लगइन पृष्ठ → TickTick पंक्ति → Configure), `DIDA365_TOKEN` पर्यावरण चर, या एक टोकन फ़ाइल (डिफ़ॉल्ट `$DSH_HOME/.ticktick-token`, एक पंक्ति)। फ़ाइल लिखने से ब्रिज बिना किसी कॉन्फ़िगरेशन बदलाव के सक्रिय हो जाता है।
3. टोकन सत्यापित करने के लिए कार्ड का **Test connection** बटन और उसे मिटाने के लिए **Clear credentials** बटन उपयोग करें।

| कुंजी | डिफ़ॉल्ट | अर्थ |
|---|---|---|
| `tokenFile` | `''` | टोकन फ़ाइल; खाली = `$DSH_HOME/.ticktick-token` |
| `mcpUrl` | `https://mcp.dida365.com` | TickTick MCP एंडपॉइंट (अंतर्राष्ट्रीय अभी अप्रमाणित है — नीचे देखें) |
| `toolCallTimeoutMs` | `30000` | प्रति tools/call समय-सीमा ms में |
| `protectedTaskIds` | `[]` | वे ids जिन्हें उत्परिवर्तन मना करते हैं |
| `tools.*` | `''` | स्थिर MCP टूल नाम (projects/tasks/create/complete/remove/update/move); `''` = पैटर्न से खोजना |

## एजेंट टूल

| टूल | उद्देश्य |
|---|---|
| `ticktick_status` | कनेक्शन स्थिति: टोकन कॉन्फ़िगर, क्लाइंट जुड़ा, एंडपॉइंट, अंतिम त्रुटि |
| `ticktick_lists` | हर सूची (प्रोजेक्ट), वर्चुअल इनबॉक्स सहित |
| `ticktick_tasks` | लंबित कार्य: एक सूची या सभी समेकित, प्रति-सूची चेतावनियों के साथ |
| `ticktick_add` | कार्य बनाएँ (सूची, वैकल्पिक ISO नियत तिथि) |
| `ticktick_complete` | कार्य पूर्ण करें (कार्य id + सूची id) |
| `ticktick_delete` | कार्य हटाएँ (कार्य id + सूची id) |
| `ticktick_due` | नियत तिथि सेट/साफ़ करें (साफ़ करने के लिए तिथि छोड़ें) |
| `ticktick_reorder` | नया पूर्णांक sortOrder दें (सूचियाँ अवरोही sortOrder से क्रमित) |
| `ticktick_completed` | एक विंडो (डिफ़ॉल्ट 30 दिन) में पूर्ण किए कार्य, वैकल्पिक रूप से एक सूची |
| `ticktick_search` | कार्यों पर पूर्ण-पाठ खोज (आधिकारिक खोज टूल) |
| `ticktick_batch_add` | एक ही कॉल में कई कार्य बनाएँ |

## आर्किटेक्चर

```
ब्राउज़र पैनल ──────── ctx.remote.ticktick.* ──▶ TicktickService (Typert Remote)
कॉन्फ़िगरेशन पृष्ठ ── ctx.configForms ──▶ profile प्रविष्टि "ticktick" (Volatile Config)
एजेंट टूल ──────────── ctx.tools (ticktick_*) ─▶ वही सेवा
                     │
                     ▼
         न्यूनतम streamable-HTTP MCP क्लाइंट
         (session id, protocol version, Retry-After)
                     │
                     ▼
         https://mcp.dida365.com  (आधिकारिक TickTick MCP)
```

## ज्ञात सीमाएँ

- अंतर्राष्ट्रीय TickTick एंडपॉइंट **अप्रमाणित है**: `mcpUrl` डिफ़ॉल्ट रूप से CN एंडपॉइंट पर जाता है और अंतर्राष्ट्रीय MCP URL की जाँच नहीं हुई है।
- पूर्ण दृश्य, खोज और बैच जोड़ MCP टूल `list_completed_tasks_by_date`, `search` और `batch_add_tasks` पर चलते हैं; इनके वायर अनुबंध प्रकाशित कैटलॉग (`dida365-sdk` stubs) से आते हैं और लाइव एंडपॉइंट के विरुद्ध **पुनः-सत्यापन लंबित** है — इन्हें सत्यापित मानने से पहले असली टोकन के साथ `probes/probe-queries.mjs` चलाएँ।
- मापा गया `update_task` क्रैश और सूची-सत्यापन विफलताएँ सर्वर-साइड व्यवहार हैं; `probes/` हर release से पहले उन्हें लाइव एंडपॉइंट के विरुद्ध फिर सत्यापित करता है (`DIDA365_TOKEN` निर्यात करके चलाएँ)।
- पैनल जो `/api` सतह उपयोग करता है वह मानक harness Typert गेटवे है; टोकन स्थानीय रूप से संग्रहीत रहता है (settings document या टोकन फ़ाइल) और केवल TickTick के अपने सर्वरों को भेजा जाता है। `dsh web` इंस्टेंस को सार्वजनिक इंटरनेट पर उजागर न करें।

## ब्रिज को लाइव एंडपॉइंट के विरुद्ध सत्यापित करें

```sh
# PowerShell
$env:DIDA365_TOKEN='dp_...'
node probes/probe-bootstrap.mjs      # handshake + टूल कैटलॉग
node probes/probe-crud.mjs           # बनाओ/पूर्ण/हटाओ राउंड ट्रिप
node probes/probe-due.mjs            # नियत तिथियाँ (+ PROJECT_ID के साथ detour)
node probes/probe-reorder.mjs        # sortOrder शब्दार्थ
node probes/probe-queries.mjs        # P2 क्वेरी-टूल अनुबंध खोज
```

## अनइंस्टॉल

```sh
dsh plugin --profile web remove @perrylink/dsh-ticktick
```

`dsh web` पुनः आरंभ करें। सभी रनटाइम पंजीकरण (टूल, पैनल, कॉन्फ़िगरेशन पृष्ठ, prompt अनुभाग) प्लगइन के साथ हट जाते हैं। एकमात्र स्थैतिक अवशेष उपयोगकर्ता settings document में टोकन है — पूरी तरह अलग करने के लिए पहले TickTick कॉन्फ़िगरेशन पृष्ठ के **Clear credentials** बटन से उसे साफ़ करें (या टोकन फ़ाइल / `DIDA365_TOKEN` चर हटाएँ)। पैकेज इंस्टॉल रखकर निष्क्रिय करने के लिए इसके बजाय पंक्ति को disabled करें:

```yaml
- id: ticktick
  disabled: true
```

### DSH Desktop मार्केट से इंस्टॉल करें

सभी PerryLink प्लगइन DSH Desktop के बिल्ट-इन मार्केट में देखे जा सकते हैं: **Market → Sources → add source → पेस्ट करें** `https://perrylink-dsh-catalog.perrylink.workers.dev/catalog-source.json` **→ चुनें**। इंस्टॉलेशन मार्केट के npm-identity सत्यापन और आपकी पुष्टि से ही होता है।

## PerryLink DSH Plugin Family

This project is one of the **45 DeepSeek Harness plugins** maintained by [PerryLink](https://github.com/PerryLink). If this one helps you, the others likely will too:

| Plugin | One-liner |
|---|---|
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** | Second-model auto-review on the approval chain, fail-closed by default | |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** | Automatic strong/cheap model-tier routing with deterministic risk guards and a `/tier` command | |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | Durable background child agents with a Web UI sidebar, messaging and interrupt | |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | Cost governance for DeepSeek Harness: budgets, carbon, and latency in one panel. | |
| **[dsh-catalog](https://github.com/PerryLink/dsh-catalog)** | DSH Desktop Market standard catalog source for the PerryLink family | |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** | Read-only MCP server exposing the certification registry: grades, snapshots and five-dimension evidence | |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore | |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH | |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** | Cross-platform native desktop control for DeepSeek Harness — Windows first. | |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Terminal-style input history for the web composer: arrows, Ctrl+R search | |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** | Dataset quality checks and citation cross-checks (the optional numeric bridge consumed here) | |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | Prompt-injection, jailbreak, and secret-leak defense for DeepSeek Harness. | |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** | Engineering-discipline guard: requirements grill, test gates, adversary review | |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | Unified static-image generation routing for DeepSeek Harness. | |
| **[dsh-fast](https://github.com/PerryLink/dsh-fast)** | Read-only performance diagnostics for DeepSeek Harness. | |
| **[dsh-fund-research](https://github.com/PerryLink/dsh-fund-research)** | Deterministic research reports for Chinese public mutual funds | |
| **[dsh-github](https://github.com/PerryLink/dsh-github)** | GitHub PR/issues integration for DSH, every write gated by approval | |
| **[dsh-industry-research](https://github.com/PerryLink/dsh-industry-research)** | Industry research orchestration that seals its deliverables through this plugin's `ctx.researchReport.assemble` | |
| **[dsh-laya](https://github.com/PerryLink/dsh-laya)** | Laya typed decisions (`noul`/`choice`/`score`) as a first-class Cordis service and model-visible tools | |
| **[dsh-library](https://github.com/PerryLink/dsh-library)** | Local document knowledge base for DeepSeek Harness. | |
| **[dsh-local-ai](https://github.com/PerryLink/dsh-local-ai)** | Local-model (Ollama) integration for DeepSeek Harness. | |
| **[dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions)** | LSP diagnostics, formatting, completion, code actions and rename over language servers | |
| **[dsh-mask](https://github.com/PerryLink/dsh-mask)** | PII masking middleware: anonymize at the model boundary, restore at the display layer | |
| **[dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel)** | Read-only MCP runtime panel: /mcp command + Settings tab with status, tools and errors | |
| **[dsh-memento](https://github.com/PerryLink/dsh-memento)** | Approval-gated cross-session memory: ctx.memory seam + SQLite + memory tool | |
| **[dsh-observe](https://github.com/PerryLink/dsh-observe)** | OpenTelemetry and Langfuse observability exporter for DeepSeek Harness. | |
| **[dsh-output-styles](https://github.com/PerryLink/dsh-output-styles)** | Claude Code outputStyles-equivalent runtime style switching | |
| **[dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules)** | Claude Code-style declarative allow/deny/ask permission rules with audit | |
| **[dsh-plugin-certification](https://github.com/PerryLink/dsh-plugin-certification)** | Community certification registry with repro-checkable grades and badges | |
| **[dsh-plugin-doctor](https://github.com/PerryLink/dsh-plugin-doctor)** | Zero-dependency static + sandbox smoke detector for DSH plugins | |
| **[dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide)** | Plugin-development knowledge base as an on-demand agent skill | |
| **[dsh-plugin-kit](https://github.com/PerryLink/dsh-plugin-kit)** | Shared zero-runtime-dependency toolkit for the PerryLink DSH plugins | |
| **[dsh-plugin-upgrade](https://github.com/PerryLink/dsh-plugin-upgrade)** | One-package, one-corridor-index plugin upgrade skill: routes a repository to the matching closed corridor card | |
| **[dsh-plugin-upgrade-015](https://github.com/PerryLink/dsh-plugin-upgrade-015)** | Merged `0.1.3-alpha.1` → `0.1.5-rc.1` upgrade corridor card plus a zero-dependency seam scanner | |
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | Multi-channel approval/question bridge: WeChat/Telegram/Feishu, session console | |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** | Verifiable research-report engine: content-addressed evidence ledger and sealed versions | |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** | Multi-dimensional quality scoring for DeepSeek Harness plugins. | |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | Pin sessions in the Web sidebar with durable ordering | |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** | Cross-device session sync for DeepSeek Harness — a dedicated git mirror of your session store. | |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** | Security-audit skill pack: secret scan, dependency and supply-chain review | |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** | Voice-first session loop for DeepSeek Harness: talk to it, hear it answer. | |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | Cross-session team rooms: shared message bus, task board and timeline | |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** | Isolated install-and-smoke test drives for DeepSeek Harness plugins. | |
| **[dsh-ticktick](https://github.com/PerryLink/dsh-ticktick)** | TickTick/Dida365 task bridge: session-header panel + 11 tools | |
| **[dsh-translate](https://github.com/PerryLink/dsh-translate)** | Vendor parameter translation and deterministic JSON repair for DeepSeek Harness. | |


## लाइसेंस

[Apache-2.0](LICENSE)
