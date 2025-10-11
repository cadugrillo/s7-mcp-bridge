import { logger } from "mcp-framework";
// ------------------------------------------------------------------------------------------------------------------------------------------------
// send request function
// ------------------------------------------------------------------------------------------------------------------------------------------------
export const sendReq = async (plcIpAddress: any, authInfos: any, method: any) => {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (authInfos?.token) {
      headers["X-Auth-Token"] = `${authInfos.token}`;
    }
    const response = await fetch(`https://${plcIpAddress}/api/jsonrpc`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(method),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error(
        `send request || request failed with status ${response.status}: ${errorBody}`
      );
    }

    const jsonResponse = await response.json();

    if (jsonResponse.errors) {
      logger.error(`send request || errors:" ${JSON.stringify(jsonResponse.errors, null, 2)}`);
    }
    return jsonResponse;
    
  } catch (error: any) {
    logger.error(`send request || error:" ${error.message}`);
    throw error;
  }
};
