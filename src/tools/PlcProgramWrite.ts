import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { sendReq } from "../utils/Fetch.js";
import { credentialsStore } from "../utils/CredentialStore.js";
import { objectReadType } from "../utils/Enum.js";

interface PlcProgramWriteInput {
  plcIpAddress: string;
  _var: string;
  value: boolean | number | string;
  mode: string;
}

interface Params {
  mode?: string;
  var?: string;
  value?: boolean | number | string;
}

const PlcProgramWriteSchema = z.object({
  plcIpAddress: z.string().min(1, "plc ip address cannot be empty.").describe("PLC IP Address"),
  _var: z.string().optional().default("").describe("Name of the tag to be searched"),
  value: z.union([z.boolean(), z.number(), z.string()]).describe("The value to be written"),
  mode: objectReadType.optional().default("simple").describe("Always use the \"simple\" mode"),
});

class PlcProgramWrite extends MCPTool<PlcProgramWriteInput> {
  name = "PlcProgram-Write";
  description = `
This method is used to write a single process tag to the CPU.
To call the PlcProgram.Write method, you require "write_value" authorization.

Structure of the request:

The following table provides information about the individual parameters of the request.

| Name  | Required                | Data type                   | Description |
|-------|-------------------------|-----------------------------|-------------|
| var   | yes                     | string                      | Name of the tag to be written. |
| value | yes                     | Boolean, Number or String   | The value to be written;<br><br>The value depends on the operating mode. |
| mode  | no, default is "simple" | string                      | Always use the "simple" mode |

Example 1:
In the following example, the user writes a global tag in the "simple" display.

{
"var": "\"MotorSpeed\"",
"value": 9001
}

Example 2:
In the following example, the user writes a tag to a data block in the "simple" display.
{
"var": "\"MyDB\".MyVariable",
"value": true
}

Example 3:
In the following example, the user writes a string tag consisting of 10 characters to the
"simple" representation.
{
"var": "\"MyDB\".MyString",
"value": "Short Str"
}

Possible error messages:
1   Internal error         || An internal error in the desired operation.
2   Permission denied      || The current authentication token is not authorized to call this method.
                           || Log on with a user account that has sufficient privileges to call this method.
4   No resources           || The system does not have the necessary resources to write the requested address.
                           || Carry out the request again as soon as sufficient resources are available.
200 Address does not exist || The requested address does not exist or the Web server cannot access the requested address.
201 Invalid address        || The name structure of the symbolic address is not correct.
203 Invalid array index    || The dimensions and limits of the array indexes do not correspond to the type information of the CPU.
204 Unsupported address    || The data type of the address cannot be written.
  `;

  schema = PlcProgramWriteSchema;

  async execute(input: PlcProgramWriteInput) {
    try {
      const params: Params = {};
      params["var"] = input._var;
      params["value"] = input.value;
      params["mode"] = "simple";
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "PlcProgram.Write",
        params,
      };
      const data = await sendReq(input.plcIpAddress, credentialsStore.get(input.plcIpAddress), method);
      return JSON.stringify(data?.result ? { NewValueAccepted: data.result } : data, null, 2);
    } catch (err: any) {
      logger.error(`Tool 'PlcProgram-Write' || Error: ${err.message}`);
      return `Tool 'PlcProgram-Write' || Error: ${JSON.stringify(err.message, null, 2)}`;
    }
  }
}

export default PlcProgramWrite;