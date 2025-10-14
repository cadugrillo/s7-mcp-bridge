import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { sendReq } from "../utils/Fetch.js";
import { credentialsStore } from "../utils/CredentialStore.js";
import { AlarmsBrowseFiltersRequestType } from "../utils/Enum.js";

interface AlarmsBrowseInput {
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

const AlarmsBrowseSchema = z.object({
  plcIpAddress: z.string().min(1, "plc ip address cannot be empty.").describe("PLC IP Address"),
  language: z.string().min(1, "language cannot be empty.").default("en-US").describe("The desired language in which the text is returned in RFC 4647 format, e.g. \"en-US\""),
  count: z.number().optional().describe("The maximum number of alarm entries that are returned. The default value is 50. If you want to determine the current status of the diagnostics buffer, enter 0 as \"count\"."),
  alarm_id: z.string().optional().describe("The alarm ID of the CPU for which you are requesting data. If the Alarm ID is included, only the \"count\" parameter can be offered as a filter."),
  filters: AlarmsBrowseFiltersRequestType.optional().default({
    mode: "include",
    attributes: ["alarm_text", "status", "timestamp"],
  }).describe("Optional object containing parameters for filtering the response"),
});

class AlarmsBrowse extends MCPTool<AlarmsBrowseInput> {
  name = "Alarms-Browse";
  description = `
With this method you can determine which alarms are currently active on the CPU, and when the last change occurred within the diagnostics buffer.
To call the Alarms.Browse method, you need the "read_diagnostics" permission.

Structure of the request

The following table provides information about the individual parameters of the request.

Table: Alarms_Browse_Request (object)

| Name | Required | Data type | Description |
|------|----------|-----------|-------------|
| language | Yes | string | The desired language in which the text is returned in RFC 4647 format, e.g. "en-US" |
| count | No | number | The maximum number of alarm entries that are returned.<br><br>The default value is 50. If you want to determine the current status of the diagnostics buffer, enter 0 as "count". |
| alarm_id | No | string | The alarm ID of the CPU for which you are requesting data. If the Alarm ID is included, only the "count" parameter can be offered as a filter. |
| filters | No | object of type Alarms_Browse_<br><br>Filters_Request | Optional object containing parameters for filtering the response |

Table: Alarms_Browse_Filters_Request (object)

| Name | Required | Data type | Description |
|------|----------|-----------|-------------|
| mode | Yes | string | The mode that determines whether attributes are to be included or excluded in the response.<br><br>The following modes are available:<br><br>• include<br>• exclude |
| filters.attributes | Yes | array of strings | Possible array entries are:<br><br>• "alarm_text"<br>• "info_text"<br>• "status"<br>• "timestamp"<br>• "acknowledgement"<br>• "alarm_number"<br>• "producer" |

Examples:

The following example shows a request for reading a single alarm with all alarm areas in the English language:

{
"language": "en-US",
"alarm_id": "1231231231"
}
The following example shows the request for reading a single alarm without the alarm areas excluded under "exclude":

{
"language": "en-US",
"alarm_id": "1231231231",
"filters":
{
"mode": "exclude",
"attributes": ["alarm_text", "info_text"],
}
}
The following example shows the request for reading 50 alarms with the alarm ranges included in "include".

{
"language": "en-US",
"count": 50,
"filters":
{
"mode": "include",
"attributes": ["status", "acknowledgement"]
}
}

Possible error messages:
2   Permission denied  || The current authentication token is not authorized to call this method. Log on with a user account that has sufficient privileges to call this method.
800 Invalid alarm ID   || The alarm ID provided is invalid.
801 Invalid parameters || The request is invalid because provided parameters are invalid (e.g. the parameters "count" and "id" are present at the same time).
  `;

  schema = AlarmsBrowseSchema;

  async execute(input: AlarmsBrowseInput) {
    try {
      const params: Params = {};

      params["language"] = input.language;
      if (input.count) {
        params["count"] = input.count;
      }
      if (input.alarm_id) {
        params["alarm_id"] = input.alarm_id;
      }
      if (input.filters) {
        params["filters"] = input.filters;
      }
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "Alarms.Browse",
        params,
      };
      const data = await sendReq(input.plcIpAddress, credentialsStore.get(input.plcIpAddress), method);
      return JSON.stringify(data?.result ? data.result : data, null, 2);
    } catch (err: any) {
      logger.error(`Tool 'Alarms-Browse' || Error: ${err.message}`);
      return `Tool 'Alarms-Browse' || Error: ${JSON.stringify(err.message, null, 2)}`;
    }
  }
}

export default AlarmsBrowse;