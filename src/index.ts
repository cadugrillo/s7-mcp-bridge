import { MCPServer, TransportType, logger } from "mcp-framework";
import { createServer } from "node:http";
import { createStatusPageHandler } from "./utils/StatusPage.js";
import { TIMEOUT } from "node:dns";
import { setSdkServer } from "./utils/SdkServerRef.js";
// ------------------------------------------------------------------------------------------------------------
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"; //Local PLCs have self-signed certificates that can't be validated using Public CAs
// ------------------------------------------------------------------------------------------------------------
let transport: TransportType = "http-stream"

if (process.env["TRANSPORT"] === "stdio") {
    transport = "stdio"
}

const mcpPort = Number(process.env["MCP_SERVER_PORT"]) || 57001;
const statusPort = mcpPort + 1;

// Start the main MCP server
const server = new MCPServer({
    transport: {
        type: transport,
        options: {
            port: mcpPort
        }
    }
});

// Create a separate HTTP server for the status endpoint (only if using http-stream)
let statusServer: ReturnType<typeof createServer> | null = null;
if (transport === "http-stream") {
    setTimeout(() => {
        try {
            statusServer = createServer((req, res) => {
                const url = new URL(req.url || '/', `http://${req.headers.host}`);

                if (url.pathname === '/status') {
                    createStatusPageHandler()(req, res);
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 Not Found. Use /status endpoint.');
                }
            });

            statusServer.listen(statusPort, () => {
                logger.info(`Status page available at http://localhost:${statusPort}/status`);
            });

        } catch (error) {
            logger.error(`Failed to start server for /status endpoint: ${error}`);
        }
    }, 3000);

    // Handle graceful shutdown for status server
    const shutdownStatusServer = () => {
        if (statusServer) {
            logger.info('Shutting down status server...');
            statusServer.close(() => {
                logger.info('Status server closed');
            });
        }
    };

    process.on('SIGINT', shutdownStatusServer);
    process.on('SIGTERM', shutdownStatusServer);
}

// Capture the SDK Server instance created inside MCPServer.start() for elicitation support.
// MCPServer assigns this.server (the SDK Server) early in its start() execution.
// We poll until it's available, then store it for tools to use.
const captureInterval = setInterval(() => {
    const sdkServer = (server as any).server;
    if (sdkServer) {
        setSdkServer(sdkServer);
        clearInterval(captureInterval);
        logger.info("SDK Server reference captured for elicitation support.");
    }
}, 100);

await server.start();