import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { sendReq } from "../utils/Fetch.js";
import { credentialsStore } from "../utils/CredentialStore.js";
import { objectOperatingModeType } from "../utils/Enum.js";
import { ipAddressSchema } from "../utils/Schemas.js";
import { jsonRpcIdGenerator } from "../utils/JsonRpcIdGenerator.js";

interface PlcRequestChangeOperatingModeInput {
  plcIpAddress: string;
  mode: string;
}

interface Params {
  mode?: string;
}

const PlcRequestChangeOperatingModeSchema = z.object({
  plcIpAddress: ipAddressSchema.describe("PLC IP Address"),
  mode: objectOperatingModeType.describe("Requested operating mode"),
});

class PlcRequestChangeOperatingMode extends MCPTool<PlcRequestChangeOperatingModeInput> {
  name = "Plc-RequestChangeOperatingMode";
  description = `
With the Plc.RequestChangeOperatingMode method, you request a new operating mode for the CPU.
To call the Plc.ReadOperatingMode method, you need the "read_diagnostics" authorization.

Structure of the request:

The following table informs you about the necessary parameters for the request.

| Name   | Required                | Data type                   | Description |
|--------|-------------------------|-----------------------------|-------------|
| mode   | yes                     | string                      | Requested operating mode: "stop" for STOP mode or "run" for RUN mode |

Possible error messages:
 2 Permission denied || The current authentication token is not authorized to call this method.
                     || Log on with a user account that has sufficient privileges to call this method.
  `;

  schema = PlcRequestChangeOperatingModeSchema;

  async execute(input: PlcRequestChangeOperatingModeInput) {
    try {
      const params: Params = {};
      params["mode"] = input.mode;

      const method = {
        id: jsonRpcIdGenerator.getNextId(),
        jsonrpc: "2.0",
        method: "Plc.RequestChangeOperatingMode",
        params,
      };
      const data = await sendReq(input.plcIpAddress, credentialsStore.get(input.plcIpAddress), method);
      return JSON.stringify(data?.result ? { NewOperatingModeAccepted: data.result } : data, null, 2);
    } catch (err: any) {
      logger.error(`Tool 'Plc-RequestChangeOperatingMode' || Error: ${err.message}`);
      return `Tool 'Plc-RequestChangeOperatingMode' || Error: ${JSON.stringify(err.message, null, 2)}`;
    }
  }
}

export default PlcRequestChangeOperatingMode;