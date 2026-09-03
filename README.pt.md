# dsh-ticktick

[English](README.md) | [中文](README.zh.md) | [Español](README.es.md) | **Português** | [हिन्दी](README.hi.md)

Ponte de tarefas TickTick / Dida365 (滴答清单) para o [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): painel de tarefas no cabeçalho da sessão (filtro por lista, adição rápida, concluir, excluir, datas de vencimento, reordenar arrastando), oito ferramentas do agente, cartão de configuração e um serviço Remote tipado — tudo sobre o endpoint MCP oficial do TickTick.

## Funcionalidades

- **Painel da sessão** — o botão `ticktick` do cabeçalho abre um popup: filtrar por lista (Todas + cada lista), adicionar tarefas com data opcional, concluir, excluir (com confirmação), definir/limpar datas com selos vencida/hoje/amanhã e reordenar arrastando (vistas de lista única).
- **Oito ferramentas** — `ticktick_status`, `ticktick_lists`, `ticktick_tasks`, `ticktick_add`, `ticktick_complete`, `ticktick_delete`, `ticktick_due`, `ticktick_reorder`; o Code Mode ganha `await tools.ticktick_*(args)` de graça.
- **Cartão de configuração** — Ajustes → Plugins → TickTick: token de API (segredo), arquivo de token, endpoint MCP, ids protegidos.
- **Releitura do token em tempo real** — o token é relido a cada requisição (segredo do cartão > arquivo, padrão `$DSH_HOME/.ticktick-token`); um 401 reinicia o cliente.
- **Contornos medidos** — o MCP do TickTick rejeita `update_task` para tarefas de projetos reais ("Expecting value…"); a ponte tenta de novo com mover-para-caixa → atualizar → devolver. Listas com falha de validação do servidor são ignoradas e reportadas como avisos.
- **Ids protegidos** — mutações recusam tarefas protegidas antes de qualquer chamada de rede.
- **Sincronização multidispositivo** — cada escrita vai para a nuvem do TickTick; celular, desktop e web a veem.

## Instalação

```sh
dsh plugin --profile web add dsh-ticktick          # npm (inclui lib/)
dsh plugin --profile web add "github:PerryLink/dsh-ticktick#<sha>"   # git
dsh plugin --profile web add link:/path/to/dsh-ticktick              # local
```

Reinicie o `dsh web`. Obtenha o token API 口令 (prefixo `dp_`) no site do Dida365 (Perfil → Ajustes → Conta e segurança → API 口令) e cole-o no cartão ou escreva-o em `$DSH_HOME/.ticktick-token`.

| Chave | Padrão | Significado |
|---|---|---|
| `tokenFile` | `''` | Arquivo de token; vazio = `$DSH_HOME/.ticktick-token` |
| `mcpUrl` | `https://mcp.dida365.com` | Endpoint MCP (o internacional não está verificado) |
| `toolCallTimeoutMs` | `30000` | Prazo por tools/call em ms |
| `protectedTaskIds` | `[]` | Ids que as mutações recusam |
| `tools.*` | `''` | Nomes MCP fixados; `''` = descobrir |

## Limitações

O endpoint internacional não está verificado; visualização de concluídas e busca ficam adiadas (contratos descobertos por `probes/probe-queries.mjs`); não exponha `dsh web` à internet. Verificação ao vivo: exporte `DIDA365_TOKEN` e execute `node probes/probe-*.mjs`.

## Licença

[Apache-2.0](LICENSE)
