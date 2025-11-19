import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeImage,
  Tray,
  globalShortcut,
  HandlerDetails,
} from "electron";
// import { createRequire } from 'node:module'
import { fileURLToPath } from "node:url";
import path from "node:path";
import { query, queryOne, execute, migrate } from "./db";
import { exec } from "node:child_process";
import { log } from "./log";
import { stat } from "node:fs/promises";
import { getFileInfo } from "./utils/file";
import windowStateKeeper from "electron-window-state";

if (app.isPackaged) {
  // 开机自启动
  app.setLoginItemSettings({
    openAtLogin: true,
    args: ["--hidden"], // 添加隐藏参数，用于标识开机自启动
  });
}

// const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null, tray: Tray | null;
let willQuitApp = false;
let mainWindowState: windowStateKeeper.State | null = null;
const DEFAULT_WINDOW_WIDTH = 1000;
const DEFAULT_WINDOW_HEIGHT = 800;

// 检查是否是开机自启动（通过命令行参数判断）
const isStartupLaunch = process.argv.includes("--hidden");

function createWindow(showWindow: boolean = true) {
  Menu.setApplicationMenu(null);
  mainWindowState = windowStateKeeper({
    defaultWidth: DEFAULT_WINDOW_WIDTH,
    defaultHeight: DEFAULT_WINDOW_HEIGHT,
    maximize: true,
    fullScreen: true,
  });
  win = new BrowserWindow({
    ...mainWindowState,
    icon: path.join(process.env.VITE_PUBLIC, "icon/p_ico_32x32.ico"),
    show: showWindow, // 控制是否显示窗口
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });
  mainWindowState.manage(win);
  mainWindowState.saveState(win);

  win.webContents.setWindowOpenHandler((details: HandlerDetails) => {
    // 获取链接
    let url = details.url as string;
    // 使用默认浏览器打开链接，而不是在webview中打开新窗口
    const cmd = `start ${url}`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        log.error(`openSource error: ${error}`);
      } else if (stderr) {
        log.error(`openSource stderr: ${stderr}`);
      } else {
        log.info(`openSource stdout: ${stdout}`);
      }
    });
    // 拒绝默认行为
    return { action: "deny" };
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }

  ipcMain.handle("dbQuery", async (event, sql, params) => {
    return query(sql, params);
  });
  ipcMain.handle("dbQueryOne", async (event, sql, params) => {
    return queryOne(sql, params);
  });
  ipcMain.handle("dbExecute", async (event, sql, params) => {
    return execute(sql, params);
  });
  ipcMain.handle(
    "openSource",
    async (event, params: { exe: string; args: string }) => {
      // 通过child_process.spawn启动进程
      const { exe, args } = params;
      return new Promise((resolve, reject) => {
        log.info(`openSource: ${exe} ${args}`);
        let cmd;
        // 写死...
        if (args.startsWith("http")) {
          cmd = `start ${args}`;
        } else {
          cmd = `"${exe}" "${args}"`;
        }
        exec(cmd, (error, stdout, stderr) => {
          minimize();
          if (error) {
            reject(error);
            log.error(`openSource error: ${error}`);
          } else if (stderr) {
            reject(stderr);
            log.error(`openSource stderr: ${stderr}`);
          } else {
            resolve(stdout);
            log.info(`openSource stdout: ${stdout}`);
          }
        });
      });
    }
  );

  ipcMain.handle("getAppPath", async (event) => {
    return app.getAppPath();
  });

  ipcMain.handle("getPath", async (event, name: any) => {
    return app.getPath(name);
  });

  ipcMain.handle("getFileInfo", async (event, filePath: string) => {
    return getFileInfo(filePath);
  });
  ipcMain.handle("openDevTools", (event) => {
    win?.webContents.openDevTools();
  });

  win.on("close", (event) => {
    if (!willQuitApp) {
      event.preventDefault();
      minimize();
    } else {
      mainWindowState?.saveState(win!);
      globalShortcut.unregisterAll();
    }
  });
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, path) => {
    if (win) {
      if (win.isMinimized()) {
        win.restore();
      } else if (!win.isVisible()) {
        maximize();
      }
      win.focus();
    }
  });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function minimize() {
  win?.hide();
  win?.setSkipTaskbar(true);
}

function maximize() {
  win?.show();
  win?.setSkipTaskbar(false);
}

function createTray() {
  const iconPath = path.join(process.env.VITE_PUBLIC, "icon/p_ico_32x32.ico"); // 请替换为你的图标路径
  const trayIcon = nativeImage.createFromPath(iconPath);
  tray = new Tray(trayIcon);

  // 定义托盘的上下文菜单（右键菜单） [citation:1][citation:5]
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "显示/隐藏",
      click: () => {
        if (win?.isVisible()) {
          minimize();
        } else {
          maximize();
        }
      },
    },
    { type: "separator" }, // 分割线
    {
      label: "退出",
      click: () => {
        // 设置标志位，表示现在要真正退出了 [citation:7]
        willQuitApp = true;
        // 退出应用 [citation:1][citation:5]
        app.quit();
      },
    },
  ]);

  // 设置托盘图标的悬停提示 [citation:1][citation:2]
  tray.setToolTip("PP");
  // 应用右键菜单
  tray.setContextMenu(contextMenu);

  // 点击托盘图标的事件（通常用于显示/隐藏窗口） [citation:2][citation:5]
  tray.on("click", () => {
    // 这里实现点击托盘图标的逻辑，例如显示/隐藏窗口
    if (win?.isVisible()) {
      minimize();
    } else {
      maximize();
    }
  });
}

app.whenReady().then(() => {
  globalShortcut.register("CommandOrControl+Q", () => {
    if (win?.isMinimized()) {
      win?.restore();
    } else {
      maximize();
    }
  });
  migrate().then(() => {
    // 如果是开机自启动，不显示窗口；否则正常显示
    createWindow(!isStartupLaunch);
    createTray();
  });
});
