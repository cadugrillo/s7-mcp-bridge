import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { sendReq } from "../utils/Fetch.js";
import { ipAddressSchema } from "../utils/Schemas.js";

interface VersionInput {
  plcIpAddress: string;
}

class Version extends MCPTool<VersionInput> {
  name = "Api-Version";
  description = `
Use the Api.Version method to request the current version number of the Web API. You can draw conclusions from the version number:
• The functions supported by the CPU version
• The hardware functional status of the CPU
This information lets you implement applications that dynamically adapt to the scope of
functions offered by the contacted CPU. An application can support multiple CPU versions.
No authorization is required for calling the Api.Version method
  `;

  schema = {
    plcIpAddress: {
      type: ipAddressSchema,
      description: "PLC IP Address",
    },
  };

  async execute(input: VersionInput) {
    try {
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "Api.Version",
      };
      const data = await sendReq(input.plcIpAddress, null, method);
      return JSON.stringify(data?.result ? data.result : data, null, 2);
    } catch (err: any) {
      logger.error(`Tool 'Api-Version' || Error: ${err.message}`);
      return `Tool 'Api-Version' || Error: ${JSON.stringify(err.message, null, 2)}`;
    }
  }
}

export default Version;