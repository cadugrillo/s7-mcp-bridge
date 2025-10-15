import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { sendReq } from "../utils/Fetch.js";
import { ipAddressSchema } from "../utils/Schemas.js";
import { jsonRpcIdGenerator } from "../utils/JsonRpcIdGenerator.js";

interface BrowseInput {
  plcIpAddress: string;
}

class Browse extends MCPTool<BrowseInput> {
  name = "Api-Browse";
  description = `
The Api.Browse method gives you a list of all methods that you can call via the Web API with the current firmware.
This provides you with an overview of all the methods supported by the CPU. No authorization is required for calling the Api.Browse method.
Possible error messages:
4 No resources || The system does not have the necessary resources to execute the Web API request.
                  Perform the request again as soon as enough resources are available again.
  `;

  schema = {
    plcIpAddress: {
      type: ipAddressSchema,
      description: "PLC IP Address",
    },
  };

  async execute(input: BrowseInput) {
    try {
      const method = {
        id: jsonRpcIdGenerator.getNextId(),
        jsonrpc: "2.0",
        method: "Api.Browse",
      };
      const data = await sendReq(input.plcIpAddress, null, method);
      return JSON.stringify(data?.result ? data.result : data, null, 2);
    } catch (err: any) {
      logger.error(`Tool 'Api-Browse' || Error: ${err.message}`);
      return `Tool 'Api-Browse' || Error: ${JSON.stringify(err.message, null, 2)}`;
    }
  }
}

export default Browse;