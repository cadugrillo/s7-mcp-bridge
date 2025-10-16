import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { sendReq } from "../utils/Fetch.js";
import { credentialsStore } from "../utils/CredentialStore.js";
import { ipAddressSchema } from "../utils/Schemas.js";
import { jsonRpcIdGenerator } from "../utils/JsonRpcIdGenerator.js";

interface ApiCloseTicketInput {
  plcIpAddress: string;
  id: string;
}

interface Params {
  id?: string;
}

const ApiCloseTicketSchema = z.object({
  plcIpAddress: ipAddressSchema.describe("PLC IP Address"),
  id: z.string().min(1, "id cannot be empty.").describe("The ticket ID to be closed."),
});

class ApiCloseTicket extends MCPTool<ApiCloseTicketInput> {
  name = "Api-CloseTicket";
  description = `
You use the Api.DeleteTicket method to delete a ticket provided by the system that is assigned to the current user session.
To call the Api.CloseTicket method, you do not need an authorization but a valid session token.

Structure of the request:

The following table informs you about the necessary parameters for the request.

| Name  | Required   | Data type   | Description |
|-------|------------|-------------|-------------|
| id    | yes        | string      | The ticket ID that was returned by Plc.CreateBackup method for use by the ticket system. |

Possible error messages: 
400 Not Found || The returned ticket ID does not exist in the ticket list of the user. The returned ticket ID or does not match the assigned session token.
  `;

  schema = ApiCloseTicketSchema;

  async execute(input: ApiCloseTicketInput) {
    try {
      const params: Params = {};

      params["id"] = input.id;

      const method = {
        id: jsonRpcIdGenerator.getNextId(),
        jsonrpc: "2.0",
        method: "Api.CloseTicket",
        params,
      };
      const data = await sendReq(input.plcIpAddress, credentialsStore.get(input.plcIpAddress), method);
      return JSON.stringify(data?.result ? { ticket_id: input.id, closed: data.result } : data, null, 2);
    } catch (err: any) {
      logger.error(`Tool 'Api-CloseTicket' || Error: ${err.message}`);
      return `Tool 'Api-CloseTicket' || Error: ${JSON.stringify(err.message, null, 2)}`;
    }
  }
}

export default ApiCloseTicket;