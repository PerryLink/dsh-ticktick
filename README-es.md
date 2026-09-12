# dsh-ticktick

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![DSH plugin](https://img.shields.io/badge/dsh--plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![dsh-doctor](https://raw.githubusercontent.com/PerryLink/dsh-plugin-doctor/main/badges/PerryLink__dsh-ticktick.svg)](https://github.com/PerryLink/dsh-plugin-doctor#verified-徽章)
[![Gitee](https://img.shields.io/badge/Gitee-mirror-c71d23?logo=gitee)](https://gitee.com/perrylink/dsh-ticktick)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-ticktick/ci.yml?branch=main&label=CI)](https://github.com/PerryLink/dsh-ticktick/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-ticktick?label=version)](https://github.com/PerryLink/dsh-ticktick/releases)
[![npm version](https://img.shields.io/npm/v/%40perrylink%2Fdsh-ticktick)](https://www.npmjs.com/package/@perrylink/dsh-ticktick)
[![npm downloads](https://img.shields.io/npm/dm/%40perrylink%2Fdsh-ticktick)](https://www.npmjs.com/package/@perrylink/dsh-ticktick)

[English](README.md) | [简体中文](README-zh.md) | **Español** | [Português](README-pt.md) | [हिन्दी](README-hi.md)

Puente de tareas de TickTick / Dida365 (滴答清单) para [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): un panel de tareas en la cabecera de sesión (filtro por lista, alta rápida, completar, borrar, fechas límite, reordenar arrastrando), once herramientas del agente, una tarjeta de configuración y un servicio Remote tipado — todo sobre el endpoint MCP oficial de TickTick.

## Compatibilidad

| Superficie | Estado |
|---|---|
| Harness | DeepSeek Harness **dsh-v0.1.5-rc.2** (tag de GitHub). Línea npm fijada en `@deepseek-ai/dsh` **0.1.5-rc.2** (peers `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0`). Verificado el 2026-09-11 contra el checkout master dsh-v0.1.5-rc.2 (cadena completa de gates + smoke de instalación de perfil). |
| Node | `^22.19.0 \|\| >=24.0.0` |

## Características

- **Panel en la cabecera de sesión** — la acción `ticktick` de la cabecera abre una ventana emergente: filtrar por lista (Todas + cada lista), alternar vistas pendientes/completadas, búsqueda de texto completo, añadir tareas con fecha de vencimiento opcional, completar, borrar (con confirmación), fijar/limpiar fechas límite con etiquetas vencida/hoy/mañana y reordenar arrastrando (vistas pendientes de una sola lista). Un punto de estado muestra la conexión; sin token configurado, el panel ofrece la configuración del token en un solo paso.
- **Once herramientas del agente** — `ticktick_status`, `ticktick_lists`, `ticktick_tasks`, `ticktick_add`, `ticktick_complete`, `ticktick_delete`, `ticktick_due`, `ticktick_reorder`, `ticktick_completed`, `ticktick_search`, `ticktick_batch_add`; Code Mode obtiene `await tools.ticktick_*(args)` gratis.
- **Tarjeta de configuración** — Ajustes → Plugins → TickTick: token API (secreto), archivo de token, endpoint MCP con ajustes CN/Internacional, ids de tareas protegidos, un botón Probar conexión y un botón Limpiar credenciales.
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

Reinicia `dsh web` (los plugins de bundle se activan al reiniciar). La acción `ticktick` aparece en la cabecera de sesión; la tarjeta aparece en Ajustes → Plugins.

## Configuración

1. Consigue un API 口令 (un token con prefijo `dp_`) desde la web de Dida365/TickTick: Perfil → Ajustes → Cuenta y seguridad → API 口令.
2. Elige una de las tres fuentes de token (orden de prioridad): el campo secreto de la tarjeta Ajustes → Plugins → TickTick, la variable de entorno `DIDA365_TOKEN`, o un archivo de token (por defecto `$DSH_HOME/.ticktick-token`, una línea). Escribir el archivo activa el puente sin ningún cambio de configuración.
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
tarjeta de ajustes ── ctx.settingsScope ──────▶ namespace de ajustes "ticktick"
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

Reinicia `dsh web`. Todos los registros en tiempo de ejecución (herramientas, panel, tarjeta de ajustes, sección del prompt) se eliminan con el plugin. El único residuo estático es el token en el documento de ajustes del usuario — límpialo primero con el botón **Limpiar credenciales** de la tarjeta (o elimina el archivo de token / la variable `DIDA365_TOKEN`) para desvincular por completo. Para mantener el paquete instalado pero inactivo, desactiva la fila en su lugar:

```yaml
- id: ticktick
  disabled: true
```

### Instalar desde el mercado de DSH Desktop

Todos los plugins de PerryLink pueden explorarse en el mercado integrado de DSH Desktop: **Market → Sources → add source → pegar** `https://perrylink-dsh-catalog.perrylink.workers.dev/catalog-source.json` **→ seleccionarlo**. La instalación sigue pasando por la verificación de identidad npm del mercado y tu confirmación.

## PerryLink DSH Plugin Family

Este proyecto es uno de los [40 complementos de DeepSeek Harness](https://github.com/PerryLink) mantenidos por [PerryLink](https://github.com/PerryLink). Si este te ayuda, probablemente los demás también:

| Plugin | One-liner |
|---|---|
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** | Auto-revisión de segundo modelo en la cadena de aprobación, con cierre en fallo por defecto | |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | Agentes hijos en segundo plano durables con barra lateral de UI web, mensajería e interrupción | |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | Gobernanza de costes para DeepSeek Harness: presupuestos, carbono y latencia en un panel. | |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** | Equivalente a /rewind de Claude Code: instantáneas, bifurcaciones de sesión, restauración de un solo uso | |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | Migra sesiones, memoria, habilidades y CLAUDE.md de Claude Code a DSH | |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** | Control de escritorio nativo multiplataforma para DeepSeek Harness — Windows primero. | |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Historial de entrada estilo terminal para el compositor web: flechas, búsqueda Ctrl+R | |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** | Comprobaciones de calidad de datasets y verificación de citas (el puente numérico opcional consumido aquí) | |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | Defensa contra inyección de prompts, jailbreak y fuga de secretos para DeepSeek Harness. | |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** | Guardián de disciplina de ingeniería: interrogatorio de requisitos, puertas de pruebas, revisión adversaria | |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | Enrutamiento unificado de generación de imágenes estáticas para DeepSeek Harness. | |
| **[dsh-fast](https://github.com/PerryLink/dsh-fast)** | Diagnóstico de rendimiento de solo lectura para DeepSeek Harness. | |
| **[dsh-fund-research](https://github.com/PerryLink/dsh-fund-research)** | Informes de investigación deterministas para fondos mutuos públicos chinos | |
| **[dsh-github](https://github.com/PerryLink/dsh-github)** | Integración de PR/issues de GitHub para DSH, cada escritura controlada por aprobación | |
| **[dsh-industry-research](https://github.com/PerryLink/dsh-industry-research)** | Orquestación de investigación sectorial que sella sus entregables mediante el `ctx.researchReport.assemble` de este plugin | |
| **[dsh-library](https://github.com/PerryLink/dsh-library)** | Base de conocimiento documental local para DeepSeek Harness. | |
| **[dsh-local-ai](https://github.com/PerryLink/dsh-local-ai)** | Integración de modelos locales (Ollama) para DeepSeek Harness. | |
| **[dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions)** | Diagnósticos, formato, autocompletado, acciones de código y renombrado LSP sobre servidores de lenguaje | |
| **[dsh-mask](https://github.com/PerryLink/dsh-mask)** | Middleware de enmascaramiento de PII: anonimiza en el límite del modelo, restaura en la capa de visualización | |
| **[dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel)** | Panel de tiempo de ejecución MCP de solo lectura: comando /mcp + pestaña Settings con estado, herramientas y errores | |
| **[dsh-memento](https://github.com/PerryLink/dsh-memento)** | Memoria entre sesiones controlada por aprobación: costura ctx.memory + SQLite + herramienta de memoria | |
| **[dsh-observe](https://github.com/PerryLink/dsh-observe)** | Exportador de observabilidad OpenTelemetry y Langfuse para DeepSeek Harness. | |
| **[dsh-output-styles](https://github.com/PerryLink/dsh-output-styles)** | Cambio de estilo en tiempo de ejecución equivalente a outputStyles de Claude Code | |
| **[dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules)** | Reglas de permisos declarativas allow/deny/ask estilo Claude Code con auditoría | |
| **[dsh-personal-directive](https://github.com/PerryLink/dsh-personal-directive)** | Inyector de directivas personales con interruptor en la barra superior (edición framework) |
| **[dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide)** | Base de conocimiento de desarrollo de plugins como habilidad de agente bajo demanda | |
| **[dsh-plugin-doctor](https://github.com/PerryLink/dsh-plugin-doctor)** | Zero-dependency static + sandbox smoke detector for DSH plugins | |
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | Puente multicanal de aprobación/preguntas: WeChat/Telegram/Feishu, consola de sesión |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** | Motor de informes de investigación verificables con evidencia direccionada por contenido | |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** | Puntuación de calidad multidimensional para plugins de DeepSeek Harness. | |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | Fija sesiones en la barra lateral web con orden durable | |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** | Sincronización de sesiones entre dispositivos para DeepSeek Harness — un espejo git dedicado de tu almacén de sesiones. | |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** | Paquete de habilidades de auditoría de seguridad: escaneo de secretos, revisión de dependencias y cadena de suministro | |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** | Bucle de sesión con voz para DeepSeek Harness: háblale y escucha su respuesta. | |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** | Pruebas de instalación y humo aisladas para plugins de DeepSeek Harness. | |
| **[dsh-translate](https://github.com/PerryLink/dsh-translate)** | Traducción de parámetros entre proveedores y reparación determinista de JSON para DeepSeek Harness. | |
| **[dsh-wechat](https://github.com/pan17/dsh-wechat)** | Puente WeChat ↔ DSH (bot Tencent iLink): texto/imagen/archivo/voz, aprobaciones en el chat |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** | Automatic strong/cheap model-tier routing with deterministic risk guards and a `/tier` command | |
| **[dsh-catalog](https://github.com/PerryLink/dsh-catalog)** | DSH Desktop Market standard catalog source for the PerryLink family | |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** | Read-only MCP server exposing the certification registry: grades, snapshots and five-dimension evidence | |
| **[dsh-kit](https://github.com/PerryLink/dsh-kit)** | One-command starter pack that installs the core family | |
| **[dsh-plugin-certification](https://github.com/PerryLink/dsh-plugin-certification)** | Community certification registry with repro-checkable grades and badges | |
| **[dsh-plugin-kit](https://github.com/PerryLink/dsh-plugin-kit)** | Shared zero-runtime-dependency toolkit for the PerryLink DSH plugins | |
| **[dsh-plugin-portal](https://github.com/PerryLink/dsh-plugin-portal)** | Zero-dependency static portal rendering the whole plugin family as one page | |
| **[dsh-plugin-upgrade-015](https://github.com/PerryLink/dsh-plugin-upgrade-015)** | Merged `0.1.3-alpha.1` → `0.1.5-rc.1` upgrade corridor card plus a zero-dependency seam scanner | |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | Cross-session team rooms: shared message bus, task board and timeline | |


## Licencia

[Apache-2.0](LICENSE)
