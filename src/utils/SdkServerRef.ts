import type { Server } from "@modelcontextprotocol/sdk/server/index.js";

let _sdkServer: Server | null = null;

export function setSdkServer(server: Server): void {
  _sdkServer = server;
}

export function getSdkServer(): Server | null {
  return _sdkServer;
}
