# dsh-ticktick

> Release stamp: `0.1.13` (2026-10-04).

> **Nome do pacote.** Este projeto é publicado no npm como **`@perrylink/dsh-ticktick`**. O nome simples `dsh-ticktick` pertence a outro projeto não relacionado — instalá-lo não instala este plugin.

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
[![dshfind](https://dshfind.com/api/badge/PerryLink/dsh-ticktick?metric=downloads&lang=pt)](https://dshfind.com/pt/plugins/PerryLink/dsh-ticktick?ref=badge)

[English](README.md) | [简体中文](README-zh.md) | [Español](README-es.md) | **Português** | [हिन्दी](README-hi.md)

```sh
dsh plugin --profile <name> add @perrylink/dsh-ticktick
```


Ponte de tarefas do TickTick / Dida365 (滴答清单) para o [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): um painel de tarefas no cabeçalho da sessão (filtro por lista, adição rápida, concluir, excluir, datas de vencimento, reordenar arrastando), onze ferramentas do agente, uma página de configuração na página Plugins e um serviço Remote tipado — tudo sobre o endpoint MCP oficial do TickTick.

## Instalação

```sh
dsh plugin --profile web add github:PerryLink/dsh-ticktick
```

```sh
dsh plugin --profile web add @perrylink/dsh-ticktick   # npm (inclui lib/)
dsh plugin --profile web add "github:PerryLink/dsh-ticktick#<sha>"   # git
dsh plugin --profile web add link:/path/to/dsh-ticktick              # local
```

Reinicie o `dsh web` (plugins de bundle são ativados ao reiniciar). A ação `ticktick` aparece no cabeçalho da sessão; sua página de configuração abre pelo controle **Configure** da linha TickTick na página Plugins.

## What is dsh-ticktick?

Ponte de tarefas do TickTick / Dida365 (滴答清单) para o [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): um painel de tarefas no cabeçalho da sessão (filtro por lista, adição rápida, concluir, excluir, datas de vencimento, reordenar arrastando), onze ferramentas do agente, uma página de configuração na página Plugins e um serviço Remote tipado — tudo sobre o endpoint MCP oficial do TickTick.

![Demonstração de terminal do dsh-ticktick: dsh-ticktick — install, then verify against the live endpoint](https://raw.githubusercontent.com/PerryLink/dsh-ticktick/main/docs/assets/dsh-ticktick-hero.png)

![Animated terminal demo of dsh-ticktick](https://raw.githubusercontent.com/PerryLink/dsh-ticktick/main/docs/assets/dsh-ticktick-demo.gif)

*A mesma execução, animada.*

## Compatibilidade

| Superfície | Status |
|---|---|
| Harness | DeepSeek Harness **dsh-v0.2.1-alpha.1** (tag do GitHub). Linha npm fixada em `@deepseek-ai/dsh` **0.2.1-alpha.1** (peers `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0 || >=0.1.6-0 <0.2.0 || >=0.1.7-0 <0.2.0 || >=0.2.0-0 <0.3.0 || >=0.2.1-0 <0.3.0`). Verificado contra o checkout dsh-v0.2.1-alpha.1 (cadeia completa de gates + smoke de instalação de perfil). |
| Node | `^22.19.0 \|\| >=24.0.0` |

## Recursos

- **Painel no cabeçalho da sessão** — a ação `ticktick` do cabeçalho abre um pop-up: filtrar por lista (Todas + cada lista), alternar entre vistas pendentes/concluídas, busca de texto completo, adicionar tarefas com data de vencimento opcional, concluir, excluir (com confirmação), definir/limpar datas de vencimento com etiquetas vencida/hoje/amanhã e reordenar arrastando (vistas pendentes de uma única lista). Um ponto de status mostra a conexão; sem token configurado, o painel oferece a configuração do token em uma única etapa.
- **Onze ferramentas do agente** — `ticktick_status`, `ticktick_lists`, `ticktick_tasks`, `ticktick_add`, `ticktick_complete`, `ticktick_delete`, `ticktick_due`, `ticktick_reorder`, `ticktick_completed`, `ticktick_search`, `ticktick_batch_add`; o Code Mode ganha `await tools.ticktick_*(args)` de graça.
- **Página de configuração** — página Plugins → a linha TickTick → **Configure**: token da API (secreto), arquivo de token, endpoint MCP com predefinições CN/Internacional, ids de tarefas protegidos (os quatro são aplicados ao vivo, sem reiniciar), um botão Testar conexão e um botão Limpar credenciais.
- **Releitura do token ao vivo** — o token Bearer é relido a cada requisição (segredo do cartão > arquivo, padrão `$DSH_HOME/.ticktick-token`); um 401 reinicia o cliente para que um token rotacionado entre em vigor sem reiniciar.
- **Contornos medidos** — o MCP do TickTick rejeita `update_task` para tarefas dentro de projetos comuns ("Expecting value: line 1 column 1"); a ponte tenta de novo com mover-para-a-caixa → atualizar → mover-de-volta. Listas que falham a validação do servidor (dados históricos `repeatFrom: ''`) são ignoradas e relatadas como avisos, nunca descartadas em silêncio.
- **Ids protegidos** — operações de mutação recusam tarefas da lista protegida antes de qualquer chamada.
- **Sincronização multidispositivo** — toda escrita vai para a nuvem do TickTick, então celular, desktop e web a veem; toda leitura busca o estado atual.

## Configuração

1. Obtenha um API 口令 (um token com prefixo `dp_`) no site do Dida365/TickTick: Perfil → Ajustes → Conta e segurança → API 口令.
2. Escolha uma das três fontes de token (ordem de prioridade): o campo secreto da página de configuração do TickTick (página Plugins → a linha TickTick → Configure), a variável de ambiente `DIDA365_TOKEN`, ou um arquivo de token (padrão `$DSH_HOME/.ticktick-token`, uma linha). Escrever o arquivo ativa a ponte sem nenhuma mudança de configuração.
3. Use o botão **Testar conexão** do cartão para verificar o token e **Limpar credenciais** para apagá-lo.

| Chave | Padrão | Significado |
|---|---|---|
| `tokenFile` | `''` | Arquivo de token; vazio = `$DSH_HOME/.ticktick-token` |
| `mcpUrl` | `https://mcp.dida365.com` | Endpoint MCP do TickTick (o internacional não está verificado — veja abaixo) |
| `toolCallTimeoutMs` | `30000` | Prazo por tools/call em ms |
| `protectedTaskIds` | `[]` | Ids que as mutações recusam |
| `tools.*` | `''` | Nomes MCP fixados (projects/tasks/create/complete/remove/update/move); `''` = descobrir por padrão |

## Ferramentas do agente

| Ferramenta | Finalidade |
|---|---|
| `ticktick_status` | estado da conexão: token configurado, cliente conectado, endpoint, último erro |
| `ticktick_lists` | todas as listas (projetos), incluída a Caixa de entrada virtual |
| `ticktick_tasks` | tarefas pendentes: uma lista ou todas agregadas, com avisos por lista |
| `ticktick_add` | criar uma tarefa (lista, data ISO opcional) |
| `ticktick_complete` | concluir uma tarefa (id da tarefa + id da lista) |
| `ticktick_delete` | excluir uma tarefa (id da tarefa + id da lista) |
| `ticktick_due` | definir/limpar uma data de vencimento (omitir a data para limpar) |
| `ticktick_reorder` | atribuir um novo sortOrder inteiro (as listas ordenam por sortOrder decrescente) |
| `ticktick_completed` | tarefas concluídas em uma janela (30 dias por padrão), opcionalmente uma lista |
| `ticktick_search` | busca de texto completo sobre tarefas (a ferramenta oficial de busca) |
| `ticktick_batch_add` | criar várias tarefas em uma chamada |

## Arquitetura

```
painel do navegador ── ctx.remote.ticktick.* ──▶ TicktickService (Typert Remote)
página de configuração ── ctx.configForms ──▶ entrada de perfil "ticktick" (Config Volatile)
ferramentas do agente ctx.tools (ticktick_*) ──▶ o mesmo serviço
                     │
                     ▼
         cliente MCP HTTP streamable mínimo
         (id de sessão, versão de protocolo, Retry-After)
                     │
                     ▼
         https://mcp.dida365.com  (MCP oficial do TickTick)
```

## Limitações conhecidas

- O endpoint internacional do TickTick **não está verificado**: `mcpUrl` aponta por padrão para o endpoint CN e a URL MCP internacional não foi testada.
- A vista de concluídas, a busca e a adição em lote usam as ferramentas MCP `list_completed_tasks_by_date`, `search` e `batch_add_tasks`; seus contratos vêm do catálogo publicado (`dida365-sdk` stubs) e a **reverificação contra o endpoint real está pendente** — execute `probes/probe-queries.mjs` com um token real antes de dá-las por verificadas.
- O crash medido de `update_task` e as falhas de validação de listas são comportamentos do servidor; `probes/` os reverifica contra o endpoint real antes de um release (execute com `DIDA365_TOKEN` exportado).
- A superfície `/api` usada pelo painel é o gateway Typert padrão do harness; o token fica armazenado localmente (documento de ajustes ou arquivo de token) e só é enviado aos servidores do TickTick. Não exponha uma instância `dsh web` à internet pública.

## Verificar a ponte contra o endpoint real

```sh
# PowerShell
$env:DIDA365_TOKEN='dp_...'
node probes/probe-bootstrap.mjs      # handshake + catálogo de ferramentas
node probes/probe-crud.mjs           # ciclo criar/concluir/excluir
node probes/probe-due.mjs            # datas de vencimento (+ desvio com um PROJECT_ID)
node probes/probe-reorder.mjs        # semântica de sortOrder
node probes/probe-queries.mjs        # descoberta do contrato P2 de consultas
```

## Desinstalação

```sh
dsh plugin --profile web remove @perrylink/dsh-ticktick
```

Reinicie o `dsh web`. Todos os registros em tempo de execução (ferramentas, painel, página de configuração, seção do prompt) são removidos com o plugin. O único resíduo estático é o token no documento de ajustes do usuário — limpe-o primeiro com o botão **Limpar credenciais** da página de configuração do TickTick (ou remova o arquivo de token / a variável `DIDA365_TOKEN`) para desvincular por completo. Para manter o pacote instalado mas inativo, desative a linha em vez disso:

```yaml
- id: ticktick
  disabled: true
```

### Instalar a partir do mercado do DSH Desktop

Todos os plugins PerryLink podem ser explorados no mercado integrado do DSH Desktop: **Market → Sources → add source → colar** `https://perrylink-dsh-catalog.perrylink.workers.dev/catalog-source.json` **→ selecionar**. A instalação continua passando pela verificação de identidade npm do mercado e pela sua confirmação.

## PerryLink DSH Plugin Family

Este projeto é um dos **87 plugins ativamente mantidos** do DeepSeek Harness da [PerryLink](https://github.com/PerryLink). O registro da família tem **95** plugins — **5 congelados**, **3 retirados** — e fica recolhido abaixo para que cada README mantenha uma primeira tela curta. Expanda para ver cada linha, com o motivo na coluna Status.

<details>
<summary>Expandir os 95 plugins</summary>

| Plugin | Uma linha | Status |
|---|---|---|
| **[dsh-aqua-input-check](https://github.com/PerryLink/dsh-aqua-input-check)** | 水产养殖投入品记录核对（按投入品用量、休药期与起捕间隔核对记录自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-archive-check](https://github.com/PerryLink/dsh-archive-check)** | 档案归档完整性与保管期限核对（依据《档案法》及配套规定，仅提示差异，不作出定性结论） |  |
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** | Second-model auto-review on the approval chain, fail-closed by default |  |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** | Automatic strong/cheap model-tier routing with deterministic risk guards and a `/tier` command |  |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | Durable background child agents with a Web UI sidebar, messaging and interrupt | 🚫 RETIRADO — ver o README do repositório |
| **[dsh-bid-ca-precheck](https://github.com/PerryLink/dsh-bid-ca-precheck)** | 投标文件符合性预检（按招标文件逐条核对响应情况，仅提示差异，不作出定性结论） |  |
| **[dsh-bid-qual-check](https://github.com/PerryLink/dsh-bid-qual-check)** | 投标人资格条件核对（按资格条件与证明材料核对逐条响应，仅提示差异，不作出定性结论） |  |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | Cost governance for DeepSeek Harness: budgets, carbon, and latency in one panel. | 🧊 CONGELADO — ver o README do repositório |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** | Read-only MCP server exposing the certification registry: grades, snapshots and five-dimension evidence |  |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore |  |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH | 🧊 CONGELADO — ver o README do repositório |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** | Cross-platform native desktop control for DeepSeek Harness — Windows first. |  |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Terminal-style input history for the web composer: arrows, Ctrl+R search |  |
| **[dsh-contract-stance](https://github.com/PerryLink/dsh-contract-stance)** | 合同条款立场台账核对（按立场、风险等级与退让底线核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-customs-doc-check](https://github.com/PerryLink/dsh-customs-doc-check)** | 报关单证一致性核对（按公开的报关单填制规范核对单证间字段一致性，仅提示差异，不作出定性结论） |  |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** | Dataset quality checks and citation cross-checks (the optional numeric bridge consumed here) |  |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | Prompt-injection, jailbreak, and secret-leak defense for DeepSeek Harness. | 🧊 CONGELADO — ver o README do repositório |
| **[dsh-demurrage-ledger](https://github.com/PerryLink/dsh-demurrage-ledger)** | 滞箱费台账核对（按免箱期与费率核对超期天数与金额的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** | Engineering-discipline guard: requirements grill, test gates, adversary review |  |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | Unified static-image generation routing for DeepSeek Harness. | 🧊 CONGELADO — ver o README do repositório |
| **[dsh-drill-script-check](https://github.com/PerryLink/dsh-drill-script-check)** | 应急演练脚本核对（按阶段、响应分级、指挥与资源要素核对脚本齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-eia-guide-check](https://github.com/PerryLink/dsh-eia-guide-check)** | 环评导则适用性核对（按要素、导则名称与执行标准核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-emergency-plan](https://github.com/PerryLink/dsh-emergency-plan)** | 应急预案要素齐备性与条款级页码定位（依据 GB/T 29639-2020 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-essay-rubric-check](https://github.com/PerryLink/dsh-essay-rubric-check)** | 作文量表评分核对（按评分项、原文定位与分值算术核对评分自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-evidence-check](https://github.com/PerryLink/dsh-evidence-check)** | 证据清单齐备性核对（按待证事实与证据要素核对清单自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-export-ctl-check](https://github.com/PerryLink/dsh-export-ctl-check)** | 出口管制物项核对（按管制清单、最终用途与许可证核对台账齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-fast](https://github.com/PerryLink/dsh-fast)** | Read-only performance diagnostics for DeepSeek Harness. |  |
| **[dsh-fmea-table-check](https://github.com/PerryLink/dsh-fmea-table-check)** | FMEA 分析表要素齐备性与风险顺序数一致性核对（按公开的 FMEA 方法标准核对表内自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-forecast-penalty](https://github.com/PerryLink/dsh-forecast-penalty)** | 预测准确率考核核对（按准确率、门槛与考核单价核对考核费用的算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-fund-research](https://github.com/PerryLink/dsh-fund-research)** | Deterministic research reports for Chinese public mutual funds |  |
| **[dsh-github](https://github.com/PerryLink/dsh-github)** | GitHub PR/issues integration for DSH, every write gated by approval |  |
| **[dsh-gongwen-flow-check](https://github.com/PerryLink/dsh-gongwen-flow-check)** | 公文流转与办理时限核对（按公开的公文处理规范核对环节完整性与时限，仅提示差异，不作出定性结论） |  |
| **[dsh-gongwen-word-check](https://github.com/PerryLink/dsh-gongwen-word-check)** | 公文格式要素核对（按公开的党政机关公文格式标准核对版头与主体要素，仅提示差异，不作出定性结论） |  |
| **[dsh-guard-plan-qc](https://github.com/PerryLink/dsh-guard-plan-qc)** | 劳动保护与安全防护用品配置表核对（按公开的配备标准核对品名规格与配置数量，仅提示差异，不作出定性结论） |  |
| **[dsh-hazchem-check](https://github.com/PerryLink/dsh-hazchem-check)** | 危险化学品临界量与重大危险源辨识核对（按储存量与临界量核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-hazplan-check](https://github.com/PerryLink/dsh-hazplan-check)** | HAZOP 分析表要素齐备性与偏差推导一致性核对（依据公开的危险与可操作性分析标准，仅提示差异，不作出定性结论） |  |
| **[dsh-hidden-risk-map](https://github.com/PerryLink/dsh-hidden-risk-map)** | 安全隐患台账→《工贸企业重大事故隐患判定标准》（应急管理部令第10号）条款映射提示（仅提示差异，不作出定性结论） |  |
| **[dsh-hs-classify](https://github.com/PerryLink/dsh-hs-classify)** | 商品归类层级一致性核对（按章、品目、子目与商品编号的层级关系核对自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-icd-rule-check](https://github.com/PerryLink/dsh-icd-rule-check)** | ICD 合并编码与星剑号配对提示（依据 GB/T 14396-2016 与公开的 ICD 使用说明，仅提示差异，不作出定性结论） |  |
| **[dsh-industry-research](https://github.com/PerryLink/dsh-industry-research)** | Industry research orchestration that seals its deliverables through this plugin's `ctx.researchReport.assemble` |  |
| **[dsh-lawcite-adapter](https://github.com/PerryLink/dsh-lawcite-adapter)** | 法条引用与文书要素核对（按名称、条号、原文与效力状态核对引用可核验性，仅提示差异，不作出定性结论） |  |
| **[dsh-laya](https://github.com/PerryLink/dsh-laya)** | Laya typed decisions (`noul`/`choice`/`score`) as a first-class Cordis service and model-visible tools |  |
| **[dsh-lc-doc-check](https://github.com/PerryLink/dsh-lc-doc-check)** | 信用证单据条款核对（按单据种类、份数、期限与不符点核对交单自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-learning-gap-check](https://github.com/PerryLink/dsh-learning-gap-check)** | 能力差距与培养计划核对（按能力等级差、培养措施与完成期限核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-library](https://github.com/PerryLink/dsh-library)** | Local document knowledge base for DeepSeek Harness. |  |
| **[dsh-local-ai](https://github.com/PerryLink/dsh-local-ai)** | Local-model (Ollama) integration for DeepSeek Harness. |  |
| **[dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions)** | LSP diagnostics, formatting, completion, code actions and rename over language servers |  |
| **[dsh-mask](https://github.com/PerryLink/dsh-mask)** | PII masking middleware: anonymize at the model boundary, restore at the display layer |  |
| **[dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel)** | Read-only MCP runtime panel: /mcp command + Settings tab with status, tools and errors |  |
| **[dsh-medrec-qc](https://github.com/PerryLink/dsh-medrec-qc)** | 病案首页形式质控与逻辑矛盾提示（依据国卫办医发〔2016〕24号等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-memento](https://github.com/PerryLink/dsh-memento)** | Approval-gated cross-session memory: ctx.memory seam + SQLite + memory tool |  |
| **[dsh-nsfc-form-check](https://github.com/PerryLink/dsh-nsfc-form-check)** | 国家自然科学基金申请书形式审查与匿名化提示（依据《国家自然科学基金条例》与申请人导入的当年指南，仅提示差异，不作出定性结论） |  |
| **[dsh-nurse-record-check](https://github.com/PerryLink/dsh-nurse-record-check)** | 护理记录时限、签名与评估表完整性校验（依据《病历书写基本规范》等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-observe](https://github.com/PerryLink/dsh-observe)** | OpenTelemetry and Langfuse observability exporter for DeepSeek Harness. |  |
| **[dsh-origin-rvc-check](https://github.com/PerryLink/dsh-origin-rvc-check)** | 原产地区域价值成分核对（按 RVC 定义式与门槛核对原产地判定自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-ota-review-check](https://github.com/PerryLink/dsh-ota-review-check)** | 在线点评回复台账核对（按回复时限、问题分类与整改状态核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-output-styles](https://github.com/PerryLink/dsh-output-styles)** | Claude Code outputStyles-equivalent runtime style switching |  |
| **[dsh-paper-doc-adapter](https://github.com/PerryLink/dsh-paper-doc-adapter)** | 试卷解析结构核对（按题型、答案、分值与 yotta 标识核对试卷结构自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules)** | Claude Code-style declarative allow/deny/ask permission rules with audit |  |
| **[dsh-permit-report-check](https://github.com/PerryLink/dsh-permit-report-check)** | 行政许可办理核对（按申请材料、法定时限与决定记录核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-pipeline-check](https://github.com/PerryLink/dsh-pipeline-check)** | 项目全流程文件链条核对（按环节先后与金额口径核对链条自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-pleading-draft](https://github.com/PerryLink/dsh-pleading-draft)** | 起诉状要素齐备性核对（按诉请、事实、证据、法条四要素核对文书齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-plugin-doctor](https://github.com/PerryLink/dsh-plugin-doctor)** | Zero-dependency static + sandbox smoke detector for DSH plugins |  |
| **[dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide)** | Plugin-development knowledge base as an on-demand agent skill |  |
| **[dsh-plugin-kit](https://github.com/PerryLink/dsh-plugin-kit)** | Shared zero-runtime-dependency toolkit for the PerryLink DSH plugins |  |
| **[dsh-plugin-upgrade](https://github.com/PerryLink/dsh-plugin-upgrade)** | One-package, one-corridor-index plugin upgrade skill: routes a repository to the matching closed corridor card |  |
| **[dsh-policy-brief-draft](https://github.com/PerryLink/dsh-policy-brief-draft)** | 政策专报要素核对（按观点、依据、出处与建议核对专报齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-power-loss-split](https://github.com/PerryLink/dsh-power-loss-split)** | 线损电量拆分与考核表核对（依据公开的线损计算口径，仅提示差异，不作出定性结论） |  |
| **[dsh-power-ticket-check](https://github.com/PerryLink/dsh-power-ticket-check)** | 电力工作票要素齐备性与签发许可顺序核对（依据现行电力安全工作规程，仅提示差异，不作出定性结论） |  |
| **[dsh-ppap-check](https://github.com/PerryLink/dsh-ppap-check)** | PPAP 提交要素齐备性核对（按公开的 PPAP 手册与提交等级核对要素齐备与版本填写，仅提示差异，不作出定性结论） |  |
| **[dsh-protest-deadline](https://github.com/PerryLink/dsh-protest-deadline)** | 质疑与投诉期限核对（按公开的政府采购质疑投诉规定核对期限与台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-railway-window](https://github.com/PerryLink/dsh-railway-window)** | 铁路施工天窗台账核对（按时间窗、时长算术与命令号核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | Multi-channel approval/question bridge: WeChat/Telegram/Feishu, session console | 🧊 CONGELADO — ver o README do repositório |
| **[dsh-repair-order-qc](https://github.com/PerryLink/dsh-repair-order-qc)** | 维修工单结算核对（按项目金额、配件工时合计与结算总额核对算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** | Verifiable research-report engine: content-addressed evidence ledger and sealed versions |  |
| **[dsh-review-reply-check](https://github.com/PerryLink/dsh-review-reply-check)** | 审稿意见逐条回应覆盖核对（按意见与回应一一对应核对覆盖完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-rulefile-check](https://github.com/PerryLink/dsh-rulefile-check)** | 规则库文件自检核对（按条款引用纪律与效力上限核对规则库自身合规，仅提示差异，不作出定性结论） |  |
| **[dsh-safety-brief-check](https://github.com/PerryLink/dsh-safety-brief-check)** | 安全技术交底记录要素齐备性与签字闭环核对（依据公开的安全生产法规与检查标准，仅提示差异，不作出定性结论） |  |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** | Multi-dimensional quality scoring for DeepSeek Harness plugins. |  |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | Pin sessions in the Web sidebar with durable ordering | 🚫 RETIRADO — ver o README do repositório |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** | Cross-device session sync for DeepSeek Harness — a dedicated git mirror of your session store. |  |
| **[dsh-site-log-check](https://github.com/PerryLink/dsh-site-log-check)** | 监理日志跨日连续性与旁站覆盖提示（依据 GB/T 50319-2013 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** | Security-audit skill pack: secret scan, dependency and supply-chain review |  |
| **[dsh-soe-decision-check](https://github.com/PerryLink/dsh-soe-decision-check)** | 三重一大决策台账核对（按前置研究、会议审议与决议记录核对程序留痕，仅提示差异，不作出定性结论） |  |
| **[dsh-soilwater-check](https://github.com/PerryLink/dsh-soilwater-check)** | 土壤与地下水监测台账核对（按点位、监测项目、限值与超标判定核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-sop-sync-check](https://github.com/PerryLink/dsh-sop-sync-check)** | 作业规程与 FMEA／控制计划一致性核对（按编号与版本核对三份文件是否同步，仅提示差异，不作出定性结论） |  |
| **[dsh-spc-gbt-adapter](https://github.com/PerryLink/dsh-spc-gbt-adapter)** | 控制图常数与过程能力指数核对（按 GB/T 4091 的常规控制图常数表核对控制限与 Cp/Cpk 的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** | Voice-first session loop for DeepSeek Harness: talk to it, hear it answer. |  |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | Cross-session team rooms: shared message bus, task board and timeline | 🚫 RETIRADO — ver o README do repositório |
| **[dsh-tender-extract](https://github.com/PerryLink/dsh-tender-extract)** | 招标文件条款摘录核对（按出处与原文逐字核对摘录完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-tender-matrix](https://github.com/PerryLink/dsh-tender-matrix)** | 评标因素评分矩阵核对（按分值上限与合计核对矩阵自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** | Isolated install-and-smoke test drives for DeepSeek Harness plugins. |  |
| **[dsh-ticktick](https://github.com/PerryLink/dsh-ticktick)** | TickTick/Dida365 task bridge: session-header panel + 11 tools |  |
| **[dsh-translate](https://github.com/PerryLink/dsh-translate)** | Vendor parameter translation and deterministic JSON repair for DeepSeek Harness. |  |
| **[dsh-warranty-calc](https://github.com/PerryLink/dsh-warranty-calc)** | 质保期与索赔金额核对（按质保期月数与里程、索赔金额算式核对自洽，仅提示差异，不作出定性结论） |  |

</details>

</details>

</details>

## Licença

[Apache-2.0](LICENSE)
