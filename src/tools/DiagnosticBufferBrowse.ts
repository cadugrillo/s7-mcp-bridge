import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { sendReq } from "../utils/Fetch.js";
import { credentialsStore } from "../utils/CredentialStore.js";
import { DiagnosticBufferBrowseFiltersRequestType } from "../utils/Enum.js";
import { ipAddressSchema } from "../utils/Schemas.js";
import { jsonRpcIdGenerator } from "../utils/JsonRpcIdGenerator.js";

interface DiagnosticBufferBrowseInput {
  plcIpAddress: string;
  language: string;
  count: number;
  filters: {};
}

interface Params {
  language?: string;
  count?: number;
  filters?: {};
}

const DiagnosticBufferBrowseSchema = z.object({
  plcIpAddress: ipAddressSchema.describe("PLC IP Address"),
  language: z.string().min(1, "language cannot be empty.").default("en-US").describe("The desired language in which the text is returned in RFC 4647 format, e.g. \"en-US\""),
  count: z.number().optional().describe("The maximum number of alarm entries that are returned. The default value is 50. If you want to determine the current status of the diagnostics buffer, enter 0 as \"count\"."),
  filters: DiagnosticBufferBrowseFiltersRequestType.optional().default({
    mode: "include",
    attributes: ["short_text", "long_text", "help_text"],
  }).describe("Optional object containing parameters for filtering the response"),
});

class DiagnosticBufferBrowse extends MCPTool<DiagnosticBufferBrowseInput> {
  name = "DiagnosticBuffer-Browse";
  description = `
With this method you read out entries from the diagnostics buffer of the CPU.
To call the DiagnosticBuffer.Browse method, you need the "read_diagnostics" permission.

Structure of the request:

The following table provides information about the individual parameters of the request.

Table: DiagnosticBuffer_Browse_Request (object)

| Name | Required | Data type | Description |
|------|----------|-----------|-------------|
| language | Yes | string | The desired language in which the text is returned in RFC 4647 format, e.g. "en-US" |
| count | No | number | The maximum number of alarm entries that are returned.<br><br>The default value is 50. If you want to determine the current status of the diagnostics buffer, enter 0 as "count". |
| filters | No | object of type DiagnosticBuffer_options.<br><br>Browse_Filters_<br><br>Request | The object that represents the different filtering |

Table: DiagnosticBuffer_Browse_Filters_Request (object)

| Name | Required | Data type | Description |
|------|----------|-----------|-------------|
| attributes | Yes | array of strings | The following attributes are possible for the diagnostics buffer entries:<br><br>• short_text<br>• long_text<br>• help_text |
| mode | Yes | string | The mode that determines whether attributes are to be included or excluded in the request.<br><br>The following modes are available:<br><br>• include<br>• exclude |


Example:

The following example shows a request of the diagnostic entries as LCID value 1033 (dec value), which stands for "English United States".

{
"language": "en-US",
"count": 50,
"entries":
{
"mode": "include",
"attributes": ["short_text", "long_text", "help_text"]
}
}

Possible error messages
2 Permission denied || The current authentication token is not authorized to call this method. Log on with a user account that has sufficient privileges to call this method
  `;

  schema = DiagnosticBufferBrowseSchema;

  async execute(input: DiagnosticBufferBrowseInput) {
    try {
      const params: Params = {};

      params["language"] = input.language;
      if (input.count) {
        params["count"] = input.count;
      }
      if (input.filters) {
        params["filters"] = input.filters;
      }
      const method = {
        id: jsonRpcIdGenerator.getNextId(),
        jsonrpc: "2.0",
        method: "DiagnosticBuffer.Browse",
        params,
      };
      const data = await sendReq(input.plcIpAddress, credentialsStore.get(input.plcIpAddress), method);
      return JSON.stringify(data?.result ? data.result : data, null, 2);
    } catch (err: any) {
      logger.error(`Tool 'DiagnosticBuffer-Browse' || Error: ${err.message}`);
      return `Tool 'DiagnosticBuffer-Browse' || Error: ${JSON.stringify(err.message, null, 2)}`;
    }
  }
}

export default DiagnosticBufferBrowse;