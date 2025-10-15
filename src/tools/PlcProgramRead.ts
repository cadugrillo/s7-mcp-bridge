import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { sendReq } from "../utils/Fetch.js";
import { credentialsStore } from "../utils/CredentialStore.js";
import { objectReadType } from "../utils/Enum.js";
import { ipAddressSchema } from "../utils/Schemas.js";
import { jsonRpcIdGenerator } from "../utils/JsonRpcIdGenerator.js";

interface PlcProgramReadInput {
  plcIpAddress: string;
  _var: string;
  mode: string;
}

interface Params {
  mode?: string;
  var?: string;
}

const PlcProgramReadSchema = z.object({
  plcIpAddress: ipAddressSchema.describe("PLC IP Address"),
  _var: z.string().optional().default("").describe("Name of the tag to be searched"),
  mode: objectReadType.optional().default("simple").describe("Always use the \"simple\" mode"),
});

class PlcProgramRead extends MCPTool<PlcProgramReadInput> {
  name = "PlcProgram-Read";
  description = `
 Use the this method to read a single variable from a CPU.
To call the PlcProgram.Read method, you need the "read_value" authorization.

Structure of the request:

The following table provides information about the individual parameters of the request.

| Name  | Required                | Data type                   | Description |
|-------|-------------------------|-----------------------------|-------------|
| var   | yes                     | string                      | Name of the tag to be read. |
| mode  | no, default is "simple" | string                      | Always use the "simple" mode |


Example 1:
In the following example, the user requests a global tag in the "simple" representation.

{
"var": "\"MotorSpeed\""
}

Example 2:
In the following example, the user requests a data block tag in the "simple" representation.

{
"var": "\"MyDB\".MyVariable",
}


 Possible error messages:
  1   Internal error         || An internal error in the desired operation.
  2   Permission denied      || The current authentication token is not authorized to call this method.
                             || Log on with a user account that has sufficient privileges to call this method.
  4   No resources           || The system does not have the necessary resources to read the requested address. 
                             || Carry out the request again as soon as sufficient resources are available.
  200 Address does not exist || The requested address does not exist or the Web server cannot access it.
  201 Invalid address        || The name structure of the symbolic address is not correct.
  203 Invalid array index    || The dimensions and limits of the array indexes do not correspond to the type information of the CPU.
  `;

  schema = PlcProgramReadSchema;

  async execute(input: PlcProgramReadInput) {
    try {
      const params: Params = {};
      params["var"] = input._var;
      if (input.mode) {
        params["mode"] = input.mode;
      }
      const method = {
        id: jsonRpcIdGenerator.getNextId(),
        jsonrpc: "2.0",
        method: "PlcProgram.Read",
        params,
      };
      const data = await sendReq(input.plcIpAddress, credentialsStore.get(input.plcIpAddress), method);
      return JSON.stringify(data?.result ? data.result : data, null, 2);
    } catch (err: any) {
      logger.error(`Tool 'PlcProgram-Read' || Error: ${err.message}`);
      return `Tool 'PlcProgram-Read' || Error: ${JSON.stringify(err.message, null, 2)}`;
    }
  }
}

export default PlcProgramRead;