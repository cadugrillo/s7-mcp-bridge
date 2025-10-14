import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { sendReq } from "../utils/Fetch.js";
import { credentialsStore } from "../utils/CredentialStore.js";

interface ChangePasswordInput {
  plcIpAddress: string;
  username: string;
  password: string;
  new_password: string;
}

class ChangePassword extends MCPTool<ChangePasswordInput> {
  name = "Api-ChangePassword";
  description = `
You can change the password for a user account with the Api.ChangePassword method.
Recommendation: Before changing a password, read the password policy from the CPU using the Api.GetPasswordPolicy API method.
If the new password does not conform to the password policy of the CPU, a corresponding error message is returned.
No prior authorizations are required to call the Api.ChangePassword method, but you must enter the current password for this call.

Response structure:
If successful, the server returns the Boolean value "true".

Possible error messages:
 5   System is read-only                          || The memory card is write-protected. Therefore, the password cannot be changed.
 6   Not accepted                                 || The password change is not performed because a CPU was configured with firmware version < V3.1. The method can only be used with CPUs as of firmware version V3.1.
 100 Login failed                                 || The user name and password combination is invalid. Assign a permissible user name and a permissible password. Another reason why the login failed may be an active brute force attack.
 103 New password does not follow password policy || The provided new password does not match with the required password policy. Assign a password conforming to the password policy. The Api.GetPasswordPolicy method provides you with the password policy of the CPU, if the CPU is in "local" authentication mode.
 104 New password matches former password         || The new password is identical with the previous password. Assign a different password. Note that the CPU does not store a password history. The comparison is therefore only performed between the new and previous password.
  `;

  schema = {
    plcIpAddress: {
      type: z.string().min(1, "plc ip address cannot be empty."),
      description: "PLC IP Address",
    },
    username: {
      type: z.string().min(1, "Username cannot be empty."),
      description: "Username",
    },
    password: {
      type: z.string().min(1, "Password cannot be empty."),
      description: "Password",
    },
    new_password: {
      type: z.string().min(1, "New Password cannot be empty."),
      description: "New Password",
    },
  };

  async execute(input: ChangePasswordInput) {
    try {
      const params = {
        username: input.username,
        password: input.password,
        new_password: input.new_password,
      };
      const method = {
        id: 45,
        jsonrpc: "2.0",
        method: "Api.ChangePassword",
        params,
      };
      const data = await sendReq(input.plcIpAddress, credentialsStore.get(input.plcIpAddress), method);
      return JSON.stringify(data?.result ? { NewPasswordAccepted: data.result } : data, null, 2);
    } catch (err: any) {
      logger.error(`Tool 'Api-ChangePassword' || Error: ${err.message}`);
      return `Tool 'Api-ChangePassword' || Error: ${JSON.stringify(err.message, null, 2)}`;
    }
  }
}

export default ChangePassword;