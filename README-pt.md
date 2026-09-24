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
[![dshfind](https://dshfind.com/api/badge/PerryLink/dsh-ticktick?metric=downloads&lang=pt)](https://dshfind.com/pt/plugins/PerryLink/dsh-ticktick?ref=badge)

[English](README.md) | [简体中文](README-zh.md) | [Español](README-es.md) | **Português** | [हिन्दी](README-hi.md)

Ponte de tarefas do TickTick / Dida365 (滴答清单) para o [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): um painel de tarefas no cabeçalho da sessão (filtro por lista, adição rápida, concluir, excluir, datas de vencimento, reordenar arrastando), onze ferramentas do agente, uma página de configuração na página Plugins e um serviço Remote tipado — tudo sobre o endpoint MCP oficial do TickTick.

## Compatibilidade

| Superfície | Status |
|---|---|
| Harness | DeepSeek Harness **dsh-v0.1.7-rc.2** (tag do GitHub). Linha npm fixada em `@deepseek-ai/dsh` **0.1.7-rc.2** (peers `>=0.1.7-alpha.1 <0.2.0`). Verificado contra o checkout dsh-v0.1.7-rc.2 (cadeia completa de gates + smoke de instalação de perfil). |
| Node | `^22.19.0 \|\| >=24.0.0` |

## Recursos

- **Painel no cabeçalho da sessão** — a ação `ticktick` do cabeçalho abre um pop-up: filtrar por lista (Todas + cada lista), alternar entre vistas pendentes/concluídas, busca de texto completo, adicionar tarefas com data de vencimento opcional, concluir, excluir (com confirmação), definir/limpar datas de vencimento com etiquetas vencida/hoje/amanhã e reordenar arrastando (vistas pendentes de uma única lista). Um ponto de status mostra a conexão; sem token configurado, o painel oferece a configuração do token em uma única etapa.
- **Onze ferramentas do agente** — `ticktick_status`, `ticktick_lists`, `ticktick_tasks`, `ticktick_add`, `ticktick_complete`, `ticktick_delete`, `ticktick_due`, `ticktick_reorder`, `ticktick_completed`, `ticktick_search`, `ticktick_batch_add`; o Code Mode ganha `await tools.ticktick_*(args)` de graça.
- **Página de configuração** — página Plugins → a linha TickTick → **Configure**: token da API (secreto), arquivo de token, endpoint MCP com predefinições CN/Internacional, ids de tarefas protegidos (os quatro são aplicados ao vivo, sem reiniciar), um botão Testar conexão e um botão Limpar credenciais.
- **Releitura do token ao vivo** — o token Bearer é relido a cada requisição (segredo do cartão > arquivo, padrão `$DSH_HOME/.ticktick-token`); um 401 reinicia o cliente para que um token rotacionado entre em vigor sem reiniciar.
- **Contornos medidos** — o MCP do TickTick rejeita `update_task` para tarefas dentro de projetos comuns ("Expecting value: line 1 column 1"); a ponte tenta de novo com mover-para-a-caixa → atualizar → mover-de-volta. Listas que falham a validação do servidor (dados históricos `repeatFrom: ''`) são ignoradas e relatadas como avisos, nunca descartadas em silêncio.
- **Ids protegidos** — operações de mutação recusam tarefas da lista protegida antes de qualquer chamada.
- **Sincronização multidispositivo** — toda escrita vai para a nuvem do TickTick, então celular, desktop e web a veem; toda leitura busca o estado atual.

## Instalação

```sh
dsh plugin --profile web add @perrylink/dsh-ticktick   # npm (inclui lib/)
dsh plugin --profile web add "github:PerryLink/dsh-ticktick#<sha>"   # git
dsh plugin --profile web add link:/path/to/dsh-ticktick              # local
```

Reinicie o `dsh web` (plugins de bundle são ativados ao reiniciar). A ação `ticktick` aparece no cabeçalho da sessão; sua página de configuração abre pelo controle **Configure** da linha TickTick na página Plugins.

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


## Licença

[Apache-2.0](LICENSE)
