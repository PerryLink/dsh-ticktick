// Probe 1: handshake + tool catalogue. Verifies the endpoint, the token,
// the negotiated protocol version, and prints every advertised tool name
// (the catalogue the reorder/update pins resolve from).
import { initialize, listTools } from './lib.mjs'

const version = await initialize()
console.log(`protocolVersion: ${version}`)
const tools = await listTools()
console.log(`tools: ${tools.length}`)
for (const tool of tools) console.log(`- ${tool.name}`)
