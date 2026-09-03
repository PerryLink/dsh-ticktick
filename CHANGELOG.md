# Changelog

All notable changes to this project are documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- TickTick (Dida365) task bridge over the official MCP endpoint: minimal streamable-HTTP MCP client (initialize handshake, session-id and protocol-version carry-over, Retry-After on 429, `isError` surfaced).
- `TicktickService` under the `ticktick` Typert Remote namespace: status, projects, tasks (aggregated with per-list warnings), add, complete, remove, setDue (with the measured move-to-inbox detour for the server-side `update_task` crash), reorder (descending sortOrder semantics).
- Eight curated agent tools (`ticktick_status/lists/tasks/add/complete/delete/due/reorder`) plus a system-prompt usage section; Code Mode calls come free via `output.schema`.
- Session-header task panel (`conversation.session.header.actions`): list filter, quick add, complete, delete with confirm, inline due dates with overdue/today/tomorrow chips, drag reorder (single-list views).
- Plugin settings card (`settings.plugin.item`, key `ticktick`): secret token, token file, MCP endpoint, protected task ids; live token re-read with 401-triggered client reset.
- Protected task ids refuse every mutating operation before any wire call.
- Zero-dependency live-endpoint probes (`probes/`) for handshake, CRUD, due-date detour, reorder semantics, and P2 query-tool contract discovery.
- Unit specs: domain normalization, MCP client, service workarounds, drag math, due-date presentation.

## [0.1.0] - unreleased

Initial release candidate.
