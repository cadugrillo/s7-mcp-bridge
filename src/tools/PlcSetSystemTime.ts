import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { sendReq } from "../utils/Fetch.js";
import { credentialsStore } from "../utils/CredentialStore.js";

interface PlcSetSystemTimeInput {
  plcIpAddress: string;
  timestamp: string;
}

interface Params {
  timestamp?: string;
}

const PlcSetSystemTimeSchema = z.object({
  plcIpAddress: z.string().min(1, "plc ip address cannot be empty.").describe("PLC IP Address"),
  timestamp: z
      .string()
      .datetime({
        message: "Invalid ISO 8601 datetime string for timestamp",
      })
      .min(1, "datetime cannot be empty.").describe("ISO 8601 timestamp as a string in nanoseconds"),
});

class PlcSetSystemTime extends MCPTool<PlcSetSystemTimeInput> {
  name = "Plc-SetSystemTime";
  description = `
Use this API method to set the system time of the CPU (PLC local time).
To call the Plc.SetSystemTime method, you need the "change_time_settings" permission.

Structure of the request:

The following table contains information about the parameters of the request:

| Name        | Required                | Data type                   | Description |
|-------------|-------------------------|-----------------------------|-------------|
| timestamp   | yes                     | string                      | ISO 8601 timestamp as a string in nanoseconds; represents the time stamp of the system time to be set. |

Possible error messages:
 2   Permission denied                  || The current authentication token is not authorized to call this method.
                                        || Log in with a user account that has sufficient authorizations to call this method.
 900 Invalid timestamp                  || The time stamp used does not match the required time-stamp format (ISO time-stamp defaults).
 901 Time not within allowed time range || The time stamp is not within the allowed period for time stamps.
                                        || The end of the possible timespan is 2200-12-31T23:59:59.999999999Z
  `;

  schema = PlcSetSystemTimeSchema;

  async execute(input: PlcSetSystemTimeInput) {
    try {
      const params: Params = {};
      params["timestamp"] = input.timestamp;

      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "Plc.SetSystemTime",
        params,
      };
      const data = await sendReq(input.plcIpAddress, credentialsStore.get(input.plcIpAddress), method);
      return JSON.stringify(data?.result ? data.result : data, null, 2);
    } catch (err: any) {
      logger.error(`Tool 'Plc-SetSystemTime' || Error: ${err.message}`);
      return `Tool 'Plc-SetSystemTime' || Error: ${JSON.stringify(err.message, null, 2)}`;
    }
  }
}

export default PlcSetSystemTime;