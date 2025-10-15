import { MCPServer, TransportType, HttpStreamTransport, logger, Logger } from "mcp-framework";
import { createStatusPageHandler } from "./utils/StatusPage.js";
// ------------------------------------------------------------------------------------------------------------
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"; //Local PLCs have self-signed certificates that can't be validated using Public CAs
// ------------------------------------------------------------------------------------------------------------
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

// Patch the HTTP transport to add /status endpoint after server starts
if (transport === "http-stream") {
    // Wait a bit for the server to fully initialize
    setTimeout(() => {
        try {
            const transportInstance = (server as any).transport as HttpStreamTransport;
            const httpServer = (transportInstance as any)._server;

            if (httpServer) {
                // Get existing request listeners
                const existingListeners = httpServer.listeners('request');

                // Remove all existing listeners
                httpServer.removeAllListeners('request');

                // Add new listener that checks for /status first
                httpServer.on('request', (req: any, res: any) => {
                    const url = new URL(req.url || '/', `http://${req.headers.host}`);

                    if (url.pathname === '/status') {
                        createStatusPageHandler()(req, res);
                        return;
                    }

                    // For all other requests, call the original MCP handler
                    for (const listener of existingListeners) {
                        listener(req, res);
                    }
                });

                logger.info(`Status page available at http://localhost:${Number(process.env["MCP_SERVER_PORT"]) || 5000}/status`);
            }
        } catch (error) {
            logger.error(`Failed to patch HTTP server for /status endpoint: ${error}`);
        }
    }, 3000);
}

await server.start();