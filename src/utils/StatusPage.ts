import { IncomingMessage, ServerResponse } from 'node:http';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AvailablePLCs } from './Config.js';
import { credentialsStore } from './CredentialStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logoPath = join(__dirname, '..', 'icon.png');
const logoBase64 = readFileSync(logoPath, 'base64');

/**
 * StatusPage - Simple HTTP server that serves a status page showing PLC connection status
 * Runs on the main MCP port and intercepts /status requests
 */
export function createStatusPageHandler() {
    return (req: IncomingMessage, res: ServerResponse) => {
        const config = AvailablePLCs();
        const connectedPLCs: string[] = [];
        const disconnectedPLCs: string[] = [];

        // Check which PLCs have credentials (are logged in)
        config.forEach(plc => {
            const credentials = credentialsStore.get(plc.plcIpAddress);
            if (credentials && credentials.token) {
                connectedPLCs.push(`${plc.plcName} (${plc.plcIpAddress})`);
            } else {
                disconnectedPLCs.push(`${plc.plcName} (${plc.plcIpAddress})`);
            }
        });

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>S7-MCP-Bridge Status</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 800px;
            width: 100%;
            padding: 40px;
        }
        .header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 10px;
        }
        .logo {
            height: 60px;
            width: auto;
        }
        h1 {
            color: #2d3748;
            margin: 0;
            font-size: 2em;
        }
        .subtitle {
            color: #718096;
            margin-bottom: 30px;
            font-size: 0.95em;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            color: #4a5568;
            font-size: 1.2em;
            margin-bottom: 15px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 8px;
        }
        .plc-list {
            list-style: none;
        }
        .plc-item {
            padding: 12px 16px;
            margin-bottom: 8px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            font-size: 0.95em;
        }
        .plc-item.connected {
            background: #c6f6d5;
            color: #22543d;
            border-left: 4px solid #38a169;
        }
        .plc-item.disconnected {
            background: #fed7d7;
            color: #742a2a;
            border-left: 4px solid #e53e3e;
        }
        .status-badge {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 10px;
        }
        .status-badge.online {
            background: #38a169;
            box-shadow: 0 0 8px #38a169;
        }
        .status-badge.offline {
            background: #e53e3e;
        }
        .empty-state {
            color: #a0aec0;
            font-style: italic;
            padding: 12px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #718096;
            font-size: 0.85em;
            text-align: center;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: #f7fafc;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #2d3748;
        }
        .stat-label {
            color: #718096;
            font-size: 0.9em;
            margin-top: 5px;
        }
        .refresh-note {
            background: #ebf8ff;
            padding: 12px;
            border-radius: 6px;
            color: #2c5282;
            font-size: 0.9em;
            margin-bottom: 20px;
            border-left: 4px solid #3182ce;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="data:image/png;base64,${logoBase64}" alt="S7 MCP Bridge Logo" class="logo">
            <h1>S7 MCP Bridge</h1>
        </div>
        <div class="subtitle">Model Context Protocol Server that connects AI agents to Siemens industrial PLCs.<br>(specifically S7-1500 and S7-1200 models)</div>

        <div class="refresh-note">
            Refresh this page to see updated connection status
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${config.length}</div>
                <div class="stat-label">Total PLCs</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${connectedPLCs.length}</div>
                <div class="stat-label">Connected</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${disconnectedPLCs.length}</div>
                <div class="stat-label">Disconnected</div>
            </div>
        </div>

        <div class="section">
            <h2>Connected PLCs</h2>
            ${connectedPLCs.length > 0 ? `
                <ul class="plc-list">
                    ${connectedPLCs.map(plc => `
                        <li class="plc-item connected">
                            <span class="status-badge online"></span>
                            ${plc}
                        </li>
                    `).join('')}
                </ul>
            ` : '<div class="empty-state">No PLCs currently connected</div>'}
        </div>

        <div class="section">
            <h2>Disconnected PLCs</h2>
            ${disconnectedPLCs.length > 0 ? `
                <ul class="plc-list">
                    ${disconnectedPLCs.map(plc => `
                        <li class="plc-item disconnected">
                            <span class="status-badge offline"></span>
                            ${plc}
                        </li>
                    `).join('')}
                </ul>
            ` : '<div class="empty-state">No PLCs currently disconnected</div>'}
        </div>

        <div class="footer">
            <strong>Endpoints:</strong> /mcp (MCP Server) | /status (This page)
            <br>
            Server uptime: ${Math.floor(process.uptime())} seconds
        </div>
    </div>
</body>
</html>
        `;

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    };
}
