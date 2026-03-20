import { MCPTool, logger } from "mcp-framework";
import { sendReq } from "../utils/Fetch.js";
import { credentialsStore } from "../utils/CredentialStore.js";
import { ipAddressSchema } from "../utils/Schemas.js";
import { jsonRpcIdGenerator } from "../utils/JsonRpcIdGenerator.js";
import { getSdkServer } from "../utils/SdkServerRef.js";

interface PlcReadOperatingModeInput {
  plcIpAddress: string;
}

function generateModeSvg(mode: string, plcIp: string): string {
  const isRun = mode === "run";
  const statusColor = isRun ? "#00e676" : "#ff1744";
  const statusBg = isRun ? "#1b5e20" : "#7f0000";
  const glowColor = isRun ? "#69f0ae" : "#ff5252";
  const statusLabel = isRun ? "RUN" : "STOP";
  const panelBg = isRun ? "#0a2e0a" : "#2e0a0a";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 200" width="420" height="200">
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${glowColor}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${statusColor}" stop-opacity="0.3"/>
    </radialGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="${statusColor}" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Outer frame -->
  <rect width="420" height="200" rx="14" fill="#111827"/>
  <rect x="1" y="1" width="418" height="198" rx="13" fill="none" stroke="#374151" stroke-width="1.5"/>

  <!-- Header bar -->
  <rect x="0" y="0" width="420" height="48" rx="14" fill="#1f2937"/>
  <rect x="0" y="36" width="420" height="12" fill="#1f2937"/>
  <text x="18" y="30" font-family="'Courier New',monospace" font-size="13" font-weight="bold" fill="#9ca3af" letter-spacing="1">SIEMENS S7 PLC</text>
  <text x="18" y="30" font-family="'Courier New',monospace" font-size="13" font-weight="bold" fill="#6b7280">　　　　　　　　　</text>
  <circle cx="380" cy="24" r="6" fill="${statusColor}" opacity="0.9" filter="url(#shadow)"/>
  <circle cx="395" cy="24" r="6" fill="${statusColor}" opacity="0.5"/>

  <!-- Status panel -->
  <rect x="16" y="60" width="388" height="110" rx="10" fill="${panelBg}"/>
  <rect x="16" y="60" width="388" height="110" rx="10" fill="none" stroke="${statusColor}" stroke-width="1.5" opacity="0.6"/>

  <!-- Large indicator light -->
  <circle cx="76" cy="115" r="34" fill="${statusBg}"/>
  <circle cx="76" cy="115" r="28" fill="url(#glow)" filter="url(#shadow)"/>
  <circle cx="66" cy="106" r="8" fill="white" opacity="0.25"/>

  <!-- Status text -->
  <text x="130" y="100" font-family="'Courier New',monospace" font-size="42" font-weight="bold" fill="${statusColor}" filter="url(#shadow)">${statusLabel}</text>
  <text x="131" y="130" font-family="Arial,sans-serif" font-size="12" fill="#6b7280" letter-spacing="2">OPERATING MODE</text>

  <!-- Divider -->
  <line x1="130" y1="142" x2="390" y2="142" stroke="#374151" stroke-width="1"/>

  <!-- PLC IP address -->
  <text x="131" y="158" font-family="'Courier New',monospace" font-size="11" fill="#4b5563">IP: ${plcIp}</text>
</svg>`;
}

class PlcReadOperatingMode extends MCPTool<PlcReadOperatingModeInput> {
  name = "Plc-ReadOperatingMode";
  description = `
With the Plc.ReadOperatingMode method you can read the operating mode of the CPU.
Returns a visual panel showing the current mode (RUN/STOP) and prompts the operator
to switch modes if desired.
To call the Plc.ReadOperatingMode method, you need the "read_diagnostics" authorization.
Possible error messages:
 2 Permission denied || The current authentication token is not authorized to call this method.
                     || Log on with a user account that has sufficient privileges to call this method.
  `;

  schema = {
    plcIpAddress: {
      type: ipAddressSchema,
      description: "PLC IP Address",
    },
  };

  async execute(input: PlcReadOperatingModeInput) {
    try {
      const method = {
        id: jsonRpcIdGenerator.getNextId(),
        jsonrpc: "2.0",
        method: "Plc.ReadOperatingMode",
      };

      const data = await sendReq(input.plcIpAddress, credentialsStore.get(input.plcIpAddress), method);
      const mode: string = (data?.result ?? data ?? "unknown").toString().toLowerCase();

      // Build SVG visual for current mode
      const svgBase64 = Buffer.from(generateModeSvg(mode, input.plcIpAddress)).toString("base64");

      // Try MCP elicitation to let the operator choose an action interactively
      const sdkServer = getSdkServer();
      if (sdkServer) {
        try {
          const targetMode = mode === "run" ? "stop" : "run";

          const elicitResult = await sdkServer.elicitInput({
            message: `PLC [${input.plcIpAddress}] is currently in ${mode.toUpperCase()} mode. Select an action:`,
            requestedSchema: {
              type: "object",
              properties: {
                action: {
                  type: "string",
                  title: "Operating Mode Action",
                  description: "Choose what to do with the PLC operating mode",
                  enum: [`switch_to_${targetMode}`, "keep_current"],
                  enumNames: [
                    `▶  Switch to ${targetMode.toUpperCase()}`,
                    `✔  Keep ${mode.toUpperCase()} (no change)`,
                  ],
                },
              },
              required: ["action"],
            },
          });

          if (
            elicitResult.action === "accept" &&
            elicitResult.content?.action === `switch_to_${targetMode}`
          ) {
            // Operator selected mode change — execute it
            const changeMethod = {
              id: jsonRpcIdGenerator.getNextId(),
              jsonrpc: "2.0",
              method: "Plc.RequestChangeOperatingMode",
              params: { mode: targetMode },
            };

            const changeData = await sendReq(
              input.plcIpAddress,
              credentialsStore.get(input.plcIpAddress),
              changeMethod
            );

            const accepted = changeData?.result ?? false;
            const newSvgBase64 = Buffer.from(generateModeSvg(targetMode, input.plcIpAddress)).toString("base64");

            return [
              { type: "image", data: newSvgBase64, mimeType: "image/svg+xml" },
              {
                type: "text",
                text: `Mode change to ${targetMode.toUpperCase()} ${accepted ? "accepted by PLC." : "rejected by PLC."}`,
              },
            ];
          }

          // Operator chose to keep current mode or cancelled
          return [
            { type: "image", data: svgBase64, mimeType: "image/svg+xml" },
            { type: "text", text: `PLC [${input.plcIpAddress}] operating mode: ${mode.toUpperCase()}` },
          ];
        } catch (elicitErr: any) {
          // Elicitation not supported by this client — fall through to plain response
          logger.warn(`Plc-ReadOperatingMode || Elicitation unavailable: ${elicitErr.message}`);
        }
      }

      // Fallback: return visual + text without elicitation
      return [
        { type: "image", data: svgBase64, mimeType: "image/svg+xml" },
        { type: "text", text: `PLC [${input.plcIpAddress}] operating mode: ${mode.toUpperCase()}` },
      ];
    } catch (err: any) {
      logger.error(`Tool 'Plc-ReadOperatingMode' || Error: ${err.message}`);
      return `Tool 'Plc-ReadOperatingMode' || Error: ${JSON.stringify(err.message, null, 2)}`;
    }
  }
}

export default PlcReadOperatingMode;
