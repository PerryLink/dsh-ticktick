# dsh-ticktick

[English](README.md) · [简体中文](README-zh.md) · [Español](README-es.md) · [Português](README-pt.md) · [हिन्दी](README-hi.md)

```sh
dsh plugin --profile <name> add @perrylink/dsh-ticktick
```


> Release stamp: `0.1.13` (2026-10-04).

> **पैकेज नाम।** यह प्रोजेक्ट npm पर **`@perrylink/dsh-ticktick`** के रूप में प्रकाशित होता है। सादा नाम `dsh-ticktick` किसी असंबंधित प्रोजेक्ट का है — उसे इंस्टॉल करने से यह प्लगइन इंस्टॉल नहीं होता।

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
[![dshfind](https://dshfind.com/api/badge/PerryLink/dsh-ticktick?metric=downloads&lang=hi)](https://dshfind.com/hi/plugins/PerryLink/dsh-ticktick?ref=badge)

[English](README.md) | [简体中文](README-zh.md) | [Español](README-es.md) | [Português](README-pt.md) | **हिन्दी**

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) के लिए TickTick / Dida365 (滴答清单) टास्क ब्रिज: सत्र-हेडर टास्क पैनल (सूची फ़िल्टर, त्वरित जोड़, पूर्ण करना, हटाना, नियत तिथियाँ, ड्रैग पुनःक्रम), ग्यारह एजेंट टूल, प्लगइन पृष्ठ पर एक कॉन्फ़िगरेशन पृष्ठ और एक टाइप्ड Remote सेवा — सब कुछ आधिकारिक TickTick MCP एंडपॉइंट के ऊपर।

## इंस्टॉल

```sh
dsh plugin --profile web add github:PerryLink/dsh-ticktick
```

```sh
dsh plugin --profile web add @perrylink/dsh-ticktick   # npm (lib/ शामिल)
dsh plugin --profile web add "github:PerryLink/dsh-ticktick#<sha>"   # git
dsh plugin --profile web add link:/path/to/dsh-ticktick              # local
```

`dsh web` पुनः आरंभ करें (bundle प्लगइन पुनरारंभ पर सक्रिय होते हैं)। `ticktick` क्रिया सत्र हेडर में दिखती है; इसका कॉन्फ़िगरेशन पृष्ठ प्लगइन पृष्ठ की TickTick पंक्ति पर **Configure** नियंत्रण से खुलता है।

## What is dsh-ticktick?

dsh plugin --profile web add @perrylink/dsh-ticktick   # npm (lib/ शामिल) dsh plugin --profile web add "github:PerryLink/dsh-ticktick#<sha>"   # git dsh plugin --profile web add link:/path/to/dsh-ticktick              # local

![dsh-ticktick का टर्मिनल डेमो: dsh-ticktick — install, then verify against the live endpoint](https://raw.githubusercontent.com/PerryLink/dsh-ticktick/main/docs/assets/dsh-ticktick-hero.png)

![Animated terminal demo of dsh-ticktick](https://raw.githubusercontent.com/PerryLink/dsh-ticktick/main/docs/assets/dsh-ticktick-demo.gif)

*वही रन, एनिमेटेड।*

## संगतता

| सतह | स्थिति |
|---|---|
| Harness | DeepSeek Harness **dsh-v0.2.1-alpha.1** (GitHub tag)। npm डिपेंडेंसी लाइन: `@deepseek-ai/dsh` **0.2.1-alpha.1** (peers `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0 || >=0.1.6-0 <0.2.0 || >=0.1.7-0 <0.2.0 || >=0.2.0-0 <0.3.0 || >=0.2.1-0 <0.3.0`)। dsh-v0.2.1-alpha.1 checkout के विरुद्ध सत्यापित (पूर्ण gate chain + profile install smoke)। |
| Node | `^22.19.0 \|\| >=24.0.0` |

## विशेषताएँ

- **सत्र-हेडर पैनल** — हेडर में `ticktick` क्रिया एक पॉपअप खोलती है: सूची के अनुसार फ़िल्टर (सभी + हर सूची), लंबित/पूर्ण दृश्य टॉगल, पूर्ण-पाठ खोज, वैकल्पिक नियत तिथि के साथ कार्य जोड़ना, पूर्ण करना, हटाना (पुष्टि के साथ), अतिदेय/आज/कल चिप्स के साथ नियत तिथियाँ सेट/साफ़ करना, और ड्रैग पुनःक्रम (लंबित, एकल-सूची दृश्य)। एक स्थिति बिंदु कनेक्शन दिखाता है; जब टोकन कॉन्फ़िगर नहीं होता, पैनल एक-चरणीय टोकन सेटअप देता है।
- **ग्यारह एजेंट टूल** — `ticktick_status`, `ticktick_lists`, `ticktick_tasks`, `ticktick_add`, `ticktick_complete`, `ticktick_delete`, `ticktick_due`, `ticktick_reorder`, `ticktick_completed`, `ticktick_search`, `ticktick_batch_add`; Code Mode को `await tools.ticktick_*(args)` मुफ़्त मिलता है।
- **कॉन्फ़िगरेशन पृष्ठ** — प्लगइन पृष्ठ → TickTick पंक्ति → **Configure**: API टोकन (गुप्त), टोकन फ़ाइल, CN/अंतर्राष्ट्रीय प्रीसेट के साथ MCP एंडपॉइंट, संरक्षित कार्य ids (चारों लाइव लागू होते हैं, पुनः आरंभ की आवश्यकता नहीं), एक कनेक्शन-परीक्षण बटन और एक क्रेडेंशियल-साफ़ बटन।
- **लाइव टोकन पुनःपठन** — Bearer टोकन हर अनुरोध पर फिर पढ़ा जाता है (कार्ड गुप्त > फ़ाइल, डिफ़ॉल्ट `$DSH_HOME/.ticktick-token`); 401 क्लाइंट को रीसेट करता है ताकि घुमाया गया टोकन बिना पुनरारंभ सक्रिय हो जाए।
- **मापे गए कामकाज** — TickTick MCP सामान्य प्रोजेक्टों के कार्यों के लिए `update_task` अस्वीकार करता है ("Expecting value: line 1 column 1"); ब्रिज इनबॉक्स-में-ले-जाओ → अपडेट → वापस-ले-आओ के रास्ते से फिर कोशिश करता है। सर्वर-साइड सत्यापन में विफल सूचियाँ (ऐतिहासिक `repeatFrom: ''` डेटा) छोड़ दी जाती हैं और चेतावनी के रूप में सूचित होती हैं, चुपचाप कभी नहीं गिराई जातीं।
- **संरक्षित ids** — उत्परिवर्तन क्रियाएँ किसी भी वायर कॉल से पहले संरक्षित-सूची के कार्यों को मना करती हैं।
- **बहु-डिवाइस सिंक** — हर लेखन TickTick क्लाउड खाते पर जाता है, इसलिए फ़ोन/डेस्कटॉप/वेब ऐप उसे देखते हैं; हर पठन वर्तमान स्थिति लाता है।

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

## PerryLink DSH प्लगइन परिवार

यह प्रोजेक्ट [PerryLink](https://github.com/PerryLink) के DeepSeek Harness प्लगइन परिवार का हिस्सा है। पूरी सूची नीचे संक्षिप्त रखी गई है ताकि हर README की पहली स्क्रीन छोटी रहे; हर पंक्ति और उसकी स्थिति देखने के लिए इसे खोलें।

<details>
<summary>सभी प्लगइन खोलें</summary>

| प्लगइन | स्थिति |
|---|---|
| **[dsh-aqua-input-check](https://github.com/PerryLink/dsh-aqua-input-check)** |  |
| **[dsh-archive-check](https://github.com/PerryLink/dsh-archive-check)** |  |
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** |  |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** |  |
| **[dsh-bid-ca-precheck](https://github.com/PerryLink/dsh-bid-ca-precheck)** |  |
| **[dsh-bid-qual-check](https://github.com/PerryLink/dsh-bid-qual-check)** |  |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** |  |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** |  |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** |  |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** |  |
| **[dsh-contract-stance](https://github.com/PerryLink/dsh-contract-stance)** |  |
| **[dsh-customs-doc-check](https://github.com/PerryLink/dsh-customs-doc-check)** |  |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** |  |
| **[dsh-demurrage-ledger](https://github.com/PerryLink/dsh-demurrage-ledger)** |  |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** |  |
| **[dsh-drill-script-check](https://github.com/PerryLink/dsh-drill-script-check)** |  |
| **[dsh-eia-guide-check](https://github.com/PerryLink/dsh-eia-guide-check)** |  |
| **[dsh-emergency-plan](https://github.com/PerryLink/dsh-emergency-plan)** |  |
| **[dsh-essay-rubric-check](https://github.com/PerryLink/dsh-essay-rubric-check)** |  |
| **[dsh-evidence-check](https://github.com/PerryLink/dsh-evidence-check)** |  |
| **[dsh-export-ctl-check](https://github.com/PerryLink/dsh-export-ctl-check)** |  |
| **[dsh-fast](https://github.com/PerryLink/dsh-fast)** |  |
| **[dsh-fmea-table-check](https://github.com/PerryLink/dsh-fmea-table-check)** |  |
| **[dsh-forecast-penalty](https://github.com/PerryLink/dsh-forecast-penalty)** |  |
| **[dsh-fund-research](https://github.com/PerryLink/dsh-fund-research)** |  |
| **[dsh-github](https://github.com/PerryLink/dsh-github)** |  |
| **[dsh-gongwen-flow-check](https://github.com/PerryLink/dsh-gongwen-flow-check)** |  |
| **[dsh-gongwen-word-check](https://github.com/PerryLink/dsh-gongwen-word-check)** |  |
| **[dsh-guard-plan-qc](https://github.com/PerryLink/dsh-guard-plan-qc)** |  |
| **[dsh-hazchem-check](https://github.com/PerryLink/dsh-hazchem-check)** |  |
| **[dsh-hazplan-check](https://github.com/PerryLink/dsh-hazplan-check)** |  |
| **[dsh-hidden-risk-map](https://github.com/PerryLink/dsh-hidden-risk-map)** |  |
| **[dsh-hs-classify](https://github.com/PerryLink/dsh-hs-classify)** |  |
| **[dsh-icd-rule-check](https://github.com/PerryLink/dsh-icd-rule-check)** |  |
| **[dsh-industry-research](https://github.com/PerryLink/dsh-industry-research)** |  |
| **[dsh-lawcite-adapter](https://github.com/PerryLink/dsh-lawcite-adapter)** |  |
| **[dsh-laya](https://github.com/PerryLink/dsh-laya)** |  |
| **[dsh-lc-doc-check](https://github.com/PerryLink/dsh-lc-doc-check)** |  |
| **[dsh-learning-gap-check](https://github.com/PerryLink/dsh-learning-gap-check)** |  |
| **[dsh-library](https://github.com/PerryLink/dsh-library)** |  |
| **[dsh-local-ai](https://github.com/PerryLink/dsh-local-ai)** |  |
| **[dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions)** |  |
| **[dsh-mask](https://github.com/PerryLink/dsh-mask)** |  |
| **[dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel)** |  |
| **[dsh-medrec-qc](https://github.com/PerryLink/dsh-medrec-qc)** |  |
| **[dsh-memento](https://github.com/PerryLink/dsh-memento)** |  |
| **[dsh-nsfc-form-check](https://github.com/PerryLink/dsh-nsfc-form-check)** |  |
| **[dsh-nurse-record-check](https://github.com/PerryLink/dsh-nurse-record-check)** |  |
| **[dsh-observe](https://github.com/PerryLink/dsh-observe)** |  |
| **[dsh-origin-rvc-check](https://github.com/PerryLink/dsh-origin-rvc-check)** |  |
| **[dsh-ota-review-check](https://github.com/PerryLink/dsh-ota-review-check)** |  |
| **[dsh-output-styles](https://github.com/PerryLink/dsh-output-styles)** |  |
| **[dsh-paper-doc-adapter](https://github.com/PerryLink/dsh-paper-doc-adapter)** |  |
| **[dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules)** |  |
| **[dsh-permit-report-check](https://github.com/PerryLink/dsh-permit-report-check)** |  |
| **[dsh-pipeline-check](https://github.com/PerryLink/dsh-pipeline-check)** |  |
| **[dsh-pleading-draft](https://github.com/PerryLink/dsh-pleading-draft)** |  |
| **[dsh-plugin-doctor](https://github.com/PerryLink/dsh-plugin-doctor)** |  |
| **[dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide)** |  |
| **[dsh-plugin-kit](https://github.com/PerryLink/dsh-plugin-kit)** |  |
| **[dsh-plugin-upgrade](https://github.com/PerryLink/dsh-plugin-upgrade)** |  |
| **[dsh-policy-brief-draft](https://github.com/PerryLink/dsh-policy-brief-draft)** |  |
| **[dsh-power-loss-split](https://github.com/PerryLink/dsh-power-loss-split)** |  |
| **[dsh-power-ticket-check](https://github.com/PerryLink/dsh-power-ticket-check)** |  |
| **[dsh-ppap-check](https://github.com/PerryLink/dsh-ppap-check)** |  |
| **[dsh-protest-deadline](https://github.com/PerryLink/dsh-protest-deadline)** |  |
| **[dsh-railway-window](https://github.com/PerryLink/dsh-railway-window)** |  |
| **[dsh-repair-order-qc](https://github.com/PerryLink/dsh-repair-order-qc)** |  |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** |  |
| **[dsh-review-reply-check](https://github.com/PerryLink/dsh-review-reply-check)** |  |
| **[dsh-rulefile-check](https://github.com/PerryLink/dsh-rulefile-check)** |  |
| **[dsh-safety-brief-check](https://github.com/PerryLink/dsh-safety-brief-check)** |  |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** |  |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** |  |
| **[dsh-site-log-check](https://github.com/PerryLink/dsh-site-log-check)** |  |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** |  |
| **[dsh-soe-decision-check](https://github.com/PerryLink/dsh-soe-decision-check)** |  |
| **[dsh-soilwater-check](https://github.com/PerryLink/dsh-soilwater-check)** |  |
| **[dsh-sop-sync-check](https://github.com/PerryLink/dsh-sop-sync-check)** |  |
| **[dsh-spc-gbt-adapter](https://github.com/PerryLink/dsh-spc-gbt-adapter)** |  |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** |  |
| **[dsh-tender-extract](https://github.com/PerryLink/dsh-tender-extract)** |  |
| **[dsh-tender-matrix](https://github.com/PerryLink/dsh-tender-matrix)** |  |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** |  |
| **[dsh-ticktick](https://github.com/PerryLink/dsh-ticktick)** |  |
| **[dsh-translate](https://github.com/PerryLink/dsh-translate)** |  |
| **[dsh-warranty-calc](https://github.com/PerryLink/dsh-warranty-calc)** |  |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | 🚫 सेवानिवृत्त — रिपॉज़िटरी README देखें |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | 🚫 सेवानिवृत्त — रिपॉज़िटरी README देखें |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | 🚫 सेवानिवृत्त — रिपॉज़िटरी README देखें |

</details>

## लाइसेंस

[Apache-2.0](LICENSE)
