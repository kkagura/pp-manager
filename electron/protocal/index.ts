import { app, protocol } from "electron";
import path from "node:path";

const PROTOCOL = "pp-manager";

export function setupProtocol() {
  if (process.platform !== "win32") return;
  if (app.isPackaged) {
    app.setAsDefaultProtocolClient(PROTOCOL);
  } else {
    app.setAsDefaultProtocolClient(PROTOCOL);
  }
}
