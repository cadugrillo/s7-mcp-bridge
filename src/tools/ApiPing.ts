import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { sendReq } from "../utils/Fetch.js";
import { ipAddressSchema } from "../utils/Schemas.js";
import { jsonRpcIdGenerator } from "../utils/JsonRpcIdGenerator.js";

interface PingInput {
  plcIpAddress: string;
}

class Ping extends MCPTool<PingInput> {
  name = "Api-Ping";
  description = `
  The Api.Ping method outputs a unique ID for the CPU used. You can use it to determine whether the CPU can be reached.
  The CPU ID comprises a 28-byte string.
  The system assigns a new, unique CPU ID after each restart (POWER ON - POWER OFF) or warm start of the CPU.
  By comparing this with previously output IDs, you can also determine whether the CPU was restarted in the meantime.
  No authorization is required for calling the Api.Ping method.
  `;

  schema = {
    plcIpAddress: {
      type: ipAddressSchema,
      description: "PLC IP Address",
    },
  };

  async execute(input: PingInput) {
    try {
      const method = {
        id: jsonRpcIdGenerator.getNextId(),
        jsonrpc: "2.0",
        method: "Api.Ping",
      };
      const data = await sendReq(input.plcIpAddress, null, method);
      return JSON.stringify(data?.result ? { uID: data.result } : data, null, 2);
    } catch (err: any) {
      logger.error(`Tool 'Api-Ping' || Error: ${err.message}`);
      return `Tool 'Api-Ping' || Error: ${JSON.stringify(err.message, null, 2)}`;
    }
  }
}

export default Ping;