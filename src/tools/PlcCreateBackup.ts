import { MCPTool, logger } from "mcp-framework";
import { sendReq } from "../utils/Fetch.js";
import { credentialsStore } from "../utils/CredentialStore.js";
import { ipAddressSchema } from "../utils/Schemas.js";
import { jsonRpcIdGenerator } from "../utils/JsonRpcIdGenerator.js";

interface PlcCreateBackupInput {
  plcIpAddress: string;
}

class PlcCreateBackup extends MCPTool<PlcCreateBackupInput> {
  name = "Plc-CreateBackup";
  description = `
With this API method, you request a ticket to create a backup file of the CPU configuration.
If all resources have been exhausted in current user session, you should close existing tickets to free up resources by calling the method Api.CloseTicket.
Then call Plc.CreateBackup method again to create a backup file.
To call the Plc.CreateBackup method, you need the "backup_plc" permission.

Response structure:
The method returns a string with a ticket ID for creating a backup file.

Example
The following example shows a generated ticket ID for creating a backup file.

"NDU2Nzg5MDEyMzQ1Njc4OTAxMjM0"

Possible error messages:
2    Permission denied              || The current authentication token is not authorized to call this method. Log on with a user account that has sufficient privileges to call this method
4    No resources                   || You have exhausted all tickets in this user session. Close existing tickets to free up resources. Then call the method again.
1000 Backup creation in progress    || The creation of a backup file is in progress.
1001 Backup restoration in progress || The restoration of a saved configuration is currently being carried out. It is not possible to perform both operations at the same time.
1004 PLC not in STOP                || A backup file can only be created when the CPU is in STOP mode. Set the CPU to STOP mode and execute the request again.
  `;

  schema = {
    plcIpAddress: {
      type: ipAddressSchema,
      description: "PLC IP Address",
    },
  };

  async execute(input: PlcCreateBackupInput) {
    try {
      const method = {
        id: jsonRpcIdGenerator.getNextId(),
        jsonrpc: "2.0",
        method: "Plc.CreateBackup",
      };
      const data = await sendReq(input.plcIpAddress, credentialsStore.get(input.plcIpAddress), method);
      return JSON.stringify(data?.result ? {ticket_id: data.result, download_url: `https://${input.plcIpAddress}/api/ticket?id=${data.result}`} : data, null, 2);
    } catch (err: any) {
      logger.error(`Tool 'Plc-CreateBackup' || Error: ${err.message}`);
      return `Tool 'Plc-CreateBackup' || Error: ${JSON.stringify(err.message, null, 2)}`;
    }
  }
}

export default PlcCreateBackup;