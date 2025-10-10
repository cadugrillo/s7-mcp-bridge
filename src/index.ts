import { MCPServer, TransportType } from "mcp-framework";

let transport: TransportType = "http-stream"

if (process.env["TRANSPORT"] === "stdio") {
    transport = "stdio"
}

const server = new MCPServer({
    transport: {
        type: transport,
        options: {
            port: Number(process.env["MCP_SERVER_PORT"]) || 5000
        }
    }
});

await server.start();