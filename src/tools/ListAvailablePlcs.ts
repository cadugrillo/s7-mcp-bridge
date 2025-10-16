import { MCPTool } from "mcp-framework";
import { AvailablePLCs } from "../utils/Config.js";

class ListAvailablePlcs extends MCPTool {
  name = "List-AvailablePlcs";
  description = `
  The AvailablePlcs method outputs a list of all configured PLCs with their names and IP addresses.
  No authorization is required for calling the Available-Plcs method.
  `;

  schema = {};

  async execute() {
    return JSON.stringify(AvailablePLCs(), null, 2);
  }
}

export default ListAvailablePlcs;