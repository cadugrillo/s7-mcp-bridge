import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { sendReq } from "../utils/Fetch.js";
import { credentialsStore } from "../utils/CredentialStore.js";
import { ipAddressSchema } from "../utils/Schemas.js";
import { jsonRpcIdGenerator } from "../utils/JsonRpcIdGenerator.js";

interface PlcReadSystemTimeInput {
  plcIpAddress: string;
}

const PlcReadSystemTimeSchema = z.object({
  plcIpAddress: ipAddressSchema.describe("PLC IP Address"),
});

class PlcReadSystemTime extends MCPTool<PlcReadSystemTimeInput> {
  name = "Plc-ReadSystemTime";
  description = `
This API method provides the system time of the CPU. If you have synchronized the system
time of the CPU, for example via the TIA Portal function "Online & diagnostics", the system
time corresponds to Coordinated Universal Time (UTC).
  `;

  schema = PlcReadSystemTimeSchema;

  async execute(input: PlcReadSystemTimeInput) {
    try {
      const method = {
        id: jsonRpcIdGenerator.getNextId(),
        jsonrpc: "2.0",
        method: "Plc.ReadSystemTime",
      };
      const data = await sendReq(input.plcIpAddress, credentialsStore.get(input.plcIpAddress), method);
      return JSON.stringify(data?.result ? data.result : data, null, 2);
    } catch (err: any) {
      logger.error(`Tool 'Plc-ReadSystemTime' || Error: ${err.message}`);
      return `Tool 'Plc-ReadSystemTime' || Error: ${JSON.stringify(err.message, null, 2)}`;
    }
  }
}

export default PlcReadSystemTime;