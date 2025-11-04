import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeImage,
  Tray,
  globalShortcut,
} from "electron";
// import { createRequire } from 'node:module'
import { fileURLToPath } from "node:url";
import path from "node:path";
import { query, queryOne, execute, migrate } from "./db";
import { exec } from "node:child_process";
import { log } from "./log";
import { stat } from "node:fs/promises";
import { getFileInfo } from "./utils/file";

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

function createWindow() {
  Menu.setApplicationMenu(null);
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "icon/p_ico_32x32.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
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

  ipcMain.handle("dbQuery", async (event, sql) => {
    return query(sql);
  });
  ipcMain.handle("dbQueryOne", async (event, sql) => {
    return queryOne(sql);
  });
  ipcMain.handle("dbExecute", async (event, sql) => {
    return execute(sql);
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
      win?.hide();
      win?.setSkipTaskbar(true);
    } else {
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
      if (win.isMinimized()) win.restore();
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

function createTray() {
  const iconPath = path.join(__dirname, "../public", "icon/p_ico_32x32.ico"); // 请替换为你的图标路径
  const trayIcon = nativeImage.createFromPath(iconPath);
  tray = new Tray(trayIcon);

  // 定义托盘的上下文菜单（右键菜单） [citation:1][citation:5]
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "显示/隐藏",
      click: () => {
        if (win?.isVisible()) {
          win?.hide();
          win?.setSkipTaskbar(true);
        } else {
          win?.show();
          win?.setSkipTaskbar(false);
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
      win?.hide();
      win?.setSkipTaskbar(true);
    } else {
      win?.show();
      win?.setSkipTaskbar(false);
    }
  });
}

app.whenReady().then(() => {
  globalShortcut.register("CommandOrControl+Q", () => {
    if (!win?.isVisible()) {
      win?.show();
      win?.setSkipTaskbar(false);
    }
  });
  migrate().then(() => {
    createWindow();
    createTray();
  });
});
