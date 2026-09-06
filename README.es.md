# dsh-ticktick

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![DSH plugin](https://img.shields.io/badge/dsh-plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![Gitee](https://img.shields.io/badge/Gitee-mirror-c71d23?logo=gitee)](https://gitee.com/perrylink/dsh-ticktick)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-ticktick/ci.yml?branch=main&label=CI)](https://github.com/PerryLink/dsh-ticktick/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-ticktick?label=version)](https://github.com/PerryLink/dsh-ticktick/releases)
[![npm version](https://img.shields.io/npm/v/%40perrylink%2Fdsh-ticktick)](https://www.npmjs.com/package/@perrylink/dsh-ticktick)
[![npm downloads](https://img.shields.io/npm/dm/%40perrylink%2Fdsh-ticktick)](https://www.npmjs.com/package/@perrylink/dsh-ticktick)

[English](README.md) | [简体中文](README.zh.md) | **Español** | [Português](README.pt.md) | [हिन्दी](README.hi.md)

Puente de tareas de TickTick / Dida365 (滴答清单) para [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): un panel de tareas en la cabecera de sesión (filtro por lista, alta rápida, completar, borrar, fechas límite, reordenar arrastrando), once herramientas del agente, una tarjeta de configuración y un servicio Remote tipado — todo sobre el endpoint MCP oficial de TickTick.

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

Reinicia `dsh web`. Obtén un token API 口令 (con prefijo `dp_`) en la web de Dida365 (Perfil → Ajustes → Cuenta y seguridad → API 口令) y pégalo en la tarjeta, escríbelo en `$DSH_HOME/.ticktick-token` (una línea) o expórtalo en `DIDA365_TOKEN`.

| Clave | Por defecto | Significado |
|---|---|---|
| `tokenFile` | `''` | Archivo de token; vacío = `$DSH_HOME/.ticktick-token` |
| `mcpUrl` | `https://mcp.dida365.com` | Endpoint MCP (el internacional no está verificado) |
| `toolCallTimeoutMs` | `30000` | Plazo por tools/call en ms |
| `protectedTaskIds` | `[]` | Ids que las mutaciones rechazan |
| `tools.*` | `''` | Nombres MCP fijados; `''` = descubrir |

## Limitaciones

El endpoint internacional no está verificado; las vistas de completadas, la búsqueda y la adición por lotes usan las herramientas MCP `list_completed_tasks_by_date`, `search` y `batch_add_tasks`, cuyos contratos vienen del catálogo publicado y están **pendientes de reverificación** contra el endpoint real (ejecuta `probes/probe-queries.mjs` con un token real). El crash medido de `update_task` y los fallos de validación de listas son comportamientos del servidor; `probes/` los reverifica antes de cada release. El token se guarda localmente y solo se envía a los servidores de TickTick; no expongas `dsh web` a internet público. Verificación en vivo: exporta `DIDA365_TOKEN` y ejecuta `node probes/probe-*.mjs`.

### Instalar desde el mercado de DSH Desktop

Todos los plugins de PerryLink pueden explorarse en el mercado integrado de DSH Desktop: **Market → Sources → add source → pegar** `https://perrylink-dsh-catalog.perrylink.workers.dev/catalog-source.json` **→ seleccionarlo**. La instalación sigue pasando por la verificación de identidad npm del mercado y tu confirmación.

## Licencia

[Apache-2.0](LICENSE)
