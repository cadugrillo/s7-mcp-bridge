import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { sendReq } from "../utils/Fetch.js";
import { credentialsStore } from "../utils/CredentialStore.js";
import { ipAddressSchema } from "../utils/Schemas.js";
import { jsonRpcIdGenerator } from "../utils/JsonRpcIdGenerator.js";

interface LoginInput {
  plcIpAddress: string;
  username: string;
  password: string;
}

class Login extends MCPTool<LoginInput> {
  name = "Api-Login";
  description = `
 The Api.Login method checks the login data of the user and on successful verification opens a new Web API session.
 The method requests the username and the password of the user in plain text as proof of authorization. Remember to ask the User for the username and password.
 Once the user has been successfully authenticated, the method returns a token that must be sent with every subsequent Web API request in order to authorize the request.
 The token is valid until the user logs out with the Api.Logout method or until the session expires due to inactivity.
 The duration of a session can be configured in the CPU under "Web server / Web services" in the TIA Portal.
 If a session expires, the user must log in again with the Api.Login method to obtain a new token.
 The user name and the password are encrypted before they are transferred to the server.

Possible error messages:
4   No resources                    || The system does not have the required resources to carry out this request. Perform the request again as soon as enough resources are available again.
100 Login failed                    || The user name and/or password are not permissible. Assign a permissible user name and a permissible password. Another reason why the login failed may be an active brute force attack.
101 Already authenticated           || The current X-Auth-Token is already authenticated. Use Api.Logout before you authenticate yourself again.
102 Login Failed - Password expired || The password of the user account has expired. The user must change the password in order to be able to successfully authenticate again
  `;

  schema = {
    plcIpAddress: {
      type: ipAddressSchema,
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
  };

  async execute(input: LoginInput) {
    try {
        const params = {
        user: input.username,
        password: input.password,
        include_web_application_cookie: true,
      };
      const method = {
        id: jsonRpcIdGenerator.getNextId(),
        jsonrpc: "2.0",
        method: "Api.Login",
        params,
      };
      const data = await sendReq(input.plcIpAddress, null, method);
      if (data?.result) {

        // Store credentials in the in-memory store
        credentialsStore.set(input.plcIpAddress, {
          user: input.username,
          pwd: input.password,
          token: data.result.token,
        });
      }
      return data?.result ? "Tool 'Api-Login' || Login successfully completed." : JSON.stringify(data.error, null, 2);
    } catch (err: any) {
      logger.error(`Tool 'Api-Login' || Error: ${err.message}`);
      return `Tool 'Api-Login' || Error: ${JSON.stringify(err.message, null, 2)}`;
    }
  }
}

export default Login;