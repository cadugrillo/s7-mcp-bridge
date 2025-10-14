import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { sendReq } from "../utils/Fetch.js";
import { credentialsStore } from "../utils/CredentialStore.js";

interface AlarmsAcknowledgeInput {
  plcIpAddress: string;
  language: string;
  count: number;
  id: string;
  alarm_id: string;
  filters: {};
}

interface Params {
  language?: string;
  count?: number;
  id?: string;
  alarm_id?: string;
  filters?: {};
}

const AlarmsAcknowledgeSchema = z.object({
  plcIpAddress: z.string().min(1, "plc ip address cannot be empty.").describe("PLC IP Address"),
  id: z.string().min(1, "id cannot be empty.").describe("The alarm ID to acknowledge."),
});

class AlarmsAcknowledge extends MCPTool<AlarmsAcknowledgeInput> {
  name = "Alarms-Acknowledge";
  description = `
Use this method to acknowledge individual alarms.
To call the Alarms.Acknowledge method, you need the "acknowledge_alarms" permission.
Possible error messages: 
2 Permission denied || The current authentication token is not authorized to call this method. Log in with a user account that has sufficient authorizations to call this method
  `;

  schema = AlarmsAcknowledgeSchema;

  async execute(input: AlarmsAcknowledgeInput) {
    try {
      const params: Params = {};

      params["id"] = input.id;

      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "Alarms.Acknowledge",
        params,
      };
      const data = await sendReq(input.plcIpAddress, credentialsStore.get(input.plcIpAddress), method);
      return JSON.stringify(data?.result ? data.result : data, null, 2);
    } catch (err: any) {
      logger.error(`Tool 'Alarms-Acknowledge' || Error: ${err.message}`);
      return `Tool 'Alarms-Acknowledge' || Error: ${JSON.stringify(err.message, null, 2)}`;
    }
  }
}

export default AlarmsAcknowledge;