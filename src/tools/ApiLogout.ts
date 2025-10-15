import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { sendReq } from "../utils/Fetch.js";
import { credentialsStore } from "../utils/CredentialStore.js";
import { ipAddressSchema } from "../utils/Schemas.js";
import { jsonRpcIdGenerator } from "../utils/JsonRpcIdGenerator.js";

interface LogoutInput {
  plcIpAddress: string;
}

class Logout extends MCPTool<LogoutInput> {
  name = "Api-Logout";
  description = `
The Api.Logout method removes the token from the list of active Web API sessions and ends the session.
The Api.Logout method returns the status of whether the logout was successful or not.
For security reasons, however, the method always returns the Boolean value "true" even if the token is invalid.
  `;

  schema = {
    plcIpAddress: {
      type: ipAddressSchema,
      description: "PLC IP Address",
    },
  };

  async execute(input: LogoutInput) {
    try {
      const method = {
        id: jsonRpcIdGenerator.getNextId(),
        jsonrpc: "2.0",
        method: "Api.Logout",
      };
      const data = await sendReq(input.plcIpAddress, credentialsStore.get(input.plcIpAddress), method);
      if (data?.result) {

        // Remove credentials from the store on successful logout
        credentialsStore.delete(input.plcIpAddress);
      }
      return data?.result ? "Tool 'Api-Logout' || Logout successfully completed." : JSON.stringify(data, null, 2);
    } catch (err: any) {
      logger.error(`Tool 'Api-Logout' || Error: ${err.message}`);
      return `Tool 'Api-Logout' || Error: ${JSON.stringify(err.message, null, 2)}`;
    }
  }
}

export default Logout;