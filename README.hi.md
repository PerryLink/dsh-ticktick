# dsh-ticktick

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![DSH plugin](https://img.shields.io/badge/dsh-plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![Gitee](https://img.shields.io/badge/Gitee-mirror-c71d23?logo=gitee)](https://gitee.com/perrylink/dsh-ticktick)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-ticktick/ci.yml?branch=main&label=CI)](https://github.com/PerryLink/dsh-ticktick/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-ticktick?label=version)](https://github.com/PerryLink/dsh-ticktick/releases)
[![npm version](https://img.shields.io/npm/v/%40perrylink%2Fdsh-ticktick)](https://www.npmjs.com/package/@perrylink/dsh-ticktick)
[![npm downloads](https://img.shields.io/npm/dm/%40perrylink%2Fdsh-ticktick)](https://www.npmjs.com/package/@perrylink/dsh-ticktick)

[English](README.md) | [简体中文](README.zh.md) | [Español](README.es.md) | [Português](README.pt.md) | **हिन्दी**

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) के लिए TickTick / Dida365 (滴答清单) टास्क ब्रिज: सत्र-हेडर टास्क पैनल (सूची फ़िल्टर, त्वरित जोड़, पूर्ण करना, हटाना, नियत तिथियाँ, ड्रैग पुनःक्रम), ग्यारह एजेंट टूल, एक प्लगइन सेटिंग्स कार्ड और एक टाइप्ड Remote सेवा — सब कुछ आधिकारिक TickTick MCP एंडपॉइंट के ऊपर।

## संगतता

| सतह | स्थिति |
|---|---|
| Harness | DeepSeek Harness **dsh-v0.1.3-alpha.1** (GitHub tag)। npm डिपेंडेंसी लाइन: `@deepseek-ai/dsh` **0.1.2-rc.1** (peers `>=0.1.2-rc.1 <0.2.0`)। 2026-09-06 को dsh-v0.1.3-alpha.1 master checkout के विरुद्ध सत्यापित (पूर्ण gate chain + profile install smoke)। |

## विशेषताएँ

- **सत्र-हेडर पैनल** — हेडर में `ticktick` क्रिया एक पॉपअप खोलती है: सूची के अनुसार फ़िल्टर (सभी + हर सूची), लंबित/पूर्ण दृश्य टॉगल, पूर्ण-पाठ खोज, वैकल्पिक नियत तिथि के साथ कार्य जोड़ना, पूर्ण करना, हटाना (पुष्टि के साथ), अतिदेय/आज/कल चिप्स के साथ नियत तिथियाँ सेट/साफ़ करना, और ड्रैग पुनःक्रम (लंबित, एकल-सूची दृश्य)। एक स्थिति बिंदु कनेक्शन दिखाता है; जब टोकन कॉन्फ़िगर नहीं होता, पैनल एक-चरणीय टोकन सेटअप देता है।
- **ग्यारह एजेंट टूल** — `ticktick_status`, `ticktick_lists`, `ticktick_tasks`, `ticktick_add`, `ticktick_complete`, `ticktick_delete`, `ticktick_due`, `ticktick_reorder`, `ticktick_completed`, `ticktick_search`, `ticktick_batch_add`; Code Mode को `await tools.ticktick_*(args)` मुफ़्त मिलता है।
- **सेटिंग्स कार्ड** — सेटिंग्स → प्लगइन → TickTick: API टोकन (गुप्त), टोकन फ़ाइल, CN/अंतर्राष्ट्रीय प्रीसेट के साथ MCP एंडपॉइंट, संरक्षित कार्य ids, एक कनेक्शन-परीक्षण बटन और एक क्रेडेंशियल-साफ़ बटन।
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

`dsh web` पुनः आरंभ करें (bundle प्लगइन पुनरारंभ पर सक्रिय होते हैं)। `ticktick` क्रिया सत्र हेडर में दिखती है; कार्ड सेटिंग्स → प्लगइन में दिखता है।

## कॉन्फ़िगरेशन

1. Dida365/TickTick वेब ऐप से एक API 口令 टोकन (`dp_`-उपसर्ग वाला) लें: प्रोफ़ाइल → सेटिंग्स → खाता और सुरक्षा → API 口令।
2. तीन टोकन स्रोतों में से एक चुनें (प्राथमिकता क्रम): सेटिंग्स → प्लगइन → TickTick कार्ड का गुप्त क्षेत्र, `DIDA365_TOKEN` पर्यावरण चर, या एक टोकन फ़ाइल (डिफ़ॉल्ट `$DSH_HOME/.ticktick-token`, एक पंक्ति)। फ़ाइल लिखने से ब्रिज बिना किसी कॉन्फ़िगरेशन बदलाव के सक्रिय हो जाता है।
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
सेटिंग्स कार्ड ─────── ctx.settingsScope ──────▶ settings namespace "ticktick"
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

`dsh web` पुनः आरंभ करें। सभी रनटाइम पंजीकरण (टूल, पैनल, सेटिंग्स कार्ड, prompt अनुभाग) प्लगइन के साथ हट जाते हैं। एकमात्र स्थैतिक अवशेष उपयोगकर्ता settings document में टोकन है — पूरी तरह अलग करने के लिए पहले कार्ड के **Clear credentials** बटन से उसे साफ़ करें (या टोकन फ़ाइल / `DIDA365_TOKEN` चर हटाएँ)। पैकेज इंस्टॉल रखकर निष्क्रिय करने के लिए इसके बजाय पंक्ति को disabled करें:

```yaml
- id: ticktick
  disabled: true
```

### DSH Desktop मार्केट से इंस्टॉल करें

सभी PerryLink प्लगइन DSH Desktop के बिल्ट-इन मार्केट में देखे जा सकते हैं: **Market → Sources → add source → पेस्ट करें** `https://perrylink-dsh-catalog.perrylink.workers.dev/catalog-source.json` **→ चुनें**। इंस्टॉलेशन मार्केट के npm-identity सत्यापन और आपकी पुष्टि से ही होता है।

## लाइसेंस

[Apache-2.0](LICENSE)
