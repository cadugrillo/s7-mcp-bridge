import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { sendReq } from "../utils/Fetch.js";

interface GetQuantityStructuresInput {
  plcIpAddress: string;
}

class GetQuantityStructures extends MCPTool<GetQuantityStructuresInput> {
  name = "Api-GetQuantityStructures";
  description = `
The Api.GetQuantityStructures method returns different structure information of the Web server.
  `;

  schema = {
    plcIpAddress: {
      type: z.string().min(1, "plc ip address cannot be empty."),
      description: "PLC IP Address",
    },
  };

  async execute(input: GetQuantityStructuresInput) {
    try {
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "Api.GetQuantityStructures",
      };
      const data = await sendReq(input.plcIpAddress, null, method);
      return JSON.stringify(data?.result ? data.result : data, null, 2);
    } catch (err: any) {
      logger.error(`Tool 'Api-GetQuantityStructures' || Error: ${err.message}`);
      return `Tool 'Api-GetQuantityStructures' || Error: ${JSON.stringify(err.message, null, 2)}`;
    }
  }
}

export default GetQuantityStructures;