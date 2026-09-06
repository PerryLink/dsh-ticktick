# dsh-ticktick

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![DSH plugin](https://img.shields.io/badge/dsh-plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![Gitee](https://img.shields.io/badge/Gitee-mirror-c71d23?logo=gitee)](https://gitee.com/perrylink/dsh-ticktick)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-ticktick/ci.yml?branch=main&label=CI)](https://github.com/PerryLink/dsh-ticktick/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-ticktick?label=version)](https://github.com/PerryLink/dsh-ticktick/releases)
[![npm version](https://img.shields.io/npm/v/%40perrylink%2Fdsh-ticktick)](https://www.npmjs.com/package/@perrylink/dsh-ticktick)
[![npm downloads](https://img.shields.io/npm/dm/%40perrylink%2Fdsh-ticktick)](https://www.npmjs.com/package/@perrylink/dsh-ticktick)

[English](README.md) | [涓枃](README.zh.md) | [Espa帽ol](README.es.md) | **Portugu锚s** | [啶灌た啶ㄠ啶︵](README.hi.md)

Ponte de tarefas TickTick / Dida365 (婊寸瓟娓呭崟) para o [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): painel de tarefas no cabe莽alho da sess茫o (filtro por lista, adi莽茫o r谩pida, concluir, excluir, datas de vencimento, reordenar arrastando), Onze ferramentas do agente, cart茫o de configura莽茫o e um servi莽o Remote tipado 鈥?tudo sobre o endpoint MCP oficial do TickTick.

## Funcionalidades

- **Painel da sess茫o** 鈥?o bot茫o `ticktick` do cabe莽alho abre um popup: filtrar por lista (Todas + cada lista), adicionar tarefas com data opcional, concluir, excluir (com confirma莽茫o), definir/limpar datas com selos vencida/hoje/amanh茫 e reordenar arrastando (vistas de lista 煤nica).
- **Onze ferramentas** 鈥?`ticktick_status`, `ticktick_lists`, `ticktick_tasks`, `ticktick_add`, `ticktick_complete`, `ticktick_delete`, `ticktick_due`, `ticktick_reorder`; o Code Mode ganha `await tools.ticktick_*(args)` de gra莽a.
- **Cart茫o de configura莽茫o** 鈥?Ajustes 鈫?Plugins 鈫?TickTick: token de API (segredo), arquivo de token, endpoint MCP, ids protegidos.
- **Releitura do token em tempo real** 鈥?o token 茅 relido a cada requisi莽茫o (segredo do cart茫o > arquivo, padr茫o `$DSH_HOME/.ticktick-token`); um 401 reinicia o cliente.
- **Contornos medidos** 鈥?o MCP do TickTick rejeita `update_task` para tarefas de projetos reais ("Expecting value鈥?); a ponte tenta de novo com mover-para-caixa 鈫?atualizar 鈫?devolver. Listas com falha de valida莽茫o do servidor s茫o ignoradas e reportadas como avisos.
- **Ids protegidos** 鈥?muta莽玫es recusam tarefas protegidas antes de qualquer chamada de rede.
- **Sincroniza莽茫o multidispositivo** 鈥?cada escrita vai para a nuvem do TickTick; celular, desktop e web a veem.

## Instala莽茫o

```sh
dsh plugin --profile web add @perrylink/dsh-ticktick   # npm (inclui lib/)
dsh plugin --profile web add "github:PerryLink/dsh-ticktick#<sha>"   # git
dsh plugin --profile web add link:/path/to/dsh-ticktick              # local
```

Reinicie o `dsh web`. Obtenha o token API 鍙ｄ护 (prefixo `dp_`) no site do Dida365 (Perfil 鈫?Ajustes 鈫?Conta e seguran莽a 鈫?API 鍙ｄ护) e cole-o no cart茫o ou escreva-o em `$DSH_HOME/.ticktick-token`.

| Chave | Padr茫o | Significado |
|---|---|---|
| `tokenFile` | `''` | Arquivo de token; vazio = `$DSH_HOME/.ticktick-token` |
| `mcpUrl` | `https://mcp.dida365.com` | Endpoint MCP (o internacional n茫o est谩 verificado) |
| `toolCallTimeoutMs` | `30000` | Prazo por tools/call em ms |
| `protectedTaskIds` | `[]` | Ids que as muta莽玫es recusam |
| `tools.*` | `''` | Nomes MCP fixados; `''` = descobrir |

## Limita莽玫es

O endpoint internacional n茫o est谩 verificado; visualiza莽茫o de conclu铆das e busca ficam adiadas (contratos descobertos por `probes/probe-queries.mjs`); n茫o exponha `dsh web` 脿 internet. Verifica莽茫o ao vivo: exporte `DIDA365_TOKEN` e execute `node probes/probe-*.mjs`.

### Instalar a partir do mercado do DSH Desktop

Todos os plugins PerryLink podem ser explorados no mercado integrado do DSH Desktop: **Market → Sources → add source → colar** `https://perrylink-dsh-catalog.perrylink.workers.dev/catalog-source.json` **→ selecionar**. A instalação continua passando pela verificação de identidade npm do mercado e pela sua confirmação.

## Licen莽a

[Apache-2.0](LICENSE)
