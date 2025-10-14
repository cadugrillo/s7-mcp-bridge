import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { sendReq } from "../utils/Fetch.js";
import { credentialsStore } from "../utils/CredentialStore.js";
import { ipAddressSchema } from "../utils/Schemas.js";

interface ProjectReadLanguagesInput {
  plcIpAddress: string;
}

const ProjectReadLanguagesSchema = z.object({
  plcIpAddress: ipAddressSchema.describe("PLC IP Address"),
});

class ProjectReadLanguages extends MCPTool<ProjectReadLanguagesInput> {
  name = "Project-ReadLanguages";
  description = `
This API method returns a list with the project languages available on the CPU.
You can then use the "Alarms.Browse" or "DiagnosticBuffer.Browse" API methods in one of the available languages to get alarm messages or diagnostic messages in the available languages.
To call the Project.ReadLanguages method, you need the "read_diagnostics" permission.

Structure of the request:

The following table show the structure of server responses to successful requests.

| Name        | Required                | Data type                                     | Description |
|-------------|-------------------------|-----------------------------------------------|-------------|
| languages   | yes                     | array of Project_ReadLanguages_Entry_Response | Object array, where each object represents a project language. |

Possible error messages:
2 Permission denied || The current authentication token is not authorized to call this method.
  `;

  schema = ProjectReadLanguagesSchema;

  async execute(input: ProjectReadLanguagesInput) {
    try {
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "Project.ReadLanguages",
      };
      const data = await sendReq(input.plcIpAddress, credentialsStore.get(input.plcIpAddress), method);
      return JSON.stringify(data?.result ? data.result : data, null, 2);
    } catch (err: any) {
      logger.error(`Tool 'Project-ReadLanguages' || Error: ${err.message}`);
      return `Tool 'Project-ReadLanguages' || Error: ${JSON.stringify(err.message, null, 2)}`;
    }
  }
}

export default ProjectReadLanguages;