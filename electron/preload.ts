import { ipcRenderer, contextBridge } from "electron";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args)
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },

  dbQuery(sql: string) {
    return ipcRenderer.invoke("dbQuery", sql);
  },
  dbQueryOne(sql: string) {
    return ipcRenderer.invoke("dbQueryOne", sql);
  },
  dbExecute(sql: string) {
    return ipcRenderer.invoke("dbExecute", sql);
  },

  openSource(event: { exe: string; args: string }) {
    return ipcRenderer.invoke("openSource", event);
  },

  getFileInfo(path: string) {
    return ipcRenderer.invoke("getFileInfo", path);
  },

  getAppPath() {
    return ipcRenderer.invoke("getAppPath");
  },

  getPath(name: any) {
    return ipcRenderer.invoke("getPath", name);
  },

  // You can expose other APTs you need here.
  // ...
});
