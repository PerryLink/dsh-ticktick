// Shared mini MCP client for the probe scripts: no dependencies, reads the
// token from DIDA365_TOKEN (dp_ prefix, exported by the user), never logs
// the token. Usage: $env:DIDA365_TOKEN='dp_...'; node probes/probe-xxx.mjs
const TOKEN = process.env.DIDA365_TOKEN ?? ''
const URL = process.env.DIDA365_MCP_URL ?? 'https://mcp.dida365.com'

if (TOKEN === '') {
  console.error('set DIDA365_TOKEN first (export $env:DIDA365_TOKEN="dp_...")')
  process.exit(2)
}

let sessionId
let protocolVersion
let nextId = 1

export async function call(method, params) {
  const headers = {
    'content-type': 'application/json',
    accept: 'application/json, text/event-stream',
    authorization: `Bearer ${TOKEN}`,
  }
  if (sessionId !== undefined) headers['mcp-session-id'] = sessionId
  if (protocolVersion !== undefined) headers['mcp-protocol-version'] = protocolVersion
  const response = await fetch(URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ jsonrpc: '2.0', id: nextId++, method, params: params ?? {} }),
  })
  const text = await response.text()
  if (response.status !== 200 && response.status !== 202) {
    throw new Error(`HTTP ${response.status}: ${text.slice(0, 300)}`)
  }
  return { message: parse(text), text }
}

function parse(text) {
  if (text.trim() === '') return undefined
  const dataLines = text.split(/\r?\n/).filter(line => line.startsWith('data:'))
  if (dataLines.length > 0) return JSON.parse(dataLines[dataLines.length - 1].slice(5).trim())
  return JSON.parse(text)
}

export async function initialize() {
  const { message } = await call('initialize', {
    protocolVersion: '2025-03-26',
    capabilities: {},
    clientInfo: { name: 'dsh-ticktick-probe', version: '0.1.0' },
  })
  protocolVersion = message?.result?.protocolVersion
  await call('notifications/initialized')
  return protocolVersion
}

export async function tool(name, args) {
  const { message } = await call('tools/call', { name, arguments: args ?? {} })
  if (message?.result?.isError === true) {
    throw new Error(`tool ${name} isError: ${message.result.content.map(b => b.text).join('\n').slice(0, 300)}`)
  }
  return message?.result ?? {}
}

export async function listTools() {
  const { message } = await call('tools/list', {})
  return message?.result?.tools ?? []
}
