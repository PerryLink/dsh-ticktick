# dsh-ticktick

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![DSH plugin](https://img.shields.io/badge/dsh-plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![Gitee](https://img.shields.io/badge/Gitee-mirror-c71d23?logo=gitee)](https://gitee.com/perrylink/dsh-ticktick)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-ticktick/ci.yml?branch=main&label=CI)](https://github.com/PerryLink/dsh-ticktick/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-ticktick?label=version)](https://github.com/PerryLink/dsh-ticktick/releases)
[![npm version](https://img.shields.io/npm/v/%40perrylink%2Fdsh-ticktick)](https://www.npmjs.com/package/@perrylink/dsh-ticktick)
[![npm downloads](https://img.shields.io/npm/dm/%40perrylink%2Fdsh-ticktick)](https://www.npmjs.com/package/@perrylink/dsh-ticktick)

[English](README.md) | [涓枃](README.zh.md) | [Espa帽ol](README.es.md) | [Portugu锚s](README.pt.md) | **啶灌た啶ㄠ啶︵**

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 啶曕 啶侧た啶?TickTick / Dida365 (婊寸瓟娓呭崟) 啶曕ぞ啶班啶?啶膏啶む: 啶膏い啷嵿ぐ-啶多啶班啶?啶曕ぞ啶班啶?啶啶ㄠげ (啶膏啶氞 啶ぜ啶苦げ啷嵿啶? 啶む啶掂ぐ啶苦い 啶溹啶∴ぜ, 啶啶班啶?啶曕ぐ啷囙, 啶灌啶距啶? 啶ㄠた啶い 啶むた啶ムた啶ぞ啶? 啶∴啶班啶?啶曕啶班ぎ), 啶嗋 啶忇啷囙啶?啶夃お啶曕ぐ啶? 啶膏啶熰た啶傕 啶曕ぞ啶班啶?啶斷ぐ 啶忇 啶熰ぞ啶囙お啷嵿ぁ Remote 啶膏啶掂ぞ 鈥?啶膏が 啶嗋ぇ啶苦啶距ぐ啶苦 TickTick MCP 啶忇啶∴お啷夃啶傕 啶ぐ啷?
## 啶掂た啶多啶粪い啶距啶?
- **啶膏い啷嵿ぐ 啶啶ㄠげ** 鈥?啶多啶班啶?啶曕ぞ `ticktick` 啶啶?啶啶啶?啶栢啶侧い啶?啶灌: 啶膏啶氞 啶膏 啶ぜ啶苦げ啷嵿啶?(啶膏き啷€ + 啶灌ぐ 啶膏啶氞), 啶掂啶曕げ啷嵿お啶苦 啶むた啶ムた 啶曕 啶膏ぞ啶?啶溹啶∴ぜ啶ㄠぞ, 啶啶班啶?啶曕ぐ啶ㄠぞ, 啶灌啶距え啶?(啶啶粪啶熰た 啶膏す啶苦い), 啶呧い啶苦う啷囙く/啶嗋/啶曕げ 啶氞た啶啶?啶曕 啶膏ぞ啶?啶むた啶ムた 啶膏啶?啶膏ぞ啶ぜ 啶曕ぐ啶ㄠぞ, 啶斷ぐ 啶∴啶班啶?啶曕啶班ぎ (啶忇啶?啶膏啶氞 啶︵啶多啶?啷?- **啶嗋 啶夃お啶曕ぐ啶?* 鈥?`ticktick_status`, `ticktick_lists`, `ticktick_tasks`, `ticktick_add`, `ticktick_complete`, `ticktick_delete`, `ticktick_due`, `ticktick_reorder`; Code Mode 啶曕 `await tools.ticktick_*(args)` 啶啶ぜ啷嵿い 啶た啶侧い啶?啶灌啷?- **啶膏啶熰た啶傕 啶曕ぞ啶班啶?* 鈥?啶膏啶熰た啶傕啷嵿じ 鈫?啶啶侧啶囙え啷嵿じ 鈫?TickTick: API 啶熰啶曕え (啶椸啶啶?, 啶熰啶曕え 啶ぜ啶距啶? MCP 啶忇啶∴お啷夃啶傕, 啶膏啶班啷嵿し啶苦い id啷?- **啶侧ぞ啶囙さ 啶熰啶曕え 啶啶ㄠぐ啷嵿お啶犩え** 鈥?啶熰啶曕え 啶灌ぐ 啶呧え啷佮ぐ啷嬥ぇ 啶ぐ 啶︵啶ぞ啶班ぞ 啶あ啶监ぞ 啶溹ぞ啶むぞ 啶灌 (啶曕ぞ啶班啶?啶椸啶啶?> 啶ぜ啶距啶? 啶∴た啶ぜ啷夃げ啷嵿 `$DSH_HOME/.ticktick-token`); 401 啶曕啶侧ぞ啶囙啶?啶班啶膏啶?啶曕ぐ啶むぞ 啶灌啷?- **啶ぞ啶 啶椸 啶夃お啶距く** 鈥?TickTick MCP 啶掂ぞ啶膏啶むさ啶苦 啶ぐ啶苦く啷嬥啶ㄠぞ啶撪 啶曕 啶曕ぞ啶班啶啶?啶曕 啶侧た啶?`update_task` 啶呧じ啷嵿さ啷€啶曕ぞ啶?啶曕ぐ啶むぞ 啶灌 ("Expecting value鈥?); 啶膏啶む 啶囙え啶啶曕啶?啶侧-啶溹ぞ啶?鈫?啶呧お啶∴啶?鈫?啶掂ぞ啶じ-啶侧ぞ啶?啶膏 啶啶ㄠ 啶啶班く啶距じ 啶曕ぐ啶むぞ 啶灌啷?啶膏ぐ啷嵿さ啶?啶膏い啷嵿く啶距お啶?啶啶?啶掂た啶げ 啶膏啶氞た啶ぞ啶?啶涏啶∴ぜ啷€ 啶溹ぞ啶む 啶灌啶?啶斷ぐ 啶氞啶むぞ啶掂え啷€ 啶曕 啶班啶?啶啶?啶︵た啶栢い啷€ 啶灌啶傕イ
- **啶膏啶班啷嵿し啶苦い id** 鈥?啶夃い啷嵿お啶班た啶掂ぐ啷嵿い啶?啶膏啶氞ぞ啶侧え 啶ㄠ啶熰さ啶班啶?啶曕啶?啶膏 啶す啶侧 啶膏啶班啷嵿し啶苦い 啶曕ぞ啶班啶啶?啶曕 啶呧じ啷嵿さ啷€啶曕ぞ啶?啶曕ぐ啶む 啶灌啶傕イ
- **啶す啷?啶∴た啶掂ぞ啶囙じ 啶膏ぎ啶ㄠ啶掂く** 鈥?啶灌ぐ 啶侧啶栢え TickTick 啶曕啶侧ぞ啶夃ぁ 啶ぐ 啶溹ぞ啶むぞ 啶灌; 啶ぜ啷嬥え, 啶∴啶膏啶曕啷夃お 啶斷ぐ 啶掂啶?啶夃じ啷?啶︵啶栢い啷?啶灌啶傕イ

## 啶囙啶膏啶熰啶侧啶多え

```sh
dsh plugin --profile web add @perrylink/dsh-ticktick # npm (lib/ 啶膏す啶苦い)
dsh plugin --profile web add "github:PerryLink/dsh-ticktick#<sha>"   # git
dsh plugin --profile web add link:/path/to/dsh-ticktick              # 啶膏啶ムぞ啶ㄠ啶?```

`dsh web` 啶啶ㄠ 啶嗋ぐ啶傕き 啶曕ぐ啷囙啷?Dida365 啶掂啶?(啶啶班啶ぜ啶距啶?鈫?啶膏啶熰た啶傕啷嵿じ 鈫?啶栢ぞ啶むぞ 啶斷ぐ 啶膏啶班啷嵿し啶?鈫?API 鍙ｄ护) 啶膏 `dp_` 啶熰啶曕え 啶侧啶?啶斷ぐ 啶曕ぞ啶班啶?啶啶?啶氞た啶啶距啶?啶ぞ `$DSH_HOME/.ticktick-token` 啶啶?啶侧た啶栢啶傕イ

| 啶曕啶傕啷€ | 啶∴た啶ぜ啷夃げ啷嵿 | 啶呧ぐ啷嵿ぅ |
|---|---|---|
| `tokenFile` | `''` | 啶熰啶曕え 啶ぜ啶距啶? 啶栢ぞ啶侧 = `$DSH_HOME/.ticktick-token` |
| `mcpUrl` | `https://mcp.dida365.com` | MCP 啶忇啶∴お啷夃啶傕 (啶呧啶むぐ啷嵿ぐ啶距し啷嵿啷嵿ぐ啷€啶?啶膏い啷嵿く啶距お啶苦い 啶ㄠす啷€啶? |
| `toolCallTimeoutMs` | `30000` | 啶啶班い啶?tools/call 啶膏ぎ啶?啶膏啶ぞ (ms) |
| `protectedTaskIds` | `[]` | 啶掂 id 啶溹た啶ㄠ啶灌啶?啶夃い啷嵿お啶班た啶掂ぐ啷嵿い啶?啶呧じ啷嵿さ啷€啶曕ぞ啶?啶曕ぐ啶む 啶灌啶?|
| `tools.*` | `''` | 啶ㄠた啶多啶氞た啶?MCP 啶ㄠぞ啶? `''` = 啶栢啶溹啶?|

## 啶膏啶ぞ啶忇

啶呧啶むぐ啷嵿ぐ啶距し啷嵿啷嵿ぐ啷€啶?啶忇啶∴お啷夃啶傕 啶膏い啷嵿く啶距お啶苦い 啶ㄠす啷€啶?啶灌; 啶啶班啶?啶︵啶多啶?啶斷ぐ 啶栢啶?啶ぞ啶?啶啶?(`probes/probe-queries.mjs` 啶呧え啷佮が啶傕ぇ 啶栢啶溹い啶?啶灌); `dsh web` 啶曕 啶囙啶熰ぐ啶ㄠ啶?啶ぐ 啶夃啶距啶?啶?啶曕ぐ啷囙啷?啶侧ぞ啶囙さ 啶膏い啷嵿く啶距お啶? `DIDA365_TOKEN` 啶ㄠた啶班啶ぞ啶?啶曕ぐ啷囙 啶斷ぐ `node probes/probe-*.mjs` 啶氞げ啶距啶佮イ

### DSH Desktop मार्केट से इंस्टॉल करें

सभी PerryLink प्लगइन DSH Desktop के बिल्ट-इन मार्केट में देखे जा सकते हैं: **Market → Sources → add source → पेस्ट करें** `https://perrylink-dsh-catalog.perrylink.workers.dev/catalog-source.json` **→ चुनें**। इंस्टॉलेशन मार्केट के npm-identity सत्यापन और आपकी पुष्टि से ही होता है।

## 啶侧ぞ啶囙じ啷囙啶?
[Apache-2.0](LICENSE)
