import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { sendReq } from "../utils/Fetch.js";
import { credentialsStore } from "../utils/CredentialStore.js";
import { ipAddressSchema } from "../utils/Schemas.js";
import { jsonRpcIdGenerator } from "../utils/JsonRpcIdGenerator.js";

interface GetPermissionsInput {
  plcIpAddress: string;
}

class GetPermissions extends MCPTool<GetPermissionsInput> {
  name = "Api-GetPermissions";
  description = `
After the successful login, the Api.GetPermissions returns a list of actions for whose execution the user is authorized.
  `;

  schema = {
    plcIpAddress: {
      type: ipAddressSchema,
      description: "PLC IP Address",
    },
  };

  async execute(input: GetPermissionsInput) {
    try {
      const method = {
        id: jsonRpcIdGenerator.getNextId(),
        jsonrpc: "2.0",
        method: "Api.GetPermissions",
      };
      const data = await sendReq(input.plcIpAddress, credentialsStore.get(input.plcIpAddress), method);
      return JSON.stringify(data?.result ? data.result : data, null, 2);
    } catch (err: any) {
      logger.error(`Tool 'Api-GetPermissions' || Error: ${err.message}`);
      return `Tool 'Api-GetPermissions' || Error: ${JSON.stringify(err.message, null, 2)}`;
    }
  }
}

export default GetPermissions;