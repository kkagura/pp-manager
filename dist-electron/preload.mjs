"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(
      channel,
      (event, ...args2) => listener(event, ...args2)
    );
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  },
  dbQuery(sql, params) {
    return electron.ipcRenderer.invoke("dbQuery", sql, params);
  },
  dbQueryOne(sql, params) {
    return electron.ipcRenderer.invoke("dbQueryOne", sql, params);
  },
  dbExecute(sql, params) {
    return electron.ipcRenderer.invoke("dbExecute", sql, params);
  },
  openSource(event) {
    return electron.ipcRenderer.invoke("openSource", event);
  },
  getFileInfo(path) {
    return electron.ipcRenderer.invoke("getFileInfo", path);
  },
  getAppPath() {
    return electron.ipcRenderer.invoke("getAppPath");
  },
  getPath(name) {
    return electron.ipcRenderer.invoke("getPath", name);
  },
  openDevTools() {
    return electron.ipcRenderer.invoke("openDevTools");
  }
  // You can expose other APTs you need here.
  // ...
});
