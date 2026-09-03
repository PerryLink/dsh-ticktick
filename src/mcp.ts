/**
 * Minimal Model Context Protocol streamable-HTTP client for the TickTick
 * endpoint: initialize, tools/list, and tools/call, accepting SSE or JSON
 * responses, propagating the session id and the negotiated protocol version,
 * honoring Retry-After on 429, and surfacing tool-level `isError` failures
 * as thrown errors.
 *
 * @module dsh-ticktick/mcp
 */

/** One tool as advertised by `tools/list`. */
export interface McpTool {
  readonly name: string
  readonly description?: string
  readonly inputSchema?: {
    readonly properties?: Readonly<Record<string, { readonly type?: string }>>
    readonly required?: readonly string[]
  }
}

/** Settled `tools/call` result (text blocks or structured content). */
export interface McpCallResult {
  readonly content?: readonly { readonly type: string; readonly text?: string }[]
  readonly structuredContent?: unknown
}

/** Structural face of the MCP client the service drives (test seam). */
export interface McpClientFace {
  initialize(): Promise<void>
  listTools(): Promise<readonly McpTool[]>
  callTool(name: string, args: Record<string, unknown>): Promise<McpCallResult>
}

/** One JSON-RPC request payload. */
interface McpRequest {
  readonly jsonrpc: '2.0'
  readonly id?: number
  readonly method: string
  readonly params?: unknown
}

/**
 * Parse one MCP response body: the last SSE `data:` payload, or plain JSON.
 * @param body - raw response text.
 * @returns the parsed message, or `undefined` for an empty body.
 */
export function parseMcpMessage(body: string): unknown | undefined {
  if (body.trim() === '') return undefined
  const dataLines = body.split(/\r?\n/).filter(line => line.startsWith('data:'))
  if (dataLines.length > 0) {
    const last = dataLines[dataLines.length - 1]!.slice(5).trim()
    return JSON.parse(last) as unknown
  }
  return JSON.parse(body) as unknown
}

/** Fetch face, injectable for tests. */
export type FetchFace = (url: string, init?: RequestInit) => Promise<Response>

/**
 * Streamable-HTTP MCP client with Bearer auth. Requests are simple POSTs;
 * notifications tolerate empty responses. A 429 response is retried once
 * after the server's Retry-After delay (bounded to one minute).
 */
export class McpStreamableClient implements McpClientFace {
  private sessionId: string | undefined
  private protocolVersion: string | undefined
  private nextId = 1

  /**
   * @param url - MCP server URL (e.g. https://mcp.dida365.com).
   * @param token - Bearer token (the TickTick API 口令).
   * @param timeoutMs - per-request deadline in milliseconds.
   * @param fetchFn - fetch implementation (defaults to global fetch).
   */
  constructor(
    private readonly url: string,
    private readonly token: string,
    private readonly timeoutMs: number,
    private readonly fetchFn: FetchFace = fetch,
  ) {}

  /** Perform the initialize handshake and send the initialized notification. */
  async initialize(): Promise<void> {
    const response = await this.send({
      jsonrpc: '2.0',
      id: this.nextId++,
      method: 'initialize',
      params: {
        protocolVersion: '2025-03-26',
        capabilities: {},
        clientInfo: { name: 'dsh-ticktick', version: '0.1.0' },
      },
    }, false)
    const body = await response.text()
    if (response.status !== 200) throw new Error(`ticktick MCP initialize: HTTP ${response.status}: ${body.slice(0, 200)}`)
    this.sessionId = response.headers.get('mcp-session-id') ?? undefined
    const message = parseMcpMessage(body) as { readonly result?: { readonly protocolVersion?: string } } | undefined
    this.protocolVersion = message?.result?.protocolVersion
    if (this.protocolVersion === undefined) {
      throw new Error(`ticktick MCP initialize: unexpected response: ${body.slice(0, 200)}`)
    }
    await this.post({ jsonrpc: '2.0', method: 'notifications/initialized' })
  }

  /** Fetch the server's tool list. */
  async listTools(): Promise<readonly McpTool[]> {
    const message = await this.post({ jsonrpc: '2.0', id: this.nextId++, method: 'tools/list', params: {} }) as
      | { readonly result?: { readonly tools?: readonly McpTool[] } }
      | undefined
    return message?.result?.tools ?? []
  }

  /**
   * Invoke one tool. A tool-level failure (the MCP result flag `isError`)
   * throws with the server's message — TickTick reports validation failures
   * that way, not as JSON-RPC errors.
   * @param name - the raw MCP tool name.
   * @param args - the tool arguments object.
   * @returns the settled result (text blocks or structured content).
   */
  async callTool(name: string, args: Record<string, unknown>): Promise<McpCallResult> {
    const message = await this.post({
      jsonrpc: '2.0',
      id: this.nextId++,
      method: 'tools/call',
      params: { name, arguments: args },
    }) as { readonly result?: McpCallResult & { readonly isError?: boolean }; readonly error?: unknown } | undefined
    if (message?.error !== undefined) {
      throw new Error(`ticktick MCP tools/call ${name}: ${JSON.stringify(message.error)}`)
    }
    if (message?.result?.isError === true) {
      const text = message.result.content
        ?.filter(block => block.type === 'text' && block.text !== undefined)
        .map(block => block.text)
        .join('\n')
      throw new Error(`ticktick MCP tools/call ${name}: ${text ?? 'unknown tool error'}`)
    }
    return message?.result ?? {}
  }

  /**
   * Send one request and parse the response message: a 429 is retried once
   * after Retry-After, any other non-2xx status throws, and an empty body
   * (notification success) parses to `undefined`.
   * @param request - JSON-RPC payload.
   * @param carryHeaders - include session/protocol headers (false for initialize).
   * @returns the parsed message, or `undefined` for an empty body.
   */
  private async post(request: McpRequest, carryHeaders = true): Promise<unknown | undefined> {
    const response = await this.send(request, carryHeaders)
    const body = await response.text()
    if (response.status !== 200 && response.status !== 202) {
      throw new Error(`ticktick MCP request failed: HTTP ${response.status}: ${body.slice(0, 200)}`)
    }
    return parseMcpMessage(body)
  }

  /**
   * Send one request, retrying once after Retry-After when the server
   * answers 429.
   * @param request - JSON-RPC payload.
   * @param carryHeaders - include session/protocol headers (false for initialize).
   * @returns the raw response (body not yet read).
   */
  private async send(request: McpRequest, carryHeaders = true): Promise<Response> {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
      authorization: `Bearer ${this.token}`,
    }
    if (carryHeaders) {
      if (this.sessionId !== undefined) headers['mcp-session-id'] = this.sessionId
      if (this.protocolVersion !== undefined) headers['mcp-protocol-version'] = this.protocolVersion
    }
    const signal = AbortSignal.timeout(this.timeoutMs)
    const send = async (): Promise<Response> =>
      await this.fetchFn(this.url, { method: 'POST', headers, body: JSON.stringify(request), signal })
    let response = await send()
    if (response.status === 429) {
      const retryAfter = parseRetryAfter(response.headers.get('retry-after'))
      await delay(retryAfter, signal)
      response = await send()
    }
    return response
  }
}

/** Parse a Retry-After header (seconds or HTTP date), bounded to 60s. */
function parseRetryAfter(value: string | null): number {
  if (value === null) return 1_000
  const seconds = Number(value)
  if (Number.isFinite(seconds)) return Math.min(Math.max(seconds * 1_000, 0), 60_000)
  const epoch = Date.parse(value)
  if (Number.isFinite(epoch)) return Math.min(Math.max(epoch - Date.now(), 0), 60_000)
  return 1_000
}

/** Abortable delay (bounded by the request timeout signal). */
function delay(ms: number, signal: AbortSignal): Promise<void> {
  if (ms <= 0) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = (): void => {
      clearTimeout(timer)
      reject(signal.reason)
    }
    signal.addEventListener('abort', onAbort, { once: true })
  })
}
