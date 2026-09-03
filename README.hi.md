# dsh-ticktick

[English](README.md) | [中文](README.zh.md) | [Español](README.es.md) | [Português](README.pt.md) | **हिन्दी**

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) के लिए TickTick / Dida365 (滴答清单) कार्य-सेतु: सत्र-शीर्ष कार्य पैनल (सूची फ़िल्टर, त्वरित जोड़, पूर्ण करें, हटाएँ, नियत तिथियाँ, ड्रैग-क्रम), आठ एजेंट उपकरण, सेटिंग कार्ड और एक टाइप्ड Remote सेवा — सब आधिकारिक TickTick MCP एंडपॉइंट पर।

## विशेषताएँ

- **सत्र पैनल** — शीर्ष का `ticktick` बटन पॉपअप खोलता है: सूची से फ़िल्टर (सभी + हर सूची), वैकल्पिक तिथि के साथ जोड़ना, पूर्ण करना, हटाना (पुष्टि सहित), अतिदेय/आज/कल चिप्स के साथ तिथि सेट/साफ़ करना, और ड्रैग-क्रम (एकल-सूची दृश्य)।
- **आठ उपकरण** — `ticktick_status`, `ticktick_lists`, `ticktick_tasks`, `ticktick_add`, `ticktick_complete`, `ticktick_delete`, `ticktick_due`, `ticktick_reorder`; Code Mode को `await tools.ticktick_*(args)` मुफ़्त मिलता है।
- **सेटिंग कार्ड** — सेटिंग्स → प्लगइन्स → TickTick: API टोकन (गुप्त), टोकन फ़ाइल, MCP एंडपॉइंट, संरक्षित id।
- **लाइव टोकन पुनर्पठन** — टोकन हर अनुरोध पर दोबारा पढ़ा जाता है (कार्ड गुप्त > फ़ाइल, डिफ़ॉल्ट `$DSH_HOME/.ticktick-token`); 401 क्लाइंट रीसेट करता है।
- **मापे गए उपाय** — TickTick MCP वास्तविक परियोजनाओं के कार्यों के लिए `update_task` अस्वीकार करता है ("Expecting value…"); सेतु इनबॉक्स-ले-जाओ → अपडेट → वापस-लाओ से पुनः प्रयास करता है। सर्वर-सत्यापन में विफल सूचियाँ छोड़ी जाती हैं और चेतावनी के रूप में दिखती हैं।
- **संरक्षित id** — उत्परिवर्तन संचालन नेटवर्क कॉल से पहले संरक्षित कार्यों को अस्वीकार करते हैं।
- **बहु-डिवाइस समन्वय** — हर लेखन TickTick क्लाउड पर जाता है; फ़ोन, डेस्कटॉप और वेब उसे देखते हैं।

## इंस्टॉलेशन

```sh
dsh plugin --profile web add dsh-ticktick          # npm (lib/ सहित)
dsh plugin --profile web add "github:PerryLink/dsh-ticktick#<sha>"   # git
dsh plugin --profile web add link:/path/to/dsh-ticktick              # स्थानीय
```

`dsh web` पुनः आरंभ करें। Dida365 वेब (प्रोफ़ाइल → सेटिंग्स → खाता और सुरक्षा → API 口令) से `dp_` टोकन लें और कार्ड में चिपकाएँ या `$DSH_HOME/.ticktick-token` में लिखें।

| कुंजी | डिफ़ॉल्ट | अर्थ |
|---|---|---|
| `tokenFile` | `''` | टोकन फ़ाइल; खाली = `$DSH_HOME/.ticktick-token` |
| `mcpUrl` | `https://mcp.dida365.com` | MCP एंडपॉइंट (अंतर्राष्ट्रीय सत्यापित नहीं) |
| `toolCallTimeoutMs` | `30000` | प्रति tools/call समय-सीमा (ms) |
| `protectedTaskIds` | `[]` | वे id जिन्हें उत्परिवर्तन अस्वीकार करते हैं |
| `tools.*` | `''` | निश्चित MCP नाम; `''` = खोजें |

## सीमाएँ

अंतर्राष्ट्रीय एंडपॉइंट सत्यापित नहीं है; पूर्ण-दृश्य और खोज बाद में (`probes/probe-queries.mjs` अनुबंध खोजता है); `dsh web` को इंटरनेट पर उजागर न करें। लाइव सत्यापन: `DIDA365_TOKEN` निर्यात करें और `node probes/probe-*.mjs` चलाएँ।

## लाइसेंस

[Apache-2.0](LICENSE)
