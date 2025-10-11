<p align="left">
  <img title="s7-mcp-bridge" src='https://raw.githubusercontent.com/cadugrillo/s7-mcp-bridge/main/logo.png' width="110" height="110"/>
</p>

# S7 MCP Bridge

**S7 MCP Bridge** is a MCP Server that connects AI agents to Siemens industrial PLCs (specifically S7-1500 and S7-1200 models). This allows AI agents to automatically monitor and control industrial equipment by sending commands and receiving data from the machines.

---

## 🔧 Available Tools

  - User authentication (`login`, `logout`, `ChangePassword-user`)
  - Check PLC connectivity (`ping`)
  - Retrieve user permissions (`Api-GetPermissions`)
  - Get API version (`Api-Version`)
  - List available API methods (`Api-Browse`)
  - Retrieve structure information (`Api-GetQuantityStructures`)
  - Get password security policies (`Api-GetPasswordPolicy`)
  - Browse tags and metadata (`PlcProgram-Browse`)
  - Read single variables (`PlcProgram-Read`)
  - Write Boolean, Number, or String tags (`PlcProgram-Write`)
  - Read the current CPU operating mode (`Plc-ReadOperatingMode`)
  - Request a change of operating mode (`Plc-RequestChangeOperatingMode`)
  - Read the CPU system time (`Plc-ReadSystemTime`)
  - Set the CPU system time (`Plc-SetSystemTime`)
  - Read available project languages (`Project-ReadLanguages`)
  - Browse active alarms (`Alarms-Browse`)
  - Acknowledge alarms (`Alarms-Acknowledge`)
  - Browse diagnostic buffer entries (`DiagnosticBuffer-Browse`)

---

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- npm (comes bundled with Node.js)
- Access to a running **SIEMENS PLC API (Webserver)**

---

## ⚙️ Configuration

This server uses environment variables for configuration.

### Example `env variables`:

```bash
export PLC_IP_ADDRESSES="192.168.2.200, 192.168.2.201, 192.168.2.202"
export PLC_NAMES="PLC1, PLC2, PLC3" //optional
export MCP_SERVER_PORT=5000 //optional
export TRANSPORT="http-stream" //optional
```

## 🚀 Getting Started (Development)

1. Git Clone this repo: https://github.com/cadugrillo/s7-mcp-bridge.git 

2. Navigate to the project folder:

```bash
cd s7-mcp-bridge
```

3. Install dependencies:

```bash
npm install
```

4. Build the project:

```bash
npm run build
```

5. Edit env variables as shown above.

6. Start the server

```bash
npm run start
```

## 🐳 Docker Container

There is a Docker Container Image avaiable at https://hub.docker.com/r/cadugrillo/s7-mcp-bridge/tags

- How to run
```bash
docker run -dp 5000:5000 -m 512m --memory-swap=512m \
--name s7mcp \
-e MCP_SERVER_PORT=5000 \
-e PLC_IP_ADDRESSES="192.168.2.200, 192.168.2.201, 192.168.2.202" \
-e PLC_NAMES="PLC1, PLC2, PLC3" \
cadugrillo/s7-mcp-bridge:latest
```

**Remember to change port according to your deployment.**


- Available Environment Variables

| | | |
| :---------------------------: | :--------: | :------------------------------------------------------- |
|  PLC_IP_ADDRESSES             | required   | IP addresses of available PLCs separated by comma eg. "192.168.1.10, 192.168.1.20" |
|  PLC_NAMES                    | optional   | Names of available PLCs separated by comma eg. "Machine1, Machine2" |
|  MCP_SERVER_PORT              | optional   | If not set, it defaults to 5000 |
|  TRANSPORT                    | optional   | It can be "http-stream" or "stdio". If not set it defaults to http-stream |


### 🖥️ Connecting with Claude Desktop

To use this MCP server with Claude AI (desktop version):

1. Find or create the claude_desktop_config.json file
   (typically in the Claude app config folder).

2. Add or update the following if running in a container (http-stream) (remember to change port according to your deployment):

```json
{
  "mcpServers": {
    "S7-MCP-SERVER": {
      "command": "npx",
      "args": ["mcp-remote", "http://localhost:5000/mcp"]
    }
  }
}
```

3. Or use the following if running locally (stdio):

```json
{
  "mcpServers": {
    "S7-MCP-SERVER": {
      "command": "node",
      "args": ["path/to/your/index.js"], //`for Windows user proper escape (eg. C:\\path\\to\\your\\index.js.js)`
      "env": {
        "PLC_IP_ADDRESSES":"192.168.2.200, 192.168.2.201, 192.168.2.202",
        "PLC_NAMES":"PLC1, PLC2, PLC3",
        "TRANSPORT": "stdio"
      }
    }
  }
}
```

### 🪲 Reporting bugs and contributing

- Want to report a bug or request a feature? Please open an [issue](https://github.com/cadugrillo/s7-mcp-bridge/issues/new)
