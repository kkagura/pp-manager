import { app, BrowserWindow, ipcMain, Menu } from "electron";
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

let win: BrowserWindow | null;

function createWindow() {
  Menu.setApplicationMenu(null);
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
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
  })
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

app.whenReady().then(() => {
  migrate().then(createWindow);
});
