# dsh-ticktick

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![DSH plugin](https://img.shields.io/badge/dsh-plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![Gitee](https://img.shields.io/badge/Gitee-mirror-c71d23?logo=gitee)](https://gitee.com/perrylink/dsh-ticktick)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-ticktick/ci.yml?branch=main&label=CI)](https://github.com/PerryLink/dsh-ticktick/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-ticktick?label=version)](https://github.com/PerryLink/dsh-ticktick/releases)
[![npm version](https://img.shields.io/npm/v/%40perrylink%2Fdsh-ticktick)](https://www.npmjs.com/package/@perrylink/dsh-ticktick)
[![npm downloads](https://img.shields.io/npm/dm/%40perrylink%2Fdsh-ticktick)](https://www.npmjs.com/package/@perrylink/dsh-ticktick)

[English](README.md) | [简体中文](README.zh.md) | [Español](README.es.md) | **Português** | [हिन्दी](README.hi.md)

Ponte de tarefas do TickTick / Dida365 (滴答清单) para o [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): um painel de tarefas no cabeçalho da sessão (filtro por lista, adição rápida, concluir, excluir, datas de vencimento, reordenar arrastando), onze ferramentas do agente, um cartão de configuração e um serviço Remote tipado — tudo sobre o endpoint MCP oficial do TickTick.

## Recursos

- **Painel no cabeçalho da sessão** — a ação `ticktick` do cabeçalho abre um pop-up: filtrar por lista (Todas + cada lista), alternar entre vistas pendentes/concluídas, busca de texto completo, adicionar tarefas com data de vencimento opcional, concluir, excluir (com confirmação), definir/limpar datas de vencimento com etiquetas vencida/hoje/amanhã e reordenar arrastando (vistas pendentes de uma única lista). Um ponto de status mostra a conexão; sem token configurado, o painel oferece a configuração do token em uma única etapa.
- **Onze ferramentas do agente** — `ticktick_status`, `ticktick_lists`, `ticktick_tasks`, `ticktick_add`, `ticktick_complete`, `ticktick_delete`, `ticktick_due`, `ticktick_reorder`, `ticktick_completed`, `ticktick_search`, `ticktick_batch_add`; o Code Mode ganha `await tools.ticktick_*(args)` de graça.
- **Cartão de configuração** — Ajustes → Plugins → TickTick: token da API (secreto), arquivo de token, endpoint MCP com predefinições CN/Internacional, ids de tarefas protegidos, um botão Testar conexão e um botão Limpar credenciais.
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

Reinicie o `dsh web`. Obtenha um token de API 口令 (com prefixo `dp_`) no site do Dida365 (Perfil → Ajustes → Conta e segurança → API 口令) e cole-o no cartão, escreva-o em `$DSH_HOME/.ticktick-token` (uma linha) ou exporte-o em `DIDA365_TOKEN`.

| Chave | Padrão | Significado |
|---|---|---|
| `tokenFile` | `''` | Arquivo de token; vazio = `$DSH_HOME/.ticktick-token` |
| `mcpUrl` | `https://mcp.dida365.com` | Endpoint MCP (o internacional não está verificado) |
| `toolCallTimeoutMs` | `30000` | Prazo por tools/call em ms |
| `protectedTaskIds` | `[]` | Ids que as mutações recusam |
| `tools.*` | `''` | Nomes MCP fixados; `''` = descobrir |

## Limitações

O endpoint internacional não está verificado; as vistas de concluídas, a busca e a adição em lote usam as ferramentas MCP `list_completed_tasks_by_date`, `search` e `batch_add_tasks`, cujos contratos vêm do catálogo publicado e estão **pendentes de reverificação** contra o endpoint real (execute `probes/probe-queries.mjs` com um token real). O crash medido de `update_task` e as falhas de validação de listas são comportamentos do servidor; `probes/` os reverifica antes de cada release. O token fica armazenado localmente e só é enviado aos servidores do TickTick; não exponha `dsh web` à internet pública. Verificação ao vivo: exporte `DIDA365_TOKEN` e execute `node probes/probe-*.mjs`.

### Instalar a partir do mercado do DSH Desktop

Todos os plugins PerryLink podem ser explorados no mercado integrado do DSH Desktop: **Market → Sources → add source → colar** `https://perrylink-dsh-catalog.perrylink.workers.dev/catalog-source.json` **→ selecionar**. A instalação continua passando pela verificação de identidade npm do mercado e pela sua confirmação.

## Licença

[Apache-2.0](LICENSE)
