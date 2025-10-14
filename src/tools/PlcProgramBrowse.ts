import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { sendReq } from "../utils/Fetch.js";
import { credentialsStore } from "../utils/CredentialStore.js";
import { objectTypeType } from "../utils/Enum.js";

interface PlcProgramBrowseInput {
  plcIpAddress: string;
  _var: string;
  mode: string;
  type: string[];
}

interface Params {
  mode?: string;
  var?: string;
  type?: string[];
  value?: boolean | number | string;
  timestamp?: string;
}

const PlcProgramBrowseSchema = z.object({
  plcIpAddress: z.string().min(1, "plc ip address cannot be empty.").describe("PLC IP Address"),
  _var: z.string().optional().default("").describe("Name of the tag to be searched"),
  mode: z.string().min(1, "mode cannot be empty.").describe("Enumeration that determines the behavior of this method"),
  type: z.array(objectTypeType).optional().default([]).describe("array entries are: \"code_blocks\", \"data_blocks\", \"tags\""),

});

class PlcProgramBrowse extends MCPTool<PlcProgramBrowseInput> {
  name = "PlcProgram-Browse";
  description = `
 The PlcProgram.Browse method allows you to search for tags and the corresponding metadata according to your individual requirements.
 To call the PlcProgram.Browse method, you need the "read_value" authorization.

 Structure of the request:
 
 The following table informs you about the properties of the tag to be searched.

 | Name | Required                         | Data type       | Description |
 |------|----------------------------------|-----------------|-------------|
 | var  | Yes/no, see "Description" column | string          | Name of the tag to be searched. If this attribute is present, it cannot be an empty string.<br><br>• If "mode" = "var", then this attribute is required. The Browse method searches for the provided tag to retrieve the metadata of the tag<br>• If "mode" = "children", this attribute is optional. The Browse method searches for the tag and returns a list of child tags and metadata. |
 | mode | Yes                              | string          | Enumeration that determines the behavior of this method.<br><br>• "var": Displays information about the specified tag<br>• "children": Outputs information about the immediate descendants (children) of the specified tags. |
 | type | No                               | array of string | Possible array entries are:<br><br>• "code_blocks": Reads all code blocks<br>• "data_blocks": Reads all data blocks<br>• "tags": Removes all tags<br><br>If no "type" parameter is selected for compatibility reasons, only DBs and tags are returned. |


 Example 1:
 In the following example the user searches the root node ("root") of the CPU.

 {
"mode": "children"
 }

 Example 2:
 In the following example, the user searches the descendants (children) of a data block.

 {
 "var": "\"MyDB\"",
 "mode": "children"
 }

 Example 3:
 In the following example, the user requests information about a specific tag.

 {
 "var": "\"MyDB\".MyStruct.MyField",
 "mode": "var"
 }

 Example 4:
 In the following example, the user searches code blocks of a CPU.

 {
 "mode": "children",
 "type": ["code_blocks"]
 }

 Example 5:
 In the following example, the user searches the data blocks of a CPU.

 {
 "mode": "children",
 "type": ["data_blocks"]
 }

 Example 6:
 The following example shows the result of searching the root node "root" of the CPU.
 The "type" parameter is selected with all 3 possible array entries "data_blocks", "code_blocks" and "tags".

{
"var": "",
"type": ["data_blocks, "code_blocks", "tags"]
}

Possible error messages:
  1   Internal error              || An internal error in the desired operation.
  2   Permission denied           || The current authentication token is not authorized to call this method.
                                  || Log on with a user account that has sufficient privileges to call this method.
  3   System is busy              || The desired operation cannot be performed because the system is currently performing a different request.
                                  || Restart the query as soon as the current operation is complete.
  4   No resources                || The system does not have the required resources to retrieve the type information.
                                  || Perform the request again as soon as enough resources are available again.
  200 Address does not exist      || The requested address does not exist or the Web server cannot access the requested address.
  201 Invalid address             || The name structure of the symbolic address is not correct.
  202 Variable is not a structure || It is not possible to search the specific address because the tag is not a structured data type.
  203 Invalid array index         || The dimensions and limits of the array indexes do not correspond to the type information of the CPU.
  `;

  schema = PlcProgramBrowseSchema;

  async execute(input: PlcProgramBrowseInput) {
    try {
      const params: Params = {
        mode: input.mode,
      };
      if (input._var) {
        params["var"] = input._var;
      }
      if (input.type) {
        params["type"] = input.type;
      }
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "PlcProgram.Browse",
        params,
      };
      const data = await sendReq(input.plcIpAddress, credentialsStore.get(input.plcIpAddress), method);
      return JSON.stringify(data?.result ? data.result : data, null, 2);
    } catch (err: any) {
      logger.error(`Tool 'PlcProgram-Browse' || Error: ${err.message}`);
      return `Tool 'PlcProgram-Browse' || Error: ${JSON.stringify(err.message, null, 2)}`;
    }
  }
}

export default PlcProgramBrowse;