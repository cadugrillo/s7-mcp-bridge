import { MCPServer, TransportType } from "mcp-framework";
// ------------------------------------------------------------------------------------------------------------
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"; //Local PLCs have self-signed certificates that can't be validated using Public CAs
// ------------------------------------------------------------------------------------------------------------
let transport: TransportType = "http-stream"

if (process.env["TRANSPORT"] === "stdio") {
    transport = "stdio"
}

const server = new MCPServer({
    name: "s7-mcp-bridge",
    version: "0.1.0",
    transport: {
        type: transport,
        options: {
            port: Number(process.env["MCP_SERVER_PORT"]) || 5000
        }
    }
});

await server.start();