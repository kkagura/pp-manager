var ye = Object.defineProperty;
var Ee = (n, e, t) => e in n ? ye(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var u = (n, e, t) => Ee(n, typeof e != "symbol" ? e + "" : e, t);
import ve, { app as y, BrowserWindow as Y, globalShortcut as Q, Menu as K, ipcMain as v, nativeImage as be, Tray as Te } from "electron";
import { fileURLToPath as Z } from "node:url";
import g from "node:path";
import O from "path";
import Se from "child_process";
import F from "os";
import $ from "fs";
import Ae from "util";
import ee from "events";
import Le from "http";
import Oe from "https";
import { createRequire as te } from "module";
import { exec as we } from "node:child_process";
import { stat as Ne } from "node:fs/promises";
import $e from "node:fs";
const Xr = Z(import.meta.url);
function Pe(n) {
  return n && n.__esModule && Object.prototype.hasOwnProperty.call(n, "default") ? n.default : n;
}
const re = $, N = O;
var De = {
  findAndReadPackageJson: Ie,
  tryReadJsonAt: L
};
function Ie() {
  return L(Re()) || L(Fe()) || L(process.resourcesPath, "app.asar") || L(process.resourcesPath, "app") || L(process.cwd()) || { name: void 0, version: void 0 };
}
function L(...n) {
  if (n[0])
    try {
      const e = N.join(...n), t = _e("package.json", e);
      if (!t)
        return;
      const r = JSON.parse(re.readFileSync(t, "utf8")), s = (r == null ? void 0 : r.productName) || (r == null ? void 0 : r.name);
      return !s || s.toLowerCase() === "electron" ? void 0 : s ? { name: s, version: r == null ? void 0 : r.version } : void 0;
    } catch {
      return;
    }
}
function _e(n, e) {
  let t = e;
  for (; ; ) {
    const r = N.parse(t), s = r.root, o = r.dir;
    if (re.existsSync(N.join(t, n)))
      return N.resolve(N.join(t, n));
    if (t === s)
      return null;
    t = o;
  }
}
function Fe() {
  const n = process.argv.filter((t) => t.indexOf("--user-data-dir=") === 0);
  return n.length === 0 || typeof n[0] != "string" ? null : n[0].replace("--user-data-dir=", "");
}
function Re() {
  var n;
  try {
    return (n = require.main) == null ? void 0 : n.filename;
  } catch {
    return;
  }
}
const xe = Se, S = F, A = O, Me = De;
let Ce = class {
  constructor() {
    u(this, "appName");
    u(this, "appPackageJson");
    u(this, "platform", process.platform);
  }
  getAppLogPath(e = this.getAppName()) {
    return this.platform === "darwin" ? A.join(this.getSystemPathHome(), "Library/Logs", e) : A.join(this.getAppUserDataPath(e), "logs");
  }
  getAppName() {
    var t;
    const e = this.appName || ((t = this.getAppPackageJson()) == null ? void 0 : t.name);
    if (!e)
      throw new Error(
        "electron-log can't determine the app name. It tried these methods:\n1. Use `electron.app.name`\n2. Use productName or name from the nearest package.json`\nYou can also set it through log.transports.file.setAppName()"
      );
    return e;
  }
  /**
   * @private
   * @returns {undefined}
   */
  getAppPackageJson() {
    return typeof this.appPackageJson != "object" && (this.appPackageJson = Me.findAndReadPackageJson()), this.appPackageJson;
  }
  getAppUserDataPath(e = this.getAppName()) {
    return e ? A.join(this.getSystemPathAppData(), e) : void 0;
  }
  getAppVersion() {
    var e;
    return (e = this.getAppPackageJson()) == null ? void 0 : e.version;
  }
  getElectronLogPath() {
    return this.getAppLogPath();
  }
  getMacOsVersion() {
    const e = Number(S.release().split(".")[0]);
    return e <= 19 ? `10.${e - 4}` : e - 9;
  }
  /**
   * @protected
   * @returns {string}
   */
  getOsVersion() {
    let e = S.type().replace("_", " "), t = S.release();
    return e === "Darwin" && (e = "macOS", t = this.getMacOsVersion()), `${e} ${t}`;
  }
  /**
   * @return {PathVariables}
   */
  getPathVariables() {
    const e = this.getAppName(), t = this.getAppVersion(), r = this;
    return {
      appData: this.getSystemPathAppData(),
      appName: e,
      appVersion: t,
      get electronDefaultDir() {
        return r.getElectronLogPath();
      },
      home: this.getSystemPathHome(),
      libraryDefaultDir: this.getAppLogPath(e),
      libraryTemplate: this.getAppLogPath("{appName}"),
      temp: this.getSystemPathTemp(),
      userData: this.getAppUserDataPath(e)
    };
  }
  getSystemPathAppData() {
    const e = this.getSystemPathHome();
    switch (this.platform) {
      case "darwin":
        return A.join(e, "Library/Application Support");
      case "win32":
        return process.env.APPDATA || A.join(e, "AppData/Roaming");
      default:
        return process.env.XDG_CONFIG_HOME || A.join(e, ".config");
    }
  }
  getSystemPathHome() {
    var e;
    return ((e = S.homedir) == null ? void 0 : e.call(S)) || process.env.HOME;
  }
  getSystemPathTemp() {
    return S.tmpdir();
  }
  getVersions() {
    return {
      app: `${this.getAppName()} ${this.getAppVersion()}`,
      electron: void 0,
      os: this.getOsVersion()
    };
  }
  isDev() {
    return process.env.NODE_ENV === "development" || process.env.ELECTRON_IS_DEV === "1";
  }
  isElectron() {
    return !!process.versions.electron;
  }
  onAppEvent(e, t) {
  }
  onAppReady(e) {
    e();
  }
  onEveryWebContentsEvent(e, t) {
  }
  /**
   * Listen to async messages sent from opposite process
   * @param {string} channel
   * @param {function} listener
   */
  onIpc(e, t) {
  }
  onIpcInvoke(e, t) {
  }
  /**
   * @param {string} url
   * @param {Function} [logFunction]
   */
  openUrl(e, t = console.error) {
    const s = { darwin: "open", win32: "start", linux: "xdg-open" }[process.platform] || "xdg-open";
    xe.exec(`${s} ${e}`, {}, (o) => {
      o && t(o);
    });
  }
  setAppName(e) {
    this.appName = e;
  }
  setPlatform(e) {
    this.platform = e;
  }
  setPreloadFileForSessions({
    filePath: e,
    // eslint-disable-line no-unused-vars
    includeFutureSession: t = !0,
    // eslint-disable-line no-unused-vars
    getSessions: r = () => []
    // eslint-disable-line no-unused-vars
  }) {
  }
  /**
   * Sent a message to opposite process
   * @param {string} channel
   * @param {any} message
   */
  sendIpc(e, t) {
  }
  showErrorBox(e, t) {
  }
};
var je = Ce;
const Ue = O, ke = je;
let ze = class extends ke {
  /**
   * @param {object} options
   * @param {typeof Electron} [options.electron]
   */
  constructor({ electron: t } = {}) {
    super();
    /**
     * @type {typeof Electron}
     */
    u(this, "electron");
    this.electron = t;
  }
  getAppName() {
    var r, s;
    let t;
    try {
      t = this.appName || ((r = this.electron.app) == null ? void 0 : r.name) || ((s = this.electron.app) == null ? void 0 : s.getName());
    } catch {
    }
    return t || super.getAppName();
  }
  getAppUserDataPath(t) {
    return this.getPath("userData") || super.getAppUserDataPath(t);
  }
  getAppVersion() {
    var r;
    let t;
    try {
      t = (r = this.electron.app) == null ? void 0 : r.getVersion();
    } catch {
    }
    return t || super.getAppVersion();
  }
  getElectronLogPath() {
    return this.getPath("logs") || super.getElectronLogPath();
  }
  /**
   * @private
   * @param {any} name
   * @returns {string|undefined}
   */
  getPath(t) {
    var r;
    try {
      return (r = this.electron.app) == null ? void 0 : r.getPath(t);
    } catch {
      return;
    }
  }
  getVersions() {
    return {
      app: `${this.getAppName()} ${this.getAppVersion()}`,
      electron: `Electron ${process.versions.electron}`,
      os: this.getOsVersion()
    };
  }
  getSystemPathAppData() {
    return this.getPath("appData") || super.getSystemPathAppData();
  }
  isDev() {
    var t;
    return ((t = this.electron.app) == null ? void 0 : t.isPackaged) !== void 0 ? !this.electron.app.isPackaged : typeof process.execPath == "string" ? Ue.basename(process.execPath).toLowerCase().startsWith("electron") : super.isDev();
  }
  onAppEvent(t, r) {
    var s;
    return (s = this.electron.app) == null || s.on(t, r), () => {
      var o;
      (o = this.electron.app) == null || o.off(t, r);
    };
  }
  onAppReady(t) {
    var r, s, o;
    (r = this.electron.app) != null && r.isReady() ? t() : (s = this.electron.app) != null && s.once ? (o = this.electron.app) == null || o.once("ready", t) : t();
  }
  onEveryWebContentsEvent(t, r) {
    var o, i, a;
    return (i = (o = this.electron.webContents) == null ? void 0 : o.getAllWebContents()) == null || i.forEach((l) => {
      l.on(t, r);
    }), (a = this.electron.app) == null || a.on("web-contents-created", s), () => {
      var l, p;
      (l = this.electron.webContents) == null || l.getAllWebContents().forEach((f) => {
        f.off(t, r);
      }), (p = this.electron.app) == null || p.off("web-contents-created", s);
    };
    function s(l, p) {
      p.on(t, r);
    }
  }
  /**
   * Listen to async messages sent from opposite process
   * @param {string} channel
   * @param {function} listener
   */
  onIpc(t, r) {
    var s;
    (s = this.electron.ipcMain) == null || s.on(t, r);
  }
  onIpcInvoke(t, r) {
    var s, o;
    (o = (s = this.electron.ipcMain) == null ? void 0 : s.handle) == null || o.call(s, t, r);
  }
  /**
   * @param {string} url
   * @param {Function} [logFunction]
   */
  openUrl(t, r = console.error) {
    var s;
    (s = this.electron.shell) == null || s.openExternal(t).catch(r);
  }
  setPreloadFileForSessions({
    filePath: t,
    includeFutureSession: r = !0,
    getSessions: s = () => {
      var o;
      return [(o = this.electron.session) == null ? void 0 : o.defaultSession];
    }
  }) {
    for (const i of s().filter(Boolean))
      o(i);
    r && this.onAppEvent("session-created", (i) => {
      o(i);
    });
    function o(i) {
      typeof i.registerPreloadScript == "function" ? i.registerPreloadScript({
        filePath: t,
        id: "electron-log-preload",
        type: "frame"
      }) : i.setPreloads([...i.getPreloads(), t]);
    }
  }
  /**
   * Sent a message to opposite process
   * @param {string} channel
   * @param {any} message
   */
  sendIpc(t, r) {
    var s, o;
    (o = (s = this.electron.BrowserWindow) == null ? void 0 : s.getAllWindows()) == null || o.forEach((i) => {
      var a, l;
      ((a = i.webContents) == null ? void 0 : a.isDestroyed()) === !1 && ((l = i.webContents) == null ? void 0 : l.isCrashed()) === !1 && i.webContents.send(t, r);
    });
  }
  showErrorBox(t, r) {
    var s;
    (s = this.electron.dialog) == null || s.showErrorBox(t, r);
  }
};
var We = ze, ne = { exports: {} };
(function(n) {
  let e = {};
  try {
    e = require("electron");
  } catch {
  }
  e.ipcRenderer && t(e), n.exports = t;
  function t({ contextBridge: r, ipcRenderer: s }) {
    if (!s)
      return;
    s.on("__ELECTRON_LOG_IPC__", (i, a) => {
      window.postMessage({ cmd: "message", ...a });
    }), s.invoke("__ELECTRON_LOG__", { cmd: "getOptions" }).catch((i) => console.error(new Error(
      `electron-log isn't initialized in the main process. Please call log.initialize() before. ${i.message}`
    )));
    const o = {
      sendToMain(i) {
        try {
          s.send("__ELECTRON_LOG__", i);
        } catch (a) {
          console.error("electronLog.sendToMain ", a, "data:", i), s.send("__ELECTRON_LOG__", {
            cmd: "errorHandler",
            error: { message: a == null ? void 0 : a.message, stack: a == null ? void 0 : a.stack },
            errorName: "sendToMain"
          });
        }
      },
      log(...i) {
        o.sendToMain({ data: i, level: "info" });
      }
    };
    for (const i of ["error", "warn", "info", "verbose", "debug", "silly"])
      o[i] = (...a) => o.sendToMain({
        data: a,
        level: i
      });
    if (r && process.contextIsolated)
      try {
        r.exposeInMainWorld("__electronLog", o);
      } catch {
      }
    typeof window == "object" ? window.__electronLog = o : __electronLog = o;
  }
})(ne);
var qe = ne.exports;
const k = $, Ve = F, z = O, Be = qe;
let W = !1, q = !1;
var Je = {
  initialize({
    externalApi: n,
    getSessions: e,
    includeFutureSession: t,
    logger: r,
    preload: s = !0,
    spyRendererConsole: o = !1
  }) {
    n.onAppReady(() => {
      try {
        s && Xe({
          externalApi: n,
          getSessions: e,
          includeFutureSession: t,
          logger: r,
          preloadOption: s
        }), o && He({ externalApi: n, logger: r });
      } catch (i) {
        r.warn(i);
      }
    });
  }
};
function Xe({
  externalApi: n,
  getSessions: e,
  includeFutureSession: t,
  logger: r,
  preloadOption: s
}) {
  let o = typeof s == "string" ? s : void 0;
  if (W) {
    r.warn(new Error("log.initialize({ preload }) already called").stack);
    return;
  }
  W = !0;
  try {
    o = z.resolve(
      __dirname,
      "../renderer/electron-log-preload.js"
    );
  } catch {
  }
  if (!o || !k.existsSync(o)) {
    o = z.join(
      n.getAppUserDataPath() || Ve.tmpdir(),
      "electron-log-preload.js"
    );
    const i = `
      try {
        (${Be.toString()})(require('electron'));
      } catch(e) {
        console.error(e);
      }
    `;
    k.writeFileSync(o, i, "utf8");
  }
  n.setPreloadFileForSessions({
    filePath: o,
    includeFutureSession: t,
    getSessions: e
  });
}
function He({ externalApi: n, logger: e }) {
  if (q) {
    e.warn(
      new Error("log.initialize({ spyRendererConsole }) already called").stack
    );
    return;
  }
  q = !0;
  const t = ["debug", "info", "warn", "error"];
  n.onEveryWebContentsEvent(
    "console-message",
    (r, s, o) => {
      e.processMessage({
        data: [o],
        level: t[s],
        variables: { processType: "renderer" }
      });
    }
  );
}
var Ge = Ye;
function Ye(n) {
  return Object.defineProperties(e, {
    defaultLabel: { value: "", writable: !0 },
    labelPadding: { value: !0, writable: !0 },
    maxLabelLength: { value: 0, writable: !0 },
    labelLength: {
      get() {
        switch (typeof e.labelPadding) {
          case "boolean":
            return e.labelPadding ? e.maxLabelLength : 0;
          case "number":
            return e.labelPadding;
          default:
            return 0;
        }
      }
    }
  });
  function e(t) {
    e.maxLabelLength = Math.max(e.maxLabelLength, t.length);
    const r = {};
    for (const s of n.levels)
      r[s] = (...o) => n.logData(o, { level: s, scope: t });
    return r.log = r.info, r;
  }
}
let Qe = class {
  constructor({ processMessage: e }) {
    this.processMessage = e, this.buffer = [], this.enabled = !1, this.begin = this.begin.bind(this), this.commit = this.commit.bind(this), this.reject = this.reject.bind(this);
  }
  addMessage(e) {
    this.buffer.push(e);
  }
  begin() {
    this.enabled = [];
  }
  commit() {
    this.enabled = !1, this.buffer.forEach((e) => this.processMessage(e)), this.buffer = [];
  }
  reject() {
    this.enabled = !1, this.buffer = [];
  }
};
var Ke = Qe;
const Ze = Ge, et = Ke;
var T;
let tt = (T = class {
  constructor({
    allowUnknownLevel: e = !1,
    dependencies: t = {},
    errorHandler: r,
    eventLogger: s,
    initializeFn: o,
    isDev: i = !1,
    levels: a = ["error", "warn", "info", "verbose", "debug", "silly"],
    logId: l,
    transportFactories: p = {},
    variables: f
  } = {}) {
    u(this, "dependencies", {});
    u(this, "errorHandler", null);
    u(this, "eventLogger", null);
    u(this, "functions", {});
    u(this, "hooks", []);
    u(this, "isDev", !1);
    u(this, "levels", null);
    u(this, "logId", null);
    u(this, "scope", null);
    u(this, "transports", {});
    u(this, "variables", {});
    this.addLevel = this.addLevel.bind(this), this.create = this.create.bind(this), this.initialize = this.initialize.bind(this), this.logData = this.logData.bind(this), this.processMessage = this.processMessage.bind(this), this.allowUnknownLevel = e, this.buffering = new et(this), this.dependencies = t, this.initializeFn = o, this.isDev = i, this.levels = a, this.logId = l, this.scope = Ze(this), this.transportFactories = p, this.variables = f || {};
    for (const d of this.levels)
      this.addLevel(d, !1);
    this.log = this.info, this.functions.log = this.log, this.errorHandler = r, r == null || r.setOptions({ ...t, logFn: this.error }), this.eventLogger = s, s == null || s.setOptions({ ...t, logger: this });
    for (const [d, E] of Object.entries(p))
      this.transports[d] = E(this, t);
    T.instances[l] = this;
  }
  static getInstance({ logId: e }) {
    return this.instances[e] || this.instances.default;
  }
  addLevel(e, t = this.levels.length) {
    t !== !1 && this.levels.splice(t, 0, e), this[e] = (...r) => this.logData(r, { level: e }), this.functions[e] = this[e];
  }
  catchErrors(e) {
    return this.processMessage(
      {
        data: ["log.catchErrors is deprecated. Use log.errorHandler instead"],
        level: "warn"
      },
      { transports: ["console"] }
    ), this.errorHandler.startCatching(e);
  }
  create(e) {
    return typeof e == "string" && (e = { logId: e }), new T({
      dependencies: this.dependencies,
      errorHandler: this.errorHandler,
      initializeFn: this.initializeFn,
      isDev: this.isDev,
      transportFactories: this.transportFactories,
      variables: { ...this.variables },
      ...e
    });
  }
  compareLevels(e, t, r = this.levels) {
    const s = r.indexOf(e), o = r.indexOf(t);
    return o === -1 || s === -1 ? !0 : o <= s;
  }
  initialize(e = {}) {
    this.initializeFn({ logger: this, ...this.dependencies, ...e });
  }
  logData(e, t = {}) {
    this.buffering.enabled ? this.buffering.addMessage({ data: e, date: /* @__PURE__ */ new Date(), ...t }) : this.processMessage({ data: e, ...t });
  }
  processMessage(e, { transports: t = this.transports } = {}) {
    if (e.cmd === "errorHandler") {
      this.errorHandler.handle(e.error, {
        errorName: e.errorName,
        processType: "renderer",
        showDialog: !!e.showDialog
      });
      return;
    }
    let r = e.level;
    this.allowUnknownLevel || (r = this.levels.includes(e.level) ? e.level : "info");
    const s = {
      date: /* @__PURE__ */ new Date(),
      logId: this.logId,
      ...e,
      level: r,
      variables: {
        ...this.variables,
        ...e.variables
      }
    };
    for (const [o, i] of this.transportEntries(t))
      if (!(typeof i != "function" || i.level === !1) && this.compareLevels(i.level, e.level))
        try {
          const a = this.hooks.reduce((l, p) => l && p(l, i, o), s);
          a && i({ ...a, data: [...a.data] });
        } catch (a) {
          this.processInternalErrorFn(a);
        }
  }
  processInternalErrorFn(e) {
  }
  transportEntries(e = this.transports) {
    return (Array.isArray(e) ? e : Object.entries(e)).map((r) => {
      switch (typeof r) {
        case "string":
          return this.transports[r] ? [r, this.transports[r]] : null;
        case "function":
          return [r.name, r];
        default:
          return Array.isArray(r) ? r : null;
      }
    }).filter(Boolean);
  }
}, u(T, "instances", {}), T);
var rt = tt;
let nt = class {
  constructor({
    externalApi: e,
    logFn: t = void 0,
    onError: r = void 0,
    showDialog: s = void 0
  } = {}) {
    u(this, "externalApi");
    u(this, "isActive", !1);
    u(this, "logFn");
    u(this, "onError");
    u(this, "showDialog", !0);
    this.createIssue = this.createIssue.bind(this), this.handleError = this.handleError.bind(this), this.handleRejection = this.handleRejection.bind(this), this.setOptions({ externalApi: e, logFn: t, onError: r, showDialog: s }), this.startCatching = this.startCatching.bind(this), this.stopCatching = this.stopCatching.bind(this);
  }
  handle(e, {
    logFn: t = this.logFn,
    onError: r = this.onError,
    processType: s = "browser",
    showDialog: o = this.showDialog,
    errorName: i = ""
  } = {}) {
    var a;
    e = st(e);
    try {
      if (typeof r == "function") {
        const l = ((a = this.externalApi) == null ? void 0 : a.getVersions()) || {}, p = this.createIssue;
        if (r({
          createIssue: p,
          error: e,
          errorName: i,
          processType: s,
          versions: l
        }) === !1)
          return;
      }
      i ? t(i, e) : t(e), o && !i.includes("rejection") && this.externalApi && this.externalApi.showErrorBox(
        `A JavaScript error occurred in the ${s} process`,
        e.stack
      );
    } catch {
      console.error(e);
    }
  }
  setOptions({ externalApi: e, logFn: t, onError: r, showDialog: s }) {
    typeof e == "object" && (this.externalApi = e), typeof t == "function" && (this.logFn = t), typeof r == "function" && (this.onError = r), typeof s == "boolean" && (this.showDialog = s);
  }
  startCatching({ onError: e, showDialog: t } = {}) {
    this.isActive || (this.isActive = !0, this.setOptions({ onError: e, showDialog: t }), process.on("uncaughtException", this.handleError), process.on("unhandledRejection", this.handleRejection));
  }
  stopCatching() {
    this.isActive = !1, process.removeListener("uncaughtException", this.handleError), process.removeListener("unhandledRejection", this.handleRejection);
  }
  createIssue(e, t) {
    var r;
    (r = this.externalApi) == null || r.openUrl(
      `${e}?${new URLSearchParams(t).toString()}`
    );
  }
  handleError(e) {
    this.handle(e, { errorName: "Unhandled" });
  }
  handleRejection(e) {
    const t = e instanceof Error ? e : new Error(JSON.stringify(e));
    this.handle(t, { errorName: "Unhandled rejection" });
  }
};
function st(n) {
  if (n instanceof Error)
    return n;
  if (n && typeof n == "object") {
    if (n.message)
      return Object.assign(new Error(n.message), n);
    try {
      return new Error(JSON.stringify(n));
    } catch (e) {
      return new Error(`Couldn't normalize error ${String(n)}: ${e}`);
    }
  }
  return new Error(`Can't normalize error ${String(n)}`);
}
var ot = nt;
let it = class {
  constructor(e = {}) {
    u(this, "disposers", []);
    u(this, "format", "{eventSource}#{eventName}:");
    u(this, "formatters", {
      app: {
        "certificate-error": ({ args: e }) => this.arrayToObject(e.slice(1, 4), [
          "url",
          "error",
          "certificate"
        ]),
        "child-process-gone": ({ args: e }) => e.length === 1 ? e[0] : e,
        "render-process-gone": ({ args: [e, t] }) => t && typeof t == "object" ? { ...t, ...this.getWebContentsDetails(e) } : []
      },
      webContents: {
        "console-message": ({ args: [e, t, r, s] }) => {
          if (!(e < 3))
            return { message: t, source: `${s}:${r}` };
        },
        "did-fail-load": ({ args: e }) => this.arrayToObject(e, [
          "errorCode",
          "errorDescription",
          "validatedURL",
          "isMainFrame",
          "frameProcessId",
          "frameRoutingId"
        ]),
        "did-fail-provisional-load": ({ args: e }) => this.arrayToObject(e, [
          "errorCode",
          "errorDescription",
          "validatedURL",
          "isMainFrame",
          "frameProcessId",
          "frameRoutingId"
        ]),
        "plugin-crashed": ({ args: e }) => this.arrayToObject(e, ["name", "version"]),
        "preload-error": ({ args: e }) => this.arrayToObject(e, ["preloadPath", "error"])
      }
    });
    u(this, "events", {
      app: {
        "certificate-error": !0,
        "child-process-gone": !0,
        "render-process-gone": !0
      },
      webContents: {
        // 'console-message': true,
        "did-fail-load": !0,
        "did-fail-provisional-load": !0,
        "plugin-crashed": !0,
        "preload-error": !0,
        unresponsive: !0
      }
    });
    u(this, "externalApi");
    u(this, "level", "error");
    u(this, "scope", "");
    this.setOptions(e);
  }
  setOptions({
    events: e,
    externalApi: t,
    level: r,
    logger: s,
    format: o,
    formatters: i,
    scope: a
  }) {
    typeof e == "object" && (this.events = e), typeof t == "object" && (this.externalApi = t), typeof r == "string" && (this.level = r), typeof s == "object" && (this.logger = s), (typeof o == "string" || typeof o == "function") && (this.format = o), typeof i == "object" && (this.formatters = i), typeof a == "string" && (this.scope = a);
  }
  startLogging(e = {}) {
    this.setOptions(e), this.disposeListeners();
    for (const t of this.getEventNames(this.events.app))
      this.disposers.push(
        this.externalApi.onAppEvent(t, (...r) => {
          this.handleEvent({ eventSource: "app", eventName: t, handlerArgs: r });
        })
      );
    for (const t of this.getEventNames(this.events.webContents))
      this.disposers.push(
        this.externalApi.onEveryWebContentsEvent(
          t,
          (...r) => {
            this.handleEvent(
              { eventSource: "webContents", eventName: t, handlerArgs: r }
            );
          }
        )
      );
  }
  stopLogging() {
    this.disposeListeners();
  }
  arrayToObject(e, t) {
    const r = {};
    return t.forEach((s, o) => {
      r[s] = e[o];
    }), e.length > t.length && (r.unknownArgs = e.slice(t.length)), r;
  }
  disposeListeners() {
    this.disposers.forEach((e) => e()), this.disposers = [];
  }
  formatEventLog({ eventName: e, eventSource: t, handlerArgs: r }) {
    var f;
    const [s, ...o] = r;
    if (typeof this.format == "function")
      return this.format({ args: o, event: s, eventName: e, eventSource: t });
    const i = (f = this.formatters[t]) == null ? void 0 : f[e];
    let a = o;
    if (typeof i == "function" && (a = i({ args: o, event: s, eventName: e, eventSource: t })), !a)
      return;
    const l = {};
    return Array.isArray(a) ? l.args = a : typeof a == "object" && Object.assign(l, a), t === "webContents" && Object.assign(l, this.getWebContentsDetails(s == null ? void 0 : s.sender)), [this.format.replace("{eventSource}", t === "app" ? "App" : "WebContents").replace("{eventName}", e), l];
  }
  getEventNames(e) {
    return !e || typeof e != "object" ? [] : Object.entries(e).filter(([t, r]) => r).map(([t]) => t);
  }
  getWebContentsDetails(e) {
    if (!(e != null && e.loadURL))
      return {};
    try {
      return {
        webContents: {
          id: e.id,
          url: e.getURL()
        }
      };
    } catch {
      return {};
    }
  }
  handleEvent({ eventName: e, eventSource: t, handlerArgs: r }) {
    var o;
    const s = this.formatEventLog({ eventName: e, eventSource: t, handlerArgs: r });
    if (s) {
      const i = this.scope ? this.logger.scope(this.scope) : this.logger;
      (o = i == null ? void 0 : i[this.level]) == null || o.call(i, ...s);
    }
  }
};
var at = it, P = { transform: ct };
function ct({
  logger: n,
  message: e,
  transport: t,
  initialData: r = (e == null ? void 0 : e.data) || [],
  transforms: s = t == null ? void 0 : t.transforms
}) {
  return s.reduce((o, i) => typeof i == "function" ? i({ data: o, logger: n, message: e, transport: t }) : o, r);
}
const { transform: lt } = P;
var se = {
  concatFirstStringElements: pt,
  format({ message: n, logger: e, transport: t, data: r = n == null ? void 0 : n.data }) {
    switch (typeof t.format) {
      case "string":
        return lt({
          message: n,
          logger: e,
          transforms: [ht, ft, dt],
          transport: t,
          initialData: [t.format, ...r]
        });
      case "function":
        return t.format({
          data: r,
          level: (n == null ? void 0 : n.level) || "info",
          logger: e,
          message: n,
          transport: t
        });
      default:
        return r;
    }
  }
};
function pt({ data: n }) {
  return typeof n[0] != "string" || typeof n[1] != "string" || n[0].match(/%[1cdfiOos]/) ? n : [`${n[0]} ${n[1]}`, ...n.slice(2)];
}
function ut(n) {
  const e = Math.abs(n), t = n > 0 ? "-" : "+", r = Math.floor(e / 60).toString().padStart(2, "0"), s = (e % 60).toString().padStart(2, "0");
  return `${t}${r}:${s}`;
}
function ft({ data: n, logger: e, message: t }) {
  const { defaultLabel: r, labelLength: s } = (e == null ? void 0 : e.scope) || {}, o = n[0];
  let i = t.scope;
  i || (i = r);
  let a;
  return i === "" ? a = s > 0 ? "".padEnd(s + 3) : "" : typeof i == "string" ? a = ` (${i})`.padEnd(s + 3) : a = "", n[0] = o.replace("{scope}", a), n;
}
function ht({ data: n, message: e }) {
  let t = n[0];
  if (typeof t != "string")
    return n;
  t = t.replace("{level}]", `${e.level}]`.padEnd(6, " "));
  const r = e.date || /* @__PURE__ */ new Date();
  return n[0] = t.replace(/\{(\w+)}/g, (s, o) => {
    var i;
    switch (o) {
      case "level":
        return e.level || "info";
      case "logId":
        return e.logId;
      case "y":
        return r.getFullYear().toString(10);
      case "m":
        return (r.getMonth() + 1).toString(10).padStart(2, "0");
      case "d":
        return r.getDate().toString(10).padStart(2, "0");
      case "h":
        return r.getHours().toString(10).padStart(2, "0");
      case "i":
        return r.getMinutes().toString(10).padStart(2, "0");
      case "s":
        return r.getSeconds().toString(10).padStart(2, "0");
      case "ms":
        return r.getMilliseconds().toString(10).padStart(3, "0");
      case "z":
        return ut(r.getTimezoneOffset());
      case "iso":
        return r.toISOString();
      default:
        return ((i = e.variables) == null ? void 0 : i[o]) || s;
    }
  }).trim(), n;
}
function dt({ data: n }) {
  const e = n[0];
  if (typeof e != "string")
    return n;
  if (e.lastIndexOf("{text}") === e.length - 6)
    return n[0] = e.replace(/\s?{text}/, ""), n[0] === "" && n.shift(), n;
  const r = e.split("{text}");
  let s = [];
  return r[0] !== "" && s.push(r[0]), s = s.concat(n.slice(1)), r[1] !== "" && s.push(r[1]), s;
}
var oe = { exports: {} };
(function(n) {
  const e = Ae;
  n.exports = {
    serialize: r,
    maxDepth({ data: s, transport: o, depth: i = (o == null ? void 0 : o.depth) ?? 6 }) {
      if (!s)
        return s;
      if (i < 1)
        return Array.isArray(s) ? "[array]" : typeof s == "object" && s ? "[object]" : s;
      if (Array.isArray(s))
        return s.map((l) => n.exports.maxDepth({
          data: l,
          depth: i - 1
        }));
      if (typeof s != "object" || s && typeof s.toISOString == "function")
        return s;
      if (s === null)
        return null;
      if (s instanceof Error)
        return s;
      const a = {};
      for (const l in s)
        Object.prototype.hasOwnProperty.call(s, l) && (a[l] = n.exports.maxDepth({
          data: s[l],
          depth: i - 1
        }));
      return a;
    },
    toJSON({ data: s }) {
      return JSON.parse(JSON.stringify(s, t()));
    },
    toString({ data: s, transport: o }) {
      const i = (o == null ? void 0 : o.inspectOptions) || {}, a = s.map((l) => {
        if (l !== void 0)
          try {
            const p = JSON.stringify(l, t(), "  ");
            return p === void 0 ? void 0 : JSON.parse(p);
          } catch {
            return l;
          }
      });
      return e.formatWithOptions(i, ...a);
    }
  };
  function t(s = {}) {
    const o = /* @__PURE__ */ new WeakSet();
    return function(i, a) {
      if (typeof a == "object" && a !== null) {
        if (o.has(a))
          return;
        o.add(a);
      }
      return r(i, a, s);
    };
  }
  function r(s, o, i = {}) {
    const a = (i == null ? void 0 : i.serializeMapAndSet) !== !1;
    return o instanceof Error ? o.stack : o && (typeof o == "function" ? `[function] ${o.toString()}` : o instanceof Date ? o.toISOString() : a && o instanceof Map && Object.fromEntries ? Object.fromEntries(o) : a && o instanceof Set && Array.from ? Array.from(o) : o);
  }
})(oe);
var R = oe.exports, j = {
  applyAnsiStyles({ data: n }) {
    return V(n, gt, mt);
  },
  removeStyles({ data: n }) {
    return V(n, () => "");
  }
};
const ie = {
  unset: "\x1B[0m",
  black: "\x1B[30m",
  red: "\x1B[31m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  blue: "\x1B[34m",
  magenta: "\x1B[35m",
  cyan: "\x1B[36m",
  white: "\x1B[37m",
  gray: "\x1B[90m"
};
function gt(n) {
  const e = n.replace(/color:\s*(\w+).*/, "$1").toLowerCase();
  return ie[e] || "";
}
function mt(n) {
  return n + ie.unset;
}
function V(n, e, t) {
  const r = {};
  return n.reduce((s, o, i, a) => {
    if (r[i])
      return s;
    if (typeof o == "string") {
      let l = i, p = !1;
      o = o.replace(/%[1cdfiOos]/g, (f) => {
        if (l += 1, f !== "%c")
          return f;
        const d = a[l];
        return typeof d == "string" ? (r[l] = !0, p = !0, e(d, o)) : f;
      }), p && t && (o = t(o));
    }
    return s.push(o), s;
  }, []);
}
const {
  concatFirstStringElements: yt,
  format: Et
} = se, { maxDepth: vt, toJSON: bt } = R, {
  applyAnsiStyles: Tt,
  removeStyles: St
} = j, { transform: At } = P, B = {
  error: console.error,
  warn: console.warn,
  info: console.info,
  verbose: console.info,
  debug: console.debug,
  silly: console.debug,
  log: console.log
};
var Lt = ce;
const Ot = process.platform === "win32" ? ">" : "›", ae = `%c{h}:{i}:{s}.{ms}{scope}%c ${Ot} {text}`;
Object.assign(ce, {
  DEFAULT_FORMAT: ae
});
function ce(n) {
  return Object.assign(e, {
    colorMap: {
      error: "red",
      warn: "yellow",
      info: "cyan",
      verbose: "unset",
      debug: "gray",
      silly: "gray",
      default: "unset"
    },
    format: ae,
    level: "silly",
    transforms: [
      wt,
      Et,
      $t,
      yt,
      vt,
      bt
    ],
    useStyles: process.env.FORCE_STYLES,
    writeFn({ message: t }) {
      (B[t.level] || B.info)(...t.data);
    }
  });
  function e(t) {
    const r = At({ logger: n, message: t, transport: e });
    e.writeFn({
      message: { ...t, data: r }
    });
  }
}
function wt({ data: n, message: e, transport: t }) {
  return typeof t.format != "string" || !t.format.includes("%c") ? n : [
    `color:${Pt(e.level, t)}`,
    "color:unset",
    ...n
  ];
}
function Nt(n, e) {
  if (typeof n == "boolean")
    return n;
  const r = e === "error" || e === "warn" ? process.stderr : process.stdout;
  return r && r.isTTY;
}
function $t(n) {
  const { message: e, transport: t } = n;
  return (Nt(t.useStyles, e.level) ? Tt : St)(n);
}
function Pt(n, e) {
  return e.colorMap[n] || e.colorMap.default;
}
const Dt = ee, b = $, J = F;
let It = class extends Dt {
  constructor({
    path: t,
    writeOptions: r = { encoding: "utf8", flag: "a", mode: 438 },
    writeAsync: s = !1
  }) {
    super();
    u(this, "asyncWriteQueue", []);
    u(this, "bytesWritten", 0);
    u(this, "hasActiveAsyncWriting", !1);
    u(this, "path", null);
    u(this, "initialSize");
    u(this, "writeOptions", null);
    u(this, "writeAsync", !1);
    this.path = t, this.writeOptions = r, this.writeAsync = s;
  }
  get size() {
    return this.getSize();
  }
  clear() {
    try {
      return b.writeFileSync(this.path, "", {
        mode: this.writeOptions.mode,
        flag: "w"
      }), this.reset(), !0;
    } catch (t) {
      return t.code === "ENOENT" ? !0 : (this.emit("error", t, this), !1);
    }
  }
  crop(t) {
    try {
      const r = _t(this.path, t || 4096);
      this.clear(), this.writeLine(`[log cropped]${J.EOL}${r}`);
    } catch (r) {
      this.emit(
        "error",
        new Error(`Couldn't crop file ${this.path}. ${r.message}`),
        this
      );
    }
  }
  getSize() {
    if (this.initialSize === void 0)
      try {
        const t = b.statSync(this.path);
        this.initialSize = t.size;
      } catch {
        this.initialSize = 0;
      }
    return this.initialSize + this.bytesWritten;
  }
  increaseBytesWrittenCounter(t) {
    this.bytesWritten += Buffer.byteLength(t, this.writeOptions.encoding);
  }
  isNull() {
    return !1;
  }
  nextAsyncWrite() {
    const t = this;
    if (this.hasActiveAsyncWriting || this.asyncWriteQueue.length === 0)
      return;
    const r = this.asyncWriteQueue.join("");
    this.asyncWriteQueue = [], this.hasActiveAsyncWriting = !0, b.writeFile(this.path, r, this.writeOptions, (s) => {
      t.hasActiveAsyncWriting = !1, s ? t.emit(
        "error",
        new Error(`Couldn't write to ${t.path}. ${s.message}`),
        this
      ) : t.increaseBytesWrittenCounter(r), t.nextAsyncWrite();
    });
  }
  reset() {
    this.initialSize = void 0, this.bytesWritten = 0;
  }
  toString() {
    return this.path;
  }
  writeLine(t) {
    if (t += J.EOL, this.writeAsync) {
      this.asyncWriteQueue.push(t), this.nextAsyncWrite();
      return;
    }
    try {
      b.writeFileSync(this.path, t, this.writeOptions), this.increaseBytesWrittenCounter(t);
    } catch (r) {
      this.emit(
        "error",
        new Error(`Couldn't write to ${this.path}. ${r.message}`),
        this
      );
    }
  }
};
var le = It;
function _t(n, e) {
  const t = Buffer.alloc(e), r = b.statSync(n), s = Math.min(r.size, e), o = Math.max(0, r.size - e), i = b.openSync(n, "r"), a = b.readSync(i, t, 0, s, o);
  return b.closeSync(i), t.toString("utf8", 0, a);
}
const Ft = le;
let Rt = class extends Ft {
  clear() {
  }
  crop() {
  }
  getSize() {
    return 0;
  }
  isNull() {
    return !0;
  }
  writeLine() {
  }
};
var xt = Rt;
const Mt = ee, X = $, H = O, Ct = le, jt = xt;
let Ut = class extends Mt {
  constructor() {
    super();
    u(this, "store", {});
    this.emitError = this.emitError.bind(this);
  }
  /**
   * Provide a File object corresponding to the filePath
   * @param {string} filePath
   * @param {WriteOptions} [writeOptions]
   * @param {boolean} [writeAsync]
   * @return {File}
   */
  provide({ filePath: t, writeOptions: r = {}, writeAsync: s = !1 }) {
    let o;
    try {
      if (t = H.resolve(t), this.store[t])
        return this.store[t];
      o = this.createFile({ filePath: t, writeOptions: r, writeAsync: s });
    } catch (i) {
      o = new jt({ path: t }), this.emitError(i, o);
    }
    return o.on("error", this.emitError), this.store[t] = o, o;
  }
  /**
   * @param {string} filePath
   * @param {WriteOptions} writeOptions
   * @param {boolean} async
   * @return {File}
   * @private
   */
  createFile({ filePath: t, writeOptions: r, writeAsync: s }) {
    return this.testFileWriting({ filePath: t, writeOptions: r }), new Ct({ path: t, writeOptions: r, writeAsync: s });
  }
  /**
   * @param {Error} error
   * @param {File} file
   * @private
   */
  emitError(t, r) {
    this.emit("error", t, r);
  }
  /**
   * @param {string} filePath
   * @param {WriteOptions} writeOptions
   * @private
   */
  testFileWriting({ filePath: t, writeOptions: r }) {
    X.mkdirSync(H.dirname(t), { recursive: !0 }), X.writeFileSync(t, "", { flag: "a", mode: r.mode });
  }
};
var kt = Ut;
const I = $, zt = F, w = O, Wt = kt, { transform: qt } = P, { removeStyles: Vt } = j, {
  format: Bt,
  concatFirstStringElements: Jt
} = se, { toString: Xt } = R;
var Ht = Yt;
const Gt = new Wt();
function Yt(n, { registry: e = Gt, externalApi: t } = {}) {
  let r;
  return e.listenerCount("error") < 1 && e.on("error", (p, f) => {
    i(`Can't write to ${f}`, p);
  }), Object.assign(s, {
    fileName: Qt(n.variables.processType),
    format: "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}",
    getFile: a,
    inspectOptions: { depth: 5 },
    level: "silly",
    maxSize: 1024 ** 2,
    readAllLogs: l,
    sync: !0,
    transforms: [Vt, Bt, Jt, Xt],
    writeOptions: { flag: "a", mode: 438, encoding: "utf8" },
    archiveLogFn(p) {
      const f = p.toString(), d = w.parse(f);
      try {
        I.renameSync(f, w.join(d.dir, `${d.name}.old${d.ext}`));
      } catch (E) {
        i("Could not rotate log", E);
        const me = Math.round(s.maxSize / 4);
        p.crop(Math.min(me, 256 * 1024));
      }
    },
    resolvePathFn(p) {
      return w.join(p.libraryDefaultDir, p.fileName);
    },
    setAppName(p) {
      n.dependencies.externalApi.setAppName(p);
    }
  });
  function s(p) {
    const f = a(p);
    s.maxSize > 0 && f.size > s.maxSize && (s.archiveLogFn(f), f.reset());
    const E = qt({ logger: n, message: p, transport: s });
    f.writeLine(E);
  }
  function o() {
    r || (r = Object.create(
      Object.prototype,
      {
        ...Object.getOwnPropertyDescriptors(
          t.getPathVariables()
        ),
        fileName: {
          get() {
            return s.fileName;
          },
          enumerable: !0
        }
      }
    ), typeof s.archiveLog == "function" && (s.archiveLogFn = s.archiveLog, i("archiveLog is deprecated. Use archiveLogFn instead")), typeof s.resolvePath == "function" && (s.resolvePathFn = s.resolvePath, i("resolvePath is deprecated. Use resolvePathFn instead")));
  }
  function i(p, f = null, d = "error") {
    const E = [`electron-log.transports.file: ${p}`];
    f && E.push(f), n.transports.console({ data: E, date: /* @__PURE__ */ new Date(), level: d });
  }
  function a(p) {
    o();
    const f = s.resolvePathFn(r, p);
    return e.provide({
      filePath: f,
      writeAsync: !s.sync,
      writeOptions: s.writeOptions
    });
  }
  function l({ fileFilter: p = (f) => f.endsWith(".log") } = {}) {
    o();
    const f = w.dirname(s.resolvePathFn(r));
    return I.existsSync(f) ? I.readdirSync(f).map((d) => w.join(f, d)).filter(p).map((d) => {
      try {
        return {
          path: d,
          lines: I.readFileSync(d, "utf8").split(zt.EOL)
        };
      } catch {
        return null;
      }
    }).filter(Boolean) : [];
  }
}
function Qt(n = process.type) {
  switch (n) {
    case "renderer":
      return "renderer.log";
    case "worker":
      return "worker.log";
    default:
      return "main.log";
  }
}
const { maxDepth: Kt, toJSON: Zt } = R, { transform: er } = P;
var tr = rr;
function rr(n, { externalApi: e }) {
  return Object.assign(t, {
    depth: 3,
    eventId: "__ELECTRON_LOG_IPC__",
    level: n.isDev ? "silly" : !1,
    transforms: [Zt, Kt]
  }), e != null && e.isElectron() ? t : void 0;
  function t(r) {
    var s;
    ((s = r == null ? void 0 : r.variables) == null ? void 0 : s.processType) !== "renderer" && (e == null || e.sendIpc(t.eventId, {
      ...r,
      data: er({ logger: n, message: r, transport: t })
    }));
  }
}
const nr = Le, sr = Oe, { transform: or } = P, { removeStyles: ir } = j, { toJSON: ar, maxDepth: cr } = R;
var lr = pr;
function pr(n) {
  return Object.assign(e, {
    client: { name: "electron-application" },
    depth: 6,
    level: !1,
    requestOptions: {},
    transforms: [ir, ar, cr],
    makeBodyFn({ message: t }) {
      return JSON.stringify({
        client: e.client,
        data: t.data,
        date: t.date.getTime(),
        level: t.level,
        scope: t.scope,
        variables: t.variables
      });
    },
    processErrorFn({ error: t }) {
      n.processMessage(
        {
          data: [`electron-log: can't POST ${e.url}`, t],
          level: "warn"
        },
        { transports: ["console", "file"] }
      );
    },
    sendRequestFn({ serverUrl: t, requestOptions: r, body: s }) {
      const i = (t.startsWith("https:") ? sr : nr).request(t, {
        method: "POST",
        ...r,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": s.length,
          ...r.headers
        }
      });
      return i.write(s), i.end(), i;
    }
  });
  function e(t) {
    if (!e.url)
      return;
    const r = e.makeBodyFn({
      logger: n,
      message: { ...t, data: or({ logger: n, message: t, transport: e }) },
      transport: e
    }), s = e.sendRequestFn({
      serverUrl: e.url,
      requestOptions: e.requestOptions,
      body: Buffer.from(r, "utf8")
    });
    s.on("error", (o) => e.processErrorFn({
      error: o,
      logger: n,
      message: t,
      request: s,
      transport: e
    }));
  }
}
const G = rt, ur = ot, fr = at, hr = Lt, dr = Ht, gr = tr, mr = lr;
var yr = Er;
function Er({ dependencies: n, initializeFn: e }) {
  var r;
  const t = new G({
    dependencies: n,
    errorHandler: new ur(),
    eventLogger: new fr(),
    initializeFn: e,
    isDev: (r = n.externalApi) == null ? void 0 : r.isDev(),
    logId: "default",
    transportFactories: {
      console: hr,
      file: dr,
      ipc: gr,
      remote: mr
    },
    variables: {
      processType: "main"
    }
  });
  return t.default = t, t.Logger = G, t.processInternalErrorFn = (s) => {
    t.transports.console.writeFn({
      message: {
        data: ["Unhandled electron-log error", s],
        level: "error"
      }
    });
  }, t;
}
const vr = ve, br = We, { initialize: Tr } = Je, Sr = yr, U = new br({ electron: vr }), x = Sr({
  dependencies: { externalApi: U },
  initializeFn: Tr
});
var Ar = x;
U.onIpc("__ELECTRON_LOG__", (n, e) => {
  e.scope && x.Logger.getInstance(e).scope(e.scope);
  const t = new Date(e.date);
  pe({
    ...e,
    date: t.getTime() ? t : /* @__PURE__ */ new Date()
  });
});
U.onIpcInvoke("__ELECTRON_LOG__", (n, { cmd: e = "", logId: t }) => {
  switch (e) {
    case "getOptions":
      return {
        levels: x.Logger.getInstance({ logId: t }).levels,
        logId: t
      };
    default:
      return pe({ data: [`Unknown cmd '${e}'`], level: "error" }), {};
  }
});
function pe(n) {
  var e;
  (e = x.Logger.getInstance(n)) == null || e.processMessage(n);
}
const Lr = Ar;
var Or = Lr;
const h = /* @__PURE__ */ Pe(Or);
h.initialize();
h.transports.console.format = "{h}:{i}:{s} {text}";
h.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}";
const wr = te(import.meta.url), Nr = wr("sqlite3"), $r = g.join(y.getPath("userData"), "pp.db"), m = new Nr.Database($r);
function Pr(n, e) {
  return new Promise((t, r) => {
    h.info(`[db] query: ${n}`), m.all(n, e || [], (s, o) => {
      s ? (h.error(`[db] query error: ${s.message}`), r(s)) : t(o);
    });
  });
}
function Dr(n, e) {
  return new Promise((t, r) => {
    h.info(`[db] queryOne: ${n}`), m.get(n, e || [], (s, o) => {
      s ? (h.error(`[db] queryOne error: ${s.message}`), r(s)) : t(o);
    });
  });
}
function ue(n, e) {
  return new Promise((t, r) => {
    h.info(`[db] execute: ${n}`), m.run(n, e || [], function(s) {
      s ? (h.error(`[db] execute error: ${s.message}`), r(s)) : t({
        id: this.lastID,
        changes: this.changes
      });
    });
  });
}
function D() {
  return new Promise((n, e) => {
    m.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='app_version'",
      [],
      (t, r) => {
        if (t) {
          e(t);
          return;
        }
        r ? m.get(
          "SELECT MAX(version) as version FROM app_version",
          [],
          (s, o) => {
            s ? e(s) : n((o == null ? void 0 : o.version) ?? 0);
          }
        ) : m.run(
          "CREATE TABLE IF NOT EXISTS app_version (version INTEGER NOT NULL)",
          [],
          (s) => {
            if (s) {
              e(s);
              return;
            }
            m.run(
              "INSERT INTO app_version (version) VALUES (0)",
              [],
              function(o) {
                o ? e(o) : n(0);
              }
            );
          }
        );
      }
    );
  });
}
function M(n) {
  return ue("UPDATE app_version SET version = ?", [n]);
}
function Ir() {
  return new Promise((n, e) => {
    m.prepare(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      shortName TEXT,
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run((r) => {
      r ? (h.error("create project table failed", r), e(r)) : (h.info("create project table success"), n(!0));
    });
  });
}
async function _r() {
  await D() >= 1 || (await Ir(), await M(1));
}
function Fr() {
  return new Promise((n, e) => {
    m.prepare(`
    CREATE TABLE IF NOT EXISTS shortcuts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      path TEXT NOT NULL,
      icon TEXT NOT NULL,
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run((r) => {
      r ? (h.error("create shortcuts table failed", r), e(r)) : (h.info("create shortcuts table success"), n(!0));
    });
  });
}
async function Rr() {
  await D() >= 2 || (await Fr(), await M(2));
}
function xr() {
  return new Promise((n, e) => {
    m.prepare(`
    CREATE TABLE IF NOT EXISTS sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      path TEXT NOT NULL,
      shortcutId INTEGER NOT NULL,
      projectId INTEGER NOT NULL,
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run((r) => {
      r ? (h.error("create sources table failed", r), e(r)) : (h.info("create sources table success"), n(!0));
    });
  });
}
async function Mr() {
  await D() >= 3 || (await xr(), await M(3));
}
function Cr() {
  return new Promise((n, e) => {
    m.prepare(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      html TEXT NOT NULL,
      text TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run((r) => {
      r ? (h.error("create notes table failed", r), e(r)) : (h.info("create notes table success"), n(!0));
    });
  });
}
async function jr() {
  await D() >= 4 || (await Cr(), await M(4));
}
async function Ur() {
  const n = await D();
  h.info(`[db] migrate version: ${n}`), await _r(), await Rr(), await Mr(), await jr();
}
const kr = te(import.meta.url), zr = kr("windows-shortcuts");
async function Wr(n) {
  try {
    return (await Ne(n)).isDirectory();
  } catch {
    return !1;
  }
}
async function qr(n) {
  return await Wr(n) ? {
    isDirectory: !0,
    filePath: n,
    isLink: !1,
    realPath: n
  } : new Promise((t) => {
    $e.lstat(n, (r, s) => {
      let o = n;
      r ? t({
        isDirectory: !1,
        filePath: n,
        isLink: !1,
        realPath: o
      }) : zr.query(n, (i, a) => {
        if (!i && a) {
          o = a.target || n;
          const l = o && n && g.resolve(o) !== g.resolve(n);
          t({
            isDirectory: !1,
            filePath: n,
            isLink: l,
            realPath: o
          });
        } else
          t({
            isDirectory: !1,
            filePath: n,
            isLink: !1,
            realPath: o
          });
      });
    });
  });
}
const fe = g.dirname(Z(import.meta.url));
process.env.APP_ROOT = g.join(fe, "..");
const C = process.env.VITE_DEV_SERVER_URL, En = g.join(process.env.APP_ROOT, "dist-electron"), he = g.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = C ? g.join(process.env.APP_ROOT, "public") : he;
let c, _, de = !1;
function ge() {
  K.setApplicationMenu(null), c = new Y({
    icon: g.join(process.env.VITE_PUBLIC, "icon/p_ico_32x32.ico"),
    webPreferences: {
      preload: g.join(fe, "preload.mjs")
    }
  }), c.webContents.on("did-finish-load", () => {
    c == null || c.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), C ? c.loadURL(C) : c.loadFile(g.join(he, "index.html")), v.handle("dbQuery", async (n, e, t) => Pr(e, t)), v.handle("dbQueryOne", async (n, e, t) => Dr(e, t)), v.handle("dbExecute", async (n, e, t) => ue(e, t)), v.handle(
    "openSource",
    async (n, e) => {
      const { exe: t, args: r } = e;
      return new Promise((s, o) => {
        h.info(`openSource: ${t} ${r}`);
        let i;
        r.startsWith("http") ? i = `start ${r}` : i = `"${t}" "${r}"`, we(i, (a, l, p) => {
          a ? (o(a), h.error(`openSource error: ${a}`)) : p ? (o(p), h.error(`openSource stderr: ${p}`)) : (s(l), h.info(`openSource stdout: ${l}`));
        });
      });
    }
  ), v.handle("getAppPath", async (n) => y.getAppPath()), v.handle("getPath", async (n, e) => y.getPath(e)), v.handle("getFileInfo", async (n, e) => qr(e)), v.handle("openDevTools", (n) => {
    c == null || c.webContents.openDevTools();
  }), c.on("close", (n) => {
    de ? Q.unregisterAll() : (n.preventDefault(), c == null || c.hide(), c == null || c.setSkipTaskbar(!0));
  });
}
const Vr = y.requestSingleInstanceLock();
Vr ? y.on("second-instance", (n, e) => {
  c && (c.isMinimized() && c.restore(), c.focus());
}) : y.quit();
y.on("window-all-closed", () => {
  process.platform !== "darwin" && (y.quit(), c = null);
});
y.on("activate", () => {
  Y.getAllWindows().length === 0 && ge();
});
function Br() {
  const n = g.join(process.env.VITE_PUBLIC, "icon/p_ico_32x32.ico"), e = be.createFromPath(n);
  _ = new Te(e);
  const t = K.buildFromTemplate([
    {
      label: "显示/隐藏",
      click: () => {
        c != null && c.isVisible() ? (c == null || c.hide(), c == null || c.setSkipTaskbar(!0)) : (c == null || c.show(), c == null || c.setSkipTaskbar(!1));
      }
    },
    { type: "separator" },
    // 分割线
    {
      label: "退出",
      click: () => {
        de = !0, y.quit();
      }
    }
  ]);
  _.setToolTip("PP"), _.setContextMenu(t), _.on("click", () => {
    c != null && c.isVisible() ? (c == null || c.hide(), c == null || c.setSkipTaskbar(!0)) : (c == null || c.show(), c == null || c.setSkipTaskbar(!1));
  });
}
y.whenReady().then(() => {
  Q.register("CommandOrControl+Q", () => {
    c != null && c.isVisible() || (c == null || c.show(), c == null || c.setSkipTaskbar(!1));
  }), Ur().then(() => {
    ge(), Br();
  });
});
export {
  En as MAIN_DIST,
  he as RENDERER_DIST,
  C as VITE_DEV_SERVER_URL
};
