# dsh-ticktick

[English](README.md) | [涓枃](README.zh.md) | **Espa帽ol** | [Portugu锚s](README.pt.md) | [啶灌た啶ㄠ啶︵](README.hi.md)

Puente de tareas de TickTick / Dida365 (婊寸瓟娓呭崟) para [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): un panel de tareas en la cabecera de sesi贸n (filtro por lista, alta r谩pida, completar, borrar, fechas l铆mite, reordenar arrastrando), once herramientas para el agente, una tarjeta de configuraci贸n y un servicio Remote tipado 鈥?todo sobre el endpoint MCP oficial de TickTick.

## Caracter铆sticas

- **Panel de sesi贸n** 鈥?el bot贸n `ticktick` de la cabecera abre una ventana emergente: filtrar por lista (Todas + cada lista), a帽adir tareas con fecha opcional, completar, borrar (con confirmaci贸n), fijar/limpiar fechas l铆mite con etiquetas vencida/hoy/ma帽ana y reordenar arrastrando (vistas de una sola lista).
- **Ocho herramientas** 鈥?`ticktick_status`, `ticktick_lists`, `ticktick_tasks`, `ticktick_add`, `ticktick_complete`, `ticktick_delete`, `ticktick_due`, `ticktick_reorder`; Code Mode obtiene `await tools.ticktick_*(args)` gratis.
- **Tarjeta de configuraci贸n** 鈥?Ajustes 鈫?Plugins 鈫?TickTick: token API (secreto), archivo de token, endpoint MCP, ids protegidos.
- **Relectura del token en vivo** 鈥?el token se relee en cada petici贸n (secreto de la tarjeta > archivo, por defecto `$DSH_HOME/.ticktick-token`); un 401 reinicia el cliente.
- **Contorneos medidos** 鈥?el MCP de TickTick rechaza `update_task` para tareas de proyectos reales ("Expecting value鈥?); el puente reintenta con mover-a-bandeja 鈫?actualizar 鈫?devolver. Las listas con fallos de validaci贸n del servidor se omiten y se notifican como advertencias.
- **Ids protegidos** 鈥?las operaciones de mutaci贸n rechazan tareas protegidas antes de llamar a la red.
- **Sincronizaci贸n multidispositivo** 鈥?cada escritura va a la nube de TickTick; m贸vil, escritorio y web la ven.

## Instalaci贸n

```sh
dsh plugin --profile web add dsh-ticktick          # npm (incluye lib/)
dsh plugin --profile web add "github:PerryLink/dsh-ticktick#<sha>"   # git
dsh plugin --profile web add link:/path/to/dsh-ticktick              # local
```

Reinicia `dsh web`. Obt茅n el token API 鍙ｄ护 (prefijo `dp_`) en la web de Dida365 (Perfil 鈫?Ajustes 鈫?Cuenta y seguridad 鈫?API 鍙ｄ护) y p茅galo en la tarjeta o escr铆belo en `$DSH_HOME/.ticktick-token`.

| Clave | Por defecto | Significado |
|---|---|---|
| `tokenFile` | `''` | Archivo de token; vac铆o = `$DSH_HOME/.ticktick-token` |
| `mcpUrl` | `https://mcp.dida365.com` | Endpoint MCP (el internacional no est谩 verificado) |
| `toolCallTimeoutMs` | `30000` | Plazo por tools/call en ms |
| `protectedTaskIds` | `[]` | Ids que las mutaciones rechazan |
| `tools.*` | `''` | Nombres MCP fijados; `''` = descubrir |

## Limitaciones

El endpoint internacional no est谩 verificado; las vistas de completadas y la b煤squeda se difieren (contratos descubiertos por `probes/probe-queries.mjs`); no expongas `dsh web` a internet. Verificaci贸n en vivo: exporta `DIDA365_TOKEN` y ejecuta `node probes/probe-*.mjs`.

## Licencia

[Apache-2.0](LICENSE)
