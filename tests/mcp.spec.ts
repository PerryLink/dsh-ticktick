/**
 * MCP client specs: SSE/JSON parsing, the initialize handshake, header
 * carry-over, isError surfacing, and the Retry-After retry.
 */

import { describe, expect, it, vi } from 'vitest'
import { McpStreamableClient, parseMcpMessage } from '../src/mcp.ts'

describe('parseMcpMessage', () => {
  it('parses the last SSE data line', () => {
    expect(parseMcpMessage('event: message\ndata: {"a":1}\n\ndata: {"b":2}\n')).toEqual({ b: 2 })
  })

  it('parses plain JSON', () => {
    expect(parseMcpMessage('{"a":1}')).toEqual({ a: 1 })
  })

  it('returns undefined for an empty body', () => {
    expect(parseMcpMessage('  \n')).toBeUndefined()
  })
})

/** Build a Response-like object for fetch stubs. */
function response(body: string, init: { status?: number, headers?: Record<string, string> } = {}): Response {
  return new Response(body, {
    status: init.status ?? 200,
    headers: { 'content-type': 'application/json', ...init.headers },
  })
}

describe('McpStreamableClient', () => {
  it('runs the handshake and carries session + protocol headers afterwards', async () => {
    const fetchFn = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { method: string }
      if (body.method === 'initialize') return response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: { protocolVersion: '2025-03-26' } }), {
        headers: { 'mcp-session-id': 'sess-1' },
      })
      if (body.method === 'notifications/initialized') return response('', { status: 202 })
      if (body.method === 'tools/list') return response(JSON.stringify({ jsonrpc: '2.0', id: 2, result: { tools: [{ name: 'list_projects' }] } }))
      return response(JSON.stringify({ jsonrpc: '2.0', id: 3, result: { content: [{ type: 'text', text: '{}' }] } }))
    })
    const client = new McpStreamableClient('https://mcp.dida365.com', 'dp_test', 5_000, fetchFn as unknown as typeof fetch)
    await client.initialize()
    const tools = await client.listTools()
    expect(tools).toEqual([{ name: 'list_projects' }])
    await client.callTool('list_projects', {})

    const initCalls = fetchFn.mock.calls
    expect(initCalls[0]?.[1]?.headers).not.toHaveProperty('mcp-session-id')
    const lastCall = initCalls[initCalls.length - 1]?.[1] as RequestInit
    const headers = lastCall.headers as Record<string, string>
    expect(headers['mcp-session-id']).toBe('sess-1')
    expect(headers['mcp-protocol-version']).toBe('2025-03-26')
    expect(headers.authorization).toBe('Bearer dp_test')
  })

  it('throws on tool-level isError', async () => {
    const fetchFn = vi.fn(async () => response(JSON.stringify({
      jsonrpc: '2.0',
      id: 3,
      result: { isError: true, content: [{ type: 'text', text: 'boom' }] },
    })))
    const client = new McpStreamableClient('https://mcp.dida365.com', 'dp_test', 5_000, fetchFn as unknown as typeof fetch)
    await expect(client.callTool('update_task', {})).rejects.toThrow(/boom/)
  })

  it('retries once after a 429 with Retry-After', async () => {
    const fetchFn = vi.fn(async () => {
      if (fetchFn.mock.calls.length === 1) return response('', { status: 429, headers: { 'retry-after': '0.01' } })
      return response(JSON.stringify({ jsonrpc: '2.0', id: 3, result: { content: [] } }))
    })
    const client = new McpStreamableClient('https://mcp.dida365.com', 'dp_test', 5_000, fetchFn as unknown as typeof fetch)
    await client.callTool('list_projects', {})
    expect(fetchFn).toHaveBeenCalledTimes(2)
  })
})
