import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { sendReq } from "../utils/Fetch.js";
import { credentialsStore } from "../utils/CredentialStore.js";

interface PlcReadOperatingModeInput {
  plcIpAddress: string;
}

class PlcReadOperatingMode extends MCPTool<PlcReadOperatingModeInput> {
  name = "Plc-ReadOperatingMode";
  description = `
With the Plc.ReadOperatingMode method you can read the operating mode of the CPU.
To call the Plc.ReadOperatingMode method, you need the "read_diagnostics" authorization.
Possible error messages:
 2 Permission denied || The current authentication token is not authorized to call this method.
                     || Log on with a user account that has sufficient privileges to call this method.
  `;

  schema = {
    plcIpAddress: {
      type: z.string().min(1, "plc ip address cannot be empty."),
      description: "PLC IP Address",
    },
  };

  async execute(input: PlcReadOperatingModeInput) {
    try {
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "Plc.ReadOperatingMode",
      };
      const data = await sendReq(input.plcIpAddress, credentialsStore.get(input.plcIpAddress), method);
      return JSON.stringify(data?.result ? data.result : data, null, 2);
    } catch (err: any) {
      logger.error(`Tool 'Plc-ReadOperatingMode' || Error: ${err.message}`);
      return `Tool 'Plc-ReadOperatingMode' || Error: ${JSON.stringify(err.message, null, 2)}`;
    }
  }
}

export default PlcReadOperatingMode;