# dsh-ticktick

[English](README.md) | [中文](README.zh.md) | **Español** | [Português](README.pt.md) | [हिन्दी](README.hi.md)

Puente de tareas de TickTick / Dida365 (滴答清单) para [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): un panel de tareas en la cabecera de sesión (filtro por lista, alta rápida, completar, borrar, fechas límite, reordenar arrastrando), ocho herramientas para el agente, una tarjeta de configuración y un servicio Remote tipado — todo sobre el endpoint MCP oficial de TickTick.

## Características

- **Panel de sesión** — el botón `ticktick` de la cabecera abre una ventana emergente: filtrar por lista (Todas + cada lista), añadir tareas con fecha opcional, completar, borrar (con confirmación), fijar/limpiar fechas límite con etiquetas vencida/hoy/mañana y reordenar arrastrando (vistas de una sola lista).
- **Ocho herramientas** — `ticktick_status`, `ticktick_lists`, `ticktick_tasks`, `ticktick_add`, `ticktick_complete`, `ticktick_delete`, `ticktick_due`, `ticktick_reorder`; Code Mode obtiene `await tools.ticktick_*(args)` gratis.
- **Tarjeta de configuración** — Ajustes → Plugins → TickTick: token API (secreto), archivo de token, endpoint MCP, ids protegidos.
- **Relectura del token en vivo** — el token se relee en cada petición (secreto de la tarjeta > archivo, por defecto `$DSH_HOME/.ticktick-token`); un 401 reinicia el cliente.
- **Contorneos medidos** — el MCP de TickTick rechaza `update_task` para tareas de proyectos reales ("Expecting value…"); el puente reintenta con mover-a-bandeja → actualizar → devolver. Las listas con fallos de validación del servidor se omiten y se notifican como advertencias.
- **Ids protegidos** — las operaciones de mutación rechazan tareas protegidas antes de llamar a la red.
- **Sincronización multidispositivo** — cada escritura va a la nube de TickTick; móvil, escritorio y web la ven.

## Instalación

```sh
dsh plugin --profile web add dsh-ticktick          # npm (incluye lib/)
dsh plugin --profile web add "github:PerryLink/dsh-ticktick#<sha>"   # git
dsh plugin --profile web add link:/path/to/dsh-ticktick              # local
```

Reinicia `dsh web`. Obtén el token API 口令 (prefijo `dp_`) en la web de Dida365 (Perfil → Ajustes → Cuenta y seguridad → API 口令) y pégalo en la tarjeta o escríbelo en `$DSH_HOME/.ticktick-token`.

| Clave | Por defecto | Significado |
|---|---|---|
| `tokenFile` | `''` | Archivo de token; vacío = `$DSH_HOME/.ticktick-token` |
| `mcpUrl` | `https://mcp.dida365.com` | Endpoint MCP (el internacional no está verificado) |
| `toolCallTimeoutMs` | `30000` | Plazo por tools/call en ms |
| `protectedTaskIds` | `[]` | Ids que las mutaciones rechazan |
| `tools.*` | `''` | Nombres MCP fijados; `''` = descubrir |

## Limitaciones

El endpoint internacional no está verificado; las vistas de completadas y la búsqueda se difieren (contratos descubiertos por `probes/probe-queries.mjs`); no expongas `dsh web` a internet. Verificación en vivo: exporta `DIDA365_TOKEN` y ejecuta `node probes/probe-*.mjs`.

## Licencia

[Apache-2.0](LICENSE)
