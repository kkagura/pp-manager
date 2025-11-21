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

  dbQuery(sql: string, params?: any[]) {
    return ipcRenderer.invoke("dbQuery", sql, params);
  },
  dbQueryOne(sql: string, params?: any[]) {
    return ipcRenderer.invoke("dbQueryOne", sql, params);
  },
  dbExecute(sql: string, params?: any[]) {
    return ipcRenderer.invoke("dbExecute", sql, params);
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
  openDevTools() {
    return ipcRenderer.invoke("openDevTools");
  },

  // 获取通过自定义协议唤起应用时传入的参数（结构化对象），可能为 null
  getDeepLink() {
    return ipcRenderer.invoke("getDeepLink");
  },

  openSystemLog() {
    return ipcRenderer.invoke("openSystemLog");
  },

  // You can expose other APTs you need here.
  // ...
});
