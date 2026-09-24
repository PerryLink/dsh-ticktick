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
[![dshfind](https://dshfind.com/api/badge/PerryLink/dsh-ticktick?metric=downloads&lang=es)](https://dshfind.com/es/plugins/PerryLink/dsh-ticktick?ref=badge)

[English](README.md) | [简体中文](README-zh.md) | **Español** | [Português](README-pt.md) | [हिन्दी](README-hi.md)

Puente de tareas de TickTick / Dida365 (滴答清单) para [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): un panel de tareas en la cabecera de sesión (filtro por lista, alta rápida, completar, borrar, fechas límite, reordenar arrastrando), once herramientas del agente, una página de configuración en la página Plugins y un servicio Remote tipado — todo sobre el endpoint MCP oficial de TickTick.

## Compatibilidad

| Superficie | Estado |
|---|---|
| Harness | DeepSeek Harness **dsh-v0.1.7-rc.2** (tag de GitHub). Línea npm fijada en `@deepseek-ai/dsh` **0.1.7-rc.2** (peers `>=0.1.7-alpha.1 <0.2.0`). Verificado contra el checkout dsh-v0.1.7-rc.2 (cadena completa de gates + smoke de instalación de perfil). |
| Node | `^22.19.0 \|\| >=24.0.0` |

## Características

- **Panel en la cabecera de sesión** — la acción `ticktick` de la cabecera abre una ventana emergente: filtrar por lista (Todas + cada lista), alternar vistas pendientes/completadas, búsqueda de texto completo, añadir tareas con fecha de vencimiento opcional, completar, borrar (con confirmación), fijar/limpiar fechas límite con etiquetas vencida/hoy/mañana y reordenar arrastrando (vistas pendientes de una sola lista). Un punto de estado muestra la conexión; sin token configurado, el panel ofrece la configuración del token en un solo paso.
- **Once herramientas del agente** — `ticktick_status`, `ticktick_lists`, `ticktick_tasks`, `ticktick_add`, `ticktick_complete`, `ticktick_delete`, `ticktick_due`, `ticktick_reorder`, `ticktick_completed`, `ticktick_search`, `ticktick_batch_add`; Code Mode obtiene `await tools.ticktick_*(args)` gratis.
- **Página de configuración** — página Plugins → la fila TickTick → **Configure**: token API (secreto), archivo de token, endpoint MCP con ajustes CN/Internacional, ids de tareas protegidos (los cuatro se aplican en vivo, sin reinicio), un botón Probar conexión y un botón Limpiar credenciales.
- **Relectura del token en vivo** — el token Bearer se relee en cada petición (secreto de la tarjeta > archivo, por defecto `$DSH_HOME/.ticktick-token`); un 401 reinicia el cliente para que un token rotado se active sin reiniciar.
- **Contorneos medidos** — el MCP de TickTick rechaza `update_task` para tareas dentro de proyectos normales ("Expecting value: line 1 column 1"); el puente reintenta con mover-a-bandeja → actualizar → devolver. Las listas que fallan la validación del servidor (datos históricos `repeatFrom: ''`) se omiten y se notifican como advertencias, nunca se descartan en silencio.
- **Ids protegidos** — las operaciones de mutación rechazan tareas de la lista protegida antes de cualquier llamada.
- **Sincronización multidispositivo** — cada escritura va a la nube de TickTick, así que móvil, escritorio y web la ven; cada lectura trae el estado actual.

## Instalación

```sh
dsh plugin --profile web add @perrylink/dsh-ticktick   # npm (incluye lib/)
dsh plugin --profile web add "github:PerryLink/dsh-ticktick#<sha>"   # git
dsh plugin --profile web add link:/path/to/dsh-ticktick              # local
```

Reinicia `dsh web` (los plugins de bundle se activan al reiniciar). La acción `ticktick` aparece en la cabecera de sesión; su página de configuración se abre desde el control **Configure** de la fila TickTick en la página Plugins.

## Configuración

1. Consigue un API 口令 (un token con prefijo `dp_`) desde la web de Dida365/TickTick: Perfil → Ajustes → Cuenta y seguridad → API 口令.
2. Elige una de las tres fuentes de token (orden de prioridad): el campo secreto de la página de configuración de TickTick (página Plugins → la fila TickTick → Configure), la variable de entorno `DIDA365_TOKEN`, o un archivo de token (por defecto `$DSH_HOME/.ticktick-token`, una línea). Escribir el archivo activa el puente sin ningún cambio de configuración.
3. Usa el botón **Probar conexión** de la tarjeta para verificar el token y **Limpiar credenciales** para borrarlo.

| Clave | Por defecto | Significado |
|---|---|---|
| `tokenFile` | `''` | Archivo de token; vacío = `$DSH_HOME/.ticktick-token` |
| `mcpUrl` | `https://mcp.dida365.com` | Endpoint MCP de TickTick (el internacional no está verificado — ver más abajo) |
| `toolCallTimeoutMs` | `30000` | Plazo por tools/call en ms |
| `protectedTaskIds` | `[]` | Ids que las mutaciones rechazan |
| `tools.*` | `''` | Nombres MCP fijados (projects/tasks/create/complete/remove/update/move); `''` = descubrir por patrón |

## Herramientas del agente

| Herramienta | Propósito |
|---|---|
| `ticktick_status` | estado de la conexión: token configurado, cliente conectado, endpoint, último error |
| `ticktick_lists` | todas las listas (proyectos), la Bandeja de entrada virtual incluida |
| `ticktick_tasks` | tareas pendientes: una lista o todas agregadas, con avisos por lista |
| `ticktick_add` | crear una tarea (lista, fecha ISO opcional) |
| `ticktick_complete` | completar una tarea (id de tarea + id de lista) |
| `ticktick_delete` | borrar una tarea (id de tarea + id de lista) |
| `ticktick_due` | fijar/limpiar una fecha límite (omitir la fecha para limpiar) |
| `ticktick_reorder` | asignar un nuevo sortOrder entero (las listas ordenan por sortOrder descendente) |
| `ticktick_completed` | tareas completadas en una ventana (30 días por defecto), opcionalmente una lista |
| `ticktick_search` | búsqueda de texto completo sobre tareas (la herramienta oficial de búsqueda) |
| `ticktick_batch_add` | crear varias tareas en una llamada |

## Arquitectura

```
panel del navegador ── ctx.remote.ticktick.* ──▶ TicktickService (Typert Remote)
página de configuración ── ctx.configForms ──▶ entrada de perfil "ticktick" (Config Volatile)
herramientas ──────── ctx.tools (ticktick_*) ─▶ el mismo servicio
                     │
                     ▼
         cliente MCP HTTP streamable mínimo
         (id de sesión, versión de protocolo, Retry-After)
                     │
                     ▼
         https://mcp.dida365.com  (MCP oficial de TickTick)
```

## Limitaciones conocidas

- El endpoint internacional de TickTick **no está verificado**: `mcpUrl` apunta por defecto al endpoint CN y la URL MCP internacional no ha sido probada.
- La vista de completadas, la búsqueda y la adición por lotes usan las herramientas MCP `list_completed_tasks_by_date`, `search` y `batch_add_tasks`; sus contratos provienen del catálogo publicado (`dida365-sdk` stubs) y la **reverificación contra el endpoint real está pendiente** — ejecuta `probes/probe-queries.mjs` con un token real antes de darlos por verificados.
- El crash medido de `update_task` y los fallos de validación de listas son comportamientos del servidor; `probes/` los reverifica contra el endpoint real antes de un release (ejecuta con `DIDA365_TOKEN` exportado).
- La superficie `/api` que usa el panel es el gateway Typert estándar del harness; el token se guarda localmente (documento de ajustes o archivo de token) y se envía solo a los servidores de TickTick. No expongas una instancia `dsh web` a internet público.

## Verificar el puente contra el endpoint real

```sh
# PowerShell
$env:DIDA365_TOKEN='dp_...'
node probes/probe-bootstrap.mjs      # handshake + catálogo de herramientas
node probes/probe-crud.mjs           # ciclo crear/completar/borrar
node probes/probe-due.mjs            # fechas límite (+ desvío con un PROJECT_ID)
node probes/probe-reorder.mjs        # semántica de sortOrder
node probes/probe-queries.mjs        # descubrimiento del contrato P2 de consultas
```

## Desinstalación

```sh
dsh plugin --profile web remove @perrylink/dsh-ticktick
```

Reinicia `dsh web`. Todos los registros en tiempo de ejecución (herramientas, panel, página de configuración, sección del prompt) se eliminan con el plugin. El único residuo estático es el token en el documento de ajustes del usuario — límpialo primero con el botón **Limpiar credenciales** de la página de configuración de TickTick (o elimina el archivo de token / la variable `DIDA365_TOKEN`) para desvincular por completo. Para mantener el paquete instalado pero inactivo, desactiva la fila en su lugar:

```yaml
- id: ticktick
  disabled: true
```

### Instalar desde el mercado de DSH Desktop

Todos los plugins de PerryLink pueden explorarse en el mercado integrado de DSH Desktop: **Market → Sources → add source → pegar** `https://perrylink-dsh-catalog.perrylink.workers.dev/catalog-source.json` **→ seleccionarlo**. La instalación sigue pasando por la verificación de identidad npm del mercado y tu confirmación.

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


## Licencia

[Apache-2.0](LICENSE)
