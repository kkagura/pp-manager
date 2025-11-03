import { stat } from "node:fs/promises";
import fs from "node:fs";
import { createRequire } from "module";
import WindowsShortcutInfo from "windows-shortcuts";
import path from "node:path";
const require = createRequire(import.meta.url);
const ws: typeof WindowsShortcutInfo = require("windows-shortcuts");

export async function isDirectory(filePath: string) {
  try {
    const stats = await stat(filePath);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}

export async function getFileInfo(filePath: string) {
  const isDir = await isDirectory(filePath);
  if (isDir) {
    return {
      isDirectory: true,
      filePath,
      isLink: false,
      realPath: filePath,
    };
  }
  return new Promise((resolve) => {
    fs.lstat(filePath, (err, _) => {
      let realPath = filePath;
      if (!err) {
        ws.query(filePath, (err, info) => {
          if (!err && info) {
            realPath = info.target || filePath;
            const isLink =
              realPath &&
              filePath &&
              path.resolve(realPath) !== path.resolve(filePath);
            resolve({
              isDirectory: false,
              filePath,
              isLink,
              realPath,
            });
          } else {
            resolve({
              isDirectory: false,
              filePath,
              isLink: false,
              realPath,
            });
          }
        });
      } else {
        resolve({
          isDirectory: false,
          filePath,
          isLink: false,
          realPath,
        });
      }
    });
  });
}
