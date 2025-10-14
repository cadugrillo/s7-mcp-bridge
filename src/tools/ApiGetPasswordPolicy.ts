import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { sendReq } from "../utils/Fetch.js";
import { ipAddressSchema } from "../utils/Schemas.js";

interface GetPasswordPolicyInput {
  plcIpAddress: string;
}

class GetPasswordPolicy extends MCPTool<GetPasswordPolicyInput> {
  name = "Api-GetPasswordPolicy";
  description = `
Passwords must fulfill specific criteria to be secure. The Api.GetPasswordPolicy method provides you with the password policy of the CPU.
The password policy is a global setting in the STEP 7 project and applies for all users of the Web server.
The method does not contain any information on the expiration of the password.
Any user, including unauthenticated users ("Anonymous"), can call this API method.
No authorization is required for calling the Api.GetPasswordPolicy method.
Possible error messages:
 6 Not accepted || The password policy cannot be read because a CPU is configured with a firmware version < V3.1.
                || The method can only be used with CPUs as of firmware version V3.1
  `;

  schema = {
    plcIpAddress: {
      type: ipAddressSchema,
      description: "PLC IP Address",
    },
  };

  async execute(input: GetPasswordPolicyInput) {
    try {
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "Api.GetPasswordPolicy",
      };
      const data = await sendReq(input.plcIpAddress, null, method);
      return JSON.stringify(data?.result ? data.result : data, null, 2);
    } catch (err: any) {
      logger.error(`Tool 'Api-GetPasswordPolicy' || Error: ${err.message}`);
      return `Tool 'Api-GetPasswordPolicy' || Error: ${JSON.stringify(err.message, null, 2)}`;
    }
  }
}

export default GetPasswordPolicy;